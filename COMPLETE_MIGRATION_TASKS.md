# 📋 خطة النقل الكاملة - من Next.js إلى Vite

## 🎯 الهدف
نقل **جميع** مميزات المشروع القديم (Next.js + Prisma) إلى المشروع الجديد (Vite + Mongoose) بالحرف الواحد

---

## ✅ المكتمل (تم بالفعل)

### Backend
- ✅ Homepage Builder System (كامل)
- ✅ Models: User, Product, Category, Order, HomepageConfig
- ✅ Auth System (JWT)
- ✅ Basic Routes

### Frontend
- ✅ Home Page (Dynamic)
- ✅ Products Page (مع الفلاتر)
- ✅ Login/Register
- ✅ Cart
- ✅ Navbar/Footer
- ✅ i18n (عربي/إنجليزي)

---

## 📦 المرحلة 1: Backend Models & Controllers (أولوية عالية جداً)

### 1.1 Models الناقصة

#### ❌ Address Model
```javascript
// backend/models/Address.js
- userId (ref User)
- fullName
- phone
- city
- district
- street
- building
- postalCode
- isDefault
```

#### ❌ PaymentIntent Model
```javascript
// backend/models/PaymentIntent.js
- orderId
- amount
- currency (SAR)
- provider (tap/myfatoorah/cod)
- status
- paymentUrl
- transactionId
- metadata
```

#### ❌ PaymentSettings Model
```javascript
// backend/models/PaymentSettings.js
- provider (tap/myfatoorah/tamara/tabby/cod)
- enabled
- config (API keys)
```

#### ❌ ShippingProvider Model
```javascript
// backend/models/ShippingProvider.js
- name (smsa/redbox/aramex)
- displayName
- enabled
- apiKey, apiSecret, apiUrl
- testMode
- settings
```

#### ❌ ShippingRate Model
```javascript
// backend/models/ShippingRate.js
- providerId
- city
- price
- estimatedDays
```

#### ❌ Shipment Model
```javascript
// backend/models/Shipment.js
- orderId
- providerId
- trackingNumber
- status
- shippingCost
- estimatedDelivery
- actualDelivery
- apiResponse
```

#### ❌ StoreSettings Model
```javascript
// backend/models/StoreSettings.js
- key (tax_rate, free_shipping_threshold, etc.)
- value (JSON)
```

#### ❌ FactoryShipment Model (Distribution System)
```javascript
// backend/models/FactoryShipment.js
- shipmentCode
- model
- color
- totalQuantity
- weight
- factoryBoxNo
- receivedDate
- notes
```

#### ❌ Device Model (Distribution System)
```javascript
// backend/models/Device.js
- shipmentId
- imei1, imei2
- serialNo
- status (IN_STOCK/ASSIGNED/DELIVERED/RETURNED)
- groupId
```

#### ❌ DistributionGroup Model
```javascript
// backend/models/DistributionGroup.js
- groupCode
- shipmentId
- clientName
- clientPhone
- model, color
- quantity
- qrCode
- labelPrinted
- notes
```

### 1.2 Controllers الناقصة

#### ❌ addressController.js
- `getAddresses` - جلب عناوين المستخدم
- `getAddress` - جلب عنوان واحد
- `createAddress` - إضافة عنوان
- `updateAddress` - تعديل عنوان
- `deleteAddress` - حذف عنوان
- `setDefaultAddress` - تعيين عنوان افتراضي

#### ❌ paymentController.js (تحسين)
- `getPaymentSettings` - جلب إعدادات الدفع
- `updatePaymentSettings` - تحديث إعدادات
- `createPaymentIntent` - إنشاء نية دفع
- `verifyPayment` - التحقق من الدفع
- `handleTapCallback` - معالجة Tap callback
- `handleMyFatoorahCallback` - معالجة MyFatoorah callback
- `refundPayment` - استرجاع مبلغ

#### ❌ shippingController.js (تحسين)
- `getShippingProviders` - جلب شركات الشحن
- `updateShippingProvider` - تحديث شركة
- `getShippingRates` - جلب أسعار الشحن
- `calculateShipping` - حساب تكلفة الشحن
- `createShipment` - إنشاء شحنة
- `trackShipment` - تتبع شحنة
- `updateShipmentStatus` - تحديث حالة

#### ❌ distributionController.js
- `createFactoryShipment` - إضافة شحنة من المصنع
- `getFactoryShipments` - جلب الشحنات
- `addDevices` - إضافة أجهزة
- `getDevices` - جلب الأجهزة
- `createDistributionGroup` - إنشاء مجموعة توزيع
- `getDistributionGroups` - جلب المجموعات
- `generateQRCode` - توليد QR Code
- `printLabel` - طباعة ملصق
- `verifyDevice` - التحقق من جهاز

