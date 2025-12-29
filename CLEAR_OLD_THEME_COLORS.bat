@echo off
echo ========================================
echo مسح الألوان القديمة من إعدادات الثيم
echo ========================================
echo.

echo هذا الملف سيساعدك في مسح الألوان البنفسجية القديمة:
echo.
echo خطوات المسح:
echo.
echo 1. افتح المتصفح واذهب لإعدادات الثيم
echo 2. اضغط F12 لفتح Developer Tools
echo 3. اذهب لتبويب Console
echo 4. انسخ والصق هذا الكود:
echo.
echo localStorage.removeItem('bannerSettings');
echo localStorage.removeItem('themeSettings');
echo localStorage.removeItem('colorSettings');
echo location.reload();
echo.
echo 5. اضغط Enter
echo 6. ستتم إعادة تحميل الصفحة بالألوان الجديدة
echo.
echo أو يمكنك:
echo - مسح cache المتصفح (Ctrl+Shift+Delete)
echo - إعادة تشغيل المتصفح
echo.
echo بعد ذلك ستظهر الألوان الجديدة (البرتقالي والأحمر)
echo بدلاً من الألوان البنفسجية القديمة.
echo.

pause