import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Category from '../models/Category.js';

dotenv.config();

async function assignCategories() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // جلب جميع الفئات
    const categories = await Category.find();
    console.log(`📂 Found ${categories.length} categories`);

    if (categories.length === 0) {
      console.log('⚠️  No categories found. Please run seed-categories.js first');
      process.exit(1);
    }

    // جلب جميع المنتجات
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products`);

    if (products.length === 0) {
      console.log('⚠️  No products found');
      process.exit(0);
    }

    // تعيين فئات للمنتجات بناءً على الاسم أو الماركة
    let updatedCount = 0;

    for (const product of products) {
      let assignedCategory = null;

      const productName = (product.nameAr || product.name?.ar || '').toLowerCase();
      const productBrand = (product.brand || '').toLowerCase();

      // محاولة تخمين الفئة بناءً على الاسم أو الماركة
      if (
        productName.includes('ايفون') ||
        productName.includes('iphone') ||
        productName.includes('جالكسي') ||
        productName.includes('galaxy') ||
        productName.includes('هاتف') ||
        productName.includes('phone') ||
        productBrand.includes('apple') ||
        productBrand.includes('samsung') ||
        productBrand.includes('xiaomi') ||
        productBrand.includes('oppo')
      ) {
        assignedCategory = categories.find((c) => c.slug === 'smartphones');
      } else if (
        productName.includes('ايباد') ||
        productName.includes('ipad') ||
        productName.includes('تابلت') ||
        productName.includes('tablet') ||
        productName.includes('لوحي')
      ) {
        assignedCategory = categories.find((c) => c.slug === 'tablets');
      } else if (
        productName.includes('ساعة') ||
        productName.includes('watch') ||
        productBrand.includes('watch')
      ) {
        assignedCategory = categories.find((c) => c.slug === 'smart-watches');
      } else if (
        productName.includes('سماعة') ||
        productName.includes('سماعات') ||
        productName.includes('headphone') ||
        productName.includes('airpods') ||
        productName.includes('earbuds')
      ) {
        assignedCategory = categories.find((c) => c.slug === 'headphones');
      } else if (
        productName.includes('ماك') ||
        productName.includes('mac') ||
        productName.includes('لابتوب') ||
        productName.includes('laptop') ||
        productName.includes('كمبيوتر')
      ) {
        assignedCategory = categories.find((c) => c.slug === 'laptops');
      } else if (
        productName.includes('كاميرا') ||
        productName.includes('camera')
      ) {
        assignedCategory = categories.find((c) => c.slug === 'cameras');
      } else if (
        productName.includes('بلايستيشن') ||
        productName.includes('playstation') ||
        productName.includes('xbox') ||
        productName.includes('ألعاب') ||
        productName.includes('gaming')
      ) {
        assignedCategory = categories.find((c) => c.slug === 'gaming');
      } else {
        // إذا ما قدرنا نحدد، نحطه في ملحقات
        assignedCategory = categories.find((c) => c.slug === 'accessories');
      }

      // تحديث المنتج
      if (assignedCategory && !product.category) {
        product.category = assignedCategory._id;
        await product.save();
        updatedCount++;
        console.log(
          `✅ ${product.nameAr || product.name?.ar} → ${assignedCategory.icon} ${assignedCategory.name.ar}`
        );
      } else if (product.category) {
        console.log(
          `⏭️  ${product.nameAr || product.name?.ar} - already has category`
        );
      }
    }

    console.log(`\n✅ Updated ${updatedCount} products`);
    console.log(`⏭️  Skipped ${products.length - updatedCount} products (already have categories)`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

assignCategories();