#### ❌ customerController.js
- `getCustomers` - جلب العملاء (Admin)
- `getCustomer` - جلب عميل واحد
- `updateCustomer` - تعديل عميل
- `deleteCustomer` - حذف عميل
- `getCustomerOrders` - جلب طلبات عميل
- `getCustomerStats` - إحصائيات عميل

### 1.3 Routes الناقصة

#### ❌ addresses.js
```javascript
GET    /api/addresses
GET    /api/addresses/:id
POST   /api/addresses
PUT    /api/addresses/:id
DELETE /api/addresses/:id
PUT    /api/addresses/:id/default
```

#### ❌ distribution.js
```javascript
POST   /api/distribution/shipments
GET    /api/distribution/shipments
POST   /api/distribution/devices
GET    /api/distribution/devices
POST   /api/distribution/groups
GET    /api/distribution/groups
GET    /api/distribution/groups/:code/qr
POST   /api/distribution/verify/:imei
```

#### ❌ customers.js
```javascript
GET    /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
GET    /api/customers/:id/orders
GET    /api/customers/:id/stats
```

---

## 📦 المرحلة 2: Frontend Components (أولوية عالية)

### 2.1 Product Components

#### ❌ ProductDetail.jsx (صفحة تفاصيل المنتج)
- عرض صور المنتج (Gallery)
- اختيار اللون
- اختيار السعة
- إضافة للسلة
- المواصفات الكاملة
- المنتجات المشابهة
- التقييمات
- الأسئلة الشائعة

#### ❌ ProductFeatures.jsx
- عرض المميزات بشكل جذاب
- أيقونات
- تصميم متجاوب

#### ❌ ProductSpecs.jsx
- جدول المواصفات
- تبويبات (Overview, Specs, Reviews)

#### ❌ RelatedProducts.jsx
- منتجات مشابهة
- سلايدر أفقي

### 2.2 Checkout Components

#### ❌ AddressManager.jsx
- عرض العناوين المحفوظة
- إضافة عنوان جديد
- تعديل عنوان
- حذف عنوان
- تعيين عنوان افتراضي

#### ❌ AddressSelector.jsx
- اختيار عنوان من القائمة
- أو إضافة عنوان جديد
- عرض تفاصيل العنوان

#### ❌ ShippingSelector.jsx
- عرض شركات الشحن المتاحة
- حساب تكلفة الشحن لكل شركة
- اختيار شركة
- عرض مدة التوصيل

#### ❌ OrderSummary.jsx
- ملخص المنتجات
- المجموع الفرعي
- الشحن
- الضريبة
- المجموع الكلي
- كود الخصم

#### ❌ PaymentMethods.jsx
- اختيار طريقة الدفع
- Tap Payment
- MyFatoorah
- Tamara
- Tabby
- الدفع عند الاستلام

### 2.3 Admin Components

#### ❌ AdminSidebar.jsx
- قائمة التنقل
- الأيقونات
- Active state
- Collapse/Expand

#### ❌ ImageUpload.jsx
- رفع صورة واحدة
- معاينة
- حذف
- تقدم الرفع

#### ❌ ImageUploadMultiple.jsx
- رفع صور متعددة
- إعادة ترتيب
- حذف
- معاينة

#### ❌ SectionEditor.jsx (Homepage Builder)
- تعديل محتوى القسم
- معاينة مباشرة
- حفظ/إلغاء

#### ❌ SectionPreview.jsx
- معاينة القسم
- تحرير
- حذف
- نسخ
- إخفاء/إظهار

#### ❌ ProductForm.jsx
- نموذج إضافة/تعديل منتج
- جميع الحقول
- رفع الصور
- المواصفات
- الألوان والسعات

#### ❌ OrderDetails.jsx
- تفاصيل الطلب
- المنتجات
- العنوان
- الشحن
- الدفع
- تغيير الحالة

### 2.4 UI Components

#### ❌ ProgressIndicator.jsx
- خطوات الطلب
- Active/Complete states

#### ❌ Modal.jsx
- نافذة منبثقة
- إغلاق
- Overlay

#### ❌ Tabs.jsx
- تبويبات
- محتوى ديناميكي

#### ❌ Dropdown.jsx
- قائمة منسدلة
- بحث
- اختيار متعدد

#### ❌ Pagination.jsx
- ترقيم الصفحات
- التنقل

#### ❌ LoadingSpinner.jsx
- مؤشر تحميل
- أحجام مختلفة

#### ❌ EmptyState.jsx
- حالة فارغة
- رسالة
- زر إجراء

---

## 📦 المرحلة 3: Frontend Pages (أولوية متوسطة)

### 3.1 Public Pages

#### ❌ ProductDetail.jsx (الصفحة)
- استخدام ProductDetail Component
- SEO
- Breadcrumbs

