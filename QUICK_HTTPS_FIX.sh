#!/bin/bash

# 🚀 إعداد HTTPS سريع للـ Backend

echo "🔧 بدء إعداد HTTPS للـ Backend..."

# تحديث النظام
echo "📦 تحديث النظام..."
sudo apt update -y

# تثبيت Nginx
echo "🌐 تثبيت Nginx..."
sudo apt install nginx -y

# إيقاف Apache إذا كان يعمل (تجنب تضارب البورت 80)
sudo systemctl stop apache2 2>/dev/null || true
sudo systemctl disable apache2 2>/dev/null || true

# إعداد Nginx كـ Reverse Proxy
echo "⚙️ إعداد Nginx..."
sudo tee /etc/nginx/sites-available/gameroom-backend > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # إعدادات CORS
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization' always;

    # معالجة طلبات OPTIONS
    if (\$request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' '*';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Origin, X-Requested-With, Content-Type, Accept, Authorization';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        
        # زيادة timeout للطلبات الكبيرة
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        # زيادة حجم الطلبات المسموحة
        client_max_body_size 100M;
    }
}
EOF

# إزالة الإعداد الافتراضي
sudo rm -f /etc/nginx/sites-enabled/default

# تفعيل الموقع الجديد
sudo ln -sf /etc/nginx/sites-available/gameroom-backend /etc/nginx/sites-enabled/

# اختبار إعداد Nginx
echo "🧪 اختبار إعداد Nginx..."
sudo nginx -t

if [ $? -eq 0 ]; then
    echo "✅ إعداد Nginx صحيح"
    
    # إعادة تشغيل Nginx
    sudo systemctl restart nginx
    sudo systemctl enable nginx
    
    echo "🎉 تم إعداد Nginx بنجاح!"
    echo ""
    echo "📋 الخطوات التالية:"
    echo "1. تأكد من تشغيل Backend على البورت 5000"
    echo "2. حدث VITE_API_URL في Vercel إلى: http://63.181.87.121/api"
    echo "3. اختبر API: curl http://63.181.87.121/api/health"
    echo ""
    echo "🔒 لإعداد HTTPS لاحقاً، استخدم الملف AWS_HTTPS_SETUP.md"
    
else
    echo "❌ خطأ في إعداد Nginx"
    exit 1
fi