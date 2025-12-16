@echo off
echo ========================================
echo     اختبار Tamara API الرسمي
echo ========================================
echo.

echo 1. فتح إعدادات تمارا لاختبار API...
start http://localhost:5173/admin/tamara-payment-settings

echo.
echo التحديثات على API:
echo ✅ اتباع الدليل الرسمي: https://docs.tamara.co/reference/
echo ✅ استخدام endpoints الصحيحة
echo ✅ تحسين معالجة الأخطاء (401, 403, 404)
echo ✅ إضافة اختبار أنواع الدفع المتاحة
echo ✅ تحسين logs للتتبع
echo.

echo API Endpoints المحدثة:
echo • POST /checkout - إنشاء جلسة الدفع
echo • GET /checkout/{id} - جلب تفاصيل الجلسة
echo • POST /payments/capture - تأكيد الدفع
echo • POST /orders/cancel - إلغاء الطلب
echo • POST /payments/refund - استرداد المبلغ
echo • GET /merchants/criteria - اختبار الاتصال
echo • GET /payment_types - أنواع الدفع المتاحة
echo.

echo للاختبار:
echo 1. أدخل API Token صحيح (يبدأ بـ sandbox_ أو sk_test_)
echo 2. اضغط "اختبار الاتصال"
echo 3. تأكد من ظهور رسالة نجاح
echo 4. راجع console للتفاصيل التقنية
echo.

echo أنواع الـ Tokens:
echo • Sandbox: sandbox_api_xxxxx (للاختبار)
echo • Live: sk_live_xxxxx (للإنتاج)
echo • Public Key: pk_test_xxxxx أو pk_live_xxxxx
echo.

echo Base URLs:
echo • Test: https://api-sandbox.tamara.co
echo • Live: https://api.tamara.co
echo.

pause