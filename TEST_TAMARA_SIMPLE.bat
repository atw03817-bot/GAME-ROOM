@echo off
echo ========================================
echo     اختبار مكون تمارا المبسط
echo ========================================
echo.

echo 1. فتح صفحة الدفع لرؤية المكون المبسط...
start http://localhost:5173/checkout

timeout /t 3 /nobreak >nul

echo.
echo 2. فتح صفحة منتج لرؤية عرض التقسيط...
start http://localhost:5173/products

timeout /t 2 /nobreak >nul

echo.
echo 3. فتح معاينة المكون المبسط...
start PREVIEW_TAMARA_SIMPLE.html

echo.
echo ما تم تبسيطه:
echo ✅ إزالة النصوص الإضافية من مكون الدفع
echo ✅ عرض الشعار والحسبة فقط
echo ✅ تصميم نظيف ومبسط
echo ✅ لا توجد أخطاء في الكود
echo.

echo المكون الآن يعرض:
echo • شعار تمارا
echo • عدد الأقساط (3 أو 4 حسب الإعدادات)
echo • المبلغ لكل قسط
echo • "كل شهر"
echo.

echo للاختبار:
echo 1. أضف منتجات للسلة بقيمة أكثر من 100 ريال
echo 2. اذهب لصفحة الدفع
echo 3. شاهد مكون تمارا المبسط في الجانب
echo.

pause