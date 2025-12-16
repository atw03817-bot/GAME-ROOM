@echo off
echo ========================================
echo        اختبار Tamara API مباشرة
echo ========================================
echo.

echo 1. اختبار الاتصال بالسيرفر الحقيقي...
echo GET https://api.ab-tw.com/api/settings
curl -s -o nul -w "%%{http_code}" https://api.ab-tw.com/api/settings
echo.

echo.
echo 2. اختبار endpoint تمارا بدون authentication...
echo POST https://api.ab-tw.com/api/payments/tamara/test
curl -X POST https://api.ab-tw.com/api/payments/tamara/test ^
  -H "Content-Type: application/json" ^
  -d "{\"merchantToken\":\"test\"}" ^
  -w "\nStatus: %%{http_code}\n"

echo.
echo 3. اختبار endpoint تاب للمقارنة...
echo POST https://api.ab-tw.com/api/payments/tap/test
curl -X POST https://api.ab-tw.com/api/payments/tap/test ^
  -H "Content-Type: application/json" ^
  -d "{\"secretKey\":\"test\"}" ^
  -w "\nStatus: %%{http_code}\n"

echo.
echo 4. اختبار الحصول على طرق الدفع...
echo GET https://api.ab-tw.com/api/payments/methods
curl -s https://api.ab-tw.com/api/payments/methods | echo.

echo.
echo ========================================
echo إذا كانت النتائج:
echo - 401: مشكلة authentication
echo - 404: الـ endpoint مش موجود
echo - 400: مشكلة في البيانات المرسلة
echo - 500: مشكلة في السيرفر
echo ========================================
pause