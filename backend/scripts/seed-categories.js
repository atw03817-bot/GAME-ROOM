import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Category from '../models/Category.js';

dotenv.config();

const categories = [
  {
    name: { ar: 'هواتف ذكية', en: 'Smartphones' },
    slug: 'smartphones',
    description: {
      ar: 'أحدث الهواتف الذكية من أفضل العلامات التجارية',
      en: 'Latest smartphones from top brands',
    },
    icon: '📱',
    order: 1,
    isActive: true,
  },
  {
    name: { ar: 'أجهزة لوحية', en: 'Tablets' },
    slug: 'tablets',
    description: {
      ar: 'أجهزة لوحية للعمل والترفيه',
      en: 'Tablets for work and entertainment',
    },
    icon: '📲',
    order: 2,
    isActive: true,
  },
  {
    name: { ar: 'ساعات ذكية', en: 'Smart Watches' },
    slug: 'smart-watches',
    description: {
      ar: 'ساعات ذكية لتتبع صحتك ولياقتك',
      en: 'Smart watches to track your health and fitness',
    },
    icon: '⌚',
    order: 3,
    isActive: true,
  },
  {
    name: { ar: 'سماعات', en: 'Headphones' },
    slug: 'headphones',
    description: {
      ar: 'سماعات لاسلكية وسلكية بجودة صوت عالية',
      en: 'Wireless and wired headphones with high quality sound',
    },
    icon: '🎧',
    order: 4,
    isActive: true,
  },
  {
    name: { ar: 'أجهزة كمبيوتر محمولة', en: 'Laptops' },
    slug: 'laptops',
    description: {
      ar: 'أجهزة كمبيوتر محمولة للعمل والألعاب',
      en: 'Laptops for work and gaming',
    },
    icon: '💻',
    order: 5,
    isActive: true,
  },
  {
    name: { ar: 'ملحقات', en: 'Accessories' },
    slug: 'accessories',
    description: {
      ar: 'ملحقات وإكسسوارات للأجهزة الإلكترونية',
      en: 'Accessories for electronic devices',
    },
    icon: '🔌',
    order: 6,
    isActive: true,
  },
  {
    name: { ar: 'كاميرات', en: 'Cameras' },
    slug: 'cameras',
    description: {
      ar: 'كاميرات رقمية واحترافية',
      en: 'Digital and professional cameras',
    },
    icon: '📷',
    order: 7,
    isActive: true,
  },
  {
    name: { ar: 'ألعاب', en: 'Gaming' },
    slug: 'gaming',
    description: {
      ar: 'أجهزة وملحقات الألعاب',
      en: 'Gaming devices and accessories',
    },
    icon: '🎮',
    order: 8,
    isActive: true,
  },
];

async function seedCategories() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // حذف الفئات الموجودة
    await Category.deleteMany({});
    console.log('🗑️  Cleared existing categories');

    // إضافة الفئات الجديدة
    const createdCategories = await Category.insertMany(categories);
    console.log(`✅ Added ${createdCategories.length} categories`);

    // عرض الفئات
    console.log('\n📂 Categories:');
    createdCategories.forEach((cat) => {
      console.log(`  ${cat.icon} ${cat.name.ar} (${cat.name.en}) - /${cat.slug}`);
    });

    console.log('\n✅ Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
