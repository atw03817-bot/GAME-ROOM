# 📋 قائمة ملفات نظام SEO للرفع

## 🔧 Backend Files (الخادم)

### ملفات جديدة:
```
backend/models/SEO.js
backend/controllers/seoController.js
backend/routes/seo.js
backend/middleware/seo.js
backend/scripts/seedSEO.js
backend/scripts/createAdmin.js
```

### ملفات محدثة:
```
backend/server.js (إضافة routes SEO)
```

## 🎨 Frontend Files (الواجهة)

### ملفات جديدة:
```
frontend/src/pages/admin/SEOManager.jsx
frontend/src/components/SEO/SEOHead.jsx
frontend/src/components/SEO/ProductSEO.jsx
frontend/src/components/SEO/CategorySEO.jsx
frontend/src/components/SEO/HomeSEO.jsx
frontend/src/components/SEO/DynamicSEO.jsx
frontend/src/components/SEO/index.js
frontend/src/hooks/useSEO.js
```

### ملفات محدثة:
```
frontend/src/App.jsx (إضافة route SEO)
frontend/src/components/admin/AdminSidebar.jsx (إضافة رابط SEO)
frontend/src/pages/Home.jsx (إضافة HomeSEO)
frontend/src/pages/ProductDetail.jsx (إضافة ProductSEO)
frontend/src/main.jsx (إضافة HelmetProvider)
frontend/package.json (مكتبات جديدة)
```

## 📦 مكتبات جديدة

### Frontend:
```bash
npm install react-helmet-async lucide-react
```

## 🗄️ قاعدة البيانات

### Collections جديدة:
- `seos` - بيانات SEO للصفحات

### Scripts للتشغيل:
```bash
# إنشاء بيانات SEO أساسية
node scripts/seedSEO.js

# إنشاء حساب مدير (إذا لم يكن موجود)
node scripts/createAdmin.js
```

## 🌐 Routes جديدة

### API Endpoints:
```
GET    /api/seo                     - جميع صفحات SEO
POST   /api/seo                     - إضافة صفحة SEO
PUT    /api/seo/:id                 - تحديث صفحة SEO
DELETE /api/seo/:id                 - حذف صفحة SEO
GET    /api/seo/:id/analyze         - تحليل جودة SEO
GET    /api/seo/page/:slug          - SEO لصفحة معينة
GET    /api/seo/sitemap.xml         - خريطة الموقع
GET    /api/seo/robots.txt          - ملف الروبوتات
POST   /api/seo/auto-generate-products - إنشاء تلقائي للمنتجات
GET    /api/seo/keywords/suggestions - اقتراحات الكلمات المفتاحية
```

### Frontend Routes:
```
/admin/seo - صفحة إدارة SEO
```

## 🔐 صلاحيات مطلوبة

جميع APIs تحتاج صلاحيات Admin ما عدا:
- `/api/seo/sitemap.xml`
- `/api/seo/robots.txt`
- `/api/seo/page/:slug`

## ✅ اختبار النظام

بعد الرفع، تأكد من:
1. تشغيل Backend بدون أخطاء
2. تشغيل Frontend بدون أخطاء
3. الوصول لصفحة `/admin/seo`
4. عمل Sitemap: `/api/seo/sitemap.xml`
5. عمل Robots: `/api/seo/robots.txt`