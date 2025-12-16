@echo off
echo تنظيف جميع الإعدادات المحفوظة...
echo.
echo هذا الملف سيساعدك في اختبار النظام الجديد بدون إعدادات افتراضية
echo.
echo الخطوات:
echo 1. افتح المتصفح واذهب للموقع
echo 2. اضغط F12 لفتح Developer Tools
echo 3. اذهب لتبويب Console
echo 4. اكتب الأوامر التالية واضغط Enter بعد كل واحد:
echo.
echo localStorage.removeItem('bannerSettings')
echo localStorage.removeItem('headerSettings')
echo localStorage.removeItem('footerSettings')
echo localStorage.removeItem('seoSettings')
echo localStorage.removeItem('themeSettings')
echo localStorage.clear()
echo.
echo 5. اعد تحميل الصفحة
echo.
echo النتيجة المتوقعة:
echo - لن تظهر أي نصوص افتراضية
echo - البانر مغلق
echo - اسم الموقع فارغ
echo - جميع الإعدادات فارغة
echo - يجب ملء كل شيء من لوحة الإدارة
echo.
pause