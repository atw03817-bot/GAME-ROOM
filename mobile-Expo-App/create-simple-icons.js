yconst fs = require('fs');
const path = require('path');

// إنشاء SVG بسيط للأيقونة
function createSVGIcon(size, filename) {
  const svg = `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#7c3aed"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${size/8}" fill="white" text-anchor="middle" dy=".3em">أبعاد</text>
  <text x="50%" y="65%" font-family="Arial, sans-serif" font-size="${size/12}" fill="white" text-anchor="middle" dy=".3em">التواصل</text>
</svg>`;
  
  const assetsDir = path.join(__dirname, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir);
  }
  
  fs.writeFileSync(path.join(assetsDir, filename), svg);
  console.log(`✅ تم إنشاء ${filename}`);
}

// إنشاء الأيقونات المطلوبة
createSVGIcon(1024, 'icon.svg');
createSVGIcon(1024, 'adaptive-icon.svg');
createSVGIcon(512, 'splash-icon.svg');
createSVGIcon(32, 'favicon.svg');

console.log('\n📋 تم إنشاء أيقونات SVG مؤقتة');
console.log('يمكنك الآن بناء التطبيق أو استبدالها بأيقونات PNG من مولد الأيقونات');