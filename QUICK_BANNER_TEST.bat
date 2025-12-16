@echo off
echo ========================================
echo اختبار سريع لمشكلة البانر
echo ========================================

echo.
echo 1. فتح أداة التشخيص...
start "" "DEBUG_MOBILE_BANNER.html"

echo.
echo 2. تشغيل الخادم الأمامي...
start "Frontend Server" cmd /c "cd frontend && npm run dev"

echo.
echo ========================================
echo خطوات الاختبار السريع:
echo ========================================
echo.
echo أ) في أداة التشخيص (DEBUG_MOBILE_BANNER.html):
echo    1. انقر "فحص شامل"
echo    2. انقر "إنشاء بانر تجريبي"
echo    3. انقر "محاكاة البانر الحقيقي"
echo    4. راقب النتائج في "سجل الأحداث"
echo.
echo ب) في التطبيق (http://localhost:5173):
echo    1. افتح أدوات المطور (F12)
echo    2. اذهب لتبويب Console
echo    3. ابحث عن رسائل "TopBanner:"
echo    4. اذهب لصفحة الإدارة وفعل البانر
echo    5. راقب الرسائل في Console
echo.
echo ج) اختبار localStorage مباشر:
echo    في Console اكتب:
echo    localStorage.getItem('bannerSettings')
echo.
echo اضغط أي مفتاح للمتابعة...
pause > nul

echo.
echo 3. انتظار تشغيل الخادم...
timeout /t 3 /nobreak > nul

echo.
echo 4. فتح التطبيق...
start "" "http://localhost:5173"

echo.
echo ========================================
echo التطبيق جاهز للاختبار!
echo ========================================
echo.
echo إذا لم يظهر البانر:
echo 1. تحقق من Console للأخطاء
echo 2. استخدم أداة التشخيص
echo 3. تأكد من localStorage
echo.
echo اضغط أي مفتاح للإغلاق...
pause > nul