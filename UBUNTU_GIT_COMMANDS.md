# تثبيت Git على Ubuntu Server

## المشكلة
السيرفر Ubuntu ما عنده `git` مثبت، لذلك ما يقدر يسحب التحديثات.

## الحل السريع

### 1. تثبيت Git
```bash
sudo apt update
sudo apt install git -y
```

### 2. التحقق من التثبيت
```bash
git --version
```

### 3. سحب التحديثات
```bash
cd /mobile-store-vite
git pull origin main
```

## الأوامر الكاملة للنسخ واللصق

```bash
# تثبيت Git
sudo apt update && sudo apt install git -y

# التحقق من التثبيت
git --version

# الانتقال للمجلد والسحب
cd /mobile-store-vite
git pull origin main

# إعادة تشغيل الخدمات
pm2 restart all
```

## إذا كان المجلد مش موجود

```bash
# استنساخ المشروع من جديد
cd /
git clone https://github.com/info-makerhgj/mobile-store-vite.git
cd mobile-store-vite

# تثبيت المتطلبات
cd backend && npm install
cd ../frontend && npm install

# تشغيل الخدمات
pm2 start ecosystem.config.js
```

---
**ملاحظة**: بعد تثبيت Git، كل أوامر git هتشتغل عادي.