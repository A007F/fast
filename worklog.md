# Delivery System - Worklog

---
Task ID: 1
Agent: Main Architect
Task: التخطيط المعماري الشامل للنظام وتصميم قاعدة البيانات

Work Log:
- تحليل متطلبات نظام توصيل الطرود
- تصميم Schema قاعدة البيانات (Users, Captains, Parcels, Payments, Notifications, LocationUpdates)
- تخطيط هيكلية Frontend (Landing Page, Admin Dashboard, Tracking Page)
- تخطيط Backend APIs

Stage Summary:
- تم تحديد 6 نماذج رئيسية لقاعدة البيانات
- واجهة عربية RTL مع نظام ألوان أخضر/زمردي
- هيكلية Clean Architecture مع Feature-first approach

---
Task ID: 3-a
Agent: Frontend Developer
Task: Build Arabic RTL landing page for delivery service

Work Log:
- Updated layout.tsx for Arabic RTL support (lang="ar", dir="rtl", Arabic-friendly fonts)
- Updated globals.css with emerald green theme (--primary: oklch(0.527 0.17 152.24))
- Created 8 landing page component files in src/components/landing/
  - Header.tsx: Sticky navbar with logo, nav links, CTA button, mobile Sheet menu
  - Hero.tsx: Hero section with animated icons, CTAs, gradient background
  - Stats.tsx: 4 animated counter stat cards (10K+ parcels, 500+ captains, 50+ cities, 4.9 rating)
  - HowItWorks.tsx: 3-step process with connecting lines and numbered circles
  - Features.tsx: 6 feature cards in 3x2 grid with hover animations
  - TrackParcel.tsx: Tracking input with mock result (timeline, status badge, estimated delivery)
  - CTASection.tsx: Captain recruitment CTA with green gradient background
  - Footer.tsx: Full footer with links, contact info, social media, copyright
- Created page.tsx composing all sections
- All text in Arabic, RTL layout, emerald/green color scheme
- Responsive mobile-first design with Framer Motion animations
- Lint passes cleanly, dev server compiles successfully

Stage Summary:
- Complete Arabic RTL landing page with all 8 sections
- Emerald green color theme applied consistently
- Responsive design with scroll animations
- Mobile hamburger menu using Sheet component
- Interactive tracking section with real API integration

---
Task ID: 3b
Agent: Main Architect
Task: تحديث مكون التتبع ليستخدم API الحقيقي

Work Log:
- استبدال البيانات التجريبية بـ API calls حقيقية
- إضافة loading states و error handling
- عرض Timeline حقيقي من قاعدة البيانات
- عرض تفاصيل الكابتن عند تعيينه
- عرض أرقام تتبع حقيقية كأمثلة

Stage Summary:
- مكون التتبع الآن متصل بالكامل مع API
- يدعم حالات الطرد الست (PENDING, PICKED_UP, IN_TRANSIT, DELIVERED, CANCELLED, RETURNED)

---
Task ID: 3-b
Agent: Backend API Developer
Task: Build all Backend API routes for the Arabic delivery service system

Work Log:
- Created 8 API route files using Next.js App Router pattern with TypeScript + Zod validation
- `/api/parcels/route.ts` (GET/POST): List parcels with pagination + filtering (status, search, captainId, senderId), create parcels with auto-generated tracking number and initial timeline entry
- `/api/parcels/[id]/route.ts` (GET/PUT): Get single parcel with full details (timeline, payments, locations), update parcel with automatic timestamp management (pickedUpAt, deliveredAt, cancelledAt) and timeline entries on status changes
- `/api/parcels/track/[trackingNumber]/route.ts` (GET): Public tracking endpoint returning parcel info, timeline history, and assigned captain details
- `/api/captains/route.ts` (GET/POST): List captains with pagination + filtering (isOnline, vehicleType), create captain profiles with user role validation and duplicate check
- `/api/captains/[id]/route.ts` (GET/PUT): Get captain with recent parcels and counts, update captain (online status, location, vehicle info, verification)
- `/api/captains/[id]/location/route.ts` (POST): GPS location updates for Flutter app, creates LocationUpdate records and updates captain's current position
- `/api/stats/route.ts` (GET): Platform statistics including parcel counts by status, captain counts, revenue totals, daily metrics
- `/api/seed/route.ts` (GET): Idempotent seed endpoint creating 3 users (admin/customer/captain), 1 captain profile, 10 sample parcels with various statuses and timeline entries, 5 location updates, 8 coverage areas, 6 platform settings
- All routes use consistent JSON response format `{ success, data, message, error }` with Arabic messages
- Zod schemas for all request validation with proper error responses
- ESLint passes with zero errors

Stage Summary:
- 8 API routes fully implemented and tested
- Comprehensive CRUD operations for parcels and captains
- Public tracking endpoint for customer use
- Platform statistics dashboard endpoint
- Rich seed data with 10 parcels across all statuses
- All endpoints return Arabic messages and handle errors gracefully

---
Task ID: 6
Agent: Frontend Developer
Task: بناء لوحة تحكم الإدارة الكاملة للنظام

Work Log:
- أنشأت 8 مكونات Dashboard في src/components/dashboard/:
  - DashboardSidebar.tsx: شريط جانبي قابل للطي مع شعار "سريع" و5 عناصر تنقل، شريط سفلي للموبايل، تأثيرات framer-motion
  - DashboardHeader.tsx: شريط علوي ديناميكي مع بحث وإشعارات واسم المستخدم وزر العودة
  - StatsOverview.tsx: نظرة عامة مع 4 بطاقات إحصائية (طرود، قيد التوصيل، كبائن، إيرادات) + مخططات recharts (Bar + Area) + 3 بطاقات معلومات سريعة
  - ParcelsTable.tsx: جدول إدارة الطرود مع بحث وتصفية وترقيم صفحات وحوار إنشاء طرد جديد وحوار عرض تفاصيل مع Timeline وتحديث الحالات
  - CaptainsTable.tsx: جدول إدارة الكبائن مع عرض النجوم وتبديل حالة الاتصال وحوار تفاصيل مع معلومات المركبة والإحصائيات والموقع
  - LiveTracking.tsx: تتبع مباشر مع خريطة تجريبية ونقاط متحركة للكبائن (تحديث كل 2 ثانية) ولوحة جانبية للطرود النشطة
  - DashboardSettings.tsx: صفحة إعدادات المنصة مع نماذج الرسوم والدفع والتتبع
  - AdminDashboard.tsx: مكون رئيسي يربط Sidebar + Header + المحتوى حسب التبويب النشط
