import mongoose from 'mongoose';
import dotenv from 'dotenv';
import HomepageConfig from '../models/HomepageConfig.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

const seedHomepage = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // حذف البيانات القديمة
    await HomepageConfig.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});

    // إنشاء فئات
    const categories = await Category.insertMany([
      {
        name: { ar: 'هواتف ذكية', en: 'Smartphones' },
        slug: 'smartphones',
        description: { ar: 'أحدث الهواتف الذكية', en: 'Latest smartphones' },
        isActive: true
      },
      {
        name: { ar: 'أجهزة لوحية', en: 'Tablets' },
        slug: 'tablets',
        description: { ar: 'أجهزة لوحية متنوعة', en: 'Various tablets' },
        isActive: true
      }
    ]);

    // إنشاء منتجات تجريبية
    const products = await Product.insertMany([
      {
        name: { ar: 'آيفون 15 برو ماكس', en: 'iPhone 15 Pro Max' },
        nameAr: 'آيفون 15 برو ماكس',
        nameEn: 'iPhone 15 Pro Max',
        description: { ar: 'أحدث هاتف من آبل', en: 'Latest iPhone from Apple' },
        price: 4999,
        originalPrice: 5999,
        brand: 'Apple',
        tagline: 'قوة التيتانيوم',
        images: ['https://placehold.co/400x400/1e40af/white?text=iPhone+15+Pro+Max'],
        category: categories[0]._id,
        stock: 10,
        colors: ['أسود', 'أبيض', 'أزرق'],
        storage: ['256GB', '512GB', '1TB'],
        isActive: true,
        isFeatured: true
      },
      {
        name: { ar: 'سامسونج جالاكسي S24 الترا', en: 'Samsung Galaxy S24 Ultra' },
        nameAr: 'سامسونج جالاكسي S24 الترا',
        nameEn: 'Samsung Galaxy S24 Ultra',
        description: { ar: 'أقوى هاتف من سامسونج', en: 'Most powerful Samsung phone' },
        price: 4499,
        originalPrice: 5499,
        brand: 'Samsung',
        tagline: 'قوة الذكاء الاصطناعي',
        images: ['https://placehold.co/400x400/1e40af/white?text=Galaxy+S24+Ultra'],
        category: categories[0]._id,
        stock: 15,
        colors: ['رمادي', 'أسود', 'بنفسجي'],
        storage: ['256GB', '512GB', '1TB'],
        isActive: true,
        isFeatured: true
      },
      {
        name: { ar: 'آيباد برو 12.9', en: 'iPad Pro 12.9' },
        nameAr: 'آيباد برو 12.9',
        nameEn: 'iPad Pro 12.9',
        description: { ar: 'جهاز لوحي احترافي', en: 'Professional tablet' },
        price: 3999,
        originalPrice: 4999,
        brand: 'Apple',
        tagline: 'قوة الإبداع',
        images: ['https://placehold.co/400x400/1e40af/white?text=iPad+Pro'],
        category: categories[1]._id,
        stock: 8,
        colors: ['فضي', 'رمادي'],
        storage: ['256GB', '512GB', '1TB'],
        isActive: true,
        isFeatured: true
      },
      {
        name: { ar: 'شاومي 14 برو', en: 'Xiaomi 14 Pro' },
        nameAr: 'شاومي 14 برو',
        nameEn: 'Xiaomi 14 Pro',
        description: { ar: 'أداء رائع بسعر مناسب', en: 'Great performance at good price' },
        price: 2499,
        originalPrice: 2999,
        brand: 'Xiaomi',
        tagline: 'الأداء الأمثل',
        images: ['https://placehold.co/400x400/1e40af/white?text=Xiaomi+14+Pro'],
        category: categories[0]._id,
        stock: 20,
        colors: ['أسود', 'أبيض', 'أخضر'],
        storage: ['256GB', '512GB'],
        isActive: true,
        isFeatured: true
      },
      {
        name: { ar: 'ون بلس 12', en: 'OnePlus 12' },
        nameAr: 'ون بلس 12',
        nameEn: 'OnePlus 12',
        description: { ar: 'سرعة وأداء', en: 'Speed and performance' },
        price: 2999,
        originalPrice: 3499,
        brand: 'OnePlus',
        tagline: 'السرعة الفائقة',
        images: ['https://placehold.co/400x400/1e40af/white?text=OnePlus+12'],
        category: categories[0]._id,
        stock: 12,
        colors: ['أسود', 'أخضر'],
        storage: ['256GB', '512GB'],
        isActive: true,
        isFeatured: true
      },
      {
        name: { ar: 'جوجل بيكسل 8 برو', en: 'Google Pixel 8 Pro' },
        nameAr: 'جوجل بيكسل 8 برو',
        nameEn: 'Google Pixel 8 Pro',
        description: { ar: 'أفضل كاميرا', en: 'Best camera' },
        price: 3499,
        originalPrice: 3999,
        brand: 'Google',
        tagline: 'التصوير الاحترافي',
        images: ['https://placehold.co/400x400/1e40af/white?text=Pixel+8+Pro'],
        category: categories[0]._id,
        stock: 10,
        colors: ['أسود', 'أبيض', 'أزرق'],
        storage: ['128GB', '256GB', '512GB'],
        isActive: true,
        isFeatured: true
      }
    ]);

    // إنشاء تكوين الصفحة الرئيسية
    const homepageConfig = new HomepageConfig({
      active: true,
      sections: [
        {
          id: '1',
          type: 'hero',
          title: 'البنر الرئيسي',
          subtitle: 'سلايدر الصور',
          order: 1,
          active: true,
          settings: {},
          content: {
            slides: [
              {
                title: 'عروض حصرية',
                subtitle: 'خصومات تصل إلى 50%',
                description: 'على أفضل الأجهزة',
                image: 'https://placehold.co/1920x600/1e40af/white?text=Banner+1',
                mobileImage: 'https://placehold.co/800x600/1e40af/white?text=Mobile+Banner+1',
                link: '/products',
                buttonText: 'تسوق الآن'
              },
              {
                title: 'أحدث الأجهزة',
                subtitle: 'تكنولوجيا المستقبل',
                description: 'اكتشف الجديد',
                image: 'https://placehold.co/1920x600/1e40af/white?text=Banner+2',
                mobileImage: 'https://placehold.co/800x600/1e40af/white?text=Mobile+Banner+2',
                link: '/products',
                buttonText: 'اكتشف المزيد'
              }
            ]
          }
        },
        {
          id: '2',
          type: 'categories',
          title: 'تسوق حسب الفئة',
          subtitle: 'اختر الفئة المناسبة لك',
          order: 2,
          active: true,
          settings: {},
          content: {
            categories: [
              { name: 'هواتف ذكية', icon: '📱', link: '/products?category=smartphones' },
              { name: 'أجهزة لوحية', icon: '💻', link: '/products?category=tablets' },
              { name: 'ساعات ذكية', icon: '⌚', link: '/products?category=watches' },
              { name: 'سماعات', icon: '🎧', link: '/products?category=headphones' },
              { name: 'إكسسوارات', icon: '🔌', link: '/products?category=accessories' },
              { name: 'أجهزة منزلية', icon: '🏠', link: '/products?category=home' }
            ]
          }
        },
        {
          id: '3',
          type: 'products',
          title: 'منتجات مميزة',
          subtitle: 'أفضل العروض لهذا الأسبوع',
          order: 3,
          active: true,
          settings: {},
          content: {
            productIds: products.map(p => p._id.toString())
          }
        },
        {
          id: '4',
          type: 'banner',
          title: 'عرض خاص',
          subtitle: 'لفترة محدودة',
          order: 4,
          active: true,
          settings: {},
          content: {
            image: 'https://placehold.co/1920x400/dc2626/white?text=Special+Offer',
            mobileImage: 'https://placehold.co/800x400/dc2626/white?text=Mobile+Special+Offer',
            buttonText: 'تسوق الآن',
            buttonLink: '/deals'
          }
        },
        {
          id: '5',
          type: 'exclusiveOffers',
          title: 'عروض حصرية',
          order: 5,
          active: true,
          settings: {},
          content: {}
        },
        {
          id: '6',
          type: 'deals',
          title: 'عروض اليوم',
          order: 6,
          active: true,
          settings: {},
          content: {}
        }
      ]
    });

    await homepageConfig.save();

    console.log('✅ Homepage seeded successfully!');
    console.log(`✅ Created ${categories.length} categories`);
    console.log(`✅ Created ${products.length} products`);
    console.log(`✅ Created homepage config with ${homepageConfig.sections.length} sections`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding homepage:', error);
    process.exit(1);
  }
};

seedHomepage();
