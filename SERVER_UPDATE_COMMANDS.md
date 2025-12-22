# أوامر تحديث السيرفر - نسخ ولصق

## تم رفع التحديثات إلى GitHub ✅

### الآن على السيرفر Ubuntu:

```bash
# 1. الانتقال لمجلد المشروع
cd ~/mobile-store-vite

# 2. سحب التحديثات الجديدة
git pull origin main

# 3. إعادة تشغيل Backend
pm2 restart mobile-store-backend

# 4. تحقق من الحالة
pm2 status

# 5. شوف آخر logs
pm2 logs mobile-store-backend --lines 20
```

## اختبار التسجيل

### من المتصفح:
1. افتح https://www.ab-tw.com/register
2. جرب التسجيل برقم جديد مثل: `0501234567`
3. يجب أن يعمل بدون مشاكل

### من Terminal (اختياري):
```bash
# اختبار API مباشرة
curl -X POST https://api.ab-tw.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"0501234567","password":"123456"}'
```

## التحقق من نجاح التحديث

### ✅ علامات النجاح:
- رسالة خطأ: "رقم الجوال مستخدم بالفعل" (إذا كان الرقم موجود)
- إنشاء حساب جديد بنجاح (إذا كان الرقم جديد)
- لا توجد رسائل عن "الإيميل"

### ❌ علامات المشكلة:
- رسالة: "الإيميل موجود مسبقاً"
- أخطاء 500 في API
- عدم عمل التسجيل

## إذا لسه فيه مشاكل:

```bash
# إجبار سحب التحديثات
cd ~/mobile-store-vite
git fetch origin
git reset --hard origin/main

# إعادة تشغيل كل شي
pm2 restart all

# تحقق من MongoDB
sudo systemctl status mongodb
sudo systemctl start mongodb

# اختبار مرة أخرى
curl -X POST https://api.ab-tw.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"0509999999","password":"123456"}'
```

---
**ملاحظة**: التحديثات تم رفعها بنجاح، المطلوب فقط سحبها على السيرفر وإعادة التشغيل.