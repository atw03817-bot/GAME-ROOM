# ⚡ النشر السريع - 5 دقائق

## 🎯 الخطوات السريعة

### 1️⃣ رفع على GitHub (دقيقة واحدة)
```bash
cd mobile-store-vite
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/mobile-store-vite.git
git push -u origin main
```

### 2️⃣ نشر Frontend على Vercel (دقيقتان)
```bash
cd frontend
npx vercel

# اتبع التعليمات:
# - Link to existing project? No
# - Project name: mobile-store
# - Directory: ./
# - Build command: npm run build
# - Output directory: dist
```

**أو من الموقع:**
1. https://vercel.com/new
2. Import من GitHub
3. اختر `mobile-store-vite`
4. Root Directory: `frontend`
5. Deploy

### 3️⃣ MongoDB Atlas (دقيقة واحدة)
1. https://www.mongodb.com/cloud/atlas/register
2. Create Free Cluster
3. Database Access → Add User
4. Network Access → Add IP: `0.0.0.0/0`
5. Connect → Copy Connection String

### 4️⃣ نشر Backend على AWS (دقيقتان)

#### الطريقة السهلة: Elastic Beanstalk
```bash
cd backend
pip install awsebcli
eb init -p node.js mobile-store-backend
eb create mobile-store-prod
eb setenv MONGODB_URI="your-atlas-uri" JWT_SECRET="your-secret"
eb deploy
```

#### أو: Railway (أسهل!)
1. https://railway.app
2. New Project → Deploy from GitHub
3. اختر `mobile-store-vite/backend`
4. Add Variables:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `PORT=5000`
5. Deploy

### 5️⃣ ربط Frontend بـ Backend
```bash
# في Vercel Dashboard
Settings → Environment Variables
Add: VITE_API_URL = https://your-backend-url.com/api

# Redeploy
```

## ✅ تم! موقعك جاهز

- Frontend: `https://mobile-store-xxx.vercel.app`
- Backend: `https://your-backend.com`

---

## 🔧 إعدادات إضافية (اختيارية)

### الدومين الخاص
1. اشتري دومين من Namecheap
2. في Vercel: Settings → Domains → Add
3. اتبع تعليمات DNS

### SSL تلقائي
- Vercel: تلقائي ✅
- Railway: تلقائي ✅
- AWS EB: يحتاج إعداد

---

## 🆘 مشاكل شائعة

### Frontend لا يتصل بـ Backend
```bash
# تحقق من VITE_API_URL في Vercel
# تأكد من CORS مفعل في Backend
```

### Backend لا يعمل
```bash
# تحقق من logs
eb logs  # AWS
railway logs  # Railway
```

### MongoDB لا يتصل
```bash
# تأكد من:
# 1. IP مسموح (0.0.0.0/0)
# 2. Username/Password صحيح
# 3. Database name موجود في URI
```

---

## 📝 Checklist

- [ ] الكود على GitHub
- [ ] Frontend على Vercel
- [ ] Backend منشور
- [ ] MongoDB Atlas متصل
- [ ] VITE_API_URL محدث
- [ ] اختبار الموقع

**مبروك! 🎉**
