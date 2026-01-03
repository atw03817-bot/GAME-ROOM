# 🔒 إعداد HTTPS على AWS Server

## المشكلة الحالية:
- Vercel (HTTPS) لا يمكنه الاتصال بـ AWS (HTTP)
- Mixed Content Error في المتصفح

## الحل السريع - إعداد SSL مع Let's Encrypt:

### 1️⃣ تثبيت Certbot على AWS Server:
```bash
# تحديث النظام
sudo apt update

# تثبيت Certbot
sudo apt install certbot python3-certbot-nginx -y

# تثبيت Nginx
sudo apt install nginx -y
```

### 2️⃣ إعداد Nginx كـ Reverse Proxy:
```bash
# إنشاء ملف إعداد Nginx
sudo nano /etc/nginx/sites-available/gameroom-backend

# أضف هذا المحتوى:
server {
    listen 80;
    server_name your-domain.com;  # غير هذا لدومينك

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# تفعيل الموقع
sudo ln -s /etc/nginx/sites-available/gameroom-backend /etc/nginx/sites-enabled/

# إعادة تشغيل Nginx
sudo systemctl restart nginx
```

### 3️⃣ الحصول على شهادة SSL:
```bash
# الحصول على شهادة SSL مجانية
sudo certbot --nginx -d your-domain.com

# تجديد تلقائي للشهادة
sudo crontab -e
# أضف هذا السطر:
0 12 * * * /usr/bin/certbot renew --quiet
```

## الحل البديل - استخدام IP مع HTTPS Proxy:

### إذا لم يكن لديك دومين، استخدم خدمة مثل ngrok:

```bash
# تثبيت ngrok
curl -s https://ngrok-agent.s3.amazonaws.com/ngrok.asc | sudo tee /etc/apt/trusted.gpg.d/ngrok.asc >/dev/null
echo "deb https://ngrok-agent.s3.amazonaws.com buster main" | sudo tee /etc/apt/sources.list.d/ngrok.list
sudo apt update && sudo apt install ngrok

# تشغيل ngrok للبورت 5000
ngrok http 5000

# ستحصل على رابط HTTPS مثل:
# https://abc123.ngrok.io
```

## تحديث Vercel Environment Variable:

بعد إعداد HTTPS، حدث المتغير في Vercel:

```
VITE_API_URL=https://your-domain.com/api
# أو
VITE_API_URL=https://abc123.ngrok.io/api
```

## اختبار الاتصال:

```bash
# اختبار API
curl https://your-domain.com/api/health

# يجب أن يرجع:
{"status":"ok","message":"Server is running","timestamp":"..."}
```