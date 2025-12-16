@echo off
echo ========================================
echo     رفع تحديث نافذة تمارا المنبثقة
echo ========================================
echo.

echo 🔄 إضافة الملفات المحدثة...
git add frontend/src/components/tamara/TamaraOfficialWidget.jsx
git add frontend/src/components/tamara/TamaraInstallmentWidget.jsx
git add frontend/src/components/checkout/PaymentMethods.jsx
git add TEST_TAMARA_LEARN_MORE_UPDATED.bat
git add PUSH_TAMARA_POPUP_UPDATE.bat

echo.
echo 📝 إنشاء commit...
git commit -m "✨ تحديث نافذة اعرف المزيد لتمارا - Popup Window

🔧 التحديثات:
- تغيير نافذة اعرف المزيد من modal إلى popup منبثقة
- حجم النافذة: 800x600 بكسل
- المتجر يبقى مفتوح في الخلفية
- تجربة مستخدم محسنة بدون انقطاع

📁 الملفات المحدثة:
- TamaraOfficialWidget.jsx
- TamaraInstallmentWidget.jsx  
- PaymentMethods.jsx
- TEST_TAMARA_LEARN_MORE_UPDATED.bat

🎯 الهدف: تحسين تجربة المستخدم عند عرض معلومات تمارا"

echo.
echo 🚀 رفع التحديثات على GitHub...
git push origin main

echo.
echo ========================================
echo ✅ تم رفع التحديث بنجاح!
echo ========================================
echo.
echo التحديثات المرفوعة:
echo ✅ نافذة منبثقة بدلاً من الانتقال لصفحة جديدة
echo ✅ حجم مناسب 800x600 بكسل
echo ✅ المتجر يبقى مفتوح في الخلفية
echo ✅ تجربة مستخدم محسنة
echo.
echo 🔗 يمكنك الآن اختبار التحديث باستخدام:
echo TEST_TAMARA_LEARN_MORE_UPDATED.bat
echo.

pause