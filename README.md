# سوق الخدمات الإلكترونية (Khadamat Market)

## نظرة عامة على المشروع
- **الاسم**: سوق الخدمات الإلكترونية
- **الهدف**: منصة متكاملة لعرض وبيع الخدمات الإلكترونية (تصميم، برمجة، تسويق، كتابة...) مع نظام دفع يدوي (تحويل بنكي / محفظة إلكترونية) ولوحة تحكم كاملة لإدارة الطلبات والمدفوعات والخدمات والمستخدمين.
- **الجمهور**: عملاء يطلبون خدمات إلكترونية + فريق إدارة (مدير عام، مدير طلبات، دعم).

## ✅ الميزات المكتملة

### الموقع العام (للعملاء)
- الصفحة الرئيسية مع عرض التصنيفات وأحدث الخدمات
- صفحة "جميع الخدمات" مع بحث وفلترة حسب التصنيف
- صفحة تفاصيل كل خدمة (السعر، مدة التسليم، الوصف)
- تسجيل حساب عميل جديد وتسجيل الدخول (JWT + كوكيز httpOnly)
- إنشاء طلب لخدمة معينة مع كتابة المتطلبات
- رفع إيصال الدفع (صورة/PDF) إلى Cloudflare R2 مع اختيار طريقة الدفع وإدخال رقم التحويل
- صفحة "طلباتي" لعرض كل الطلبات وحالتها
- صفحة تفاصيل الطلب: سجل الحالة الزمني، الدفعات المرفوعة، وإمكانية رفع إيصال جديد إذا رُفض السابق

### لوحة تحكم الأدمن (نظام أدوار متعدد)
- **مدير عام (super_admin)**: كل الصلاحيات + إدارة حسابات المشرفين
- **مدير طلبات (manager)**: إدارة الخدمات، التصنيفات، طرق الدفع، الطلبات، الموافقة/رفض المدفوعات
- **دعم ومتابعة (support)**: عرض الطلبات والعملاء وتحديث حالة الطلب فقط (بدون التعديل على الخدمات/المدفوعات)
- تسجيل دخول مستقل بكوكيز JWT خاصة بالأدمن
- **لوحة إحصائيات**: عدد الطلبات، الطلبات بانتظار مراجعة الدفع، قيد التنفيذ، الإيرادات المؤكدة، آخر الطلبات، الخدمات الأكثر طلبًا
- **إدارة الطلبات**: قائمة قابلة للبحث والفلترة بالحالة، صفحة تفاصيل مع سجل الحالة، الموافقة/رفض على إيصال الدفع (مع سبب الرفض)، تحديث حالة الطلب يدويًا (بانتظار الدفع → قيد المراجعة → قيد التنفيذ → تم التسليم → مكتمل / مرفوض / ملغي)
- **إدارة الخدمات**: إضافة/تعديل/حذف الخدمات والتصنيفات
- **إدارة طرق الدفع**: إضافة/تعديل طرق التحويل البنكي والمحافظ الإلكترونية وتعليمات الدفع
- **إدارة العملاء**: عرض العملاء وحظر/إلغاء حظر الحساب
- **إدارة المشرفين** (super_admin فقط): إضافة مشرفين جدد بأدوار مختلفة، تعديل الدور، تعطيل/حذف

## 🔗 ملخص المسارات (APIs)

### عامة (بدون تسجيل دخول)
- `GET /api/public/categories` — كل التصنيفات
- `GET /api/public/services?category=&q=` — قائمة الخدمات مع فلترة
- `GET /api/public/services/:slug` — تفاصيل خدمة
- `GET /api/public/payment-methods` — طرق الدفع المتاحة

### العميل
- `POST /api/customer/auth/register` `{name, email, phone?, password}`
- `POST /api/customer/auth/login` `{email, password}`
- `POST /api/customer/auth/logout`
- `GET /api/customer/auth/me`
- `POST /api/customer/orders` `{service_id, requirements?}` — إنشاء طلب
- `GET /api/customer/orders` — طلباتي
- `GET /api/customer/orders/:id` — تفاصيل طلب
- `POST /api/customer/orders/:id/payment` (multipart: receipt, payment_method_id, transfer_reference?) — رفع إيصال دفع

