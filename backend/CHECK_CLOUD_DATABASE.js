#!/usr/bin/env node

import mongoose from 'mongoose';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// رابط قاعدة البيانات السحابية
const CLOUD_MONGODB_URI = 'mongodb+srv://atw03817_db_user:jP9AouAfbaifknI4@mobile-store-cluster.cylotee.mongodb.net/mobile_store?retryWrites=true&w=majority&appName=mobile-store-cluster';

// نموذج طلب الصيانة (مبسط للفحص فقط)
const maintenanceRequestSchema = new mongoose.Schema({}, { strict: false, collection: 'maintenancerequests' });
const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceRequestSchema);

// نموذج الطلبات العادية
const orderSchema = new mongoose.Schema({}, { strict: false, collection: 'orders' });
const Order = mongoose.model('Order', orderSchema);

// نموذج المستخدمين
const userSchema = new mongoose.Schema({}, { strict: false, collection: 'users' });
const User = mongoose.model('User', userSchema);

// نموذج المنتجات
const productSchema = new mongoose.Schema({}, { strict: false, collection: 'products' });
const Product = mongoose.model('Product', productSchema);

async function checkCloudDatabase() {
  try {
    console.log('🔗 الاتصال بقاعدة البيانات السحابية...');
    console.log('☁️  MongoDB Atlas');
    console.log('='.repeat(50));

    await mongoose.connect(CLOUD_MONGODB_URI);
    console.log('✅ تم الاتصال بنجاح!');
    console.log('');

    // فحص طلبات الصيانة
    console.log('🔧 فحص طلبات الصيانة:');
    console.log('-'.repeat(30));
    
    const maintenanceCount = await MaintenanceRequest.countDocuments();
    console.log(`📊 إجمالي طلبات الصيانة: ${maintenanceCount}`);
    
    if (maintenanceCount > 0) {
      // فحص حالات طلبات الصيانة
      const statusCounts = await MaintenanceRequest.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);
      
      console.log('📈 توزيع حسب الحالة:');
      statusCounts.forEach(status => {
        console.log(`   ${status._id || 'غير محدد'}: ${status.count}`);
      });

      // أحدث 5 طلبات صيانة
      console.log('\n📋 أحدث 5 طلبات صيانة:');
      const recentMaintenance = await MaintenanceRequest.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('customerName customerPhone deviceType issueDescription status createdAt');
      
      recentMaintenance.forEach((request, index) => {
        console.log(`${index + 1}. ${request.customerName || 'غير محدد'} - ${request.deviceType || 'غير محدد'}`);
        console.log(`   الهاتف: ${request.customerPhone || 'غير محدد'}`);
        console.log(`   المشكلة: ${request.issueDescription?.substring(0, 50) || 'غير محدد'}...`);
        console.log(`   الحالة: ${request.status || 'غير محدد'}`);
        console.log(`   التاريخ: ${request.createdAt ? new Date(request.createdAt).toLocaleDateString('ar-SA') : 'غير محدد'}`);
        console.log('');
      });
    }

    console.log('');
    console.log('📊 إحصائيات عامة:');
    console.log('-'.repeat(30));
    
    // فحص الطلبات العادية
    const ordersCount = await Order.countDocuments();
    console.log(`🛒 إجمالي الطلبات: ${ordersCount}`);
    
    // فحص المستخدمين
    const usersCount = await User.countDocuments();
    console.log(`👥 إجمالي المستخدمين: ${usersCount}`);
    
    // فحص المنتجات
    const productsCount = await Product.countDocuments();
    console.log(`📱 إجمالي المنتجات: ${productsCount}`);

    console.log('');
    console.log('✅ تم الفحص بنجاح!');

  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error.message);
    
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

// تشغيل الفحص
checkCloudDatabase();