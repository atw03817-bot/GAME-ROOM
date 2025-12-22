# إصلاح مشكلة اتصال MongoDB على السيرفر

## المشكلة
```
Operation `products.find()` buffering timed out after 10000ms
GET /api/footer 500 (Internal Server Error)
GET /api/theme 500 (Internal Server Error)
GET /api/products 500 (Internal Server Error)
```

**السبب**: قاعدة البيانات MongoDB غير متصلة أو معطلة.

## الحل الكامل

### 1. تحقق من MongoDB
```bash
# تحقق من حالة MongoDB
sudo systemctl status mongod

# إذا كان متوقف، شغله
sudo systemctl start mongod

# تفعيل التشغيل التلقائي
sudo systemctl enable mongod
```

### 2. تحقق من ملف .env
```bash
cd /mobile-store-vite/backend
cat .env
```

يجب أن يحتوي على:
```env
MONGODB_URI=mongodb+srv://atw03817_db_user:jP9AouAfbaifknI4@mobile-store-cluster.cylotee.mongodb.net/mobile_store?retryWrites=true&w=majority
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://www.ab-tw.com
JWT_SECRET=your-secret-key-here
```

### 3. تحقق من logs الـ Backend
```bash
pm2 logs backend --lines 50
```

ابحث عن رسائل مثل:
- ✅ `MongoDB connected successfully`
- ❌ `MongoDB connection error`
- ❌ `MongooseServerSelectionError`

### 4. إعادة تشغيل الخدمات
```bash
# إعادة تشغيل كل الخدمات
pm2 restart all

# مراقبة الـ logs
pm2 logs

# التحقق من الحالة
pm2 status
```

### 5. اختبار الاتصال يدوياً
```bash
# اختبار الاتصال بـ MongoDB Atlas
curl -I https://mobile-store-cluster.cylotee.mongodb.net

# اختبار API
curl https://api.ab-tw.com/api/products
```

## إذا استمرت المشكلة

### الحل البديل: استخدام MongoDB محلي
```bash
# تثبيت MongoDB محلياً
sudo apt update
sudo apt install mongodb -y

# تشغيل MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# تحديث .env لاستخدام MongoDB المحلي
echo "MONGODB_URI=mongodb://localhost:27017/mobile_store" >> /mobile-store-vite/backend/.env

# إعادة تشغيل
pm2 restart all
```

## التحقق من نجاح الإصلاح

افتح المتصفح وتحقق من:
1. ✅ الموقع يفتح بدون أخطاء
2. ✅ المنتجات تظهر
3. ✅ Footer و Header يظهران
4. ✅ لا توجد أخطاء 500 في Console

---
**ملاحظة مهمة**: المشكلة ليست في الكود، المشكلة في اتصال قاعدة البيانات على السيرفر.