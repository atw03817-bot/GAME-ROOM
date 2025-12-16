# حل سريع لمشكلة Tamara API

## المشكلة الحالية
- Tamara API يرجع خطأ 400 على السيرفر الحقيقي
- Tap API يعمل بشكل طبيعي
- المشكلة في `POST https://api.ab-tw.com/api/payments/tamara/test`

## الأسباب المحتملة

### 1. مشكلة Authentication
```
Status: 401 = غير مصرح (مش مسجل دخول كـ admin)
Status: 403 = ممنوع (مش admin)
```

### 2. مشكلة في البيانات المرسلة
```
Status: 400 = بيانات خاطئة (merchantToken فاضي أو غير صحيح)
```

### 3. مشكلة في السيرفر
```
Status: 500 = خطأ في السيرفر
Status: 404 = الـ endpoint مش موجود
```

## خطوات التشخيص

### 1. افتح ملف TEST_API_DIRECT.html
- افتح الملف في المتصفح
- اختبر الاتصال العام أولاً
- اختبر Tap API للمقارنة
- اختبر Tamara API

### 2. تحقق من تسجيل الدخول
- تأكد من تسجيل الدخول كـ Admin
- تحقق من صلاحية الـ token في localStorage
- جرب تسجيل دخول جديد

### 3. تحقق من إعدادات Tamara
- تأكد من وجود Merchant Token
- تأكد من صحة الـ API URL
- جرب مع Sandbox أولاً

## الحلول المقترحة

### الحل الأول: إصلاح Authentication
```javascript
// تحقق من الـ token في المتصفح
console.log('Token:', localStorage.getItem('token'));

// إذا كان فاضي أو منتهي الصلاحية، سجل دخول جديد
```

### الحل الثاني: إصلاح البيانات
```javascript
// تأكد من إرسال البيانات الصحيحة
{
  "merchantToken": "your_actual_token_here",
  "apiUrl": "https://api-sandbox.tamara.co",
  "notificationToken": "",
  "publicKey": ""
}
```

### الحل الثالث: تحديث الـ Backend
إذا كان السيرفر الحقيقي مش محدث، ارفع التحديثات الجديدة:
```bash
git add .
git commit -m "Fix Tamara API endpoints"
git push origin main
```

## اختبار سريع

### 1. من المتصفح (F12 Console):
```javascript
// اختبار الاتصال
fetch('https://api.ab-tw.com/api/settings')
  .then(r => r.json())
  .then(console.log);

// اختبار Tamara (بدون token)
fetch('https://api.ab-tw.com/api/payments/tamara/test', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({merchantToken: 'test'})
}).then(r => r.json()).then(console.log);
```

### 2. من Command Line:
```bash
# تشغيل TEST_TAMARA_API_DIRECT.bat
TEST_TAMARA_API_DIRECT.bat
```

## النتائج المتوقعة

### إذا كان الخطأ 401/403:
- المشكلة في الـ authentication
- سجل دخول جديد كـ admin

### إذا كان الخطأ 400:
- المشكلة في البيانات المرسلة
- تحقق من الـ merchantToken

### إذا كان الخطأ 404:
- الـ endpoint مش موجود على السيرفر
- ارفع التحديثات الجديدة

### إذا كان الخطأ 500:
- مشكلة في كود السيرفر
- تحقق من الـ logs

## خطوات المتابعة
1. شغل الاختبارات أعلاه
2. شارك النتائج
3. سنحدد الحل المناسب بناءً على النتائج