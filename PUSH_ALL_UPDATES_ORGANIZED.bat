@echo off
echo ========================================
echo     رفع جميع التحديثات بشكل منظم
echo ========================================
echo.

echo 📋 عرض ملخص التغييرات...
echo.
echo الملفات المعدلة:
git diff --name-only
echo.
echo الملفات الجديدة:
git ls-files --others --exclude-standard
echo.

echo ⚠️  تحذير: فيه تغييرات كثيرة!
echo هل تريد المتابعة؟ (y/n)
set /p choice=

if /i "%choice%" neq "y" (
    echo تم الإلغاء.
    pause
    exit /b
)

echo.
echo 🔄 المرحلة 1: إضافة ملفات نظام تمارا الأساسي...
git add backend/services/tamaraPaymentService.js
git add backend/controllers/paymentController.js
git add backend/routes/payments.js
git add frontend/src/components/tamara/
git add frontend/src/components/payment/
git add frontend/src/hooks/useTamaraConfig.js
git add frontend/src/styles/tamara.css

git commit -m "✨ إضافة نظام دفع تمارا الكامل

🔧 الميزات الجديدة:
- خدمة دفع تمارا الخلفية
- مكونات تمارا للواجهة الأمامية
- hook لإعدادات تمارا
- أنماط CSS مخصصة لتمارا

📁 الملفات المضافة:
- backend/services/tamaraPaymentService.js
- frontend/src/components/tamara/
- frontend/src/components/payment/
- frontend/src/hooks/useTamaraConfig.js
- frontend/src/styles/tamara.css"

echo.
echo 🔄 المرحلة 2: تحديث واجهة المستخدم...
git add frontend/src/App.jsx
git add frontend/src/components/checkout/PaymentMethods.jsx
git add frontend/src/pages/Checkout.jsx
git add frontend/src/pages/ProductDetail.jsx
git add frontend/src/pages/OrderSuccess.jsx
git add frontend/src/pages/Account.jsx

git commit -m "🎨 تحديث واجهة المستخدم لدعم تمارا

🔧 التحديثات:
- تكامل تمارا في صفحة الدفع
- عرض خيارات التقسيط في صفحة المنتج
- تحديث صفحة نجاح الطلب
- تحسينات على صفحة الحساب

📁 الملفات المحدثة:
- App.jsx
- PaymentMethods.jsx (نافذة منبثقة)
- Checkout.jsx
- ProductDetail.jsx
- OrderSuccess.jsx
- Account.jsx"

echo.
echo 🔄 المرحلة 3: تحديث لوحة الإدارة...
git add frontend/src/pages/admin/Settings.jsx
git add frontend/src/pages/admin/OrderDetails.jsx
git add frontend/src/pages/admin/TamaraPaymentSettings.jsx

git commit -m "⚙️ تحديث لوحة الإدارة لتمارا

🔧 الميزات الجديدة:
- صفحة إعدادات تمارا المخصصة
- تحديث إعدادات عامة
- تحسينات على تفاصيل الطلبات

📁 الملفات المحدثة:
- admin/Settings.jsx
- admin/OrderDetails.jsx
- admin/TamaraPaymentSettings.jsx"

echo.
echo 🔄 المرحلة 4: إضافة ملفات الاختبار والتوثيق...
git add TEST_TAMARA_*.bat
git add TEST_TAMARA_*.html
git add TAMARA_*.md
git add PREVIEW_TAMARA_*.html
git add PUSH_TAMARA_POPUP_UPDATE.bat
git add GIT_CHANGES_SUMMARY.md
git add PUSH_ALL_UPDATES_ORGANIZED.bat

git commit -m "📚 إضافة ملفات الاختبار والتوثيق

🔧 المحتوى:
- ملفات اختبار تمارا المتعددة
- توثيق شامل لنظام تمارا
- ملفات معاينة HTML
- أدوات رفع التحديثات

📁 الملفات المضافة:
- TEST_TAMARA_*.bat
- TAMARA_*.md
- PREVIEW_TAMARA_*.html
- أدوات Git المساعدة"

echo.
echo 🚀 رفع جميع التحديثات على GitHub...
git push origin main

echo.
echo ========================================
echo ✅ تم رفع جميع التحديثات بنجاح!
echo ========================================
echo.
echo 📊 ملخص ما تم رفعه:
echo ✅ نظام دفع تمارا الكامل
echo ✅ واجهة مستخدم محدثة مع نافذة منبثقة
echo ✅ لوحة إدارة محسنة
echo ✅ ملفات اختبار وتوثيق شاملة
echo.
echo 🎯 الميزة الجديدة: نافذة تمارا المنبثقة 800x600
echo.

pause