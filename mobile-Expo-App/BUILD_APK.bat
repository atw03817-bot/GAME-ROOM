@echo off
chcp 65001 >nul
echo ========================================
echo    🚀 بناء تطبيق جيم روم - APK
echo ========================================
echo.

echo 📋 معلومات التطبيق:
echo    الاسم: جيم روم
echo    الموقع: https://www.gameroom-store.com
echo    النوع: WebView App
echo.

echo 1️⃣ التحقق من تثبيت المتطلبات...
where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت
    echo يرجى تحميله من: https://nodejs.org
    pause
    exit /b 1
)

where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ NPM غير مثبت
    pause
    exit /b 1
)

echo ✅ Node.js و NPM مثبتان

echo.
echo 2️⃣ تثبيت EAS CLI...
call npm install -g eas-cli
if %errorlevel% neq 0 (
    echo ❌ فشل في تثبيت EAS CLI
    pause
    exit /b 1
)

echo ✅ تم تثبيت EAS CLI

echo.
echo 3️⃣ تثبيت تبعيات المشروع...
call npm install
if %errorlevel% neq 0 (
    echo ❌ فشل في تثبيت التبعيات
    pause
    exit /b 1
)

echo ✅ تم تثبيت التبعيات

echo.
echo 4️⃣ إنشاء الأيقونات المؤقتة...
call node create-temp-icons.js
echo ✅ تم إنشاء الأيقونات

echo.
echo 5️⃣ فتح مولد الأيقونات المحسن (اختياري)...
echo هل تريد إنشاء أيقونات مخصصة؟ (y/n)
set /p choice=
if /i "%choice%"=="y" (
    start create-icons-from-image.html
    echo 📝 ارفع صورة الشعار وحمل الأيقونات إلى مجلد assets
    echo اضغط أي مفتاح بعد الانتهاء...
    pause
)

echo.
echo 6️⃣ تسجيل الدخول إلى Expo...
call eas whoami
if %errorlevel% neq 0 (
    echo 🔐 يرجى تسجيل الدخول...
    call eas login
    if %errorlevel% neq 0 (
        echo ❌ فشل في تسجيل الدخول
        echo إنشاء حساب جديد على: https://expo.dev
        pause
        exit /b 1
    )
)

echo ✅ تم تسجيل الدخول بنجاح

echo.
echo 7️⃣ بناء APK...
echo ⏰ هذا قد يستغرق 10-15 دقيقة...
echo 📱 سيتم إنشاء APK جاهز للتثبيت
echo.

call npm run build:android

if %errorlevel% equ 0 (
    echo.
    echo ✅ تم بناء التطبيق بنجاح!
    echo 📱 ستجد رابط تحميل APK في النتيجة أعلاه
    echo.
    echo 📋 الخطوات التالية:
    echo    1. حمل APK من الرابط
    echo    2. انقل APK إلى الجهاز
    echo    3. فعل "تثبيت من مصادر غير معروفة"
    echo    4. ثبت التطبيق
    echo.
) else (
    echo.
    echo ❌ فشل في بناء التطبيق
    echo 🔧 جرب الحلول التالية:
    echo    1. تأكد من الاتصال بالإنترنت
    echo    2. شغل: expo doctor
    echo    3. شغل: npm install
    echo    4. أعد المحاولة
    echo.
)

echo اضغط أي مفتاح للخروج...
pause