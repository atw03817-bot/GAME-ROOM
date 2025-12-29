# 🚀 دليل النشر الكامل - جيم روم

## 📋 المحتويات
1. [الرفع على GitHub](#github)
2. [النشر على Vercel (Frontend)](#vercel)
3. [النشر على AWS (Backend)](#aws)
4. [ربط الدومين](#domain)
5. [المتغيرات البيئية](#env)

---

## 🔧 التحضيرات الأولية

### 1. تنظيف المشروع
```bash
# احذف node_modules من الجذر (إن وجد)
rm -rf node_modules

# تأكد من وجود .gitignore
```

### 2. تحديث .gitignore
تأكد من أن `.gitignore` يحتوي على:
```
node_modules/
.env
.env.local
dist/
build/
.DS_Store
*.log
.vercel
```

---

## 📦 الرفع على GitHub {#github}

### الطريقة 1: من Terminal

```bash
# 1. انتقل لمجلد المشروع
cd mobile-store-vite

# 2. تهيئة Git (إذا لم يكن مهيأ)
git init

# 3. إضافة جميع الملفات
git add .

# 4. أول commit
git commit -m "Initial commit: Mobile Store - Abad Tawasul"

# 5. إنشاء repository على GitHub
# اذهب إلى: https://github.com/new
# اسم الـ repo: mobile-store-vite
# اجعله Private أو Public حسب رغبتك

# 6. ربط المشروع بـ GitHub
git remote add origin https://github.com/YOUR_USERNAME/mobile-store-vite.git

# 7. رفع الكود
git branch -M main
git push -u origin main
```

### الطريقة 2: من GitHub Desktop
1. افتح GitHub Desktop
2. File → Add Local Repository
3. اختر مجلد `mobile-store-vite`
4. Publish Repository
5. اختر الاسم والخصوصية
6. انقر Publish

---

## ☁️ النشر على Vercel (Frontend) {#vercel}

### الخطوة 1: إنشاء حساب
1. اذهب إلى: https://vercel.com
2. سجل دخول بحساب GitHub
3. اربط حسابك

### الخطوة 2: استيراد المشروع
```bash
# من Terminal
cd mobile-store-vite
npx vercel

# أو من موقع Vercel:
# 1. New Project
# 2. Import Git Repository
# 3. اختر mobile-store-vite
```

### الخطوة 3: إعدادات المشروع

#### Framework Preset
```
Framework: Vite
```

#### Root Directory
```
frontend
```

#### Build Command
```bash
npm run build
```

#### Output Directory
```
dist
```

#### Install Command
```bash
npm install
```

### الخطوة 4: المتغيرات البيئية

في Vercel Dashboard → Settings → Environment Variables:

```env
# API URL (سيتم تحديثه بعد نشر Backend)
VITE_API_URL=https://your-backend.com/api

# أو إذا كنت تستخدم نفس الدومين
VITE_API_URL=/api
```

### الخطوة 5: Deploy
```bash
# انقر Deploy
# انتظر 2-3 دقائق
# ستحصل على رابط مثل: https://mobile-store-vite.vercel.app
```

---

## 🖥️ النشر على AWS (Backend) {#aws}

### الخيار 1: AWS Elastic Beanstalk (الأسهل)

#### 1. تحضير Backend
```bash
cd mobile-store-vite/backend

# إنشاء .ebignore
echo "node_modules/" > .ebignore
echo ".env" >> .ebignore
```

#### 2. تثبيت EB CLI
```bash
# Windows (PowerShell)
pip install awsebcli

# أو
choco install awsebcli
```

#### 3. تهيئة Elastic Beanstalk
```bash
# في مجلد backend
eb init

# اختر:
# - Region: Middle East (Bahrain) me-south-1
# - Application name: mobile-store-backend
# - Platform: Node.js
# - SSH: Yes (اختياري)
```

#### 4. إنشاء Environment
```bash
eb create mobile-store-prod

# أو للتطوير
eb create mobile-store-dev
```

#### 5. إعداد المتغيرات البيئية
```bash
# من Console
eb setenv PORT=5000 \
  NODE_ENV=production \
  MONGODB_URI="your-mongodb-uri" \
  JWT_SECRET="your-secret-key" \
  FRONTEND_URL="https://your-vercel-app.vercel.app"

# أو من AWS Console:
# Elastic Beanstalk → Environment → Configuration → Software
```

#### 6. Deploy
```bash
eb deploy

# للتحقق
eb open
```

### الخيار 2: AWS EC2 (أكثر تحكم)

#### 1. إنشاء EC2 Instance
```bash
# من AWS Console:
# 1. EC2 → Launch Instance
# 2. اختر: Ubuntu Server 22.04 LTS
# 3. Instance Type: t2.micro (Free Tier) أو t3.small
# 4. Security Group: افتح ports 22, 80, 443, 5000
# 5. Create Key Pair وحفظه
```

#### 2. الاتصال بالسيرفر
```bash
# Windows (PowerShell)
ssh -i "your-key.pem" ubuntu@your-ec2-ip

# أو استخدم PuTTY
```

#### 3. تثبيت المتطلبات
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# تثبيت MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt update
sudo apt install -y mongodb-org
sudo systemctl start mongod
sudo systemctl enable mongod

# تثبيت PM2
sudo npm install -g pm2

# تثبيت Nginx
sudo apt install -y nginx
```

#### 4. رفع الكود
```bash
# من جهازك
cd mobile-store-vite/backend
scp -i "your-key.pem" -r . ubuntu@your-ec2-ip:/home/ubuntu/backend

# أو استخدم Git
# على السيرفر:
cd /home/ubuntu
git clone https://github.com/YOUR_USERNAME/mobile-store-vite.git
cd mobile-store-vite/backend
```

#### 5. إعداد Backend
```bash
# على السيرفر
cd /home/ubuntu/mobile-store-vite/backend

# تثبيت Dependencies
npm install --production

# إنشاء .env
nano .env
```

محتوى `.env`:
```env
PORT=5000
NODE_ENV=production
MONGODB_URI=mongodb://localhost:27017/mobile-store
JWT_SECRET=your-super-secret-jwt-key-change-this
FRONTEND_URL=https://your-vercel-app.vercel.app
```

#### 6. تشغيل بـ PM2
```bash
# تشغيل
pm2 start server.js --name mobile-store-backend

# حفظ
pm2 save

# تشغيل تلقائي عند إعادة التشغيل
pm2 startup
```

#### 7. إعداد Nginx
```bash
sudo nano /etc/nginx/sites-available/mobile-store
```

محتوى الملف:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

تفعيل:
```bash
sudo ln -s /etc/nginx/sites-available/mobile-store /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 8. SSL مع Let's Encrypt
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🌐 ربط الدومين {#domain}

### 1. شراء دومين
- Namecheap: https://www.namecheap.com
- GoDaddy: https://www.godaddy.com
- أو أي مزود آخر

### 2. إعداد DNS

#### لـ Vercel (Frontend):
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: Auto

Type: A
Name: @
Value: 76.76.21.21
TTL: Auto
```

#### لـ AWS (Backend):
```
Type: A
Name: api
Value: YOUR_EC2_IP
TTL: 3600
```

### 3. إضافة الدومين في Vercel
```
1. Project Settings → Domains
2. Add Domain: yourdomain.com
3. Add Domain: www.yourdomain.com
4. انتظر التحقق (5-10 دقائق)
```

### 4. تحديث المتغيرات البيئية

#### في Vercel:
```env
VITE_API_URL=https://api.yourdomain.com/api
```

#### في AWS:
```env
FRONTEND_URL=https://yourdomain.com
```

---

## 🔐 المتغيرات البيئية {#env}

### Frontend (.env)
```env
VITE_API_URL=https://api.yourdomain.com/api
```

### Backend (.env)
```env
PORT=5000
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/mobile-store
# أو MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/mobile-store

# Security
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long

# CORS
FRONTEND_URL=https://yourdomain.com

# Optional: Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Optional: Payment
TAP_SECRET_KEY=your-tap-secret-key

```

---

## 📝 ملاحظات مهمة

### 1. الأمان
- ✅ لا ترفع ملفات `.env` على GitHub
- ✅ استخدم secrets قوية للـ JWT
- ✅ فعّل HTTPS على جميع الدومينات
- ✅ استخدم MongoDB Atlas للإنتاج (أفضل من local)

### 2. MongoDB Atlas (موصى به)
```bash
# بدلاً من MongoDB محلي:
1. اذهب إلى: https://www.mongodb.com/cloud/atlas
2. إنشاء حساب مجاني
3. Create Cluster (M0 Free)
4. Database Access → Add User
5. Network Access → Add IP (0.0.0.0/0 للسماح للجميع)
6. Connect → Get Connection String
7. استخدمه في MONGODB_URI
```

### 3. التحديثات
```bash
# Frontend (Vercel)
git push origin main
# Vercel ينشر تلقائياً

# Backend (AWS)
# EC2:
ssh ubuntu@your-ec2-ip
cd mobile-store-vite/backend
git pull
npm install
pm2 restart mobile-store-backend

# Elastic Beanstalk:
eb deploy
```

### 4. المراقبة
```bash
# PM2 Monitoring
pm2 monit

# Logs
pm2 logs mobile-store-backend

# Status
pm2 status
```

---

## 🆘 استكشاف الأخطاء

### Frontend لا يتصل بـ Backend
```bash
# تحقق من:
1. VITE_API_URL صحيح في Vercel
2. CORS مفعل في Backend
3. Backend يعمل: curl https://api.yourdomain.com/api/health
```

### Backend لا يعمل
```bash
# على السيرفر:
pm2 logs mobile-store-backend
pm2 restart mobile-store-backend

# تحقق من MongoDB:
sudo systemctl status mongod
```

### مشاكل الدومين
```bash
# تحقق من DNS:
nslookup yourdomain.com
dig yourdomain.com

# انتظر 24-48 ساعة لانتشار DNS
```

---

## ✅ Checklist النشر

- [ ] الكود على GitHub
- [ ] Frontend على Vercel
- [ ] Backend على AWS
- [ ] MongoDB يعمل (Atlas أو EC2)
- [ ] المتغيرات البيئية محدثة
- [ ] الدومين مربوط
- [ ] SSL مفعل (HTTPS)
- [ ] اختبار جميع الوظائف
- [ ] PM2 يعمل تلقائياً
- [ ] Nginx مضبوط
- [ ] Backup للبيانات

---

## 📞 الدعم

إذا واجهت أي مشاكل:
1. راجع logs: `pm2 logs`
2. تحقق من status: `pm2 status`
3. أعد التشغيل: `pm2 restart all`

**مبروك! 🎉 موقعك الآن على الإنترنت!**
