'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Package,
  CreditCard,
  Megaphone,
  Info,
  Check,
  CheckCheck,
  Trash2,
  X,
  Circle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
  data: Record<string, unknown> | null;
}

interface NotificationsPanelProps {
  token?: string | null;
  userId?: string | null;
}

const typeConfig: Record<string, { icon: typeof Package; color: string; bgColor: string; label: string }> = {
  ORDER_UPDATE: { icon: Package, color: 'text-emerald-600', bgColor: 'bg-emerald-50', label: 'تحديث طلب' },
  PAYMENT: { icon: CreditCard, color: 'text-amber-600', bgColor: 'bg-amber-50', label: 'دفعة' },
  PROMOTION: { icon: Megaphone, color: 'text-purple-600', bgColor: 'bg-purple-50', label: 'عرض خاص' },
  INFO: { icon: Info, color: 'text-blue-600', bgColor: 'bg-blue-50', label: 'معلومة' },
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'الآن';
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  if (diffHr < 24) return `منذ ${diffHr} ساعة`;
  if (diffDay < 7) return `منذ ${diffDay} يوم`;
  return date.toLocaleDateString('ar-SA');
}

export default function NotificationsPanel({ token, userId }: NotificationsPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const fetchNotifications = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const res = await fetch('/api/notifications?limit=20', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setNotifications(json.data || []);
        }
      }
    } catch {
      // Silent fail
    } finally {
      setLoading(false);
    }
  }, [token]);

  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/notifications/unread-count', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          setUnreadCount(json.data?.count || 0);
        }
      }
    } catch {
      // Silent fail
    }
  }, [token]);

  useEffect(() => {
    if (isOpen && token) {
      fetchNotifications();
    }
  }, [isOpen, token, fetchNotifications]);

  useEffect(() => {
    if (token) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [token, fetchUnreadCount]);

  // WebSocket real-time notification listener
  useEffect(() => {
    if (!userId) return;

    let socket: ReturnType<typeof import('socket.io-client').io> | null = null;

    const connectSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        socket = io('/?XTransformPort=3004', {
          transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
          socket?.emit('user:subscribe-notifications', { userId });
        });

        socket.on('notification:new', (data: { title: string; body: string; type: string }) => {
 setUnreadCount((prev) => prev + 1);
          // Auto-refresh notifications if panel is open
          if (isOpen) {
            fetchNotifications();
          }
        });

        socket.on('disconnect', () => {
          socket?.emit('user:unsubscribe-notifications', { userId });
        });
      } catch {
        // Socket.io not available, silent fail
      }
    };

    connectSocket();

    return () => {
      if (socket) {
        socket.emit('user:unsubscribe-notifications', { userId });
        socket.disconnect();
      }
    };
  }, [userId, isOpen, fetchNotifications]);

  const markAsRead = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ isRead: true }),
      });
      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch {
      // Silent fail
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;
    try {
      setMarkingAll(true);
      const res = await fetch('/api/notifications/mark-all-read', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch {
      // Silent fail
    } finally {
      setMarkingAll(false);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const notification = notifications.find((n) => n.id === id);
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
      }
    } catch {
      // Silent fail
    }
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="relative hover:bg-primary/5"
        aria-label="الإشعارات"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <Badge className="absolute -top-1 -left-1 h-5 w-5 flex items-center justify-center p-0 bg-primary text-primary-foreground text-[10px] font-bold animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </Badge>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute left-0 top-full mt-2 w-80 sm:w-96 bg-background border border-border rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b border-border">
                <div className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  <h3 className="font-bold text-foreground">الإشعارات</h3>
                  {unreadCount > 0 && (
                    <Badge variant="secondary" className="text-xs bg-primary/10 text-primary">
                      {unreadCount} جديد
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      disabled={markingAll}
                      className="text-xs text-primary hover:text-primary h-7 px-2"
                    >
                      <CheckCheck className="h-3.5 w-3.5 ml-1" />
                      قراءة الكل
                    </Button>
                  )}
                  <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-7 w-7">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ScrollArea className="max-h-96">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex gap-3 p-2">
                        <Skeleton className="h-10 w-10 rounded-full shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                    <div className="bg-muted rounded-full p-4 mb-3">
                      <Bell className="h-8 w-8 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium">لا توجد إشعارات</p>
                    <p className="text-xs mt-1">ستظهر الإشعارات الجديدة هنا</p>
                  </div>
                ) : (
                  <div className="divide-y divide-border/50">
                    {notifications.map((notification) => {
                      const config = typeConfig[notification.type] || typeConfig.INFO;
                      const Icon = config.icon;

                      return (
                        <motion.div
                          key={notification.id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className={`group flex gap-3 px-4 py-3 transition-colors hover:bg-muted/30 cursor-pointer ${
                            !notification.isRead ? 'bg-primary/5' : ''
                          }`}
                          onClick={() => {
                            if (!notification.isRead) markAsRead(notification.id);
                          }}
                        >
                          <div className={`shrink-0 h-10 w-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
                            <Icon className={`h-5 w-5 ${config.color}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <p className={`text-sm font-semibold leading-tight ${!notification.isRead ? 'text-foreground' : 'text-muted-foreground'}`}>
                                {notification.title}
                              </p>
                              {!notification.isRead && (
                                <Circle className="h-2 w-2 fill-primary text-primary shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                              {notification.body}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] text-muted-foreground/70">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                              <Badge variant="outline" className="text-[10px] h-4 px-1.5 py-0 border-border/50">
                                {config.label}
                              </Badge>
                            </div>
                          </div>
                          <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                            {!notification.isRead && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  markAsRead(notification.id);
                                }}
                                className="p-1 rounded hover:bg-muted/50 text-muted-foreground hover:text-primary"
                                aria-label="تعليم كمقروء"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteNotification(notification.id);
                              }}
                              className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500"
                              aria-label="حذف"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>

              {notifications.length > 0 && (
                <div className="border-t border-border px-4 py-2 bg-muted/20">
                  <p className="text-[10px] text-muted-foreground text-center">
                    عرض آخر {notifications.length} إشعار
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
