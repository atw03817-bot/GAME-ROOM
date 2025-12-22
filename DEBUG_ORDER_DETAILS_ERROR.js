// تشخيص خطأ تفاصيل الطلب
import mongoose from 'mongoose';
import Order from './backend/models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

async function debugOrderDetailsError() {
  try {
    console.log('🔍 بدء تشخيص خطأ تفاصيل الطلب...');
    
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    const orderNumber = 'ORD-1766429381174-6';
    console.log(`🔍 البحث عن الطلب: ${orderNumber}`);

    // البحث بواسطة orderNumber
    const orderByNumber = await Order.findOne({ orderNumber });
    console.log('📦 البحث بواسطة orderNumber:', orderByNumber ? 'موجود' : 'غير موجود');

    if (orderByNumber) {
      console.log('📋 تفاصيل الطلب:');
      console.log('- ID:', orderByNumber._id);
      console.log('- رقم الطلب:', orderByNumber.orderNumber);
      console.log('- المستخدم:', orderByNumber.user);
      console.log('- عدد المنتجات:', orderByNumber.items?.length || 0);
      console.log('- الحالة:', orderByNumber.status);
      console.log('- حالة الطلب:', orderByNumber.orderStatus);
      
      // تحقق من المنتجات
      if (orderByNumber.items && orderByNumber.items.length > 0) {
        console.log('🛍️ المنتجات:');
        for (let i = 0; i < orderByNumber.items.length; i++) {
          const item = orderByNumber.items[i];
          console.log(`  - المنتج ${i + 1}:`, item.product);
          console.log(`    الاسم:`, item.name);
          console.log(`    الكمية:`, item.quantity);
          console.log(`    السعر:`, item.price);
        }
      }
    }

    // البحث بواسطة _id إذا كان orderNumber يشبه ObjectId
    if (mongoose.Types.ObjectId.isValid(orderNumber)) {
      const orderById = await Order.findById(orderNumber);
      console.log('📦 البحث بواسطة _id:', orderById ? 'موجود' : 'غير موجود');
    }

    // البحث في جميع الطلبات
    const allOrders = await Order.find({}).limit(5);
    console.log(`📊 إجمالي الطلبات في قاعدة البيانات: ${await Order.countDocuments()}`);
    console.log('📋 أمثلة على أرقام الطلبات:');
    allOrders.forEach((order, index) => {
      console.log(`  ${index + 1}. ${order.orderNumber} (${order._id})`);
    });

    // محاولة محاكاة الاستعلام الفعلي
    console.log('\n🧪 محاكاة الاستعلام الفعلي...');
    try {
      const testOrder = await Order.findOne({
        $or: [
          { orderNumber: orderNumber },
          { _id: orderNumber }
        ]
      }).populate('user', 'name nameAr email phone');
      
      console.log('✅ نتيجة الاستعلام:', testOrder ? 'نجح' : 'فشل');
      
      if (testOrder) {
        console.log('📋 تفاصيل الطلب المسترجع:');
        console.log('- ID:', testOrder._id);
        console.log('- رقم الطلب:', testOrder.orderNumber);
        console.log('- المستخدم:', testOrder.user);
        console.log('- عدد المنتجات:', testOrder.items?.length || 0);
      }
    } catch (queryError) {
      console.error('❌ خطأ في الاستعلام:', queryError.message);
      console.error('📋 تفاصيل الخطأ:', queryError);
    }

  } catch (error) {
    console.error('❌ خطأ في التشخيص:', error.message);
    console.error('📋 تفاصيل الخطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

debugOrderDetailsError();