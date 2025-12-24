const fs = require('fs');
const path = require('path');

// إنشاء Canvas في Node.js (محاكاة)
function createTempIcon(size, filename) {
  // إنشاء SVG مؤقت
  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#8b5cf6;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#7c3aed;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" fill="url(#grad1)" rx="${size * 0.1}"/>
  
  <!-- شكل يشبه الأيقونة المرسلة -->
  <g transform="translate(${size * 0.2}, ${size * 0.2}) scale(${size * 0.006})">
    <!-- الشكل الأول (V) -->
    <path d="M0 0 L60 0 L60 40 L40 40 L40 20 L20 20 L20 60 L0 60 Z" fill="white" opacity="0.9"/>
    <!-- الشكل الثاني (!) -->
    <ellipse cx="80" cy="30" rx="15" ry="30" fill="white" opacity="0.9"/>
    <!-- النقطة -->
    <circle cx="80" cy="80" r="8" fill="white" opacity="0.9"/>
  </g>
  
  <!-- نص أبعاد التواصل -->
  <text x="50%" y="85%" font-family="Arial, sans-serif" font-size="${size * 0.08}" fill="white" text-anchor="middle" font-weight="bold">أبعاد التواصل</text>
</svg>`;

  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }
  
  // حفظ كـ SVG أولاً
  const svgPath = path.join(assetsDir, filename.replace('.png', '.svg'));
  fs.writeFileSync(svgPath, svg);
  
  // إنشاء PNG بسيط (placeholder)
  const pngPath = path.join(assetsDir, filename);
  
  // إنشاء ملف PNG أساسي (سيتم استبداله لاحقاً)
  const simplePng = Buffer.from([
    0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D,
    0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01,
    0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00,
    0x0A, 0x49, 0x44, 0x41, 0x54, 0x78, 0x9C, 0x63, 0x00, 0x01, 0x00, 0x00,
    0x05, 0x00, 0x01, 0x0D, 0x0A, 0x2D, 0xB4, 0x00, 0x00, 0x00, 0x00, 0x49,
    0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82
  ]);
  
  fs.writeFileSync(pngPath, simplePng);
  
  console.log(`✅ تم إنشاء ${filename} (${size}x${size})`);
}

// إنشاء جميع الأيقونات المطلوبة
console.log('🚀 إنشاء أيقونات مؤقتة للتطبيق...');

createTempIcon(1024, 'icon.png');
createTempIcon(1024, 'adaptive-icon.png');
createTempIcon(512, 'splash-icon.png');
createTempIcon(32, 'favicon.png');

console.log('\n✅ تم إنشاء جميع الأيقونات المؤقتة');
console.log('📋 يمكنك الآن:');
console.log('1. بناء التطبيق مباشرة: npm run build:android');
console.log('2. أو استبدال الأيقونات بأيقونات أفضل من create-icons-from-image.html');
console.log('3. ثم إعادة البناء للحصول على أيقونات محسنة');

// إنشاء ملف تعليمات
const instructions = `# تعليمات الأيقونات

## الأيقونات الحالية:
تم إنشاء أيقونات مؤقتة بسيطة للسماح ببناء التطبيق فوراً.

## للحصول على أيقونات أفضل:
1. افتح create-icons-from-image.html في المتصفح
2. ارفع صورة الشعار عالية الجودة
3. اضغط "إنشاء جميع الأيقونات"
4. حمل الأيقونات واستبدل الملفات في هذا المجلد
5. أعد بناء التطبيق

## أحجام الأيقونات:
- icon.png: 1024x1024 (أيقونة التطبيق الرئيسية)
- adaptive-icon.png: 1024x1024 (أيقونة Android التكيفية)
- splash-icon.png: 512x512 (شاشة البداية)
- favicon.png: 32x32 (أيقونة الويب)
`;

fs.writeFileSync(path.join(__dirname, 'assets', 'ICONS_README.md'), instructions);
console.log('📝 تم إنشاء ملف التعليمات: assets/ICONS_README.md');