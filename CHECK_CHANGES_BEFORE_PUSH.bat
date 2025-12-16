@echo off
echo ========================================
echo     فحص التغييرات قبل الرفع
echo ========================================
echo.

echo 📋 حالة Git الحالية:
git status --short
echo.

echo 📊 إحصائيات التغييرات:
echo.
echo الملفات المعدلة:
git diff --name-only | find /c /v ""
echo.
echo الملفات الجديدة:
git ls-files --others --exclude-standard | find /c /v ""
echo.

echo 🔍 تفاصيل الملفات المعدلة:
echo ================================
git diff --name-only
echo.

echo 📁 الملفات الجديدة:
echo ==================
git ls-files --others --exclude-standard
echo.

echo 📈 إحصائيات التغييرات في الكود:
git diff --stat
echo.

echo ========================================
echo 🎯 الملفات المهمة للتحديث الحالي:
echo ========================================
echo ✅ frontend/src/components/checkout/PaymentMethods.jsx
echo ✅ frontend/src/components/tamara/TamaraOfficialWidget.jsx  
echo ✅ frontend/src/components/tamara/TamaraInstallmentWidget.jsx
echo ✅ TEST_TAMARA_LEARN_MORE_UPDATED.bat
echo.

echo هل تريد رؤية تفاصيل التغييرات في ملف معين؟ (y/n)
set /p choice=

if /i "%choice%" equ "y" (
    echo.
    echo أدخل اسم الملف:
    set /p filename=
    echo.
    echo تفاصيل التغييرات في %filename%:
    git diff "%filename%"
)

echo.
echo ========================================
echo هل تريد المتابعة لرفع التحديثات؟
echo استخدم: PUSH_ALL_UPDATES_ORGANIZED.bat
echo ========================================

pause