@echo off
echo ========================================
echo   حل مشكلة الـ Cache
echo ========================================
echo.

echo المشكلة: المتصفح يستخدم نسخة قديمة من الملف
echo.
echo الحل:
echo 1. اضغط Ctrl+Shift+R لإعادة تحميل قوية
echo 2. أو اضغط F12 ثم اضغط بالزر الأيمن على زر Refresh واختر "Empty Cache and Hard Reload"
echo 3. أو امسح cache المتصفح كاملاً
echo.
echo بعد مسح الـ cache، جرب:
start http://localhost:5173/admin/theme-settings
echo.
echo إذا لم يعمل، أعد تشغيل الخادم:
echo npm run dev
echo.
pause