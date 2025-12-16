@echo off
echo ========================================
echo اختبار البحث السريع - منتجات HOTWAV
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
echo اختبر البحث السريع الجديد:
echo - Note 13
echo - Hyper 75  
echo - R10 Pro
echo - Note 15 Pro
echo - جميع منتجات HOTWAV
echo - مقاوم للماء
echo - بطارية قوية
echo ========================================

pause