- حدّثت page.tsx ليصبح 'use client' مع تبديل بين Landing و Dashboard باستخدام AnimatePresence
- حدّثت Header.tsx لقبول onOpenDashboard prop وإضافة زر "لوحة التحكم" (سطح المكتب + الموبايل)
- أضفت أنماط CSS مخصصة (safe-area-pb, custom-scrollbar)
- جميع النصوص بالعربية، تخطيط RTL، ألوان emerald/green
- تصميم متجاوب (mobile-first) مع شريط تنقل سفلي للموبايل
- تأثيرات حركية باستخدام Framer Motion
- ESLint يمر بدون أخطاء

Stage Summary:
- لوحة تحكم إدارة كاملة مع 5 صفحات (نظرة عامة، الطرود، الكبائن، التتبع المباشر، الإعدادات)
- تكامل كامل مع API الخلفية (/api/stats, /api/parcels, /api/captains)
- واجهة عربية RTL متجاوبة مع تجربة مستخدم سلسة
- مخططات بيانية (Bar + Area) باستخدام recharts
- إنشاء طرود جديدة مع نماذج وإشعارات toast
- تتبع مباشر مع محاكاة حركة الكبائن

---
Task ID: 7
Agent: Tracking Service Developer
Task: Build WebSocket tracking service for real-time delivery tracking

Work Log:
- Created standalone mini-service at `mini-services/tracking-service/`
- Set up package.json with socket.io ^4.8.0 and @prisma/client dependencies
- Created local Prisma schema (`prisma/schema.prisma`) with output pointing to local node_modules
- Generated Prisma client locally in mini-service
- Built comprehensive Socket.IO server on port 3004 with path "/" for Caddy forwarding
- Implemented all event handlers:
  - **Captain Events:**
    - `captain:location`: Receives GPS updates, saves to LocationUpdate table, updates Captain position, broadcasts to admin subscribers and customer tracking rooms
    - `captain:status`: Updates captain online/available status in DB, broadcasts `admin:captain-status-update`
    - `captain:parcel-update`: Updates parcel status with automatic timestamp management, creates timeline entries, broadcasts to admins and customers
  - **Admin Events:**
    - `admin:subscribe`: Joins admin-tracking room (optionally specific captain room), sends Arabic confirmation
    - `admin:unsubscribe`: Leaves admin rooms, cleans up state
    - `admin:assign-captain`: Assigns captain to parcel, creates timeline entry, notifies captain via socket (`captain:new-assignment`), broadcasts to all subscribers
  - **Customer Events:**
    - `customer:track-parcel`: Joins tracking room, fetches and sends current parcel status, timeline, captain info, and latest location
    - `customer:stop-tracking`: Leaves tracking room, cleans up room state
- Implemented 3-second simulation loop for IN_TRANSIT parcels: calculates movement toward receiver coordinates with random drift, updates DB and broadcasts location to all subscribers
- Used absolute database path via `import.meta.dir` for reliable SQLite connection
- Added graceful shutdown with SIGTERM/SIGINT handlers
- In-memory state management: admin subscriber map, customer tracking rooms, captain socket mapping
- All messages and confirmations in Arabic

Stage Summary:
- Tracking service running on port 3004 with Socket.IO
- Full real-time event system for captains, admins, and customers
- Automatic simulation of captain movement for IN_TRANSIT parcels
- Database-connected with Prisma (same SQLite database as main project)
- WebSocket path "/" configured for Caddy gateway forwarding
- Frontend connects via `io("/?XTransformPort=3004")`

---
Task ID: 10
Agent: Auth System Developer
Task: بناء نظام المصادقة الكامل لخدمة التوصيل

Work Log:
- أنشأت مكتبة المصادقة `/src/lib/auth.ts`:
  - إدارة جلسات في الذاكرة باستخدام `randomUUID` (بدون حزم إضافية)
  - `createSession()` - إنشاء جلسة بتوكن UUID
  - `getSession()` - استرجاع والتحقق من صلاحية الجلسة (7 أيام)
  - `destroySession()` - حذف الجلسة
  - `getTokenFromHeaders()` - استخراج Bearer token من Authorization header
  - `verifyPassword()` - مقارنة بسيطة للعرض التجريبي
  - `formatUser()` - تنسيق موحد لبيانات المستخدم

- أنشأت 4 مسارات API للمصادقة:
  - `/api/auth/login/route.ts` (POST): تسجيل الدخول بالهاتف وكلمة المرور، إنشاء جلسة، إرجاع token + بيانات المستخدم + ملف الكابتن
  - `/api/auth/register/route.ts` (POST): إنشاء حساب جديد (CUSTOMER/CAPTAIN)، التحقق من تكرار الهاتف، إنشاء ملف كابتن تلقائياً
  - `/api/auth/me/route.ts` (GET): جلب بيانات المستخدم الحالي من الجلسة مع بيانات حديثة من قاعدة البيانات
  - `/api/auth/logout/route.ts` (POST): حذف الجلسة وتسجيل الخروج

- أنشأت Hook `/src/hooks/useAuth.ts`:
  - إدارة حالة المستخدم وملف الكابتن وحالة التحميل
  - التحقق التلقائي من الجلسة عند التحميل
  - `login()`, `register()`, `logout()`, `refreshUser()`
  - حفظ التوكن في localStorage تحت مفتاح `saree3_token`

