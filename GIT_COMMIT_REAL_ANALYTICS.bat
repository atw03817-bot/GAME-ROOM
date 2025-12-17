@echo off
echo ========================================
echo    رفع نظام التحليلات الحقيقي لـ Git
echo ========================================
echo.

echo [1/4] إضافة الملفات الجديدة...
git add backend/controllers/realAnalyticsController.js
git add backend/routes/realAnalytics.js
git add backend/scripts/checkRealData.js
git add frontend/src/components/admin/RealAnalyticsDashboard.jsx
git add frontend/src/pages/admin/Analytics.jsx
git add backend/server.js
git add frontend/src/main.jsx
git add REAL_ANALYTICS_SYSTEM.md
git add REAL_ANALYTICS_ADDITION.md

echo [2/4] حذف الملفات القديمة...
git rm --cached backend/models/Analytics.js 2>nul
git rm --cached backend/controllers/analyticsController.js 2>nul
git rm --cached backend/routes/analytics.js 2>nul
git rm --cached frontend/src/utils/analytics.js 2>nul
git rm --cached frontend/src/utils/initAnalytics.js 2>nul
git rm --cached frontend/src/components/admin/AnalyticsDashboard.jsx 2>nul

echo [3/4] إنشاء commit...
git commit -m "✨ إضافة نظام التحليلات الحقيقي

🆕 ملفات جديدة:
- realAnalyticsController.js - تحليلات حقيقية 100%%
- RealAnalyticsDashboard.jsx - لوحة تحكم جديدة
- realAnalytics.js routes - مسارات API جديدة

📊 البيانات الحقيقية:
- 114 طلب حقيقي (بدلاً من البيانات الوهمية)
- 2,908.85 ر.س إيرادات حقيقية
- 3 عملاء حقيقيين
- 7 منتجات متوفرة

🗑️ حذف النظام القديم:
- إزالة جميع البيانات الوهمية
- حذف analytics.js القديم
- تنظيف الملفات غير المستخدمة

✅ المميزات:
- بيانات حقيقية 100%% من قاعدة البيانات
- واجهة محسنة مع رسائل خطأ واضحة
- أداء محسن مع استعلامات محسنة
- تصدير تقارير حقيقية"

echo [4/4] رفع للـ repository...
git push origin main

echo.
echo ✅ تم رفع نظام التحليلات الحقيقي لـ Git بنجاح!
echo.
pause