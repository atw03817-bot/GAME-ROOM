# 🏗️ دليل Homepage Builder System

## نظام بناء الصفحة الرئيسية الديناميكي

هذا النظام يسمح لك بإنشاء وتخصيص الصفحة الرئيسية بشكل كامل من لوحة التحكم.

---

## 📋 الأقسام المتاحة

### 1. Hero Slider (البنر الرئيسي)
سلايدر صور متحرك مع دعم:
- ✅ صور منفصلة للكمبيوتر والجوال
- ✅ Side Peeks (600px على كل جانب)
- ✅ Auto-play مع تحكم يدوي
- ✅ Swipe على الجوال
- ✅ نصوص وأزرار قابلة للتخصيص

**مثال:**
```javascript
{
  type: 'hero',
  content: {
    slides: [
      {
        title: 'عروض حصرية',
        subtitle: 'خصومات تصل إلى 50%',
        image: 'desktop-image.jpg',
        mobileImage: 'mobile-image.jpg',
        link: '/products',
        buttonText: 'تسوق الآن'
      }
    ]
  }
}
```

### 2. Categories (الفئات)
عرض الفئات بشكل أيقونات:
- ✅ 6 فئات في الصف (3 على الجوال)
- ✅ أيقونات Emoji
- ✅ روابط مخصصة

**مثال:**
```javascript
{
  type: 'categories',
  content: {
    categories: [
      { name: 'هواتف ذكية', icon: '📱', link: '/products?category=smartphones' },
      { name: 'أجهزة لوحية', icon: '💻', link: '/products?category=tablets' }
    ]
  }
}
```

### 3. Products Slider (عرض المنتجات)
سلايدر منتجات أفقي:
- ✅ اختيار منتجات محددة
- ✅ Quick Add للسلة
- ✅ عرض السعر والخصم
- ✅ أسهم تنقل

**مثال:**
```javascript
{
  type: 'products',
  title: 'منتجات مميزة',
  subtitle: 'أفضل العروض',
  content: {
    productIds: ['product1_id', 'product2_id']
  }
}
```

### 4. Banner (بنر إعلاني)
صورة إعلانية كبيرة:
- ✅ صور منفصلة للكمبيوتر والجوال
- ✅ نص وزر اختياري
- ✅ رابط مخصص

**مثال:**
```javascript
{
  type: 'banner',
  content: {
    image: 'desktop-banner.jpg',
    mobileImage: 'mobile-banner.jpg',
    buttonText: 'تسوق الآن',
    buttonLink: '/deals'
  }
}
```

### 5. Text Section (قسم نصي)
قسم نصي بسيط:
- ✅ عنوان وعنوان فرعي
- ✅ نص طويل
- ✅ تنسيق مركزي

**مثال:**
```javascript
{
  type: 'text',
  title: 'من نحن',
  subtitle: 'قصتنا',
  content: {
    text: 'نحن أفضل متجر...'
  }
}
```

### 6. Image Grid (شبكة صور)
3 صور جنباً إلى جنب:
- ✅ 3 أعمدة (1 على الجوال)
- ✅ روابط مخصصة
- ✅ تأثير Hover

**مثال:**
```javascript
{
  type: 'imageGrid',
  content: {
    images: [
      { image: 'image1.jpg', link: '/category1' },
      { image: 'image2.jpg', link: '/category2' },
      { image: 'image3.jpg', link: '/category3' }
    ]
  }
}
```

### 7. Exclusive Offers (عروض حصرية)
3 بطاقات عروض ملونة:
- ✅ قابلة للتخصيص بالكامل
- ✅ 3 عروض مختلفة
- ✅ تصميم جذاب

### 8. Deals Section (قسم العروض)
عرض المنتجات التي عليها خصم:
- ✅ يجلب المنتجات تلقائياً
- ✅ بنر عروض
- ✅ قابل للتخصيص

---

## 🎮 API Endpoints

### Public (للعملاء)
```
GET /api/homepage
GET /api/homepage/featured-deals
GET /api/homepage/exclusive-offers
```

### Admin (للإدارة)
```
PUT /api/homepage
POST /api/homepage/sections
PUT /api/homepage/sections/:sectionId
DELETE /api/homepage/sections/:sectionId
POST /api/homepage/sections/reorder
POST /api/homepage/sections/:sectionId/duplicate
POST /api/homepage/sections/:sectionId/toggle
PUT /api/homepage/featured-deals
PUT /api/homepage/exclusive-offers
```

---

## 💾 Database Models

### HomepageConfig
```javascript
{
  active: Boolean,
  sections: [
    {
      id: String,
      type: String, // 'hero', 'categories', 'products', etc.
      title: String,
      subtitle: String,
      order: Number,
      active: Boolean,
      settings: Object,
      content: Object
    }
  ]
}
```

### FeaturedDealsSettings
```javascript
{
  enabled: Boolean,
  title: String,
  subtitle: String,
  bannerTitle: String,
  bannerSubtitle: String,
  productsCount: Number,
  ctaText: String
}
```