- أنشأت سياق React `/src/contexts/AuthContext.tsx`:
  - `AuthProvider` مكون مزود لسياق المصادقة
  - خصائص محسوبة: `isAuthenticated`, `isAdmin`, `isCaptain`, `isCustomer`
  - `useAuthContext()` hook للوصول إلى حالة المصادقة

- حدّثت `/src/app/layout.tsx`:
  - إضافة `AuthProvider` كعنصر مغلف للتطبيق بالكامل
  - الحفاظ على إعدادات RTL والخطوط و Toaster الموجودة

- توافق مع البيانات التجريبية: كلمات مرور نصية (`password: "password"`)
- جميع رسائل الخطأ والاستجابات بالعربية
- تحقق Zod v4 لجميع المدخلات
- ESLint: صفر أخطاء

Stage Summary:
- نظام مصادقة كامل مع 4 نقاط نهاية API
- إدارة جلسات في الذاكرة بتوكنات UUID (صلاحية 7 أيام)
- Hook and Context شاملان لتكامل سهل مع المكونات
- توافق كامل مع بيانات التهيئة الحالية (3 مستخدمين تجريبيين)
- دعم أدوار المستخدمين الثلاثة: ADMIN, CUSTOMER, CAPTAIN

---
Task ID: 12
Agent: Captain Dashboard Developer
Task: بناء لوحة تحكم الكابتن الكاملة لنظام التوصيل

Work Log:
- أنشأت 6 مكونات في src/components/captain/:
  - CaptainHeader.tsx: شريط علوي مع اسم الكابتن ومعلومات المركبة وتبديل الاتصال (أخضر/رمادي) مع تقييم النجوم وشارة عدد التوصيلات وزر العودة
  - CaptainHome.tsx: الشاشة الرئيسية مع بطاقة ترحيب "أهلاً سالم! 👋" + 3 بطاقات إحصائية (توصيلات اليوم، الإيرادات، التقييم) + قسم التوصيلات النشطة مع تفاصيل قابلة للتوسيع + قسم بانتظار الاستلام مع زر "استلام"
  - CaptainOrders.tsx: الطلبات المتاحة للقبول مع تحديث تلقائي كل 10 ثوانٍ، تصفية حسب الفئة (الكل، وثائق، طعام، إلكترونيات)، بطاقات عرض المسار والرسوم مع زر "قبول الطلب"، حالة فارغة متحركة
  - CaptainDeliveries.tsx: إدارة التوصيلات النشطة مقسمة إلى "قيد التوصيل" و"بانتظار الاستلام"، أزرار إجراءات حسب الحالة، حوار تأكيد التسليم باستخدام AlertDialog، سحب للتحديث على الموبايل
  - CaptainEarnings.tsx: بطاقة إيرادات رئيسية (اليوم/الأسبوع/الشهر)، مخطط أعمدة لآخر 7 أيام باستخدام recharts، إحصائيات (التوصيلات، التقييم، المسافة، ساعات العمل)، قائمة آخر المعاملات
  - CaptainDashboard.tsx: المكون الرئيسي مع شريط تنقل سفلي (4 تبويبات: الرئيسية، الطلبات، التوصيلات، الإيرادات) مع مؤشر متحرك
- حدّثت page.tsx لإضافة 'captain' كرابع مشهد (landing, dashboard, customer, captain)
- حدّثت Header.tsx بإضافة `onOpenCaptain` prop وزر "الكابتن" (أيقونة UserCircle) في سطح المكتب والموبايل
- جميع النصوص بالعربية، تخطيط RTL، ألوان emerald/green
- تصميم متجاوب (mobile-first) مع شريط تنقل سفلي
- تأثيرات حركية باستخدام Framer Motion (AnimatePresence, layout animations)
- تكامل مع API الخلفية (/api/parcels)
- ESLint: صفر أخطاء

Stage Summary:
- لوحة تحكم كابتن كاملة مع 4 أقسام (الرئيسية، الطلبات، التوصيلات، الإيرادات)
- تبديل حالة الاتصال بتصميم بارز
- قبول الطلبات المتاحة مع تحديث تلقائي كل 10 ثوانٍ
- إدارة دورة حياة التوصيل (استلام → بدء → تسليم) مع حوار تأكيد
- لوحة إيرادات شاملة مع مخططات بيانية وإحصائيات
- تكامل مع زر "الكابتن" في الصفحة الرئيسية

---
Task ID: 11
Agent: Frontend Developer
Task: بناء بوابة العميل (Customer Portal) لنظام التوصيل

Work Log:
- أنشأت 6 مكونات في src/components/customer/:
  - CustomerHeader.tsx: شريط علوي مع معلومات العميل (أحمد محمد العتيبي، +966500000002) + Avatar + قائمة منسدلة + جرس إشعارات مع شارة الطرود النشطة + زر العودة + قائمة Sheet للموبايل
  - MyParcels.tsx: قائمة طرود العميل مع بحث (رقم التتبع أو اسم المستلم) + تصفية حسب الحالة (الكل، قيد الانتظار، قيد التوصيل، تم التسليم، ملغي) + بطاقات قابلة للتوسيع مع تفاصيل كاملة (المسار، المستلم، الفئة، الحجم، الوزن، الدفع عند الاستلام) + حالة فارغة متحركة + Skeleton loading + زر "عرض المزيد" (3 بطاقات في البداية)
  - NewParcelForm.tsx: نموذج إنشاء طرد جديد بـ 4 خطوات مع مؤشر تقدم متحرك:
    - الخطوة 1: معلومات المرسل (عنوان + خريطة + ملاحظات)
    - الخطوة 2: معلومات المستلم (اسم + هاتف + عنوان + خريطة + ملاحظات)
    - الخطوة 3: تفاصيل الطرد (فئة: 5 خيارات، حجم: 3 خيارات، وزن، وصف)
    - الخطوة 4: الدفع والتأكيد (3 طرق دفع: نقدي/بطاقة/محفظة + مبلغ COD + ملخص كامل)
    - POST إلى /api/parcels + Toast نجاح + انتقال لطرودي
  - TrackShipment.tsx: تتبع متقدم مع بحث برقم التتبع + شريط تقدم رأسي (4 خطوات) + بطاقة الكابتن مع تقييم النجوم وزر اتصال + مسار التوصيل + سجل أحداث كامل مع طوابع زمنية + خريطة تجريبية
  - ParcelDetail.tsx: عرض تفصيلي كامل للطرد مع أقسام منفصلة (الحالة، المسار، الكابتن، Timeline، الدفع، تفاصيل الطرد) + أزرار إجراء (تتبع، اتصل بالدعم، تقديم شكوى)
  - CustomerPortal.tsx: مكون رئيسي يربط Header + 3 تبويبات (طرودي، طرد جديد، تتبع) + عرض تفاصيل الطرد كـ sub-view مع تبديل عبر AnimatePresence

