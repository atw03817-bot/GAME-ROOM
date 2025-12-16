@echo off
echo ========================================
echo   تحديث رابط API للسيرفر الحقيقي
echo ========================================
echo.

set /p API_URL="ادخل رابط API الحقيقي (مثال: https://api.ab-he.com/api): "

echo.
echo جاري تحديث .env.production...
echo VITE_API_URL=%API_URL% > frontend\.env.production

echo.
echo ✅ تم التحديث بنجاح!
echo.
echo الخطوة التالية:
echo 1. cd frontend
echo 2. npm run build
echo 3. ارفع محتويات dist/ إلى السيرفر
echo.
pause
