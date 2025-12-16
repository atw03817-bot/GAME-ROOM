@echo off
echo ========================================
echo   متجر الجوالات - Mobile Store
echo   Vite + React Edition
echo ========================================
echo.

echo [1/3] تثبيت المكتبات...
call npm install

echo.
echo [2/3] تثبيت مكتبات Frontend...
cd frontend
call npm install
cd ..

echo.
echo [3/3] تثبيت مكتبات Backend...
cd backend
call npm install
cd ..

echo.
echo ========================================
echo   ✅ تم التثبيت بنجاح!
echo ========================================
echo.
echo الخطوات التالية:
echo 1. انسخ ملف .env.example إلى .env في مجلد backend
echo 2. عدل ملف .env بمعلومات قاعدة البيانات
echo 3. شغل المشروع بالأمر: npm run dev
echo.
pause
