@echo off
echo اختبار البانر في الجوال...
echo.
echo خطوات التشخيص:
echo.
echo 1. افتح الموقع في الجوال
echo 2. اضغط F12 أو افتح Developer Tools
echo 3. اذهب لتبويب Console
echo 4. ابحث عن رسائل البانر:
echo    - "TopBanner: Loading settings from localStorage"
echo    - "TopBanner rendering with settings"
echo.
echo 5. تحقق من localStorage:
echo    localStorage.getItem('bannerSettings')
echo.
echo 6. إذا لم توجد إعدادات، اذهب للإدارة وفعل البانر
echo.
echo التحسينات المطبقة:
echo - زيادة حجم النص في الجوال (text-sm)
echo - إظهار الأيقونات في الجوال
echo - زيادة الـ padding للجوال
echo - إضافة minHeight للتأكد من الظهور
echo - إضافة zIndex عالي
echo.
pause