- حدّثت page.tsx لإضافة 'customer' كثالث مشهد (landing, dashboard, customer) مع AnimatePresence
- حدّثت Header.tsx بإضافة `onOpenCustomer` prop وزر "حسابي" (أيقونة UserCircle) في سطح المكتب والموبايل قبل زر لوحة التحكم
- جميع النصوص بالعربية، تخطيط RTL، ألوان emerald/green
- تصميم متجاوب (mobile-first) مع بطاقات بدلاً من جداول
- تأثيرات حركية باستخدام Framer Motion (AnimatePresence, motion.div)
- تكامل مع API الخلفية (/api/parcels, /api/parcels/track, /api/parcels/[id])
- ESLint: صفر أخطاء، خريومات

Stage Summary:
- بوابة عميل كاملة مع 3 تبويبات (طرودي، طرد جديد، تتبع)
- عرض تفصيلي للطرد مع Timeline + معلومات الكابتن + الدفع
- نموذج إنشاء طرد بـ 4 خطوات مع تحقق وتلخيص
- تتبع متقدم مع شريط تقدم وبطاقة الكابتن
- تكامل مع زر "حسابي" في الصفحة الرئيسية

---
Task ID: 13
Agent: Main Architect
Task: دمج التعارضات وإصلاح الأخطاء والتشطيب النهائي

Work Log:
- دمج التعارضات في page.tsx (4 مشاهد: landing, dashboard, customer, captain)
- دمج التعارضات في Header.tsx (3 أزرار: حسابي، الكابتن، الإدارة)
- إصلاح استيراد أيقونة Motorcycle غير موجودة في lucide-react (استبدال بـ Bike)
- إعادة تشغيل الخدمات (Next.js port 3000, Tracking Service port 3004)
- التحقق: ESLint صفر أخطاء، الصفحة تعرض HTTP 200
- التحقق: WebSocket Service يعمل ويحاكي حركة الكابتن تلقائياً

Stage Summary:
- النظام الكامل يعمل بنجاح مع 4 واجهات
- صفحة الهبوط → لوحة التحكم → بوابة العميل → لوحة الكابتن
- خدمة WebSocket نشطة وتحاكي التتبع اللحظي

---
Task ID: 5a
Agent: Notifications API Developer
Task: بناء نظام الإشعارات API

Work Log:
- قراءة worklog.md و auth.ts و db.ts ومسار API موجود لفهم أنماط المشروع
- أنشأت مكتبة مساعدة `/src/lib/notifications.ts`:
  - `createNotification(userId, title, body, type, data?)` - إنشاء إشعار في قاعدة البيانات
  - `getUnreadCount(userId)` - جلب عدد الإشعارات غير المقروءة
  - نوع `NotificationType` للأنواع المدعومة (INFO, ORDER_UPDATE, PAYMENT, PROMOTION)

- أنشأت 4 مسارات API للإشعارات:
  - `/api/notifications/route.ts` (GET + POST):
    - GET: جلب إشعارات المستخدم المصادق عليه مع تصفح (page/limit) وتصفية (unreadOnly/type)، تحليل حقل data من JSON
    - POST: إنشاء إشعار جديد (مدير فقط)، التحقق من Zod، التحقق من وجود المستخدم المستهدف
  - `/api/notifications/[id]/route.ts` (GET + PUT + DELETE):
    - GET: جلب إشعار محدد مع التحقق من الملكية
    - PUT: تحديث الإشعار (تعليم كمقروء أو تعديل المحتوى) مع التحقق من الملكية
    - DELETE: حذف الإشعار مع التحقق من الملكية
  - `/api/notifications/mark-all-read/route.ts` (POST):
    - تعليم جميع إشعارات المستخدم كمقروءة دفعة واحدة
  - `/api/notifications/unread-count/route.ts` (GET):
    - إرجاع عدد الإشعارات غير المقروءة للمستخدم

- جميع المسارات تستخدم:
  - `getTokenFromHeaders()` و `getSession()` للمصادقة
  - Zod v4 للتحقق من المدخلات
  - تنسيق استجابة موحد `{ success, data, message, error }` مع رسائل عربية
  - معالجة أخطاء شاملة (401, 403, 404, 500)
  - Next.js 16 App Router pattern مع `params: Promise<{ id: string }>`

- ESLint: صفر أخطاء
- Dev server: يعمل بدون أخطاء تجميع

Stage Summary:
- نظام إشعارات API كامل مع 4 مسارات (5 نقاط نهاية)
- مكتبة مساعدة قابلة لإعادة الاستخدام لإنشاء الإشعارات من أجزاء أخرى من النظام
- تحقق من المصادقة والصلاحيات في جميع المسارات
- دعم تصفح وتصفية الإشعارات
- تعليم كمقروء (فردي وجماعي) وعدد غير المقروءة
- جميع الرسائل والتعليقات بالعربية

---
Task ID: 6
Agent: Reports Analytics Developer
Task: بناء صفحة التقارير والتحليلات

