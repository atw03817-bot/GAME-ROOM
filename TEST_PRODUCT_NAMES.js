// اختبار أسماء المنتجات الفعلية في قاعدة البيانات
import mongoose from 'mongoose';
import Product from './backend/models/Product.js';

const testProductNames = async () => {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store');
    
    console.log('🔍 فحص أسماء المنتجات في قاعدة البيانات...');
    
    // جلب جميع المنتجات
    const products = await Product.find({}).select('name nameAr nameEn _id').limit(50);
    
    console.log(`📦 تم العثور على ${products.length} منتج`);
    console.log('');
    
    let emptyNameCount = 0;
    let validNameCount = 0;
    
    products.forEach((product, index) => {
      console.log(`--- منتج ${index + 1} ---`);
      console.log(`ID: ${product._id}`);
      console.log(`name (object):`, product.name);
      console.log(`name.ar:`, product.name?.ar);
      console.log(`name.en:`, product.name?.en);
      console.log(`nameAr (legacy):`, product.nameAr);
      console.log(`nameEn (legacy):`, product.nameEn);
      
      // تحديد الاسم النهائي
      const finalName = product.name?.ar || product.nameAr || product.name?.en || product.nameEn || product.name;
      console.log(`الاسم النهائي: "${finalName}"`);
      
      if (!finalName || finalName.trim() === '') {
        console.log('❌ اسم فارغ!');
        emptyNameCount++;
      } else {
        console.log('✅ اسم صحيح');
        validNameCount++;
      }
      
      console.log('');
    });
    
    console.log('📊 ملخص النتائج:');
    console.log(`✅ منتجات بأسماء صحيحة: ${validNameCount}`);
    console.log(`❌ منتجات بأسماء فارغة: ${emptyNameCount}`);
    
    if (emptyNameCount > 0) {
      console.log('');
      console.log('🔧 المنتجات التي تحتاج إصلاح:');
      const emptyProducts = await Product.find({
        $or: [
          { 'name.ar': { $in: [null, '', undefined] } },
          { 'name.ar': { $exists: false } },
          { nameAr: { $in: [null, '', undefined] } },
          { nameAr: { $exists: false } }
        ]
      }).select('name nameAr _id');
      
      emptyProducts.forEach(product => {
        console.log(`- ID: ${product._id}, name: ${JSON.stringify(product.name)}, nameAr: ${product.nameAr}`);
      });
    }
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
  }
};

// تشغيل الاختبار
testProductNames();