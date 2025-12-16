# 🧪 اختبار المشروع

## ✅ Checklist للتأكد من أن كل شي يشتغل

### 1. التثبيت
```bash
# من المجلد الرئيسي
npm install

# Frontend
cd frontend
npm install

# Backend
cd ../backend
npm install
```

### 2. إعداد MongoDB
```bash
# تأكد من تشغيل MongoDB
# Windows
net start MongoDB

# Mac
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

### 3. إعداد .env
```bash
cd backend
cp .env.example .env
```

عدل ملف `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mobile-store
JWT_SECRET=my-super-secret-key-123456
FRONTEND_URL=http://localhost:5173
```

### 4. تشغيل المشروع
```bash
# من المجلد الرئيسي
npm run dev
```

### 5. اختبار الصفحات

افتح المتصفح وجرب:

#### Frontend (http://localhost:5173)
- ✅ الصفحة الرئيسية `/`
- ✅ المنتجات `/products`
- ✅ السلة `/cart`
- ✅ تسجيل الدخول `/login`
- ✅ إنشاء حساب `/register`

#### Backend (http://localhost:5000)
- ✅ Health Check: `http://localhost:5000/api/health`

### 6. اختبار الترجمة
- اضغط على أيقونة الكرة الأرضية في Navbar
- يجب أن تتغير اللغة من عربي لإنجليزي

### 7. اختبار السلة
- افتح أي صفحة
- السلة يجب أن تظهر في Navbar
- العدد يجب أن يتحدث تلقائياً

---

## 🐛 حل المشاكل الشائعة

### MongoDB لا يعمل؟
```bash
# تأكد من تثبيت MongoDB
# Windows: قم بتحميله من mongodb.com
# Mac: brew install mongodb-community
# Linux: sudo apt install mongodb
```

### Port 5000 مستخدم؟
غير PORT في ملف `.env` إلى 4000 أو أي رقم آخر

### Frontend لا يتصل بـ Backend؟
تأكد من:
1. Backend يعمل على http://localhost:5000
2. ملف `frontend/.env` يحتوي على:
   ```
   VITE_API_URL=http://localhost:5000/api
   ```

### الترجمة لا تعمل؟
تأكد من وجود ملفات:
- `frontend/src/locales/ar.json`
- `frontend/src/locales/en.json`

---

## ✅ إذا كل شي شغال

الحين يمكنك:
1. البدء في نقل الكود من مشروعك القديم
2. إضافة المنتجات والفئات
3. تطوير صفحات Admin
4. إضافة المزيد من المميزات

---

## 📝 ملاحظات مهمة

- المشروع يستخدم **Vite** (أسرع من Webpack)
- **Zustand** للـ State (أبسط من Redux)
- **i18next** للترجمة (أقوى من next-intl)
- **Mongoose** للـ Database (أبسط من Prisma)

---

**كل شي جاهز! 🎉**