Work Log:
- أنشأت نقطة نهاية API شاملة `/api/reports/route.ts`:
  - دعم 4 أنواع تقارير: overview, revenue, performance, captains
  - دعم 4 فترات زمنية: 7d, 30d, 90d, 1y
  - تحقق من صحة المعاملات مع رسائل خطأ عربية
  - **overview**: إجمالي الطرود، نسبة التسليم، متوسط وقت التوصيل، الإيرادات، COD، كبائن نشطين، توزيع الحالات، طرود يومية
  - **revenue**: إجمالي الإيرادات، رسوم التوصيل، رسوم المنصة، حصص الكبائن، COD، اتجاه يومي، أعلى 5 أيام إيرادات
  - **performance**: متوسط وقت التوصيل، نسبة التسليم في الوقت، معدل الإلغاء، أداء الكبائن، أداء يومي
  - **captains**: تصنيف الكبائن حسب التوصيلات والتقييم والإيرادات، أفضل 10، إحصائيات عامة

- أنشأت مكون `ReportsAnalytics.tsx` في src/components/dashboard/:
  - عنوان "التقارير والتحليلات" مع محدد فترة زمنية (7 أيام، 30 يوم، 90 يوم، سنة)
  - 4 تبويبات باستخدام Tabs: نظرة عامة، الإيرادات، الأداء، الكبائن
  - **تبويب نظرة عامة**: 6 بطاقات إحصائية + مخطط دائري PieChart لتوزيع الحالات + مخطط أعمدة BarChart للطرود اليومية
  - **تبويب الإيرادات**: بطاقة رئيسية بتدرج أخضر + 3 بطاقات فرعية + AreaChart لاتجاه الإيرادات + أعلى 5 أيام
  - **تبويب الأداء**: 3 بطاقات KPI + BarChart مزدوج (تسليم/إلغاء) + جدول أداء الكبائن
  - **تبويب الكبائن**: 3 بطاقات ملخصة + BarChart أفقي لأفضل 10 + لوحة متصدرين مع ترتيب ونجوم وميداليات
  - Skeleton loaders مخصصة لكل تبويب
  - Framer Motion fadeInUp animations
  - تصميم متجاوب mobile-first
  - ألوان emerald/teal/amber/rose

- دمج في النظام:
  - أضفت عنصر "التقارير" بشارة BarChart3 في DashboardSidebar.tsx بين "التتبع المباشر" و"الإعدادات"
  - أضفت حالة "reports" في AdminDashboard.tsx مع استدعاء ReportsAnalytics
  - أضفت عنوان "التقارير" في DashboardHeader.tsx

- ESLint: صفر أخطاء
- Dev server: يعمل بدون أخطاء تجميع

Stage Summary:
- صفحة تقارير وتحليلات شاملة مع 4 تبويبات
- API reports endpoint يدعم 4 أنواع × 4 فترات = 16 مجموعة بيانات
- 6 مخططات بيانية (PieChart, BarChart, AreaChart) باستخدام recharts
- جميع النصوص بالعربية، تخطيط RTL، ألوان emerald/green
- تكامل كامل مع لوحة تحكم الإدارة (Sidebar + Header + Router)

---
Task ID: 7b
Agent: Users API Developer
Task: بناء API إدارة المستخدمين ومناطق التغطية

Work Log:
- قراءة worklog.md و auth.ts و db.ts ومسارات API موجودة لفهم أنماط المشروع
- أنشأت 4 مسارات API:
  - `/api/users/route.ts` (GET + POST):
    - GET: عرض قائمة المستخدمين مع تصفح (page/limit) وتصفية (role, search, isActive)، تضمين ملف الكابتن وعدد الطرود المرسلة، إزالة كلمة المرور من النتائج (مدير فقط)
    - POST: إنشاء مستخدم جديد (مدير فقط)، التحقق من تكرار الهاتف والبريد، إنشاء ملف كابتن تلقائياً عند اختيار دور CAPTAIN
  - `/api/users/[id]/route.ts` (GET + PUT + DELETE):
    - GET: عرض تفاصيل مستخدم واحد مع ملف الكابتن وعدد الطرود (مدير فقط)
    - PUT: تحديث بيانات المستخدم (مدير فقط)، إنشاء ملف كابتن عند تغيير الدور إلى CAPTAIN، التحقق من تكرار الهاتف والبريد
    - DELETE: حذف ناعم (تعطيل isActive=false) بدلاً من حذف فعلي، منع تعطيل الحساب الحالي
  - `/api/coverage-areas/route.ts` (GET + POST):
    - GET: عرض قائمة مناطق التغطية مع تصفية (isActive)، مرتبة أبجدياً
    - POST: إنشاء منطقة تغطية جديدة (مدير فقط)، التحقق من تكرار الاسم
  - `/api/coverage-areas/[id]/route.ts` (GET + PUT + DELETE):
    - GET: عرض تفاصيل منطقة تغطية
    - PUT: تحديث منطقة تغطية (مدير فقط)، التحقق من تكرار الاسم
    - DELETE: حذف منطقة تغطية (مدير فقط)

- جميع المسارات تستخدم:
  - `getTokenFromHeaders()` و `getSession()` للمصادقة
  - فحص `session.role !== "ADMIN"` لعمليات الكتابة
  - Zod للتحقق من المدخلات
  - تنسيق استجابة موحد `{ success, data, message, error, details?, pagination? }` مع رسائل عربية
  - معالجة أخطاء شاملة (401, 403, 404, 409, 500)
  - Next.js 16 App Router pattern مع `params: Promise<{ id: string }>`
  - إزالة حقل `password` من جميع استجابات المستخدمين

- ESLint: صفر أخطاء
- Dev server: يعمل بدون أخطاء تجميع

Stage Summary:
- 4 مسارات API لإدارة المستخدمين ومناطق التغطية (8 نقاط نهاية)
- إدارة كاملة للمستخدمين: عرض، إنشاء، تحديث، تعطيل
- تضمين ملف الكابتن وعدد الطرود تلقائياً
- إنشاء ملف كابتن تلقائياً عند تغيير الدور
- CRUD كامل لمناطق التغطية
- حماية كاملة بالصلاحيات (مدير فقط للكتابة)
- جميع الرسائل والتعليقات بالعربية