### الأدمن
- `POST /api/admin/auth/login`, `POST /api/admin/auth/logout`, `GET /api/admin/auth/me`
- `GET /api/admin/dashboard/stats` — إحصائيات لوحة التحكم
- `GET/POST/PUT/DELETE /api/admin/catalog/categories` — التصنيفات
- `GET/POST/PUT/DELETE /api/admin/catalog/services` — الخدمات
- `GET/POST/PUT/DELETE /api/admin/catalog/payment-methods` — طرق الدفع
- `GET /api/admin/orders?status=&q=` — قائمة الطلبات
- `GET /api/admin/orders/:id` — تفاصيل طلب
- `PATCH /api/admin/orders/:id/status` `{status, note?}` — تحديث حالة الطلب
- `POST /api/admin/orders/payments/:paymentId/approve` — الموافقة على الدفع
- `POST /api/admin/orders/payments/:paymentId/reject` `{reason?}` — رفض الدفع
- `GET /api/admin/users/customers?q=` — قائمة العملاء
- `PATCH /api/admin/users/customers/:id/status` `{status: active|blocked}`
- `GET/POST/PUT/DELETE /api/admin/users/admins` (super_admin فقط) — إدارة المشرفين
- `GET /api/files/*` — عرض ملفات إيصالات الدفع من R2

### صفحات الموقع
`/` `/services` `/services/:slug` `/login` `/register` `/my-orders` `/my-orders/:id`
`/admin/login` `/admin` `/admin/orders` `/admin/orders/:id` `/admin/services` `/admin/payment-methods` `/admin/customers` `/admin/admins`

## 🗄️ نموذج البيانات والتخزين
- **قاعدة البيانات**: Cloudflare D1 (SQLite) — الجداول: `categories`, `services`, `customers`, `admins`, `payment_methods`, `orders`, `payments`, `order_status_history`
- **تخزين الملفات**: Cloudflare R2 (bucket: `khadamat-market-receipts`) لإيصالات الدفع
- **المصادقة**: JWT موقّع بـ HMAC-SHA256 (Web Crypto API)، مخزّن في كوكيز httpOnly منفصلة للعميل (`customer_token`) والأدمن (`admin_token`)
- **كلمات المرور**: مشفّرة بـ PBKDF2-SHA256 (100,000 تكرار) — لا كلمات مرور نصية مخزنة أبدًا

## 👤 دليل الاستخدام السريع

### للعملاء
1. تصفح `/services`، اختر خدمة، سجّل حساب من `/register`
2. اضغط "اطلب الآن" في صفحة الخدمة، أدخل تفاصيل الطلب
3. من صفحة الطلب: اختر طريقة الدفع (تحويل بنكي / محفظة)، حوّل المبلغ، ثم ارفع صورة الإيصال
4. تابع حالة الطلب من `/my-orders`

### لفريق الإدارة
- **بيانات الدخول الافتراضية للوحة التحكم** (`/admin/login`):
  - البريد: `admin@example.com`
  - كلمة المرور: `Admin@12345`
  - ⚠️ **يجب تغيير كلمة المرور فورًا بعد أول نشر** (من خلال إنشاء مشرف جديد وتعطيل/حذف هذا الحساب، أو تحديث كلمة المرور من صفحة المشرفين)
- من `/admin/orders`: راجع الطلبات الجديدة، اضغط على الطلب لعرض إيصال الدفع، ووافق أو ارفض
- من `/admin/services`: أضف/عدّل خدماتك وتصنيفاتك
- من `/admin/payment-methods`: أضف حسابات التحويل البنكي/المحافظ التي تريد عرضها للعملاء
- من `/admin/admins`: أضف فريقك بالأدوار المناسبة (مدير عام / مدير طلبات / دعم)

## 🚀 حالة النشر
- **البيئة الحالية**: بيئة تطوير (Sandbox) — `wrangler pages dev` مع D1/R2 محليين
- **التقنيات**: Hono + TypeScript + Cloudflare Pages/Workers + D1 + R2 + Tailwind CSS (CDN)
- **جاهز للنشر على Cloudflare Pages**: نعم — يتطلب فقط إنشاء قاعدة D1 وbucket R2 فعليين على حساب Cloudflare وتحديث `wrangler.jsonc` بالمعرّفات الحقيقية

## 📋 ميزات غير منفذة / مقترحات للتطوير المستقبلي
- إشعارات بريد إلكتروني/SMS تلقائية عند تغيير حالة الطلب
- دردشة مباشرة بين العميل والدعم داخل صفحة الطلب
- دعم بوابة دفع إلكتروني حقيقية (Stripe/PayTabs) كخيار إضافي بجانب الدفع اليدوي
- تقييمات ومراجعات العملاء على الخدمات
- تصدير تقارير الطلبات/الإيرادات إلى Excel
- سجل تدقيق (Audit Log) مفصّل لكل إجراءات المشرفين
