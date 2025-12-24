@echo off
echo ========================================
echo   بناء ملف AAB لـ Google Play
echo ========================================
echo.

echo جاري بناء ملف AAB...
echo هذه العملية قد تستغرق 10-20 دقيقة
echo.

cd /d "%~dp0"

echo التحقق من تثبيت EAS CLI...
call npm list -g eas-cli >nul 2>&1
if errorlevel 1 (
    echo تثبيت EAS CLI...
    call npm install -g eas-cli
)

echo.
echo بدء عملية البناء...
echo.

call eas build --platform android --profile production

echo.
echo ========================================
echo   تم الانتهاء!
echo ========================================
echo.
echo الملف سيكون متاح للتحميل من:
echo https://expo.dev/accounts/[your-account]/projects/oliviaship/builds
echo.
pause
