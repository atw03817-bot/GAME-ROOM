@echo off
echo ========================================
echo     اختبار Tamara Widget الرسمي
echo ========================================
echo.

echo 1. فتح إعدادات تمارا لإدخال Public Key...
start http://localhost:5173/admin/tamara-payment-settings

timeout /t 3 /nobreak >nul

echo.
echo 2. فتح صفحة منتج لاختبار Widget الرسمي...
start http://localhost:5173/products

echo.
echo التحديثات الجديدة:
echo ✅ استخدام Tamara Widget الرسمي من تمارا
echo ✅ تحميل مباشر من CDN تمارا الرسمي
echo ✅ إضافة حقل Public Key في الإعدادات
echo ✅ Fallback widget في حالة فشل التحميل
echo ✅ اتباع دليل تمارا الرسمي 100%%
echo.

echo خطوات الإعداد:
echo 1. اذهب لإعدادات تمارا
echo 2. أدخل API Token (يبدأ بـ sandbox_ أو live_)
echo 3. أدخل Public Key (يبدأ بـ pk_test_ أو pk_live_)
echo 4. احفظ الإعدادات
echo 5. اذهب لصفحة منتج لرؤية Widget الرسمي
echo.

echo المرجع الرسمي:
echo https://widget-docs.tamara.co/tamara-summary
echo.

echo ما يجب أن تراه:
echo • Widget رسمي من تمارا مع التصميم الأصلي
echo • تحميل من https://cdn.tamara.co/widget/tamara-widget.js
echo • عرض صحيح للأقساط حسب إعدادات تمارا
echo • رابط "اعرف المزيد" يفتح صفحة تمارا الرسمية
echo.

pause