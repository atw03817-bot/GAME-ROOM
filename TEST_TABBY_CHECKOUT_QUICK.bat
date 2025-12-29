@echo off
echo ========================================
echo        اختبار Tabby Checkout السريع
echo ========================================
echo.

echo 1. فتح صفحة الاختبار...
start "" "TEST_TABBY_CHECKOUT_URL.html"

echo.
echo 2. تشغيل الخادم إذا لم يكن يعمل...
echo    تأكد من أن الخادم يعمل على المنفذ 5000
echo.

echo 3. خطوات الاختبار:
echo    - أدخل رمز المصادقة (Bearer token)
echo    - اضغط "اختبار Tabby Checkout"
echo    - تحقق من الاستجابة والرابط
echo.

echo 4. إذا ظهر خطأ 404:
echo    - تحقق من إعدادات Tabby في لوحة الإدارة
echo    - تأكد من صحة المفاتيح
echo    - تحقق من merchant_urls
echo.

pause