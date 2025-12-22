# الحل الصحيح بدون ترقيع

## المشاكل الحقيقية من الصور:

### 1. MongoDB مش مثبت على Ubuntu
```
Failed to start mongod.service: Unit mongod.service not found.
```

### 2. MongoDB URI مش شغال
```
MongooseError: The `uri` parameter to `openUri()` must be a string, got "undefined"
```

### 3. Port 5000 مشغول
```
Error: listen EADDRINUSE: address already in use 0.0.0.0:5000
```

## الحل الصحيح:

### 1. تثبيت MongoDB على Ubuntu
```bash
# تثبيت MongoDB
sudo apt update
sudo apt install mongodb -y

# تشغيل MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# تحقق من التشغيل
sudo systemctl status mongodb
```

### 2. إصلاح ملف .env
```bash
cd ~/mobile-store-vite/backend

# تحقق من المحتوى الحالي
cat .env

# إصلاح MONGODB_URI
sed -i 's|MONGODB_URI=mongodb+srv://.*|MONGODB_URI=mongodb://localhost:27017/mobile_store|' .env

# أو إعادة كتابة الملف
cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017/mobile_store
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://www.ab-tw.com
JWT_SECRET=mobile-store-secret-key-2025
API_URL=https://api.ab-tw.com
EOF
```

### 3. إيقاف العمليات المتضاربة
```bash
# إيقاف العمليات على Port 5000
sudo fuser -k 5000/tcp

# إيقاف PM2 القديم
pm2 delete all

# تحقق من عدم وجود عمليات
pm2 status
```

### 4. تشغيل المشروع
```bash
cd ~/mobile-store-vite/backend

# تشغيل بـ PM2
pm2 start server.js --name mobile-store-backend

# تحقق من الحالة
pm2 status
pm2 logs mobile-store-backend --lines 20
```

### 5. اختبار النتيجة
```bash
# اختبار API محلياً
curl http://localhost:5000/api/products

# اختبار من الخارج
curl https://api.ab-tw.com/api/products
```

## ملاحظات مهمة:

1. **لا تحذف المشروع** - هو موجود في `~/mobile-store-vite`
2. **المشكلة في MongoDB** - مش مثبت على Ubuntu
3. **استخدم MongoDB محلي** بدلاً من Atlas للاستقرار
4. **تأكد من Port 5000** مش مشغول قبل التشغيل

---
**هذا الحل الصحيح بدون ترقيع أو حذف المشروع**