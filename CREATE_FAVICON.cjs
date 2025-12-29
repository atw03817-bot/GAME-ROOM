// إنشاء favicon من اللوجو الموجود
const fs = require('fs');
const path = require('path');

const createFavicon = () => {
  console.log('🎨 CREATING FAVICON FILES');
  console.log('='.repeat(40));

  // إنشاء favicon.ico بسيط (نص)
  const faviconSVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" fill="#6366f1"/>
  <text x="16" y="22" font-family="Arial, sans-serif" font-size="18" font-weight="bold" text-anchor="middle" fill="white">أ</text>
</svg>`;

  // حفظ SVG favicon
  fs.writeFileSync('frontend/public/favicon.svg', faviconSVG);
  console.log('✅ Created favicon.svg');

  // إنشاء HTML لتحويل SVG إلى ICO
  const htmlConverter = `<!DOCTYPE html>
<html>
<head>
    <title>Favicon Generator</title>
    <style>
        canvas { border: 1px solid #ccc; margin: 10px; }
        .container { text-align: center; padding: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <h2>Favicon Generator - جيم روم</h2>
        <canvas id="canvas16" width="16" height="16"></canvas>
        <canvas id="canvas32" width="32" height="32"></canvas>
        <canvas id="canvas180" width="180" height="180"></canvas>
        <br>
        <button onclick="downloadFavicons()">تحميل جميع الأيقونات</button>
    </div>

    <script>
        function drawFavicon(canvas, size) {
            const ctx = canvas.getContext('2d');
            
            // خلفية زرقاء
            ctx.fillStyle = '#6366f1';
            ctx.fillRect(0, 0, size, size);
            
            // نص أبيض
            ctx.fillStyle = 'white';
            ctx.font = \`bold \${size * 0.6}px Arial\`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('أ', size/2, size/2);
        }

        // رسم الأيقونات
        drawFavicon(document.getElementById('canvas16'), 16);
        drawFavicon(document.getElementById('canvas32'), 32);
        drawFavicon(document.getElementById('canvas180'), 180);

        function downloadFavicons() {
            // تحميل 16x16
            const canvas16 = document.getElementById('canvas16');
            const link16 = document.createElement('a');
            link16.download = 'favicon-16x16.png';
            link16.href = canvas16.toDataURL();
            link16.click();

            // تحميل 32x32
            setTimeout(() => {
                const canvas32 = document.getElementById('canvas32');
                const link32 = document.createElement('a');
                link32.download = 'favicon-32x32.png';
                link32.href = canvas32.toDataURL();
                link32.click();
            }, 500);

            // تحميل 180x180 (Apple Touch Icon)
            setTimeout(() => {
                const canvas180 = document.getElementById('canvas180');
                const link180 = document.createElement('a');
                link180.download = 'apple-touch-icon.png';
                link180.href = canvas180.toDataURL();
                link180.click();
            }, 1000);

            alert('تم إنشاء جميع أيقونات الموقع! ضعها في مجلد frontend/public/');
        }
    </script>
</body>
</html>`;

  fs.writeFileSync('favicon-generator.html', htmlConverter);
  console.log('✅ Created favicon-generator.html');

  // إنشاء manifest.json للـ PWA
  const manifest = {
    "name": "متجر جيم روم",
    "short_name": "جيم روم",
    "description": "أفضل متجر ألعاب وتقنية في السعودية",
    "start_url": "/",
    "display": "standalone",
    "background_color": "#ffffff",
    "theme_color": "#6366f1",
    "icons": [
      {
        "src": "/favicon-16x16.png",
        "sizes": "16x16",
        "type": "image/png"
      },
      {
        "src": "/favicon-32x32.png",
        "sizes": "32x32",
        "type": "image/png"
      },
      {
        "src": "/apple-touch-icon.png",
        "sizes": "180x180",
        "type": "image/png"
      }
    ]
  };

  fs.writeFileSync('frontend/public/manifest.json', JSON.stringify(manifest, null, 2));
  console.log('✅ Created manifest.json');

  console.log('\n📋 Next Steps:');
  console.log('1. افتح favicon-generator.html في المتصفح');
  console.log('2. اضغط "تحميل جميع الأيقونات"');
  console.log('3. ضع الملفات المحملة في frontend/public/');
  console.log('4. ارفع التحديثات للسيرفر');
  console.log('\n✅ Favicon creation completed!');
};

createFavicon();