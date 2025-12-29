# 🚀 تحضير Backend للرفع على AWS

## 1️⃣ إنشاء ملف package.json للإنتاج

تأكد من وجود هذه الإعدادات في `backend/package.json`:

```json
{
  "name": "gameroom-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

## 2️⃣ إنشاء ملف .ebextensions

أنشئ مجلد `.ebextensions` في `backend/` وأضف ملف `01_node_command.config`:

```yaml
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "npm start"
  aws:elasticbeanstalk:application:environment:
    NODE_ENV: production
    PORT: 8080
```

## 3️⃣ تحديث server.js للإنتاج

```javascript
// في بداية server.js
const PORT = process.env.PORT || 8080; // AWS يستخدم 8080 عادة
```

## 4️⃣ إنشاء ملف .env للإنتاج

```bash
# Production Environment Variables
NODE_ENV=production
PORT=8080
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/gameroom-store
JWT_SECRET=your-super-secret-jwt-key-very-long-and-random
FRONTEND_URL=https://your-vercel-app.vercel.app
```

## 5️⃣ تحضير ملف ZIP للرفع

### الملفات المطلوبة:
```
backend/
├── server.js
├── package.json
├── package-lock.json
├── .ebextensions/
│   └── 01_node_command.config
├── controllers/
├── models/
├── routes/
├── middleware/
├── services/
└── scripts/
```

### الملفات المستبعدة (.ebignore):
```
node_modules/
.env
.git/
*.log
temp_shipments/
uploads/temp/
```

## 6️⃣ خطوات الرفع على Elastic Beanstalk

1. **اذهب إلى AWS Console**
2. **ابحث عن "Elastic Beanstalk"**
3. **اضغط "Create Application"**
4. **املأ البيانات:**
   - Application name: `gameroom-backend`
   - Platform: `Node.js`
   - Platform version: `Node.js 18 running on 64bit Amazon Linux 2`
5. **ارفع ملف ZIP**
6. **اضغط "Create Application"**

## 7️⃣ إعداد متغيرات البيئة في AWS

بعد الرفع:
1. **اذهب إلى Configuration**
2. **اضغط Software**
3. **أضف Environment Properties:**
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-atlas-uri
   JWT_SECRET=your-jwt-secret
   FRONTEND_URL=https://your-vercel-app.vercel.app
   ```

## 8️⃣ اختبار التطبيق

بعد النشر، ستحصل على رابط مثل:
```
http://gameroom-backend.us-east-1.elasticbeanstalk.com
```

اختبر:
- `GET /api/products` - جلب المنتجات
- `GET /api/health` - فحص صحة الخادم

## 9️⃣ تحديث Frontend

في Vercel، حدث متغير البيئة:
```
VITE_API_URL=http://gameroom-backend.us-east-1.elasticbeanstalk.com/api
```

## 🔧 استكشاف الأخطاء

### مشاهدة اللوجز:
1. **اذهب إلى Logs في Elastic Beanstalk**
2. **اضغط "Request Logs" → "Last 100 Lines"**

### أخطاء شائعة:
- **Port Error:** تأكد من استخدام `process.env.PORT`
- **Module Error:** تأكد من `"type": "module"` في package.json
- **Database Error:** تأكد من MongoDB Atlas URI

## 💰 التكلفة

- **Free Tier:** 750 ساعة مجانية شهرياً
- **بعد Free Tier:** حوالي $10-20/شهر حسب الاستخدام