import { createServer } from "http";
import { Server } from "socket.io";
import { PrismaClient } from "@prisma/client";
import { join } from "path";

// ============================================
// Prisma Setup - Connect to the main project's database
// ============================================
const dbPath = join(import.meta.dir, "..", "..", "db", "custom.db");
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: `file:${dbPath}`,
    },
  },
});

console.log(`[DB] Database path: ${dbPath}`);

// ============================================
// Socket.IO Server Setup
// ============================================
const httpServer = createServer();
const io = new Server(httpServer, {
  path: "/",
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// ============================================
// In-memory state for connected clients
// ============================================
interface AdminSocket {
  socketId: string;
  subscribedCaptainId?: string;
}

const connectedAdmins = new Map<string, AdminSocket>();
const customerTrackingRooms = new Map<string, Set<string>>(); // trackingNumber -> Set<socketId>
const captainSockets = new Map<string, string>(); // captainId -> socketId

// ============================================
// Helper Functions
// ============================================

function getArabicStatus(status: string): string {
  const map: Record<string, string> = {
    PENDING: "قيد الانتظار",
    PICKED_UP: "تم الاستلام",
    IN_TRANSIT: "قيد التوصيل",
    DELIVERED: "تم التسليم",
    CANCELLED: "ملغي",
    RETURNED: "مرتجع",
  };
  return map[status] || status;
}

// ============================================
// Notification Helper - Create DB notifications
// ============================================

async function createNotification(
  userId: string,
  title: string,
  body: string,
  type: string = 'INFO',
  data?: Record<string, unknown>
) {
  try {
    await prisma.notification.create({
      data: {
        userId,
        title,
        body,
        type,
        data: data ? JSON.stringify(data) : null,
      },
    });

    // Push to user notification room if connected
    io.to(`user-notifications-${userId}`).emit('notification:new', {
      title,
      body,
      type,
      data: data || null,
      timestamp: new Date().toISOString(),
    });

    console.log(`[Notification] Created for user ${userId}: ${title}`);
  } catch (error) {
    console.error('[Notification] Failed to create:', error);
  }
}

function getStatusDescription(status: string): string {
  const map: Record<string, string> = {
    PENDING: "تم إنشاء الطلب وهو بانتظار تعيين كابتن",
    PICKED_UP: "تم استلام الطرد من المرسل",
    IN_TRANSIT: "الكابتن في الطريق لتسليم الطرد",
    DELIVERED: "تم تسليم الطرد بنجاح",
    CANCELLED: "تم إلغاء الطلب",
    RETURNED: "تم إرجاع الطرد للمرسل",
  };
  return map[status] || `تم تحديث حالة الطلب إلى: ${status}`;
}

async function createTimelineEntry(
  parcelId: string,
  status: string,
  description?: string,
  location?: string,
  latitude?: number,
  longitude?: number,
  createdBy?: string
) {
  try {
    await prisma.parcelTimeline.create({
      data: {
        parcelId,
        status,
        description: description || getStatusDescription(status),
        location,
        latitude,
        longitude,
        createdBy: createdBy || "SYSTEM",
      },
    });
  } catch (error) {
    console.error("[Timeline] Failed to create timeline entry:", error);
  }
}

// ============================================
// Captain Events
// ============================================

function handleCaptainLocation(
  socket: any,
  payload: {
    captainId: string;
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
    accuracy?: number;
    parcelId?: string;
  }
) {
  const { captainId, latitude, longitude, heading, speed, accuracy, parcelId } =
    payload;

  console.log(
    `[Captain:Location] Captain ${captainId} at ${latitude}, ${longitude}`
  );

  // Save location update to database
  prisma.locationUpdate
    .create({
      data: {
        captainId,
        parcelId,
        latitude,
        longitude,
        heading,
        speed,
        accuracy,
      },
    })
    .then(() => {
      // Update captain's current position
      return prisma.captain.update({
        where: { id: captainId },
        data: {
          currentLatitude: latitude,
          currentLongitude: longitude,
          heading,
        },
      });
    })
    .then(() => {
      const locationData = {
        captainId,
        latitude,
        longitude,
        heading,
        speed,
        accuracy,
        parcelId,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to all admin subscribers
      io.to("admin-tracking").emit("admin:captain-location", locationData);

      // If there's a specific captain room subscribed
      io.to(`admin-captain-${captainId}`).emit(
        "admin:captain-location",
        locationData
      );

      // If parcelId is provided, broadcast to customer tracking room
      if (parcelId) {
        // Find the parcel's tracking number
        prisma.parcel
          .findUnique({ where: { id: parcelId }, select: { trackingNumber: true } })
          .then((parcel) => {
            if (parcel) {
              io.to(`customer-track-${parcel.trackingNumber}`).emit(
                "customer:captain-location",
                {
                  ...locationData,
                  trackingNumber: parcel.trackingNumber,
                }
              );
            }
          });
      }
    })
    .catch((error) => {
      console.error("[Captain:Location] Error:", error);
    });
}

function handleCaptainStatus(
  socket: any,
  payload: { captainId: string; isOnline: boolean; isAvailable?: boolean }
) {
  const { captainId, isOnline, isAvailable } = payload;

  console.log(
    `[Captain:Status] Captain ${captainId} - online: ${isOnline}, available: ${isAvailable}`
  );

  // Register captain socket mapping
  captainSockets.set(captainId, socket.id);

  prisma.captain
    .update({
      where: { id: captainId },
      data: {
        isOnline,
        ...(isAvailable !== undefined ? { isAvailable } : {}),
      },
    })
    .then((captain) => {
      const statusData = {
        captainId,
        isOnline,
        isAvailable: captain.isAvailable,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to all admin subscribers
      io.to("admin-tracking").emit("admin:captain-status-update", statusData);
      io.to(`admin-captain-${captainId}`).emit(
        "admin:captain-status-update",
        statusData
      );
    })
    .catch((error) => {
      console.error("[Captain:Status] Error:", error);
    });
}

function handleCaptainParcelUpdate(
  socket: any,
  payload: {
    parcelId: string;
    status: string;
    captainId: string;
    notes?: string;
  }
) {
  const { parcelId, status, captainId, notes } = payload;

  console.log(
    `[Captain:ParcelUpdate] Parcel ${parcelId} -> ${status} by Captain ${captainId}`
  );

  // Determine timestamp fields based on status
  const timestampUpdate: Record<string, Date | null> = {};
  if (status === "PICKED_UP") timestampUpdate.pickedUpAt = new Date();
  if (status === "DELIVERED") timestampUpdate.deliveredAt = new Date();
  if (status === "CANCELLED") timestampUpdate.cancelledAt = new Date();

  prisma.parcel
    .update({
      where: { id: parcelId },
      data: {
        status,
        ...timestampUpdate,
        ...(notes ? { adminNotes: notes } : {}),
      },
      include: {
        captain: {
          include: { user: { select: { name: true, phone: true, avatar: true } } },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })
    .then(async (parcel) => {
      // Create timeline entry
      await createTimelineEntry(parcelId, status, notes);

      // Create notification for the parcel sender
      if (parcel.senderId) {
        const notificationMessages: Record<string, { title: string; body: string }> = {
          PICKED_UP: {
            title: 'تم استلام طردك',
            body: `تم استلام الطرد ${parcel.trackingNumber} من قبل الكابتن ${parcel.captain?.user.name || 'المعين'}`,
          },
          IN_TRANSIT: {
            title: 'طردك في الطريق',
            body: `الكابتن في الطريق لتسليم الطرد ${parcel.trackingNumber}`,
          },
          DELIVERED: {
            title: 'تم تسليم طردك بنجاح ✅',
            body: `تم تسليم الطرد ${parcel.trackingNumber} بنجاح. شكراً لثقتكم بنا!`,
          },
          CANCELLED: {
            title: 'تم إلغاء طردك',
            body: `تم إلغاء الطرد ${parcel.trackingNumber}. ${notes || 'تواصل مع الدعم للمزيد من المعلومات.'}`,
          },
          RETURNED: {
            title: 'تم إرجاع طردك',
            body: `تم إرجاع الطرد ${parcel.trackingNumber} للمرسل.`,
          },
        };

        const msg = notificationMessages[status];
        if (msg) {
          await createNotification(
            parcel.senderId,
            msg.title,
            msg.body,
            'ORDER_UPDATE',
            { parcelId, trackingNumber: parcel.trackingNumber, status }
          );
        }
      }

      const updateData = {
        parcelId,
        trackingNumber: parcel.trackingNumber,
        status: parcel.status,
        arabicStatus: getArabicStatus(parcel.status),
        captainId,
        captainName: parcel.captain?.user.name,
        captainPhone: parcel.captain?.user.phone,
        notes,
        timestamp: new Date().toISOString(),
      };

      // Broadcast to admin subscribers
      io.to("admin-tracking").emit("admin:parcel-update", updateData);

      // Notify the customer tracking room
      io.to(`customer-track-${parcel.trackingNumber}`).emit(
        "customer:parcel-update",
        updateData
      );

      console.log(
        `[Captain:ParcelUpdate] Broadcasted update for ${parcel.trackingNumber}`
      );
    })
    .catch((error) => {
      console.error("[Captain:ParcelUpdate] Error:", error);
    });
}

// ============================================
// Admin Events
// ============================================

function handleAdminSubscribe(
  socket: any,
  payload: { captainId?: string }
) {
  const { captainId } = payload;

  // Join the general admin tracking room
  socket.join("admin-tracking");

  connectedAdmins.set(socket.id, {
    socketId: socket.id,
    subscribedCaptainId: captainId,
  });

  // If a specific captain is requested, also join that captain's room
  if (captainId) {
    socket.join(`admin-captain-${captainId}`);
    console.log(
      `[Admin:Subscribe] Admin ${socket.id} subscribed to captain ${captainId}`
    );
  } else {
    console.log(`[Admin:Subscribe] Admin ${socket.id} subscribed to all updates`);
  }

  // Send confirmation
  socket.emit("admin:subscribed", {
    success: true,
    captainId: captainId || null,
    message: captainId
      ? `تم الاشتراك في تحديثات الكابتن`
      : "تم الاشتراك في جميع التحديثات",
    timestamp: new Date().toISOString(),
  });
}

function handleAdminUnsubscribe(socket: any) {
  socket.leave("admin-tracking");
  connectedAdmins.delete(socket.id);

  console.log(`[Admin:Unsubscribe] Admin ${socket.id} unsubscribed`);

  socket.emit("admin:unsubscribed", {
    success: true,
    message: "تم إلغاء الاشتراك",
    timestamp: new Date().toISOString(),
  });
}

function handleAdminAssignCaptain(
  socket: any,
  payload: { parcelId: string; captainId: string }
) {
  const { parcelId, captainId } = payload;

  console.log(
    `[Admin:AssignCaptain] Assigning captain ${captainId} to parcel ${parcelId}`
  );

  prisma.parcel
    .update({
      where: { id: parcelId },
      data: {
        captainId,
        status: "PICKED_UP",
        assignedAt: new Date(),
      },
      include: {
        captain: {
          include: { user: { select: { name: true, phone: true, avatar: true } } },
        },
        sender: { select: { name: true, phone: true } },
      },
    })
    .then(async (parcel) => {
      // Create timeline entry
      await createTimelineEntry(
        parcelId,
        "PICKED_UP",
        `تم تعيين الكابتن ${parcel.captain?.user.name} للطرد`,
        parcel.senderAddress
      );

      const assignmentData = {
        parcelId,
        trackingNumber: parcel.trackingNumber,
        captainId,
        captainName: parcel.captain?.user.name,
        captainPhone: parcel.captain?.user.phone,
        status: parcel.status,
        arabicStatus: getArabicStatus(parcel.status),
        timestamp: new Date().toISOString(),
      };

      // Notify the captain via their socket and notification
      const captainSocketId = captainSockets.get(captainId);
      if (captainSocketId) {
        io.to(captainSocketId).emit("captain:new-assignment", {
          parcelId: parcel.id,
          trackingNumber: parcel.trackingNumber,
          senderName: parcel.sender.name,
          senderPhone: parcel.sender.phone,
          senderAddress: parcel.senderAddress,
          senderLat: parcel.senderLat,
          senderLng: parcel.senderLng,
          receiverName: parcel.receiverName,
          receiverPhone: parcel.receiverPhone,
          receiverAddress: parcel.receiverAddress,
          receiverLat: parcel.receiverLat,
          receiverLng: parcel.receiverLng,
          description: parcel.description,
          weight: parcel.weight,
          codAmount: parcel.codAmount,
        });
      }

      // Create notification for captain
      if (parcel.captain?.userId) {
        await createNotification(
          parcel.captain.userId,
          'طلب توصيل جديد 📦',
          `تم تعيينك لتوصيل طرد من ${parcel.sender.name} إلى ${parcel.receiverName} - ${parcel.receiverAddress}`,
          'ORDER_UPDATE',
          { parcelId: parcel.id, trackingNumber: parcel.trackingNumber }
        );
      }

      // Create notification for sender
      await createNotification(
        parcel.senderId,
        'تم تعيين كابتن لطردك 🚗',
        `تم تعيين الكابتن ${parcel.captain?.user.name || ''} لتوصيل طردك ${parcel.trackingNumber}`,
        'ORDER_UPDATE',
        { parcelId: parcel.id, trackingNumber: parcel.trackingNumber, captainId }
      );

      // Broadcast to admin subscribers
      io.to("admin-tracking").emit("admin:parcel-update", assignmentData);

      // Notify customer tracking room
      io.to(`customer-track-${parcel.trackingNumber}`).emit(
        "customer:parcel-update",
        assignmentData
      );

      // Confirm to the admin who made the assignment
      socket.emit("admin:captain-assigned", {
        success: true,
        ...assignmentData,
        message: `تم تعيين الكابتن ${parcel.captain?.user.name} بنجاح`,
      });

      console.log(
        `[Admin:AssignCaptain] Captain assigned to ${parcel.trackingNumber}`
      );
    })
    .catch((error) => {
      console.error("[Admin:AssignCaptain] Error:", error);
      socket.emit("admin:error", {
        error: "فشل في تعيين الكابتن",
        details: String(error),
        timestamp: new Date().toISOString(),
      });
    });
}

// ============================================
// Customer Events
// ============================================

function handleCustomerTrackParcel(
  socket: any,
  payload: { trackingNumber: string }
) {
  const { trackingNumber } = payload;

  console.log(`[Customer:Track] Customer tracking parcel ${trackingNumber}`);

  // Join the room for this tracking number
  socket.join(`customer-track-${trackingNumber}`);

  // Track which sockets are in which rooms
  if (!customerTrackingRooms.has(trackingNumber)) {
    customerTrackingRooms.set(trackingNumber, new Set());
  }
  customerTrackingRooms.get(trackingNumber)!.add(socket.id);

  // Fetch current status and send it
  prisma.parcel
    .findUnique({
      where: { trackingNumber },
      include: {
        captain: {
          include: { user: { select: { name: true, phone: true, avatar: true } } },
        },
        timeline: {
          orderBy: { createdAt: "desc" },
        },
        locations: {
          orderBy: { timestamp: "desc" },
          take: 1,
        },
      },
    })
    .then((parcel) => {
      if (!parcel) {
        socket.emit("customer:track-error", {
          error: "رقم التتبع غير موجود",
          trackingNumber,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      socket.emit("customer:parcel-status", {
        trackingNumber: parcel.trackingNumber,
        status: parcel.status,
        arabicStatus: getArabicStatus(parcel.status),
        captain: parcel.captain
          ? {
              id: parcel.captain.id,
              name: parcel.captain.user.name,
              phone: parcel.captain.user.phone,
              avatar: parcel.captain.user.avatar,
              vehicleType: parcel.captain.vehicleType,
              currentLatitude: parcel.captain.currentLatitude,
              currentLongitude: parcel.captain.currentLongitude,
            }
          : null,
        timeline: parcel.timeline.map((entry) => ({
          status: entry.status,
          description: entry.description,
          location: entry.location,
          createdAt: entry.createdAt,
        })),
        latestLocation: parcel.locations[0] || null,
        timestamp: new Date().toISOString(),
      });

      console.log(
        `[Customer:Track] Sent current status for ${trackingNumber}: ${parcel.status}`
      );
    })
    .catch((error) => {
      console.error("[Customer:Track] Error:", error);
      socket.emit("customer:track-error", {
        error: "حدث خطأ أثناء البحث عن الطرد",
        trackingNumber,
        timestamp: new Date().toISOString(),
      });
    });
}

function handleCustomerStopTracking(
  socket: any,
  payload: { trackingNumber: string }
) {
  const { trackingNumber } = payload;

  console.log(`[Customer:StopTrack] Customer stopped tracking ${trackingNumber}`);

  // Leave the room
  socket.leave(`customer-track-${trackingNumber}`);

  // Clean up tracking room map
  const roomSockets = customerTrackingRooms.get(trackingNumber);
  if (roomSockets) {
    roomSockets.delete(socket.id);
    if (roomSockets.size === 0) {
      customerTrackingRooms.delete(trackingNumber);
    }
  }

  socket.emit("customer:stop-tracking-confirmed", {
    trackingNumber,
    message: "تم إيقاف التتبع",
    timestamp: new Date().toISOString(),
  });
}

// ============================================
// Main Connection Handler
// ============================================

io.on("connection", (socket) => {
  console.log(`[Connection] Client connected: ${socket.id}`);

  // ---- Captain Events ----
  socket.on("captain:location", (payload) => {
    handleCaptainLocation(socket, payload);
  });

  socket.on("captain:status", (payload) => {
    handleCaptainStatus(socket, payload);
  });

  socket.on("captain:parcel-update", (payload) => {
    handleCaptainParcelUpdate(socket, payload);
  });

  // ---- Admin Events ----
  socket.on("admin:subscribe", (payload) => {
    handleAdminSubscribe(socket, payload || {});
  });

  socket.on("admin:unsubscribe", () => {
    handleAdminUnsubscribe(socket);
  });

  socket.on("admin:assign-captain", (payload) => {
    handleAdminAssignCaptain(socket, payload);
  });

  // ---- User Notification Subscription ----
  socket.on('user:subscribe-notifications', (payload: { userId: string }) => {
    if (payload?.userId) {
      socket.join(`user-notifications-${payload.userId}`);
      console.log(`[User:Notifications] User ${payload.userId} subscribed to notifications`);
    }
  });

  socket.on('user:unsubscribe-notifications', (payload: { userId: string }) => {
    if (payload?.userId) {
      socket.leave(`user-notifications-${payload.userId}`);
      console.log(`[User:Notifications] User ${payload.userId} unsubscribed`);
    }
  });

  // ---- Customer Events ----
  socket.on("customer:track-parcel", (payload) => {
    handleCustomerTrackParcel(socket, payload);
  });

  socket.on("customer:stop-tracking", (payload) => {
    handleCustomerStopTracking(socket, payload);
  });

  // ---- Disconnect ----
  socket.on("disconnect", () => {
    console.log(`[Disconnect] Client disconnected: ${socket.id}`);

    // Clean up admin subscriptions
    connectedAdmins.delete(socket.id);

    // Clean up captain socket mapping
    for (const [captainId, sockId] of captainSockets.entries()) {
      if (sockId === socket.id) {
        captainSockets.delete(captainId);
        break;
      }
    }

    // Clean up customer tracking rooms
    for (const [trackingNumber, sockets] of customerTrackingRooms.entries()) {
      sockets.delete(socket.id);
      if (sockets.size === 0) {
        customerTrackingRooms.delete(trackingNumber);
      }
    }
  });

  socket.on("error", (error) => {
    console.error(`[Error] Socket error (${socket.id}):`, error);
  });
});

// ============================================
// Simulation: Captain Movement for IN_TRANSIT Parcels
// ============================================

function simulateCaptainMovement() {
  prisma.parcel
    .findMany({
      where: {
        status: "IN_TRANSIT",
        captainId: { not: null },
      },
      include: {
        captain: {
          select: {
            id: true,
            currentLatitude: true,
            currentLongitude: true,
          },
        },
      },
    })
    .then((parcels) => {
      if (parcels.length === 0) return;

      for (const parcel of parcels) {
        if (!parcel.captain?.currentLatitude || !parcel.captain?.currentLongitude) {
          continue;
        }

        // Calculate direction toward the receiver
        const currentLat = parcel.captain.currentLatitude;
        const currentLng = parcel.captain.currentLongitude;
        const destLat = parcel.receiverLat;
        const destLng = parcel.receiverLng;

        // Calculate remaining distance
        const dLat = destLat - currentLat;
        const dLng = destLng - currentLng;
        const distance = Math.sqrt(dLat * dLat + dLng * dLng);

        // If very close to destination, stop simulating
        if (distance < 0.0005) {
          continue;
        }

        // Simulate movement: move ~0.1% of remaining distance + small random offset
        const moveFactor = 0.002 + Math.random() * 0.001;
        const newLat = currentLat + dLat * moveFactor + (Math.random() - 0.5) * 0.0003;
        const newLng = currentLng + dLng * moveFactor + (Math.random() - 0.5) * 0.0003;

        // Calculate heading
        const heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;

        const captainId = parcel.captain.id;

        // Save location
        prisma.locationUpdate
          .create({
            data: {
              captainId,
              parcelId: parcel.id,
              latitude: newLat,
              longitude: newLng,
              heading,
              speed: 30 + Math.random() * 20, // 30-50 km/h simulated speed
              accuracy: 10 + Math.random() * 15,
            },
          })
          .then(() => {
            // Update captain position
            return prisma.captain.update({
              where: { id: captainId },
              data: {
                currentLatitude: newLat,
                currentLongitude: newLng,
                heading,
              },
            });
          })
          .then(() => {
            const locationData = {
              captainId,
              latitude: newLat,
              longitude: newLng,
              heading,
              speed: 30 + Math.random() * 20,
              parcelId: parcel.id,
              trackingNumber: parcel.trackingNumber,
              timestamp: new Date().toISOString(),
              simulated: true,
            };

            // Broadcast to admins
            io.to("admin-tracking").emit("admin:captain-location", locationData);
            io
              .to(`admin-captain-${captainId}`)
              .emit("admin:captain-location", locationData);

            // Broadcast to customer tracking room
            io.to(`customer-track-${parcel.trackingNumber}`).emit(
              "customer:captain-location",
              locationData
            );

            console.log(
              `[Simulation] Captain ${captainId} moved to ${newLat.toFixed(6)}, ${newLng.toFixed(6)} for parcel ${parcel.trackingNumber}`
            );
          })
          .catch((error) => {
            console.error("[Simulation] Error:", error);
          });
      }
    })
    .catch((error) => {
      console.error("[Simulation] Error fetching parcels:", error);
    });
}

// Run simulation every 3 seconds
const simulationInterval = setInterval(simulateCaptainMovement, 3000);

// ============================================
// Start Server
// ============================================

const PORT = 3004;
httpServer.listen(PORT, () => {
  console.log(`🚚 Tracking service running on port ${PORT}`);
  console.log(`📡 WebSocket path: /`);
  console.log(`🔄 Simulation interval: 3 seconds`);
});

// ============================================
// Graceful Shutdown
// ============================================

function gracefulShutdown(signal: string) {
  console.log(`\n[Shutdown] Received ${signal}, shutting down...`);
  clearInterval(simulationInterval);

  io.close(() => {
    console.log("[Shutdown] Socket.IO server closed");
    prisma
      .$disconnect()
      .then(() => {
        console.log("[Shutdown] Database disconnected");
        httpServer.close(() => {
          console.log("[Shutdown] HTTP server closed");
          process.exit(0);
        });
      });
  });

  // Force exit after 10 seconds
  setTimeout(() => {
    console.error("[Shutdown] Forced exit after timeout");
    process.exit(1);
  }, 10000);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
