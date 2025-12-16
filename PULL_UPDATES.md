# 📥 كيفية سحب التحديثات من GitHub

## 🖥️ على السيرفر (AWS)

### الطريقة الكاملة (موصى بها)

```bash
# 1. الدخول لمجلد المشروع
cd /home/ubuntu/mobile-store-vite

# 2. إيقاف السيرفرات
pm2 stop all

# 3. حفظ نسخة احتياطية (اختياري)
cp -r backend/uploads backend/uploads.backup
cp backend/.env backend/.env.backup

# 4. سحب التحديثات
git pull origin main

# 5. تثبيت التحديثات (إذا كان فيه packages جديدة)
cd backend
npm install
cd ../frontend
npm install
cd ..

# 6. إعادة تشغيل السيرفرات
pm2 restart all

# 7. التحقق من الحالة
pm2 status
pm2 logs
```

---

## ⚡ الطريقة السريعة (بدون packages جديدة)

```bash
cd /home/ubuntu/mobile-store-vite
pm2 stop all
git pull origin main
pm2 restart all
pm2 status
```

---

## 🔍 التحقق من التحديثات قبل السحب

```bash
# معرفة التحديثات المتاحة
cd /home/ubuntu/mobile-store-vite
git fetch origin
git log HEAD..origin/main --oneline

# معرفة الملفات التي ستتغير
git diff HEAD origin/main --name-only
```

---

## 🛡️ إذا كان عندك تعديلات محلية

### الخيار 1: حفظ التعديلات مؤقتاً
```bash
git stash
git pull origin main
git stash pop
```

### الخيار 2: إلغاء التعديلات المحلية
```bash
git reset --hard HEAD
git pull origin main
```

### الخيار 3: دمج التعديلات
```bash
git pull origin main
# إذا حصل conflict، حله يدوياً ثم:
git add .
git commit -m "Merge updates"
```

---

## 📋 خطوات مفصلة للسيرفر

### 1. الاتصال بالسيرفر
```bash
ssh ubuntu@your-server-ip
```

### 2. الانتقال للمشروع
```bash
cd /home/ubuntu/mobile-store-vite
```

### 3. التحقق من الحالة الحالية
```bash
git status
git branch
```

### 4. سحب التحديثات
```bash
git pull origin main
```

### 5. إذا ظهرت رسالة "Already up to date"
معناها المشروع محدث ومافيه تحديثات جديدة

### 6. إذا ظهرت رسالة "Updating..."
معناها التحديثات تم سحبها بنجاح

### 7. إعادة تشغيل السيرفرات
```bash
pm2 restart all
```

---

## 🔧 حل المشاكل الشائعة

### مشكلة: "error: Your local changes would be overwritten"

**الحل:**
```bash
# حفظ التعديلات
git stash
git pull origin main
git stash pop
```

### مشكلة: "fatal: Not a git repository"

**الحل:**
```bash
# تأكد إنك في المجلد الصحيح
cd /home/ubuntu/mobile-store-vite
pwd
```

### مشكلة: "Permission denied"

**الحل:**
```bash
# تغيير الصلاحيات
sudo chown -R ubuntu:ubuntu /home/ubuntu/mobile-store-vite
```

### مشكلة: "Could not resolve host"

**الحل:**
```bash
# تحقق من الاتصال بالإنترنت
ping github.com
```

---

## 📦 بعد سحب التحديثات

### تحقق من الملفات الجديدة
```bash
ls -la
```

### تحقق من السيرفرات
```bash
pm2 status
pm2 logs backend --lines 50
pm2 logs frontend --lines 50
```

### اختبر الموقع
```bash
# Backend
curl http://localhost:5000/api/health

# Frontend
curl http://localhost:5173
```

---

## 🎯 التحديثات الأخيرة (8 ديسمبر 2024)

### ما تم إضافته:
1. ✅ صفحة تفاصيل الطلب الكاملة
2. ✅ محرر أقسام متقدم
3. ✅ نظام رفع صور
4. ✅ ترتيب صور المنتجات
5. ✅ عرض نفذت الكمية

### الملفات الجديدة المهمة:
- `frontend/src/pages/admin/OrderDetails.jsx`
- `frontend/src/components/SectionEditor.jsx`
- `frontend/src/components/ImageUploader.jsx`
- `backend/routes/upload.js`

### لا تنسى:
- ✅ مجلد `backend/uploads` يجب أن يكون موجود
- ✅ الصلاحيات على مجلد uploads: `chmod 755`
- ✅ إعادة تشغيل السيرفرات بعد التحديث

---

## 🚀 سكريبت تلقائي للتحديث

احفظ هذا في ملف `update.sh`:

```bash
#!/bin/bash

echo "🔄 بدء عملية التحديث..."

# الانتقال للمشروع
cd /home/ubuntu/mobile-store-vite

# إيقاف السيرفرات
echo "⏸️  إيقاف السيرفرات..."
pm2 stop all

# سحب التحديثات
echo "📥 سحب التحديثات..."
git pull origin main

# تثبيت packages الجديدة
echo "📦 تثبيت التحديثات..."
cd backend && npm install
cd ../frontend && npm install
cd ..

# إعادة تشغيل السيرفرات
echo "▶️  إعادة تشغيل السيرفرات..."
pm2 restart all

# عرض الحالة
echo "✅ تم التحديث بنجاح!"
pm2 status

echo "📊 آخر 20 سطر من اللوقات:"
pm2 logs --lines 20
```

### استخدام السكريبت:
```bash
# إعطاء صلاحيات التنفيذ
chmod +x update.sh

# تشغيل السكريبت
./update.sh
```

---

## 📞 للدعم

إذا واجهت أي مشكلة:
1. تحقق من اللوقات: `pm2 logs`
2. تحقق من الحالة: `pm2 status`
3. راجع ملف `✅_TODAY_UPDATES_AR.md`

---

**آخر تحديث**: 8 ديسمبر 2024
