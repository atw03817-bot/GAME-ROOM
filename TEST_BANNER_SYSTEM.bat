@echo off
echo ========================================
echo اختبار نظام البانر الجديد المبسط
echo ========================================

echo.
echo 1. تشغيل الخادم الخلفي...
start "Backend Server" cmd /c "cd backend && npm start"

echo.
echo 2. انتظار تشغيل الخادم الخلفي...
timeout /t 3 /nobreak > nul

echo.
echo 3. تشغيل الخادم الأمامي...
start "Frontend Server" cmd /c "cd frontend && npm run dev"

echo.
echo 4. انتظار تشغيل الخادم الأمامي...
timeout /t 5 /nobreak > nul

echo.
echo 5. فتح ملف اختبار البانر البسيط...
start "" "TEST_BANNER_SIMPLE.html"

echo.
echo ========================================
echo النظام جاهز للاختبار!
echo ========================================
echo.
echo خطوات الاختبار:
echo.
echo أ) اختبار ملف HTML البسيط:
echo    1. استخدم ملف TEST_BANNER_SIMPLE.html المفتوح
echo    2. فعل البانر واكتب نص
echo    3. احفظ الإعدادات
echo    4. اختبر البانر
echo.
echo ب) اختبار التطبيق الحقيقي:
echo    1. افتح المتصفح على: http://localhost:5173
echo    2. اذهب إلى: /admin/theme-settings
echo    3. اختر تبويب "الإعلان العلوي"
echo    4. فعل البانر واكتب نص
echo    5. احفظ الإعدادات
echo    6. اذهب للصفحة الرئيسية وشاهد البانر
echo.
echo ج) اختبار الجوال:
echo    1. افتح أدوات المطور (F12)
echo    2. فعل وضع الجوال
echo    3. أعد تحميل الصفحة
echo    4. تأكد من ظهور البانر
echo.
echo المشاكل المحلولة:
echo - تبسيط كود البانر
echo - إصلاح localStorage
echo - تحسين نظام الأحداث
echo - إزالة التعقيدات غير الضرورية
echo.
echo اضغط أي مفتاح للإغلاق...
pause > nul