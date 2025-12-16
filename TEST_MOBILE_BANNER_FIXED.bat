@echo off
echo ========================================
echo اختبار البانر المحسن للجوال
echo ========================================

echo.
echo 1. تشغيل الخادم الخلفي...
start "Backend Server" cmd /c "cd backend && npm start"

echo.
echo 2. انتظار تشغيل الخادم الخلفي...
timeout /t 3 /nobreak > nul

echo.
echo 3. تشغيل الخادم الأمامي...
start "Frontend Server" cmd /c "cd frontend && npm run dev"

echo.
echo 4. انتظار تشغيل الخادم الأمامي...
timeout /t 5 /nobreak > nul

echo.
echo ========================================
echo الخوادم تعمل الآن!
echo ========================================
echo.
echo للاختبار:
echo 1. افتح المتصفح على: http://localhost:5173
echo 2. اذهب إلى صفحة الإدارة: /admin/theme-settings
echo 3. فعل البانر واكتب نص
echo 4. احفظ الإعدادات
echo 5. اختبر في الجوال والديسكتوب
echo.
echo ملاحظات الاختبار:
echo - البانر يجب أن يظهر في الجوال والديسكتوب
echo - النص يجب أن يكون واضح ومقروء
echo - الألوان يجب أن تطبق بشكل صحيح
echo - localStorage يجب أن يعمل في الجوال
echo.
echo اضغط أي مفتاح للإغلاق...
pause > nul