// إصلاح طلبات Tabby الموجودة
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './backend/models/Order.js';
import Product from './backend/models/Product.js';

dotenv.config();

async function fixTabbyOrders() {
  try {
    console.log('🔍 الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // البحث عن طلبات Tabby التي تحتاج إصلاح
    const tabbyOrders = await Order.find({ 
      paymentMethod: 'tabby',
      $or: [
        { status: 'draft' },
        { status: 'pending', paymentStatus: 'pending' }
      ]
    }).populate('items.product');

    console.log(`\n🔧 تم العثور على ${tabbyOrders.length} طلب Tabby يحتاج إصلاح:`);

    for (let i = 0; i < tabbyOrders.length; i++) {
      const order = tabbyOrders[i];
      console.log(`\n${i + 1}. إصلاح طلب: ${order.orderNumber}`);
      
      let needsUpdate = false;
      
      // إصلاح الحالة
      if (order.status === 'draft' || (order.status === 'pending' && order.paymentStatus === 'pending')) {
        console.log(`   📝 تحديث الحالة من ${order.status} إلى confirmed`);
        order.status = 'confirmed';
        order.orderStatus = 'confirmed';
        order.paymentStatus = 'paid';
        order.paidAt = new Date();
        needsUpdate = true;
      }
      
      // تحديث المخزون إذا لم يتم تحديثه
      if (!order.stockUpdated) {
        console.log(`   📦 تحديث المخزون...`);
        
        for (const item of order.items) {
          if (item.product) {
            const product = await Product.findById(item.product._id);
            if (product) {
              const newStock = Math.max(0, product.stock - item.quantity);
              product.stock = newStock;
              product.sales = (product.sales || 0) + item.quantity;
              await product.save();
              console.log(`     ✅ ${product.name?.ar || product.nameAr}: ${newStock} (كان ${product.stock + item.quantity})`);
            }
          }
        }
        
        order.stockUpdated = true;
        needsUpdate = true;
      }
      
      // إضافة سجل في تاريخ الحالة
      if (needsUpdate) {
        order.statusHistory.push({
          status: 'confirmed',
          note: 'تم إصلاح الطلب تلقائياً - Tabby payment confirmed',
          date: new Date()
        });
        
        // إضافة بيانات الدفع
        order.paymentData = {
          provider: 'tabby',
          status: 'paid',
          fixedAt: new Date().toISOString(),
          note: 'Fixed automatically'
        };
        
        await order.save();
        console.log(`   ✅ تم حفظ التحديثات`);
      } else {
        console.log(`   ℹ️  الطلب لا يحتاج إصلاح`);
      }
    }

    console.log(`\n🎉 تم إصلاح ${tabbyOrders.length} طلب بنجاح!`);

    // عرض الإحصائيات النهائية
    const finalStats = await Order.aggregate([
      { $match: { paymentMethod: 'tabby' } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 الإحصائيات النهائية لطلبات Tabby:');
    console.log('=' .repeat(40));
    finalStats.forEach(stat => {
      console.log(`${stat._id}: ${stat.count}`);
    });

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 تم قطع الاتصال بقاعدة البيانات');
  }
}

// تأكيد من المستخدم
console.log('⚠️  هذا السكريبت سيقوم بإصلاح طلبات Tabby في قاعدة البيانات');
console.log('   - تحديث حالة الطلبات إلى confirmed');
console.log('   - تحديث المخزون');
console.log('   - إضافة سجلات في تاريخ الحالة');
console.log('');

// تشغيل الإصلاح
fixTabbyOrders();