#### ❌ Checkout.jsx (كامل)
- خطوة 1: العنوان
- خطوة 2: الشحن
- خطوة 3: الدفع
- خطوة 4: المراجعة
- Progress Indicator
- حفظ البيانات

#### ❌ OrderSuccess.jsx
- رسالة نجاح
- تفاصيل الطلب
- رقم التتبع
- زر العودة

#### ❌ Orders.jsx (للعميل)
- قائمة الطلبات
- الفلترة (الكل/قيد التنفيذ/مكتمل)
- البحث
- تفاصيل الطلب
- تتبع الطلب

#### ❌ Account.jsx (كامل)
- معلومات الحساب
- تعديل الملف الشخصي
- تغيير كلمة المرور
- العناوين
- الطلبات
- تسجيل الخروج

#### ❌ Deals.jsx
- جميع العروض
- الفلترة
- الترتيب

#### ❌ About.jsx
- عن المتجر
- الرؤية والرسالة
- الفريق

#### ❌ Contact.jsx
- نموذج التواصل
- معلومات الاتصال
- الخريطة

#### ❌ Terms.jsx
- الشروط والأحكام

#### ❌ Privacy.jsx
- سياسة الخصوصية

#### ❌ Warranty.jsx
- سياسة الضمان

#### ❌ Return.jsx
- سياسة الاسترجاع

### 3.2 Admin Pages

#### ❌ Dashboard.jsx (كامل)
- إحصائيات عامة
- المبيعات
- الطلبات
- العملاء
- الرسوم البيانية
- آخر الطلبات

#### ❌ Products.jsx (Admin)
- قائمة المنتجات
- البحث والفلترة
- إضافة منتج
- تعديل منتج
- حذف منتج
- رفع صور
- إدارة المخزون

#### ❌ Orders.jsx (Admin)
- قائمة الطلبات
- الفلترة (حسب الحالة)
- البحث
- تفاصيل الطلب
- تغيير الحالة
- طباعة الفاتورة
- تصدير

#### ❌ Customers.jsx (Admin)
- قائمة العملاء
- البحث
- تفاصيل العميل
- طلبات العميل
- إحصائيات العميل

#### ❌ Categories.jsx (Admin)
- قائمة الفئات
- إضافة فئة
- تعديل فئة
- حذف فئة
- إعادة ترتيب

#### ❌ HomepageBuilder.jsx (Admin)
- عرض الأقسام
- إضافة قسم
- تعديل قسم
- حذف قسم
- إعادة ترتيب (Drag & Drop)
- نسخ قسم
- إخفاء/إظهار
- معاينة مباشرة

#### ❌ Settings.jsx (Admin)
- إعدادات المتجر
- إعدادات الدفع
- إعدادات الشحن
- الضريبة
- العملة
- اللغة

#### ❌ Deals.jsx (Admin)
- إدارة العروض
- Featured Deals Settings
- Exclusive Offers Settings

#### ❌ Distribution.jsx (Admin)
- إضافة شحنة من المصنع
- إضافة أجهزة
- إنشاء مجموعات توزيع
- طباعة QR Codes
- التحقق من الأجهزة

---

## 📦 المرحلة 4: Features & Functionality (أولوية متوسطة)

### 4.1 Cart & Checkout

#### ❌ نظام العناوين الكامل
- إضافة/تعديل/حذف عناوين
- عنوان افتراضي
- التحقق من البيانات

#### ❌ حساب الشحن
- جلب شركات الشحن المتاحة
- حساب التكلفة حسب المدينة
- عرض مدة التوصيل

#### ❌ حساب الضريبة
- نسبة الضريبة من الإعدادات
- تطبيق على المجموع

#### ❌ كود الخصم
- إدخال كود
- التحقق
- تطبيق الخصم

#### ❌ الدفع عند الاستلام
- تفعيل/تعطيل
- رسوم إضافية (اختياري)

#### ❌ Tap Payment Integration
- إنشاء Payment Intent
- إعادة التوجيه
- معالجة Callback
- التحقق من الدفع

#### ❌ MyFatoorah Integration
- نفس Tap

#### ❌ Tamara/Tabby (اختياري)
- عرض خيار التقسيط
- حساب الأقساط

### 4.2 Order Management

#### ❌ Order Tracking
- رقم تتبع
- حالة الطلب
- تحديثات الشحن
- إشعارات

#### ❌ Order Status Updates
- Pending → Processing → Shipped → Delivered
- إشعار للعميل عند كل تحديث

#### ❌ Invoice Generation
- فاتورة PDF
- تحميل
- طباعة

### 4.3 Product Features

#### ❌ Product Search
- بحث متقدم
- Autocomplete
- نتائج فورية

#### ❌ Product Filters
- حسب الفئة
- حسب السعر
- حسب العلامة
- حسب الحالة
- حسب التقييم

