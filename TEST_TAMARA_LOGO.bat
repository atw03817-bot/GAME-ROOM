@echo off
echo ========================================
echo     اختبار شعار تمارا الجديد
echo ========================================
echo.

echo 1. فتح صفحة إعدادات تمارا...
start http://localhost:5173/admin/tamara-payment-settings

timeout /t 2 /nobreak >nul

echo.
echo 2. فتح صفحة الإعدادات الرئيسية...
start http://localhost:5173/admin/settings

timeout /t 2 /nobreak >nul

echo.
echo 3. فتح صفحة الدفع للاختبار...
start http://localhost:5173/checkout

timeout /t 2 /nobreak >nul

echo.
echo 4. فتح اختبار الشعار المباشر...
start TEST_TAMARA_LOGO_DIRECT.html

echo.
echo ما تم تحديثه:
echo ✅ شعار تمارا الرسمي من Noon CDN
echo ✅ شعار باللغة العربية المحسن
echo ✅ تصميم محسن مع CSS مخصص
echo ✅ fallback للنص في حالة فشل تحميل الصورة
echo ✅ تصميم متجاوب للهواتف
echo ✅ دعم الوضع المظلم
echo.

echo للاختبار:
echo 1. تحقق من ظهور شعار تمارا في الإعدادات
echo 2. جرب عملية شراء واختر تمارا
echo 3. تأكد من ظهور الشعار في صفحة الدفع
echo.

pause