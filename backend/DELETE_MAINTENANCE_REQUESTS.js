#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// رابط قاعدة البيانات السحابية
const CLOUD_MONGODB_URI = 'mongodb+srv://atw03817_db_user:jP9AouAfbaifknI4@mobile-store-cluster.cylotee.mongodb.net/mobile_store?retryWrites=true&w=majority&appName=mobile-store-cluster';

// نموذج طلب الصيانة
const maintenanceRequestSchema = new mongoose.Schema({}, { strict: false, collection: 'maintenancerequests' });
const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

async function deleteMaintenanceRequests() {
  try {
    console.log('🔗 الاتصال بقاعدة البيانات السحابية...');
    console.log('☁️  MongoDB Atlas');
    console.log('='.repeat(50));

    await mongoose.connect(CLOUD_MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح!');
    console.log('');

    // عد طلبات الصيانة قبل الحذف
    const countBefore = await MaintenanceRequest.countDocuments();
    console.log(`📊 عدد طلبات الصيانة قبل الحذف: ${countBefore}`);
    
    if (countBefore === 0) {
      console.log('ℹ️  لا توجد طلبات صيانة للحذف');
      return;
    }

    console.log('');
    console.log('⚠️  تحذير: سيتم حذف جميع طلبات الصيانة!');
    console.log('🗑️  جاري الحذف...');
    console.log('');

    // حذف جميع طلبات الصيانة
    const deleteResult = await MaintenanceRequest.deleteMany({});
    
    console.log('✅ تم الحذف بنجاح!');
    console.log(`🗑️  تم حذف ${deleteResult.deletedCount} طلب صيانة`);
    
    // التأكد من الحذف
    const countAfter = await MaintenanceRequest.countDocuments();
    console.log(`📊 عدد طلبات الصيانة بعد الحذف: ${countAfter}`);
    
    if (countAfter === 0) {
      console.log('✅ تم حذف جميع طلبات الصيانة بنجاح!');
    } else {
      console.log(`⚠️  تبقى ${countAfter} طلب صيانة لم يتم حذفها`);
    }

    console.log('');
    console.log('ℹ️  ملاحظة: تم حذف طلبات الصيانة فقط');
    console.log('ℹ️  الطلبات العادية والمستخدمين والمنتجات لم تتأثر');

  } catch (error) {
    console.error('❌ خطأ في العملية:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.log('💡 السبب: خطأ في بيانات المصادقة');
      console.log('🔧 الحل: تحقق من اسم المستخدم وكلمة المرور');
    } else if (error.message.includes('network')) {
      console.log('💡 السبب: خطأ في الشبكة');
      console.log('🔧 الحل: تحقق من الاتصال بالإنترنت');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال');
  }
}

// تشغيل الحذف
deleteMaintenanceRequests();