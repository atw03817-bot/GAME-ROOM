@echo off
echo Testing Diagnosis Report Fields...
echo.
echo 1. Testing diagnosis form with all fields
start http://localhost:3000/admin/maintenance/675b123456789012345678ab/diagnosis
echo.
echo 2. Testing maintenance details page to verify all fields display
start http://localhost:3000/admin/maintenance/675b123456789012345678ab
echo.
echo 3. Testing customer view of diagnosis report
start http://localhost:3000/maintenance/request/MR-001
echo.
echo Test completed! Check that all fields save and display properly:
echo - المشكلة المكتشفة (problemFound)
echo - السبب الجذري (rootCause) 
echo - الحل المقترح (recommendedSolution)
echo - ملاحظات فنية إضافية (technicianNotes)
pause