#### ❌ Product Sorting
- الأحدث
- الأقل سعراً
- الأعلى سعراً
- الأكثر مبيعاً
- الأعلى تقييماً

#### ❌ Product Reviews
- إضافة تقييم
- عرض التقييمات
- متوسط التقييم

#### ❌ Product Wishlist
- إضافة للمفضلة
- عرض المفضلة
- حذف من المفضلة

#### ❌ Product Comparison
- إضافة للمقارنة
- عرض المقارنة
- جدول المواصفات

### 4.4 Admin Features

#### ❌ Dashboard Analytics
- مبيعات اليوم/الأسبوع/الشهر
- عدد الطلبات
- عدد العملاء
- المنتجات الأكثر مبيعاً
- رسوم بيانية

#### ❌ Inventory Management
- تتبع المخزون
- تنبيه عند نفاد المخزون
- تحديث تلقائي عند البيع

#### ❌ Bulk Operations
- حذف متعدد
- تعديل متعدد
- تصدير

#### ❌ Image Optimization
- ضغط الصور
- تحويل إلى WebP
- أحجام متعددة

---

## 📦 المرحلة 5: Distribution System (أولوية منخفضة)

### 5.1 Factory Shipments
- ❌ إضافة شحنة من المصنع
- ❌ عرض الشحنات
- ❌ تفاصيل الشحنة

### 5.2 Devices Management
- ❌ إضافة أجهزة (IMEI)
- ❌ عرض الأجهزة
- ❌ البحث بـ IMEI
- ❌ تغيير حالة الجهاز

### 5.3 Distribution Groups
- ❌ إنشاء مجموعة توزيع
- ❌ تخصيص أجهزة للمجموعة
- ❌ توليد QR Code
- ❌ طباعة ملصقات
- ❌ التحقق من الأجهزة

---

## 📦 المرحلة 6: Advanced Features (اختياري)

### 6.1 Notifications
- ❌ Email notifications
- ❌ SMS notifications
- ❌ Push notifications

### 6.2 Reports
- ❌ تقرير المبيعات
- ❌ تقرير المخزون
- ❌ تقرير العملاء
- ❌ تصدير Excel/PDF

### 6.3 Multi-language
- ✅ عربي/إنجليزي (تم)
- ❌ لغات إضافية

### 6.4 SEO
- ❌ Meta tags
- ❌ Sitemap
- ❌ Robots.txt
- ❌ Schema markup

### 6.5 Performance
- ❌ Image lazy loading
- ❌ Code splitting
- ❌ Caching
- ❌ CDN

---

## 📦 المرحلة 7: Testing & Deployment

### 7.1 Testing
- ❌ Unit tests
- ❌ Integration tests
- ❌ E2E tests
- ❌ Manual testing

### 7.2 Deployment
- ❌ Environment variables
- ❌ Build optimization
- ❌ Deploy backend (Railway/Render)
- ❌ Deploy frontend (Vercel/Netlify)
- ❌ Database setup (MongoDB Atlas)
- ❌ Domain setup
- ❌ SSL certificate

---

## 🎯 خطة التنفيذ المقترحة

### الأسبوع 1: Backend Foundation
- [ ] إنشاء جميع Models الناقصة
- [ ] إنشاء جميع Controllers الناقصة
- [ ] إنشاء جميع Routes الناقصة
- [ ] اختبار APIs

### الأسبوع 2: Product & Checkout
- [ ] ProductDetail Page
- [ ] Checkout Flow كامل
- [ ] Address Management
- [ ] Shipping Integration
- [ ] Payment Integration

### الأسبوع 3: Admin Dashboard
- [ ] Admin Dashboard
- [ ] Admin Products Management
- [ ] Admin Orders Management
- [ ] Admin Customers
- [ ] Homepage Builder UI

### الأسبوع 4: Polish & Deploy
- [ ] باقي الصفحات
- [ ] Testing
- [ ] Bug fixes
- [ ] Deployment
- [ ] Documentation

---

## 📊 الإحصائيات

### Backend
- **Models:** 7/17 (41%)
- **Controllers:** 3/10 (30%)
- **Routes:** 5/15 (33%)

### Frontend
- **Components:** 15/40 (37%)
- **Pages:** 8/25 (32%)
- **Features:** 5/30 (16%)

### Overall Progress
- **المكتمل:** ~35%
- **المتبقي:** ~65%

---

## 🚀 البداية

### الخطوة التالية الفورية:
1. إنشاء Models الناقصة (Address, PaymentIntent, etc.)
2. إنشاء Controllers الناقصة
3. إنشاء Routes الناقصة
4. ProductDetail Page
5. Checkout Flow

---

**جاهز للبدء؟ نبدأ بالـ Models! 💪**
