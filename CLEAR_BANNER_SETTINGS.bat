@echo off
echo تنظيف إعدادات البانر المحفوظة...
echo.
echo هذا الملف سيساعدك في اختبار النظام الجديد
echo.
echo الخطوات:
echo 1. افتح المتصفح واذهب للموقع
echo 2. اضغط F12 لفتح Developer Tools
echo 3. اذهب لتبويب Console
echo 4. اكتب: localStorage.removeItem('bannerSettings')
echo 5. اضغط Enter
echo 6. اعد تحميل الصفحة
echo.
echo النتيجة المتوقعة:
echo - البانر لن يظهر (مغلق افتراضياً)
echo - اذهب لصفحة الإعدادات وفعل البانر
echo - اكتب النص الذي تريده
echo - احفظ الإعدادات
echo.
pause