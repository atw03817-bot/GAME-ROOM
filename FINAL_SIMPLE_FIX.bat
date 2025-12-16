@echo off
echo ========================================
echo   الحل النهائي البسيط
echo ========================================
echo.

echo خطوات الحل:
echo.
echo 1. أعد تشغيل الخادم لضمان التحديث:
echo    اضغط Ctrl+C في terminal الخادم
echo    ثم اكتب: npm run dev
echo.
echo 2. امسح cache المتصفح:
echo    اضغط Ctrl+Shift+R
echo    أو F12 ثم Empty Cache and Hard Reload
echo.
echo 3. اختبر الموقع:
start http://localhost:5173
echo.
echo 4. اختبر صفحة الإدارة:
timeout /t 3 /nobreak > nul
start http://localhost:5173/admin/theme-settings
echo.
echo الآن يجب أن يعمل كل شيء بدون أخطاء!
echo.
echo إذا لم يعمل، تأكد من:
echo - تشغيل npm run dev
echo - مسح cache المتصفح
echo - عدم وجود أخطاء في Console
echo.
pause