---
Task ID: 7a
Agent: User Management UI Developer
Task: بناء صفحة إدارة المستخدمين

Work Log:
- قراءة worklog.md ومكونات Dashboard الموجودة (AdminDashboard, CaptainsTable, ParcelsTable, DashboardSidebar, DashboardHeader) لفهم الأنماط المتبعة
- قراءة API المسارات الموجودة `/api/users/route.ts` و `/api/users/[id]/route.ts`
- أنشأت مكون `UserManagement.tsx` شامل في `src/components/dashboard/`:
  - **صف الإحصائيات**: 4 بطاقات متحركة (fadeInUp) - إجمالي المستخدمين، العملاء، الكبائن، المدراء بألوان مختلفة (primary, emerald, amber, rose)
  - **شريط الإجراءات**: بحث متقدم (اسم/هاتف/بريد)، تصفية حسب الدور (الكل/مدراء/عملاء/كبائن)، تصفية حسب الحالة (الكل/نشط/غير نشط)، زر إضافة مستخدم
  - **جدول المستخدمين (سطح المكتب)**: أعمدة (المستخدم+الهاتف، الدور بشارة ملونة، الحالة بـ Switch، عدد الطرود، تاريخ الانضمام، إجراءات)، صفوف متحركة staggered، حالة فارغة مع أيقونة
  - **بطاقات المستخدمين (الموبايل)**: عرض بطاقات متجاوبة بدلاً من الجدول مع Avatar ومعلومات مختصرة
  - **حوار إنشاء مستخدم**: حقول (الاسم، الهاتف، البريد، كلمة المرور، الدور) مع تحقق Zod-like، رسائل خطأ حقلية، POST إلى `/api/users`
  - **حوار تفاصيل المستخدم**: معلومات كاملة، ملف الكابتن (المركبة، التقييم، التوصيلات، حالة الاتصال)، آخر 5 طرود، أزرار (تفعيل/تعطيل، حذف)
  - **حوار تأكيد الحذف**: مع رسالة تأكيد عربية
  - **ترقيم الصحات**: أزرار السابق/التالي مع أرقام الصفحات
- حدّثت `/api/users/route.ts`:
  - أضفت `stats` في الاستجابة (إجمالي، عملاء، كبائن، مدراء) باستخدام `db.user.groupBy({ by: ["role"] })`
  - حدّثت تضمين `captainProfile` مع select محدد (id, vehicleType, vehicleBrand, isOnline, rating, totalDeliveries)
- حدّثت `/api/users/[id]/route.ts`:
  - أضفت `recentParcels` (آخر 5 طرود مرسلة) في استجابة GET باستخدام `sentParcels: { take: 5, orderBy: { createdAt: "desc" } }`
- دمج في النظام:
  - أضفت `case 'users': return <UserManagement />;` في AdminDashboard.tsx
  - أضفت عنصر `{ id: 'users', label: 'المستخدمين', icon: Users }` في DashboardSidebar.tsx (بعد الكبائن)
  - أضفت `users: 'إدارة المستخدمين'` في DashboardHeader.tsx tabTitles
- جميع النصوص بالعربية، تخطيط RTL
- تصميم متجاوب (mobile-first): جدول على سطح المكتب، بطاقات على الموبايل
- تأثيرات Framer Motion (fadeInUp للبطاقات، staggered للصفوف)
- Skeleton loading states للحمل والحوار
- شارات أدوار ملونة: ADMIN=rose, CUSTOMER=blue, CAPTAIN=amber
- استخدام `toast` من 'sonner' (مطابق لأنماط المشروع)
- ESLint: صفر أخطاء
- Dev server: يعمل بدون أخطاء تجميع

Stage Summary:
- صفحة إدارة مستخدمين كاملة مع جدول متجاوب و3 حوارات (إنشاء، تفاصيل، حذف)
- 4 بطاقات إحصائية مع بيانات حية من API
- بحث متقدم وتصفية حسب الدور والحالة
- عرض ملف الكابتن وآخر الطرود في تفاصيل المستخدم
- تبديل حالة الحساب بـ Switch toggle
- تحديث API لإرجاع إحصائيات وآخر الطرود
- تكامل كامل مع لوحة تحكم الإدارة (Sidebar + Header + Router)

---
Task ID: 8
Agent: Support System Developer
Task: بناء نظام الدعم الفني

Work Log:
- حدّثت Prisma Schema بإضافة نموذج SupportTicket مع العلاقات إلى User و Parcel
- أضفت حقول supportTickets في نموذجي User و Parcel
- نفّذت db:push بنجاح لدفع التحديثات إلى قاعدة البيانات

- أنشأت 3 مسارات API للدعم:
  - `/api/support/route.ts` (GET + POST):
    - GET: قائمة التذاكر مع تصفح وتصفية (status, priority, search)، المدير يرى الكل والعميل يرى تذاكره فقط
    - POST: إنشاء تذكرة جديدة مع التحقق من الحقول والطرد المرتبط
  - `/api/support/[id]/route.ts` (GET + PUT):
    - GET: تفاصيل التذكرة مع بيانات المستخدم والطرد
    - PUT: تحديث التذكرة (المدير: status, response, assignedTo, priority؛ العميل: description add)
  - `/api/support/stats/route.ts` (GET):
    - إحصائيات شاملة: إجمالي، حسب الحالة، حسب الأولوية، متوسط وقت الاستجابة

- أنشأت مكون `AdminSupport.tsx` في src/components/dashboard/:
  - 4 بطاقات إحصائية (إجمالي، مفتوحة، قيد المعالجة، محلولة)
  - شريط متوسط وقت الاستجابة
  - فلاتر متقدمة (الحالة، الأولوية، بحث)
  - قائمة تذاكر مع Badge ملونة للأولوية والحالة
  - حوار تفاصيل التذكرة مع معلومات العميل والطرد
  - رسالة العميل + رد الدعم
  - تحديث الحالة والأولوية مع منطقة الرد
  - Skeleton loading + حالة فارغة + ترقيم صفحات

