# إصلاح مشكلة الاتصال بـ Production API في البيئة المحلية

## المشكلة
النظام كان يتصل بـ `https://api.ab-tw.com` بدلاً من `localhost:5000` حتى في البيئة المحلية.

## السبب
ملف `vercel.json` كان يحتوي على environment variables للإنتاج، مما أثر على البيئة المحلية.

## الحل المطبق

### 1. إزالة Environment Variables من vercel.json
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. إنشاء ملف .env.production منفصل
```bash
# إعدادات البيئة الإنتاجية
VITE_API_URL=https://api.ab-tw.com/api
VITE_BACKEND_URL=https://api.ab-tw.com
VITE_FRONTEND_URL=https://ab-tw.com
```

### 3. التأكد من .env.local للبيئة المحلية
```bash
# إعدادات البيئة المحلية
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
```

## خطوات التشغيل الصحيح

### 1. تشغيل Backend
```bash
cd backend
npm start
```

### 2. تشغيل Frontend
```bash
cd frontend
npm run dev
```

### 3. فتح الموقع المحلي
```
http://localhost:5173
```

⚠️ **مهم جداً**: تأكد من فتح `localhost:5173` وليس `ab-tw.com`

## اختبار الإصلاح

### 1. افتح Developer Tools (F12)
### 2. اذهب إلى Console
### 3. ابحث عن هذه الرسائل:
```
🔍 TamaraPaymentSettings API_URL: http://localhost:5000/api
🔍 Environment variables: {
  VITE_API_URL: "http://localhost:5000/api",
  MODE: "development",
  DEV: true,
  PROD: false
}
```

### 4. اختبار Tamara
- اذهب إلى: الإعدادات > طرق الدفع > تمارا
- اضغط "اختبار الاتصال"
- يجب أن يتصل بـ `localhost:5000` وليس `api.ab-tw.com`

## ملفات تم تعديلها
- ✅ `frontend/vercel.json` - إزالة env variables
- ✅ `frontend/.env.production` - إعدادات الإنتاج
- ✅ `frontend/.env.local` - إعدادات محلية (موجود مسبقاً)
- ✅ `frontend/src/pages/admin/TamaraPaymentSettings.jsx` - إضافة debug logs

## للنشر على الإنتاج
عند النشر على Vercel، سيتم استخدام `.env.production` تلقائياً للإعدادات الصحيحة.