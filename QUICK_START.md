# 🚀 دليل البدء السريع

## الخطوة 1: التثبيت

### Windows
```bash
# شغل ملف START.bat
START.bat
```

### Mac/Linux
```bash
# تثبيت المكتبات
npm install
cd frontend && npm install
cd ../backend && npm install
```

## الخطوة 2: إعداد قاعدة البيانات

1. تأكد من تشغيل MongoDB
2. انسخ ملف `.env.example` إلى `.env` في مجلد `backend`
3. عدل ملف `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mobile-store
JWT_SECRET=your-secret-key-here
FRONTEND_URL=http://localhost:5173
```

## الخطوة 3: تشغيل المشروع

```bash
# من المجلد الرئيسي
npm run dev
```

سيفتح:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## الخطوة 4: إنشاء حساب Admin

```bash
cd backend
node -e "
const mongoose = require('mongoose');
const User = require('./models/User.js');
mongoose.connect('mongodb://localhost:27017/mobile-store').then(async () => {
  const admin = new User({
    name: 'Admin',
    email: 'admin@store.com',
    password: 'admin123',
    phone: '0500000000',
    role: 'admin'
  });
  await admin.save();
  console.log('✅ تم إنشاء حساب Admin');
  process.exit();
});
"
```

## 🎉 جاهز!

- تسجيل دخول Admin: admin@store.com / admin123
- لوحة التحكم: http://localhost:5173/admin

## 📝 ملاحظات

- المشروع يستخدم Vite (سريع جداً)
- سهل الرفع على Vercel/Netlify
- بدون تعقيدات SSR
- كل المميزات موجودة

## 🆘 مشاكل شائعة

### MongoDB لا يعمل؟
```bash
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### Port مستخدم؟
غير PORT في ملف .env

---

**استمتع بالتطوير! 🚀**
