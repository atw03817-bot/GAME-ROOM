// حذف جميع الطلبات من قاعدة البيانات
import mongoose from 'mongoose';
import Order from './models/Order.js';
import Shipment from './models/Shipment.js';

async function deleteAllOrders() {
  try {
    console.log('🗑️ بدء عملية حذف جميع الطلبات...');
    
    // الاتصال بقاعدة البيانات
    const MONGODB_URI = 'mongodb+srv://atw03817_db_user:jP9AouAfbaifknI4@mobile-store-cluster.cylotee.mongodb.net/mobile_store?retryWrites=true&w=majority&appName=mobile-store-cluster';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // عرض إحصائيات قبل الحذف
    const ordersCount = await Order.countDocuments();
    const shipmentsCount = await Shipment.countDocuments();
    
    console.log(`📊 الإحصائيات الحالية:`);
    console.log(`   - عدد الطلبات: ${ordersCount}`);
    console.log(`   - عدد الشحنات: ${shipmentsCount}`);

    if (ordersCount === 0 && shipmentsCount === 0) {
      console.log('ℹ️ لا توجد طلبات أو شحنات للحذف');
      return;
    }

    // عرض بعض الطلبات الموجودة
    if (ordersCount > 0) {
      console.log('\n📋 أمثلة على الطلبات الموجودة:');
      const sampleOrders = await Order.find({}).select('orderNumber createdAt total').limit(5);
      sampleOrders.forEach((order, index) => {
        console.log(`   ${index + 1}. ${order.orderNumber} - ${order.total} ر.س - ${new Date(order.createdAt).toLocaleDateString('ar-SA')}`);
      });
    }

    // تأكيد الحذف
    console.log('\n⚠️ تحذير: هذه العملية ستحذف جميع الطلبات والشحنات نهائياً!');
    console.log('🔄 بدء عملية الحذف...');

    // حذف جميع الشحنات أولاً
    if (shipmentsCount > 0) {
      const deletedShipments = await Shipment.deleteMany({});
      console.log(`✅ تم حذف ${deletedShipments.deletedCount} شحنة`);
    }

    // حذف جميع الطلبات
    if (ordersCount > 0) {
      const deletedOrders = await Order.deleteMany({});
      console.log(`✅ تم حذف ${deletedOrders.deletedCount} طلب`);
    }

    // التحقق من النتيجة
    const remainingOrders = await Order.countDocuments();
    const remainingShipments = await Shipment.countDocuments();

    console.log('\n📊 النتيجة النهائية:');
    console.log(`   - الطلبات المتبقية: ${remainingOrders}`);
    console.log(`   - الشحنات المتبقية: ${remainingShipments}`);

    if (remainingOrders === 0 && remainingShipments === 0) {
      console.log('🎉 تم حذف جميع الطلبات والشحنات بنجاح!');
    } else {
      console.log('⚠️ لم يتم حذف جميع البيانات، قد تحتاج لإعادة المحاولة');
    }

  } catch (error) {
    console.error('❌ خطأ في حذف الطلبات:', error.message);
    console.error('📋 تفاصيل الخطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

// تشغيل الدالة
deleteAllOrders();