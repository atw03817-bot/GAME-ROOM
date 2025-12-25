@echo off
echo ========================================
echo Fixing Total Calculation with Shipping Fees
echo ========================================
echo.

echo PROBLEM: Total cost not including shipping fees correctly
echo SOLUTION: Recalculate all maintenance request totals
echo.

echo Running fix script...
node FIX_TOTAL_CALCULATION_WITH_SHIPPING.js

echo.
echo ========================================
echo WHAT THIS SCRIPT DOES:
echo ========================================
echo 1. Connects to MongoDB database
echo 2. Finds all maintenance requests
echo 3. Recalculates total cost using calculateTotal() method
echo 4. Updates requests where total changed
echo 5. Shows before/after comparison
echo 6. Displays summary of all requests
echo.

echo ========================================
echo COST BREAKDOWN FORMULA:
echo ========================================
echo Total = Diagnostic + Parts + Labor + Priority + Shipping
echo Example: 25 + 0 + 0 + 0 + 26 = 51 ريال
echo.

echo ========================================
echo AFTER RUNNING THIS SCRIPT:
echo ========================================
echo • All totals will include shipping fees
echo • Frontend will display correct amounts
echo • Customer approval will show right total
echo • Admin diagnosis will calculate properly
echo.

pause