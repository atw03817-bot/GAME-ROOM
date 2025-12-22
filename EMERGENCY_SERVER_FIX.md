# 🚨 إصلاح طارئ - قاعدة البيانات معطلة

## المشكلة الحالية
```
Operation `products.find()` buffering timed out after 10000ms
GET /api/theme 500 (Internal Server Error)
GET /api/products 500 (Internal Server Error)
GET /api/footer 500 (Internal Server Error)
```

**السبب**: MongoDB غير متصل على السيرفر

## الحل الفوري (نفذ هذه الأوامر على السيرفر)

### 1. تحقق من حالة MongoDB
```bash
sudo systemctl status mongod
```

### 2. إذا كان متوقف، شغله
```bash
sudo systemctl start mongod
sudo systemctl enable mongod
```

### 3. تحقق من ملف .env
```bash
cd /mobile-store-vite/backend
ls -la .env
cat .env | grep MONGODB
```

### 4. إذا ملف .env مش موجود، أنشئه
```bash
cd /mobile-store-vite/backend
cat > .env << 'EOF'
MONGODB_URI=mongodb+srv://atw03817_db_user:jP9AouAfbaifknI4@mobile-store-cluster.cylotee.mongodb.net/mobile_store?retryWrites=true&w=majority
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://www.ab-tw.com
JWT_SECRET=mobile-store-secret-key-2024
EOF
```

### 5. أعد تشغيل PM2
```bash
pm2 restart all
pm2 logs --lines 20
```

### 6. تحقق من الحالة
```bash
pm2 status
```

## إذا استمرت المشكلة - الحل البديل

### استخدم MongoDB محلي
```bash
# ثبت MongoDB محلياً
sudo apt update
sudo apt install mongodb -y

# شغل MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb

# غير .env لاستخدام MongoDB المحلي
echo "MONGODB_URI=mongodb://localhost:27017/mobile_store" > /mobile-store-vite/backend/.env

# أعد تشغيل
pm2 restart all
```

## التحقق من نجاح الإصلاح
```bash
# اختبر API
curl https://api.ab-tw.com/api/products

# شوف logs
pm2 logs backend --lines 10
```

---
**ملاحظة مهمة**: المشكلة ليست في الكود، المشكلة في اتصال قاعدة البيانات!