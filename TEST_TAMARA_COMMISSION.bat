@echo off
echo ========================================
echo اختبار نظام عمولة تمارا
echo ========================================
echo.

echo 1. اختبار الحصول على إعدادات تمارا...
curl -s http://localhost:5000/api/tamara-settings | jq .
echo.

echo 2. اختبار حساب عمولة تمارا لمبلغ 1000 ريال...
curl -s -X POST http://localhost:5000/api/tamara-settings/calculate-commission ^
  -H "Content-Type: application/json" ^
  -d "{\"subtotal\": 1000}" | jq .
echo.

echo 3. اختبار التحقق من أهلية تمارا لمبلغ 500 ريال...
curl -s -X POST http://localhost:5000/api/tamara-settings/check-eligibility ^
  -H "Content-Type: application/json" ^
  -d "{\"totalAmount\": 500}" | jq .
echo.

echo ========================================
echo انتهى الاختبار
echo ========================================
pause