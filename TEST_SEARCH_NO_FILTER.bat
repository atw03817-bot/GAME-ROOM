@echo off
echo ========================================
echo اختبار صفحة البحث بدون فلتر
echo ========================================
echo.

echo تشغيل الخادم الخلفي...
start "Backend Server" cmd /k "cd backend && npm start"

echo انتظار 3 ثوان...
timeout /t 3 /nobreak > nul

echo تشغيل الخادم الأمامي...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo تم تشغيل الخوادم بنجاح!
echo ========================================
echo.
echo الخادم الأمامي: http://localhost:5173
echo الخادم الخلفي: http://localhost:5000
echo.
echo اختبر البحث في الموقع للتأكد من عدم وجود فلتر
echo ========================================

pause