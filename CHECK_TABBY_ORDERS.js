// فحص طلبات Tabby في قاعدة البيانات
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './backend/models/Order.js';

dotenv.config();

async function checkTabbyOrders() {
  try {
    console.log('🔍 الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // البحث عن طلبات Tabby
    const tabbyOrders = await Order.find({ 
      paymentMethod: 'tabby' 
    }).sort('-createdAt');

    console.log(`\n📊 تم العثور على ${tabbyOrders.length} طلب Tabby:`);
    console.log('=' .repeat(80));

    tabbyOrders.forEach((order, index) => {
      console.log(`\n${index + 1}. طلب رقم: ${order.orderNumber}`);
      console.log(`   ID: ${order._id}`);
      console.log(`   الحالة: ${order.status}`);
      console.log(`   حالة الدفع: ${order.paymentStatus}`);
      console.log(`   المخزون محدث: ${order.stockUpdated ? 'نعم' : 'لا'}`);
      console.log(`   تاريخ الإنشاء: ${order.createdAt}`);
      console.log(`   تاريخ الدفع: ${order.paidAt || 'لم يدفع بعد'}`);
      console.log(`   المجموع: ${order.total} ر.س`);
      
      if (order.paymentData) {
        console.log(`   بيانات الدفع: ${JSON.stringify(order.paymentData, null, 2)}`);
      }
      
      if (order.statusHistory && order.statusHistory.length > 0) {
        console.log(`   تاريخ الحالة:`);
        order.statusHistory.forEach((history, i) => {
          console.log(`     ${i + 1}. ${history.status} - ${history.note} (${history.date})`);
        });
      }
    });

    // إحصائيات
    const draftOrders = tabbyOrders.filter(o => o.status === 'draft').length;
    const pendingOrders = tabbyOrders.filter(o => o.status === 'pending').length;
    const confirmedOrders = tabbyOrders.filter(o => o.status === 'confirmed').length;
    const paidOrders = tabbyOrders.filter(o => o.paymentStatus === 'paid').length;
    const stockUpdatedOrders = tabbyOrders.filter(o => o.stockUpdated).length;

    console.log('\n📈 الإحصائيات:');
    console.log('=' .repeat(40));
    console.log(`مسودة (draft): ${draftOrders}`);
    console.log(`قيد الانتظار (pending): ${pendingOrders}`);
    console.log(`مؤكدة (confirmed): ${confirmedOrders}`);
    console.log(`مدفوعة: ${paidOrders}`);
    console.log(`المخزون محدث: ${stockUpdatedOrders}`);

    // اقتراحات للإصلاح
    console.log('\n💡 اقتراحات للإصلاح:');
    console.log('=' .repeat(40));
    
    if (draftOrders > 0) {
      console.log(`⚠️  يوجد ${draftOrders} طلب مسودة - قد تحتاج لتأكيدها يدوياً`);
    }
    
    if (pendingOrders > paidOrders) {
      console.log(`⚠️  يوجد ${pendingOrders - paidOrders} طلب pending لكن غير مدفوع`);
    }
    
    if (paidOrders > stockUpdatedOrders) {
      console.log(`⚠️  يوجد ${paidOrders - stockUpdatedOrders} طلب مدفوع لكن المخزون غير محدث`);
    }

    // البحث عن جميع الطلبات للمقارنة
    const allOrders = await Order.countDocuments();
    const codOrders = await Order.countDocuments({ paymentMethod: 'cod' });
    const tamaraOrders = await Order.countDocuments({ paymentMethod: 'tamara' });
    const tapOrders = await Order.countDocuments({ paymentMethod: 'tap' });

    console.log('\n📊 مقارنة طرق الدفع:');
    console.log('=' .repeat(40));
    console.log(`إجمالي الطلبات: ${allOrders}`);
    console.log(`الدفع عند الاستلام: ${codOrders}`);
    console.log(`تمارا: ${tamaraOrders}`);
    console.log(`تاب: ${tapOrders}`);
    console.log(`تابي: ${tabbyOrders.length}`);

  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 تم قطع الاتصال بقاعدة البيانات');
  }
}

checkTabbyOrders();