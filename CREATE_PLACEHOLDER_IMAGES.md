# 🖼️ إنشاء صور Placeholder

## الخيار 1: استخدام خدمة Placeholder أخرى

قم بتحديث `seedHomepage.js` لاستخدام خدمة تعمل:

```javascript
// استبدل المسارات المحلية بـ:
'https://placehold.co/400x400/1e40af/white?text=iPhone+15+Pro+Max'
'https://placehold.co/400x400/1e40af/white?text=Galaxy+S24+Ultra'
// إلخ...
```

## الخيار 2: إنشاء صور محلية بسيطة

### باستخدام ImageMagick (إذا كان مثبت):

```bash
# إنشاء مجلدات
mkdir -p frontend/public/images/products
mkdir -p frontend/public/images/banners

# إنشاء صور المنتجات
convert -size 400x400 -background "#1e40af" -fill white -gravity center -pointsize 30 label:"iPhone 15 Pro Max" frontend/public/images/products/iphone-15-pro-max.jpg

convert -size 400x400 -background "#1e40af" -fill white -gravity center -pointsize 30 label:"Galaxy S24 Ultra" frontend/public/images/products/galaxy-s24-ultra.jpg

convert -size 400x400 -background "#1e40af" -fill white -gravity center -pointsize 30 label:"iPad Pro" frontend/public/images/products/ipad-pro.jpg

convert -size 400x400 -background "#1e40af" -fill white -gravity center -pointsize 30 label:"Xiaomi 14 Pro" frontend/public/images/products/xiaomi-14-pro.jpg

convert -size 400x400 -background "#1e40af" -fill white -gravity center -pointsize 30 label:"OnePlus 12" frontend/public/images/products/oneplus-12.jpg

convert -size 400x400 -background "#1e40af" -fill white -gravity center -pointsize 30 label:"Pixel 8 Pro" frontend/public/images/products/pixel-8-pro.jpg

# إنشاء صور البنرات
convert -size 1920x600 -background "#1e40af" -fill white -gravity center -pointsize 60 label:"Banner 1" frontend/public/images/banners/banner-1.jpg

convert -size 1920x600 -background "#1e40af" -fill white -gravity center -pointsize 60 label:"Banner 2" frontend/public/images/banners/banner-2.jpg

convert -size 1920x400 -background "#dc2626" -fill white -gravity center -pointsize 60 label:"Special Offer" frontend/public/images/banners/special-offer.jpg

convert -size 800x600 -background "#1e40af" -fill white -gravity center -pointsize 40 label:"Mobile Banner 1" frontend/public/images/banners/mobile-banner-1.jpg

convert -size 800x600 -background "#1e40af" -fill white -gravity center -pointsize 40 label:"Mobile Banner 2" frontend/public/images/banners/mobile-banner-2.jpg

convert -size 800x400 -background "#dc2626" -fill white -gravity center -pointsize 40 label:"Mobile Special Offer" frontend/public/images/banners/mobile-special-offer.jpg
```

## الخيار 3: استخدام صور حقيقية

1. ابحث عن صور المنتجات على الإنترنت
2. احفظها في المجلدات المناسبة
3. تأكد من الأسماء تطابق ما في الكود

## الخيار 4: تحديث الكود لاستخدام placehold.co

قم بتشغيل هذا الأمر لتحديث seedHomepage.js:

```bash
cd mobile-store-vite
```

ثم قم بتحديث الملف يدوياً أو استخدم الكود التالي:

```javascript
// في seedHomepage.js، استبدل:
images: ['/images/products/iphone-15-pro-max.jpg']
// بـ:
images: ['https://placehold.co/400x400/1e40af/white?text=iPhone+15+Pro+Max']
```

## ✅ الحل السريع الموصى به:

استخدم placehold.co لأنه يعمل بدون مشاكل:

```javascript
// المنتجات
'https://placehold.co/400x400/1e40af/white?text=iPhone+15'
'https://placehold.co/400x400/1e40af/white?text=Galaxy+S24'
'https://placehold.co/400x400/1e40af/white?text=iPad+Pro'
'https://placehold.co/400x400/1e40af/white?text=Xiaomi+14'
'https://placehold.co/400x400/1e40af/white?text=OnePlus+12'
'https://placehold.co/400x400/1e40af/white?text=Pixel+8'

// البنرات
'https://placehold.co/1920x600/1e40af/white?text=Banner+1'
'https://placehold.co/1920x600/1e40af/white?text=Banner+2'
'https://placehold.co/1920x400/dc2626/white?text=Special+Offer'
'https://placehold.co/800x600/1e40af/white?text=Mobile+Banner+1'
'https://placehold.co/800x600/1e40af/white?text=Mobile+Banner+2'
'https://placehold.co/800x400/dc2626/white?text=Mobile+Special'
```