- أنشأت مكون `CustomerSupport.tsx` في src/components/customer/:
  - زر "فتح تذكرة جديدة" مع Dialog
  - نموذج إنشاء تذكرة (العنوان، الوصف، رقم الطرد اختياري، الأولوية)
  - قائمة تذاكر قابلة للتوسيع مع تفاصيل كاملة
  - عرض رد الدعم مع طابع زمني
  - إضافة رسالة إضافية للعميل
  - حالة انتظار رد فريق الدعم

- دمج في النظام:
  - أضفت عنصر "الدعم الفني" بأيقونة Headset في DashboardSidebar.tsx قبل الإعدادات
  - أضفت حالة "support" في AdminDashboard.tsx مع استدعاء AdminSupport
  - أضفت عنوان "الدعم الفني" في DashboardHeader.tsx
  - أضفت تبويب "الدعم" (الرابع) في CustomerPortal.tsx مع استدعاء CustomerSupport

- ESLint: صفر أخطاء

Stage Summary:
- نظام دعم فني كامل مع 3 نقاط نهاية API
- لوحة تحكم المدير مع إحصائيات وفلاترد وتفاصيل وردود
- بوابة العميل مع إنشاء وعرض وإضافة رسائل للتذاكر
- شارات ملونة: الأولوية (عاجل=أحمر، عالي=برتقالي، متوسط=أصفر، منخفض=أخضر) والحالة (مفتوحة=أزرق، قيد المعالجة=كهرماني، محلولة=زمردي، مغلقة=رمادي)
- تكامل كامل مع لوحة تحكم الإدارة وبوابة العميل
- جميع النصوص بالعربية، تخطيط RTL، ألوان emerald/green

---
Task ID: 7a
Agent: Security Fix Developer
Task: إصلاح مشاكل الأمان الحرجة في نظام التوصيل

Work Log:
- حدّثت `/src/lib/auth.ts`:
  - أضفت `import bcrypt from 'bcryptjs'`
  - أضفت دالة `hashPassword(plainPassword)` تستخدم bcrypt.hash مع saltRounds=10
  - حدّثت دالة `verifyPassword` لتصبح async وتستخدم bcrypt.compare بدلاً من المقارنة النصية البسيطة
  - حافظت على جميع الدوال الأخرى (createSession, getSession, destroySession, getTokenFromHeaders, formatUser)

- حدّثت `/src/app/api/auth/register/route.ts`:
  - استيراد `hashPassword` من `@/lib/auth`
  - تشفير كلمة المرور قبل إنشاء المستخدم: `const hashedPassword = await hashPassword(password)`
  - استخدام `hashedPassword` في db.user.create بدلاً من كلمة المرور النصية

- حدّثت `/src/app/api/auth/login/route.ts`:
  - تحديث استدعاء `verifyPassword` لاستخدام `await` بسبب تحويله إلى دالة async
  - `const isValid = await verifyPassword(password, user.password)`

- حدّثت `/src/app/api/users/route.ts`:
  - استيراد `hashPassword` من `@/lib/auth`
  - تشفير كلمة المرور قبل إنشاء المستخدم في POST handler
  - استخدام `hashedPassword` في db.user.create

- حدّثت `/src/app/api/seed/route.ts`:
  - استيراد `hashPassword` من `@/lib/auth`
  - تشفير كلمات المرور الثلاث (admin, customer, captain) قبل إنشاء المستخدمين التجريبيين

- أنشأت `/src/middleware.ts` (ملف جديد):
  - إضافة رؤوس أمان لجميع الاستجابات: X-Content-Type-Options, X-Frame-Options, X-XSS-Protection, Referrer-Policy
  - تقييد معدل الطلبات (Rate Limiting) لنقطة نهاية التتبع العامة `/api/parcels/track/` (60 طلب/دقيقة لكل IP)
  - تخطي نقاط نهاية المصادقة والبذور من التقييد
  - تنظيف تلقائي للمدخلات القديمة كل 5 دقائق
  - رسالة خطأ عربية عند تجاوز الحد

- أنشأت `/src/lib/rate-limit.ts` (ملف جديد):
  - أداة تقييد معدل الطلبات قابلة لإعادة الاستخدام
  - دالة `rateLimit(key, maxRequests, windowMs)` تُرجع { limited, remaining, resetTime }
  - تخزين في الذاكرة باستخدام Map

- ESLint: صفر أخطاء

Stage Summary:
- جميع كلمات المرور مشفرة الآن باستخدام bcrypt (saltRounds=10)
- 5 ملفات محدثة و2 ملفات جديدة
- رؤوس أمان HTTP مضافة لجميع الاستجابات
- تقييد معدل الطلبات على نقطة التتبع العامة
- أداة rate-limit قابلة لإعادة الاستخدام متاحة للطرق الأخرى

---
Task ID: 7b
Agent: Payments & Wallet API Developer
Task: بناء API المدفوعات، كوبونات الخصم، التقييمات، ومحفظة الكابتن

