#!/bin/bash

# إنشاء حساب مدير على السيرفر Ubuntu
# الاستخدام: ./create_admin_ubuntu.sh

echo "🚀 إنشاء حساب مدير على السيرفر"
echo "=================================="
echo ""

# بيانات المدير - غير هذه البيانات
PHONE="0501234567"
PASSWORD="Admin@123456"
API_URL="https://www.ab-tw.com/api/auth/register"

echo "📝 بيانات المدير:"
echo "   📱 رقم الجوال: $PHONE"
echo "   🔐 كلمة المرور: $PASSWORD"
echo ""

# التحقق من وجود curl
if ! command -v curl &> /dev/null; then
    echo "❌ curl غير مثبت"
    echo "💡 لتثبيت curl: sudo apt-get install curl"
    exit 1
fi

echo "📡 إرسال طلب إنشاء الحساب..."
echo ""

# إرسال الطلب
response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"password\":\"$PASSWORD\"}")

# فصل الاستجابة وكود الحالة
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

echo "📊 كود الحالة: $http_code"
echo ""

if [ "$http_code" -eq 201 ] || [ "$http_code" -eq 200 ]; then
    echo "✅ تم إنشاء الحساب بنجاح!"
    echo ""
    echo "📋 الاستجابة:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    echo ""
    echo "🔗 روابط مهمة:"
    echo "   🌐 تسجيل الدخول: https://www.ab-tw.com/login"
    echo "   ⚙️  لوحة الإدارة: https://www.ab-tw.com/admin"
    echo ""
    echo "⚠️ تذكر تغيير كلمة المرور بعد تسجيل الدخول"
else
    echo "❌ فشل في إنشاء الحساب"
    echo ""
    echo "📋 الاستجابة:"
    echo "$body" | python3 -m json.tool 2>/dev/null || echo "$body"
    echo ""
    
    if echo "$body" | grep -q "مستخدم"; then
        echo "💡 السبب: رقم الجوال مستخدم بالفعل"
        echo "🔧 الحل: استخدم رقم جوال آخر أو سجل دخول بالحساب الموجود"
    fi
fi

echo ""
echo "🔍 اختبار تسجيل الدخول:"
echo "   curl -X POST https://www.ab-tw.com/api/auth/login \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"phone\":\"$PHONE\",\"password\":\"$PASSWORD\"}'"
echo ""