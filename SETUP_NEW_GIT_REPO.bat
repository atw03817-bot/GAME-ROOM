@echo off
chcp 65001 >nul
echo ========================================
echo    🔄 إعداد مستودع Git جديد لجيم روم
echo ========================================
echo.

echo 🗑️ حذف إعدادات Git القديمة...
if exist .git (
    rmdir /s /q .git
    echo ✅ تم حذف مجلد .git القديم
) else (
    echo ℹ️ لا يوجد مجلد .git قديم
)
echo.

echo 🆕 إنشاء مستودع Git جديد...
git init
echo ✅ تم إنشاء مستودع Git جديد
echo.

echo 📝 إضافة جميع الملفات...
git add .
echo ✅ تم إضافة جميع الملفات
echo.

echo 💾 إنشاء أول commit...
git commit -m "🎮 Initial commit: Game Room Store - متجر جيم روم للألعاب والتقنية"
echo ✅ تم إنشاء أول commit
echo.

echo 🌿 إنشاء branch رئيسي...
git branch -M main
echo ✅ تم إنشاء branch main
echo.

echo ========================================
echo    ✅ تم إعداد المستودع بنجاح!
echo ========================================
echo.
echo 📋 الخطوات التالية:
echo.
echo 1. إنشاء مستودع جديد على GitHub باسم: gameroom-store
echo 2. تشغيل الأمر التالي لربط المستودع:
echo    git remote add origin https://github.com/YOUR_USERNAME/gameroom-store.git
echo.
echo 3. رفع الكود:
echo    git push -u origin main
echo.
echo 🎯 تأكد من تغيير YOUR_USERNAME إلى اسم المستخدم الخاص بك
echo.
pause