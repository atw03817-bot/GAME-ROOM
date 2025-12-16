# تعليمات النشر - البيئة المحلية والإنتاج

## المشكلة التي تم حلها ✅
كان ملف `vercel.json` يعيد توجيه جميع طلبات API إلى الخادم المباشر حتى في البيئة المحلية، مما يسبب أخطاء 400.

## الحل المُطبق

### 1. البيئة المحلية (Development) 🏠
**الملفات**:
- `frontend/.env.local` - متغيرات البيئة المحلية
- `frontend/vercel.json` - إعدادات مبسطة للتطوير

**الإعدادات**:
```env
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
```

### 2. البيئة المباشرة (Production) 🚀
**الملفات**:
- `frontend/vercel-production.json` - إعدادات الإنتاج الكاملة

**للنشر على Vercel**:
1. انسخ محتوى `vercel-production.json`
2. الصقه في `vercel.json` قبل النشر
3. أو استخدم الأمر:
```bash
cp vercel-production.json vercel.json
```

## كيفية التشغيل

### البيئة المحلية:
```bash
# Backend
cd backend
npm start

# Frontend (في terminal منفصل)
cd frontend
npm run dev
```

### النشر على Vercel:
```bash
# نسخ إعدادات الإنتاج
cp vercel-production.json vercel.json

# النشر
vercel --prod
```

## الفرق بين البيئتين

### المحلية (localhost):
- API: `http://localhost:5000/api`
- Frontend: `http://localhost:5173`
- لا توجد إعادة توجيه للـ API

### الإنتاج (ab-tw.com):
- API: `https://api.ab-tw.com/api`
- Frontend: `https://ab-tw.com`
- إعادة توجيه كاملة للـ API

## ملفات الإعدادات

### `frontend/.env.local` (محلي فقط):
```env
VITE_API_URL=http://localhost:5000/api
VITE_BACKEND_URL=http://localhost:5000
VITE_FRONTEND_URL=http://localhost:5173
VITE_DISABLE_VERCEL_REWRITES=true
```

### `frontend/vercel.json` (تطوير):
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

### `frontend/vercel-production.json` (إنتاج):
```json
{
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://api.ab-tw.com/api/$1"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## اختبار الإصلاح

### 1. البيئة المحلية:
```bash
# تشغيل الخوادم
./TEST_OFFICIAL_LOGOS.bat

# التحقق من:
# ✅ API يتصل بـ localhost:5000
# ✅ لا توجد أخطاء 400
# ✅ تمارا يعمل محلياً
```

### 2. البيئة المباشرة:
```bash
# نسخ إعدادات الإنتاج
cp vercel-production.json vercel.json

# النشر
vercel --prod

# التحقق من:
# ✅ API يتصل بـ api.ab-tw.com
# ✅ الموقع يعمل على ab-tw.com
# ✅ تمارا يعمل في الإنتاج
```

## الملاحظات المهمة ⚠️

1. **لا تنشر** `vercel.json` الحالي للإنتاج
2. **استخدم** `vercel-production.json` للنشر فقط
3. **احتفظ** بـ `.env.local` للتطوير المحلي
4. **تأكد** من تشغيل الخادم المحلي قبل الاختبار

## الأخطاء الشائعة وحلولها

### خطأ 400 في البيئة المحلية:
```bash
# الحل: تأكد من وجود .env.local
echo "VITE_API_URL=http://localhost:5000/api" > frontend/.env.local

# إعادة تشغيل الخادم
cd frontend
npm run dev
```

### API لا يعمل في الإنتاج:
```bash
# الحل: استخدم إعدادات الإنتاج
cp vercel-production.json vercel.json
vercel --prod
```

الآن النظام يعمل بشكل صحيح في كلا البيئتين! 🎉