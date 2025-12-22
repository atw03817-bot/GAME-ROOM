#!/bin/bash

echo "=========================================="
echo "🔧 إعداد السيرفر الكامل من الصفر"
echo "=========================================="
echo ""

# 1. تثبيت Git إذا لم يكن موجود
echo "📦 تثبيت Git..."
sudo apt update
sudo apt install git -y

# 2. تثبيت MongoDB
echo "📦 تثبيت MongoDB..."
sudo apt install mongodb -y
sudo systemctl start mongodb
sudo systemctl enable mongodb

# 3. تثبيت Node.js و npm إذا لم يكونا موجودين
echo "📦 تحقق من Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

# 4. تثبيت PM2 إذا لم يكن موجود
echo "📦 تثبيت PM2..."
sudo npm install -g pm2

# 5. إيقاف أي عمليات تستخدم Port 5000
echo "🔄 إيقاف العمليات على Port 5000..."
sudo fuser -k 5000/tcp 2>/dev/null || true
pm2 delete all 2>/dev/null || true

# 6. حذف المجلد القديم إذا كان موجود
echo "🗑️ تنظيف المجلدات القديمة..."
sudo rm -rf /mobile-store-vite

# 7. استنساخ المشروع من GitHub
echo "📥 استنساخ المشروع..."
cd /
sudo git clone https://github.com/info-makerhgj/mobile-store-vite.git
sudo chown -R ubuntu:ubuntu /mobile-store-vite

# 8. إعداد Backend
echo "🔧 إعداد Backend..."
cd /mobile-store-vite/backend
npm install

# إنشاء ملف .env
cat > .env << 'EOF'
MONGODB_URI=mongodb://localhost:27017/mobile_store
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://www.ab-tw.com
JWT_SECRET=mobile-store-secret-key-2025-change-in-production-abc123xyz
API_URL=https://api.ab-tw.com
EOF

# 9. إعداد Frontend
echo "🔧 إعداد Frontend..."
cd /mobile-store-vite/frontend
npm install
npm run build

# 10. إنشاء ملف PM2 ecosystem
echo "📝 إنشاء ملف PM2..."
cd /mobile-store-vite
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'mobile-store-backend',
      script: './backend/server.js',
      cwd: '/mobile-store-vite',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G'
    }
  ]
};
EOF

# 11. تشغيل الخدمات
echo "🚀 تشغيل الخدمات..."
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo ""
echo "=========================================="
echo "✅ تم الانتهاء من الإعداد!"
echo "=========================================="
echo ""
echo "🔍 تحقق من الحالة:"
echo "pm2 status"
echo "pm2 logs"
echo ""
echo "🌐 اختبر الموقع:"
echo "curl http://localhost:5000/api/products"
echo "https://www.ab-tw.com"
echo ""