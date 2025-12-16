@echo off
echo ========================================
echo اختبار البحث النظيف - بدون كلمات سريعة
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
echo اختبر البحث النظيف:
echo 1. اضغط على أيقونة البحث
echo 2. تأكد من عدم وجود كلمات بحث سريعة
echo 3. اكتب في البحث واختبر النتائج
echo 4. تأكد من التخطيط الجديد (بطاقتين جنب بعض)
echo ========================================

pause