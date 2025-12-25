@echo off
echo Testing Admin Edit/Delete Maintenance Requests...
echo.
echo 1. Testing admin maintenance management (should show "إدارة" badge for admin-created requests)
start http://localhost:3000/admin/maintenance
echo.
echo 2. Testing admin create maintenance request (creates editable/deletable request)
start http://localhost:3000/admin/maintenance/create
echo.
echo Test the following features:
echo - Create a maintenance request from admin panel
echo - Check that it shows "إدارة" badge in the list
echo - Open the request details and verify edit/delete buttons appear
echo - Test editing the request (should work)
echo - Test deleting the request (should work)
echo - Try editing/deleting a customer-created request (should be blocked)
echo.
pause