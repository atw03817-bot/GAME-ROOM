const fs = require('fs');
const https = require('https');
const path = require('path');

// إنشاء مجلد assets إذا لم يكن موجود
const assetsDir = path.join(__dirname, 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir);
}

// تحميل الشعار من الموقع
function downloadLogo() {
  return new Promise((resolve, reject) => {
    const logoPath = path.join(assetsDir, 'logo.png');
    const file = fs.createWriteStream(logoPath);
    
    https.get('https://www.gameroom-store.com/logo.png', (response) => {
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log('✅ تم تحميل الشعار بنجاح');
        resolve(logoPath);
      });
    }).on('error', (err) => {
      fs.unlink(logoPath, () => {}); // حذف الملف في حالة الخطأ
      reject(err);
    });
  });
}

// إنشاء ملف HTML لتحويل الشعار لأيقونات مختلفة الأحجام
function createIconGenerator() {
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <title>مولد أيقونات التطبيق</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 20px; direction: rtl; }
        canvas { border: 1px solid #ccc; margin: 10px; }
        .icon-set { margin: 20px 0; }
        button { padding: 10px 20px; margin: 5px; background: #7c3aed; color: white; border: none; border-radius: 5px; cursor: pointer; }
    </style>
</head>
<body>
    <h1>مولد أيقونات تطبيق جيم روم</h1>
    
    <div>
        <input type="file" id="logoInput" accept="image/*">
        <button onclick="generateIcons()">إنشاء الأيقونات</button>
    </div>
    
    <div id="iconsContainer"></div>
    
    <script>
        let logoImage = null;
        
        document.getElementById('logoInput').addEventListener('change', function(e) {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    logoImage = new Image();
                    logoImage.onload = function() {
                        console.log('تم تحميل الشعار');
                    };
                    logoImage.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
        
        function generateIcons() {
            if (!logoImage) {
                alert('يرجى اختيار صورة الشعار أولاً');
                return;
            }
            
            const sizes = [
                { name: 'icon.png', size: 1024 },
                { name: 'adaptive-icon.png', size: 1024 },
                { name: 'splash-icon.png', size: 512 },
                { name: 'favicon.png', size: 32 }
            ];
            
            const container = document.getElementById('iconsContainer');
            container.innerHTML = '';
            
            sizes.forEach(iconInfo => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = iconInfo.size;
                canvas.height = iconInfo.size;
                
                // خلفية بنفسجية للأيقونة
                ctx.fillStyle = '#7c3aed';
                ctx.fillRect(0, 0, iconInfo.size, iconInfo.size);
                
                // رسم الشعار في المنتصف
                const logoSize = iconInfo.size * 0.7;
                const x = (iconInfo.size - logoSize) / 2;
                const y = (iconInfo.size - logoSize) / 2;
                
                ctx.drawImage(logoImage, x, y, logoSize, logoSize);
                
                // إضافة الكانفاس للصفحة
                const div = document.createElement('div');
                div.className = 'icon-set';
                div.innerHTML = \`<h3>\${iconInfo.name} (\${iconInfo.size}x\${iconInfo.size})</h3>\`;
                div.appendChild(canvas);
                
                // زر التحميل
                const downloadBtn = document.createElement('button');
                downloadBtn.textContent = 'تحميل ' + iconInfo.name;
                downloadBtn.onclick = function() {
                    const link = document.createElement('a');
                    link.download = iconInfo.name;
                    link.href = canvas.toDataURL();
                    link.click();
                };
                div.appendChild(downloadBtn);
                
                container.appendChild(div);
            });
        }
        
        // تحميل الشعار تلقائياً من الموقع
        window.onload = function() {
            logoImage = new Image();
            logoImage.crossOrigin = 'anonymous';
            logoImage.onload = function() {
                console.log('تم تحميل شعار الموقع تلقائياً');
                generateIcons();
            };
            logoImage.onerror = function() {
                console.log('فشل في تحميل الشعار من الموقع');
            };
            logoImage.src = 'https://www.gameroom-store.com/logo.png';
        };
    </script>
</body>
</html>
  `;
  
  fs.writeFileSync(path.join(__dirname, 'icon-generator.html'), htmlContent);
  console.log('✅ تم إنشاء مولد الأيقونات: icon-generator.html');
}

// تشغيل العملية
async function main() {
  try {
    console.log('🚀 بدء إنشاء أيقونات التطبيق...');
    
    // تحميل الشعار
    await downloadLogo();
    
    // إنشاء مولد الأيقونات
    createIconGenerator();
    
    console.log('\n📋 الخطوات التالية:');
    console.log('1. افتح ملف icon-generator.html في المتصفح');
    console.log('2. سيتم تحميل الشعار تلقائياً وإنشاء الأيقونات');
    console.log('3. حمل كل الأيقونات وضعها في مجلد assets');
    console.log('4. شغل الأمر: npx expo build:android');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  }
}

main();