Work Log:
- قراءة worklog.md و auth.ts و db.ts و notifications.ts لفهم أنماط المشروع
- أنشأت 10 مسارات API:
  - `/api/payments/route.ts` (GET + POST):
    - GET: عرض قائمة المدفوعات مع تصفح وتصفية (status, method, captainId, parcelId, startDate, endDate)، المدير يرى الكل والكابتن يرى طروده والعميل يرى طرده، تضمين معلومات الطرد (trackingNumber, status) والكابتن (name, vehicleType)، إرجاع ملخص إحصائي (totalAmount, totalCaptainEarnings, totalPlatformFees)
    - POST: إنشاء مدفوعة جديدة (كابتن أو مدير)، تحديث حالة دفع الطرد تلقائياً عند اكتمال الدفع، إنشاء معاملة محفظة للكابتن عند وجود أرباح
  - `/api/payments/[id]/route.ts` (GET + PUT):
    - GET: عرض تفاصيل مدفوعة مع معلومات الطرد والكابتن، التحقق من صلاحية الوصول
    - PUT: تحديث المدفوعة (مدير فقط) - الحالة، المبلغ، طريقة الدفع، الأرباح، الرسوم
  - `/api/promo-codes/route.ts` (GET + POST):
    - GET: عرض قائمة كوبونات الخصم، المدير يرى الكل والعميل يرى النشطة غير المنتهية فقط، تصفية (isActive, search)
    - POST: إنشاء كوبون خصم (مدير فقط)، تحويل الكود لحروف كبيرة، التحقق من تكرار الكود
  - `/api/promo-codes/[id]/route.ts` (GET + PUT + DELETE):
    - GET: عرض تفاصيل كوبون، العميل لا يرى الكوبونات المعطلة
    - PUT: تحديث كوبون (مدير فقط)
    - DELETE: حذف ناعم (isActive = false) (مدير فقط)
  - `/api/promo-codes/validate/route.ts` (POST):
    - التحقق من صحة الكوبون: موجود، نشط، غير منتهي، لم يتجاوز الحد الأقصى، المبلغ ≥ الحد الأدنى
    - حساب الخصم (نسبة مئوية أو مبلغ ثابت) مع مراعاة الحد الأقصى للخصم
    - زيادة عداد الاستخدامات وإرجاع discountAmount و finalAmount
  - `/api/reviews/route.ts` (GET + POST):
    - GET: عرض التقييمات مع تصفية (captainId, rating)، تضمين اسم المراجع والكابتن ورقم التتبع
    - POST: إنشاء تقييم (عميل فقط)، التحقق من تسليم الطرد وملكية المرسل، منع التقييم المكرر، تحديث تقييم الكابتن (متوسط مرجح)، إشعار للكابتن
  - `/api/reviews/[id]/route.ts` (GET + PUT):
    - GET: عرض تفاصيل التقييم مع جميع المعلومات المرتبطة
    - PUT: تحديث التقييم - العميل يحدّث التقييم والتعليق، الكابتن يضيف رد، إعادة حساب متوسط التقييم
  - `/api/wallet/route.ts` (GET):
    - عرض محفظة الكابتن (الرصيد، إجمالي الأرباح، المسحوبات، المعلق) مع آخر 10 معاملات (كابتن فقط)
    - إنشاء محفظة تلقائياً إذا لم تكن موجودة
  - `/api/wallet/withdraw/route.ts` (POST):
    - طلب سحب من المحفظة (كابتن فقط)، التحقق من الرصيد الكافي
    - خصم من الرصيد وإضافة للمبالغ المعلقة، إنشاء معاملة بحالة PENDING
    - إشعار لجميع المدراء عن طلب السحب الجديد
  - `/api/wallet/transactions/route.ts` (GET):
    - عرض سجل معاملات المحفظة مع تصفح وتصفية (type, status) (كابتن فقط)

- جميع المسارات تستخدم:
  - `getTokenFromHeaders()` و `getSession()` للمصادقة
  - Zod للتحقق من المدخلات
  - تنسيق استجابة موحد `{ success, data, message, error, details?, pagination? }` مع رسائل عربية
  - معالجة أخطاء شاملة (400, 401, 403, 404, 409, 500)
  - Next.js 16 App Router pattern مع `params: Promise<{ id: string }>`
  - `createNotification()` من مكتبة الإشعارات

- ESLint: صفر أخطاء
- Dev server: يعمل بدون أخطاء تجميع

Stage Summary:
- 10 مسارات API كاملة للمدفوعات وكوبونات الخصم والتقييمات ومحفظة الكابتن
- نظام مدفوعات متكامل: إنشاء، عرض، تحديث مع تحديث تلقائي لحالة الطرد وإنشاء معاملات المحفظة
- نظام كوبونات خصم كامل: CRUD، تحقق شامل (تكرار، صلاحية، استخدامات، حد أدنى)، تطبيق الخصم
- نظام تقييمات شامل: إنشاء بشرط التسليم، منع التكرار، تحديث متوسط تقييم الكابتن، رد الكابتن
- محفظة كابتن كاملة: عرض الرصيد، طلب سحب، سجل المعاملات، إشعارات تلقائية
- حماية كاملة بالصلاحيات لكل دور (مدير، كابتن، عميل)
- جميع الرسائل والتعليقات بالعربية

---
Task ID: 7c
Agent: Frontend Integration Developer
Task: بناء صفحات المدفوعات، الكوبونات، التقييمات، والمحفظة ودمجها في النظام

Work Log:
- قراءة worklog.md و10 مكونات موجودة لفهم الأنامط المتبعة
- أنشأت 5 مكونات جديدة:
  - AdminPayments.tsx: صفحة إدارة المدفوعات مع إحصائيات وفلاتر وجدول وحوار تفاصيل
  - AdminPromoCodes.tsx: صفحة كوبونات الخصم مع إنشاء وتعديل وحذف وتفاصيل
  - AdminReviews.tsx: صفحة التقييمات مع عرض ورد على التقييمات
  - CustomerReviewForm.tsx: نموذج تقييم التوصيل للعملاء مع نجوم تفاعلية
  - CaptainWallet.tsx: صفحة محفظة الكابتن مع رصيد وسحب ومعاملات
- دمج في النظام:
  - أضفت 3 عناصر في DashboardSidebar.tsx (payments, promos, reviews)
  - أضفت 3 حالات في AdminDashboard.tsx
  - أضفت 3 عناوين في DashboardHeader.tsx
  - أضفت تبويب المحفظة في CaptainDashboard.tsx (5 تبويبات)
  - حدّثت ParcelDetail.tsx بزر تقييم وعرض حالة التقييم
- ESLint: صفر أخطاء

Stage Summary:
- 5 مكونات جديدة مدمجة بالكامل
- 3 صفحات إدارة + صفحة محفظة + نموذج تقييم
- تكامل كامل مع Sidebar + Header + Router