### ExclusiveOffersSettings
```javascript
{
  enabled: Boolean,
  offer1: {
    title: String,
    titleEn: String,
    discount: String,
    description: String,
    descriptionEn: String,
    link: String
  },
  offer2: { ... },
  offer3: { ... }
}
```

---

## 🚀 كيفية الاستخدام

### 1. إضافة قسم جديد
```javascript
POST /api/homepage/sections
{
  "type": "hero",
  "title": "البنر الرئيسي",
  "content": {
    "slides": [...]
  }
}
```

### 2. تحديث قسم
```javascript
PUT /api/homepage/sections/:sectionId
{
  "title": "عنوان جديد",
  "content": {...}
}
```

### 3. إعادة ترتيب الأقسام
```javascript
POST /api/homepage/sections/reorder
{
  "sections": [
    { id: "1", order: 1 },
    { id: "2", order: 2 }
  ]
}
```

### 4. إخفاء/إظهار قسم
```javascript
POST /api/homepage/sections/:sectionId/toggle
```

### 5. نسخ قسم
```javascript
POST /api/homepage/sections/:sectionId/duplicate
```

---

## 🎨 التخصيص

### تغيير إعدادات العروض المميزة
```javascript
PUT /api/homepage/featured-deals
{
  "enabled": true,
  "title": "عروض حصرية",
  "subtitle": "خصومات تصل إلى {maxDiscount}%",
  "productsCount": 6
}
```

### تغيير العروض الحصرية
```javascript
PUT /api/homepage/exclusive-offers
{
  "enabled": true,
  "offer1": {
    "title": "عرض الجمعة البيضاء",
    "discount": "50%",
    "description": "خصم يصل إلى 50%",
    "link": "/deals"
  }
}
```

---

## 📱 التصميم المتجاوب

كل الأقسام مصممة للعمل على:
- ✅ Desktop (1920px+)
- ✅ Tablet (768px - 1024px)
- ✅ Mobile (320px - 767px)

### مميزات الجوال:
- صور منفصلة للجوال
- Swipe للسلايدرات
- تصميم مبسط
- أزرار أكبر

---

## 🔥 المميزات المتقدمة

### 1. Side Peeks في Hero Slider
- 600px على كل جانب
- يظهر جزء من الصورة التالية/السابقة
- يعمل فقط على Desktop

### 2. Quick Add للمنتجات
- إضافة للسلة بدون فتح صفحة المنتج
- Toast notification
- تحديث فوري للسلة

### 3. Auto-play مع Pause on Hover
- السلايدر يتحرك تلقائياً
- يتوقف عند التمرير
- قابل للتخصيص

### 4. Lazy Loading للصور
- تحميل الصور عند الحاجة
- تحسين الأداء
- تقليل استهلاك البيانات

---

## 🎯 أفضل الممارسات

### 1. ترتيب الأقسام
```
1. Hero Slider (البنر الرئيسي)
2. Categories (الفئات)
3. Products Slider (منتجات مميزة)
4. Banner (بنر إعلاني)
5. Exclusive Offers (عروض حصرية)
6. Deals Section (قسم العروض)
```

### 2. أحجام الصور الموصى بها
- Hero Desktop: 1920x600px
- Hero Mobile: 800x600px
- Banner Desktop: 1920x400px
- Banner Mobile: 800x400px
- Product: 400x400px

### 3. عدد المنتجات
- Products Slider: 6-12 منتج
- Deals Section: 6 منتجات
- Grid: 6-12 منتج

---

## 🐛 استكشاف الأخطاء

### المشكلة: الأقسام لا تظهر
**الحل:** تأكد من:
- `active: true` في القسم
- `order` صحيح
- `content` يحتوي على البيانات المطلوبة

### المشكلة: الصور لا تظهر
**الحل:** تأكد من:
- الرابط صحيح
- الصورة موجودة
- CORS مفعل

### المشكلة: المنتجات لا تظهر
**الحل:** تأكد من:
- `productIds` صحيحة
- المنتجات موجودة في قاعدة البيانات
- `isActive: true` للمنتجات

---

## 📚 أمثلة كاملة

### مثال: صفحة رئيسية كاملة
```javascript
{
  "active": true,
  "sections": [
    {
      "id": "1",
      "type": "hero",
      "title": "البنر الرئيسي",
      "order": 1,
      "active": true,
      "content": {
        "slides": [
          {
            "title": "عروض حصرية",
            "image": "banner1.jpg",
            "mobileImage": "banner1-mobile.jpg",
            "link": "/products"
          }
        ]
      }
    },
    {
      "id": "2",
      "type": "categories",
      "title": "تسوق حسب الفئة",
      "order": 2,
      "active": true,
      "content": {
        "categories": [
          { "name": "هواتف", "icon": "📱", "link": "/products" }
        ]
      }
    }
  ]
}
```

---

**النظام جاهز ويعمل بكفاءة! 🚀**
