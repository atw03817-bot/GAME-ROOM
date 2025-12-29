@echo off
chcp 65001 >nul
echo ========================================
echo    🧹 تنظيف الملفات المؤقتة
echo ========================================
echo.

echo 🗑️ حذف ملفات التحديث المؤقتة...

if exist "UPDATE_BRAND_TO_GAMEROOM.cjs" (
    del "UPDATE_BRAND_TO_GAMEROOM.cjs"
    echo ✅ تم حذف UPDATE_BRAND_TO_GAMEROOM.cjs
)

if exist "UPDATE_REMAINING_FILES.cjs" (
    del "UPDATE_REMAINING_FILES.cjs"
    echo ✅ تم حذف UPDATE_REMAINING_FILES.cjs
)

if exist "FINAL_BRAND_UPDATE.cjs" (
    del "FINAL_BRAND_UPDATE.cjs"
    echo ✅ تم حذف FINAL_BRAND_UPDATE.cjs
)

if exist "UPDATE_REMAINING_SEO_FILES.cjs" (
    del "UPDATE_REMAINING_SEO_FILES.cjs"
    echo ✅ تم حذف UPDATE_REMAINING_SEO_FILES.cjs
)

if exist "FINAL_CLEANUP.cjs" (
    del "FINAL_CLEANUP.cjs"
    echo ✅ تم حذف FINAL_CLEANUP.cjs
)

if exist "CLEANUP_REMAINING.cjs" (
    del "CLEANUP_REMAINING.cjs"
    echo ✅ تم حذف CLEANUP_REMAINING.cjs
)

echo.
echo ========================================
echo    ✅ تم تنظيف جميع الملفات المؤقتة!
echo ========================================
echo.
echo 📋 الملفات المتبقية هي ملفات المشروع الأساسية فقط
echo.
pause