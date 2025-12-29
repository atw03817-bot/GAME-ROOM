@echo off
echo ========================================
echo إصلاح سريع لمشكلة Tabby
echo ========================================
echo.

echo الخطوات المطلوبة:
echo.
echo 1. تأكد من أن الخادم يعمل (npm run dev في مجلد backend)
echo 2. شغل سكريبت فحص قاعدة البيانات
echo 3. اختبر API مباشرة
echo 4. أعد تشغيل الخادم إذا لزم الأمر
echo.

echo تشغيل فحص قاعدة البيانات...
node CHECK_TABBY_SETTINGS.js

echo.
echo افتح الملف TEST_PAYMENT_METHODS_API.html في المتصفح لاختبار API
echo.

echo إذا لم تظهر Tabby بعد:
echo 1. أعد تشغيل الخادم (Ctrl+C ثم npm run dev)
echo 2. امسح cache المتصفح (Ctrl+Shift+R)
echo 3. تحقق من console المتصفح للأخطاء
echo.

pause