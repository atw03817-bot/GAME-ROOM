// تشخيص API تفاصيل الطلب
import mongoose from 'mongoose';
import Order from './models/Order.js';
import Product from './models/Product.js';
import User from './models/User.js'; // إضافة نموذج المستخدم

async function debugOrderAPI() {
  try {
    console.log('🔍 بدء تشخيص API تفاصيل الطلب...');
    
    // الاتصال بقاعدة البيانات
    const MONGODB_URI = 'mongodb+srv://atw03817_db_user:jP9AouAfbaifknI4@mobile-store-cluster.cylotee.mongodb.net/mobile_store?retryWrites=true&w=majority&appName=mobile-store-cluster';
    await mongoose.connect(MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    const orderNumber = 'ORD-1766429381174-6';
    console.log(`🔍 البحث عن الطلب: ${orderNumber}`);

    // محاكاة دالة getOrderById
    try {
      const { id } = { id: orderNumber };
      
      // البحث بواسطة orderNumber أو _id
      let order = await Order.findOne({
        $or: [
          { orderNumber: id },
          { _id: mongoose.Types.ObjectId.isValid(id) ? id : null }
        ]
      }).populate('user', 'name nameAr email phone');

      console.log('📦 نتيجة البحث:', order ? 'تم العثور على الطلب' : 'لم يتم العثور على الطلب');

      if (!order) {
        console.log('❌ الطلب غير موجود');
        
        // البحث في جميع الطلبات لمعرفة الأرقام الموجودة
        const allOrders = await Order.find({}).select('orderNumber _id').limit(10);
        console.log(`📋 إجمالي الطلبات: ${await Order.countDocuments()}`);
        console.log('📋 أرقام الطلبات الموجودة:');
        allOrders.forEach((o, index) => {
          console.log(`  ${index + 1}. ${o.orderNumber} (${o._id})`);
        });
        return;
      }

      console.log('✅ تم العثور على الطلب:');
      console.log('- ID:', order._id);
      console.log('- رقم الطلب:', order.orderNumber);
      console.log('- المستخدم:', order.user?._id || order.user);
      console.log('- عدد المنتجات:', order.items?.length || 0);
      console.log('- الحالة:', order.status);
      console.log('- حالة الطلب:', order.orderStatus);

      // تحويل إلى object عادي للتعديل
      order = order.toObject();

      // جلب تفاصيل المنتجات يدوياً
      console.log('🛍️ جلب تفاصيل المنتجات...');
      for (let i = 0; i < order.items.length; i++) {
        const item = order.items[i];
        console.log(`  المنتج ${i + 1}:`, item.product);
        
        if (item.product) {
          try {
            const product = await Product.findById(item.product);
            if (product) {
              console.log(`    ✅ تم العثور على المنتج: ${product.nameAr || product.name}`);
              order.items[i].product = product.toObject();
            } else {
              console.log(`    ❌ المنتج غير موجود في قاعدة البيانات`);
            }
          } catch (productError) {
            console.log(`    ❌ خطأ في جلب المنتج:`, productError.message);
          }
        }
      }

      console.log('✅ تم معالجة جميع المنتجات بنجاح');
      console.log('📊 ملخص النتيجة:');
      console.log('- رقم الطلب:', order.orderNumber);
      console.log('- إجمالي المبلغ:', order.total);
      console.log('- عدد المنتجات المعالجة:', order.items.length);

    } catch (error) {
      console.error('❌ خطأ في محاكاة API:', error.message);
      console.error('📋 Stack trace:', error.stack);
    }

  } catch (error) {
    console.error('❌ خطأ عام في التشخيص:', error.message);
    console.error('📋 تفاصيل الخطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

debugOrderAPI();