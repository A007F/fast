# Task 7 - Tracking Service Developer

## Task
Build WebSocket tracking service for real-time delivery tracking

## Status: ✅ Completed

## Files Created
- `/home/z/my-project/mini-services/tracking-service/package.json` - Standalone bun project config
- `/home/z/my-project/mini-services/tracking-service/prisma/schema.prisma` - Local Prisma schema mirroring main project
- `/home/z/my-project/mini-services/tracking-service/index.ts` - Socket.IO server implementation (~800 lines)

## Implementation Details

### Architecture
- Standalone bun mini-service running on port 3004
- Socket.IO with `path: "/"` for Caddy gateway forwarding
- Prisma client connecting to main project's SQLite database (`/home/z/my-project/db/custom.db`)
- CORS enabled for all origins

### Events Handled

**From Captain (Flutter app):**
- `captain:location` - GPS updates → save to DB, update captain position, broadcast to admins/customers
- `captain:status` - Online/available status → update DB, broadcast to admins
- `captain:parcel-update` - Parcel status change → update DB with timestamps, create timeline, broadcast

**From Admin (Dashboard):**
- `admin:subscribe` - Join tracking rooms (general or specific captain)
- `admin:unsubscribe` - Leave rooms, cleanup
- `admin:assign-captain` - Assign captain to parcel, notify captain, create timeline

**From Customer (Landing page):**
- `customer:track-parcel` - Join tracking room, receive current status/timeline/captain/location
- `customer:stop-tracking` - Leave room, cleanup

### Simulation
- Every 3 seconds, simulates captain movement for IN_TRANSIT parcels
- Calculates movement direction toward receiver with random drift
- Updates database and broadcasts to all admin/customer subscribers
- Verified working with seed data (2 IN_TRANSIT parcels found)

### Key Decisions
- Used absolute path (`import.meta.dir`) for database URL to avoid relative path resolution issues
- Local Prisma schema with `output = "../node_modules/.prisma/client"` for standalone generation
- In-memory state maps for admin subscribers, customer rooms, and captain sockets
- All user-facing messages in Arabic
- Graceful shutdown with cleanup
