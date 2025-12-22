@echo off
chcp 65001 >nul
echo.
echo 🚀 تشغيل سكريبت إنشاء حساب المدير
echo =====================================
echo.
echo 📝 تأكد من تعديل البيانات في الملف:
echo    CREATE_ADMIN_DIRECT_DB.js
echo.
echo    - رقم الجوال (phone)
echo    - كلمة المرور (password)
echo.
echo ⚠️ اضغط أي زر للمتابعة...
pause >nul
echo.
echo 🔄 تشغيل السكريبت...
echo.

node CREATE_ADMIN_DIRECT_DB.js

echo.
echo ✅ انتهى التنفيذ
echo.
pause