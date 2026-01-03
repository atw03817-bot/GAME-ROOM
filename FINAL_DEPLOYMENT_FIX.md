# 🚨 إصلاح مشكلة Timeout النهائي

## المشكلة:
- Frontend يعطي timeout errors
- Backend لا يرد على الطلبات
- الاتصال منقطع بين Vercel و AWS

## الحل النهائي:

### 1️⃣ تحقق من حالة Backend على AWS:
```bash
# في AWS terminal
pm2 status
pm2 logs gameroom-backend

# إذا كان متوقف، شغله:
cd GAME-ROOM/backend
pm2 restart gameroom-backend

# تحقق من الاتصال:
curl http://localhost:5000/api/health
curl http://localhost/api/health
```

### 2️⃣ إصلاح إعدادات Nginx:
```bash
# تحقق من حالة Nginx
sudo systemctl status nginx

# إعادة تشغيل Nginx
sudo systemctl restart nginx

# اختبار الإعداد
sudo nginx -t
```

### 3️⃣ فتح جميع المنافذ المطلوبة:
```bash
# فتح المنافذ
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 5000

# تحقق من الجدار الناري
sudo ufw status
```

### 4️⃣ تحديث متغيرات البيئة في Backend:
```bash
# تحديث ملف .env
nano .env

# أضف هذه المتغيرات:
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb+srv://abadaltwasl390_db_user:FhyyWMVFoDUj0zFk@al-abaad.pt0bwnx.mongodb.net/gameroom-store?retryWrites=true&w=majority
JWT_SECRET=gameroom-super-secret-jwt-key-production-2025
FRONTEND_URL=https://game-room-tau.vercel.app
```

### 5️⃣ إعادة تشغيل كل شيء:
```bash
# إعادة تشغيل Backend
pm2 restart gameroom-backend

# إعادة تشغيل Nginx
sudo systemctl restart nginx

# اختبار نهائي
curl http://localhost/api/health
```

### 6️⃣ تحديث Vercel (الحل المؤقت):
```
VITE_API_URL=http://63.181.37.121/api
```

### 7️⃣ إذا لم يعمل، استخدم الحل البديل:
```bash
# شغل Backend على بورت 80 مباشرة
sudo PORT=80 pm2 start server.js --name gameroom-backend-80

# حدث في Vercel:
VITE_API_URL=http://63.181.37.121
```

## اختبار النهائي:
```bash
# يجب أن ترجع هذه الأوامر نتائج صحيحة:
curl http://63.181.37.121/api/health
curl http://63.181.37.121/api/products
```