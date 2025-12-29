# 🚀 دليل النشر - GAME-ROOM

## 📋 خطوات النشر

### 1️⃣ Frontend على Vercel

#### متغيرات البيئة المطلوبة في Vercel:
```
VITE_API_URL=https://your-aws-backend-url.com/api
```

#### خطوات الإعداد:
1. اذهب إلى Vercel Dashboard
2. اختر المشروع GAME-ROOM
3. اذهب إلى Settings → Environment Variables
4. أضف المتغير:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-aws-backend-url.com/api`
   - **Environment:** Production

### 2️⃣ Backend على AWS

#### متغيرات البيئة المطلوبة:
```bash
# Server
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gameroom-store

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-make-it-very-long-and-random

# Frontend URL (Vercel URL)
FRONTEND_URL=https://your-vercel-app.vercel.app

# Payment Settings
TAP_SECRET_KEY=your-tap-secret-key
TAP_PUBLIC_KEY=your-tap-public-key

# Email (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3️⃣ تحديث CORS للإنتاج

يجب تحديث ملف `backend/server.js` لإضافة رابط Vercel:

```javascript
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://your-vercel-app.vercel.app',  // أضف رابط Vercel هنا
  'https://www.gameroom-store.com',
  'https://gameroom-store.com',
  'https://api.gameroom-store.com'
];
```

### 4️⃣ ملفات مهمة للتحقق

#### Frontend:
- ✅ `package.json` - تأكد من وجود build scripts
- ✅ `vite.config.js` - إعدادات Vite
- ✅ `.env.production` - متغيرات الإنتاج

#### Backend:
- ✅ `package.json` - تأكد من start script
- ✅ `server.js` - إعدادات CORS
- ✅ `.env` - جميع المتغيرات المطلوبة

### 5️⃣ اختبار الاتصال

بعد النشر، تأكد من:
1. Frontend يتصل بـ Backend بنجاح
2. قاعدة البيانات تعمل
3. المدفوعات تعمل (إن وجدت)
4. رفع الصور يعمل

### 🔧 استكشاف الأخطاء

#### خطأ CORS:
- تأكد من إضافة رابط Vercel في allowedOrigins
- تأكد من FRONTEND_URL في متغيرات البيئة

#### خطأ API:
- تأكد من VITE_API_URL صحيح
- تأكد من Backend يعمل على AWS

#### خطأ قاعدة البيانات:
- تأكد من MONGODB_URI صحيح
- تأكد من الاتصال بالإنترنت

### 📞 الدعم
إذا واجهت أي مشاكل، تحقق من:
- Vercel Logs
- AWS CloudWatch Logs
- Browser Developer Console