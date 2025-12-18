// إصلاح المنتجات التي لديها أسماء فارغة
import mongoose from 'mongoose';
import Product from './backend/models/Product.js';

const fixEmptyProductNames = async () => {
  try {
    // الاتصال بقاعدة البيانات
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store';
    await mongoose.connect(mongoUri);
    
    console.log('🔍 البحث عن المنتجات بأسماء فارغة...');
    
    // البحث عن المنتجات بأسماء فارغة أو غير موجودة
    const emptyNameProducts = await Product.find({
      $or: [
        // name.ar فارغ أو غير موجود
        { 'name.ar': { $in: [null, '', undefined] } },
        { 'name.ar': { $exists: false } },
        // nameAr فارغ أو غير موجود
        { nameAr: { $in: [null, '', undefined] } },
        { nameAr: { $exists: false } },
        // name غير موجود أو فارغ
        { name: { $in: [null, '', undefined] } },
        { name: { $exists: false } }
      ]
    });
    
    console.log(`❌ تم العثور على ${emptyNameProducts.length} منتج بأسماء فارغة`);
    
    if (emptyNameProducts.length === 0) {
      console.log('✅ جميع المنتجات لديها أسماء صحيحة!');
      return;
    }
    
    console.log('\n🔧 إصلاح المنتجات...');
    
    let fixedCount = 0;
    
    for (const product of emptyNameProducts) {
      console.log(`\n--- إصلاح منتج ${product._id} ---`);
      console.log('البيانات الحالية:', {
        name: product.name,
        nameAr: product.nameAr,
        nameEn: product.nameEn
      });
      
      // محاولة إيجاد اسم من أي مصدر متاح
      let newName = null;
      
      if (product.name && typeof product.name === 'object' && product.name.en) {
        newName = product.name.en;
      } else if (product.nameEn && product.nameEn.trim() !== '') {
        newName = product.nameEn;
      } else if (typeof product.name === 'string' && product.name.trim() !== '') {
        newName = product.name;
      } else {
        // إنشاء اسم افتراضي بناءً على العلامة التجارية أو الفئة
        const brand = product.brand || 'منتج';
        const category = product.categoryName || 'إلكتروني';
        newName = `${brand} ${category} ${product._id.toString().slice(-4)}`;
      }
      
      // تحديث المنتج
      const updateData = {};
      
      // إذا كان لدينا بنية name كـ object
      if (product.name && typeof product.name === 'object') {
        updateData['name.ar'] = newName;
        if (!product.name.en) {
          updateData['name.en'] = newName;
        }
      } else {
        // إنشاء بنية name جديدة
        updateData.name = {
          ar: newName,
          en: newName
        };
      }
      
      // تحديث الحقول القديمة للتوافق
      if (!product.nameAr) {
        updateData.nameAr = newName;
      }
      if (!product.nameEn) {
        updateData.nameEn = newName;
      }
      
      await Product.findByIdAndUpdate(product._id, updateData);
      
      console.log(`✅ تم إصلاح المنتج: ${newName}`);
      fixedCount++;
    }
    
    console.log(`\n🎉 تم إصلاح ${fixedCount} منتج بنجاح!`);
    
    // التحقق من النتائج
    console.log('\n🔍 التحقق من النتائج...');
    const remainingEmptyProducts = await Product.find({
      $or: [
        { 'name.ar': { $in: [null, '', undefined] } },
        { 'name.ar': { $exists: false } },
        { nameAr: { $in: [null, '', undefined] } },
        { nameAr: { $exists: false } }
      ]
    });
    
    console.log(`📊 المنتجات المتبقية بأسماء فارغة: ${remainingEmptyProducts.length}`);
    
    if (remainingEmptyProducts.length === 0) {
      console.log('🎉 تم إصلاح جميع المنتجات بنجاح!');
    }
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح المنتجات:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
};

// تشغيل الإصلاح
fixEmptyProductNames();