import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

dotenv.config();

// الاتصال بقاعدة البيانات
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB متصل بنجاح'))
  .catch((err) => console.error('❌ خطأ في الاتصال بـ MongoDB:', err));

const checkData = async () => {
  try {
    console.log('🔍 فحص البيانات الحقيقية في قاعدة البيانات...\n');

    // فحص الطلبات
    const totalOrders = await Order.countDocuments();
    const paidOrders = await Order.countDocuments({ paymentStatus: { $in: ['paid', 'approved'] } });
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: { $in: ['paid', 'approved'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    console.log('📊 إحصائيات الطلبات:');
    console.log(`   - إجمالي الطلبات: ${totalOrders}`);
    console.log(`   - الطلبات المدفوعة: ${paidOrders}`);
    console.log(`   - إجمالي الإيرادات: ${totalRevenue[0]?.total || 0} ر.س\n`);

    // فحص العملاء
    const totalUsers = await User.countDocuments({ role: { $in: ['USER', 'customer'] } });
    const usersWithOrders = await Order.distinct('user').then(users => users.length);

    console.log('👥 إحصائيات العملاء:');
    console.log(`   - إجمالي العملاء: ${totalUsers}`);
    console.log(`   - عملاء لديهم طلبات: ${usersWithOrders}`);
    console.log(`   - معدل التحويل: ${totalUsers > 0 ? ((usersWithOrders / totalUsers) * 100).toFixed(1) : 0}%\n`);

    // فحص المنتجات
    const totalProducts = await Product.countDocuments();
    const productsInStock = await Product.countDocuments({ stock: { $gt: 0 } });

    console.log('🛍️ إحصائيات المنتجات:');
    console.log(`   - إجمالي المنتجات: ${totalProducts}`);
    console.log(`   - منتجات متوفرة: ${productsInStock}`);
    console.log(`   - منتجات نفدت: ${totalProducts - productsInStock}\n`);

    // عرض آخر 5 طلبات
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('orderNumber total paymentStatus orderStatus createdAt');

    console.log('📋 آخر 5 طلبات:');
    recentOrders.forEach((order, index) => {
      console.log(`   ${index + 1}. ${order.orderNumber} - ${order.total} ر.س - ${order.paymentStatus} - ${order.createdAt.toLocaleDateString('ar-SA')}`);
    });

    if (totalOrders === 0) {
      console.log('\n⚠️  لا توجد طلبات في قاعدة البيانات!');
      console.log('💡 هذا يفسر سبب ظهور البيانات كأصفار في التحليلات.');
      console.log('💡 لإنشاء بيانات تجريبية، يمكنك إضافة طلبات من لوحة الإدارة.');
    }

    if (totalUsers === 0) {
      console.log('\n⚠️  لا توجد عملاء مسجلون في قاعدة البيانات!');
      console.log('💡 يجب تسجيل عملاء جدد لرؤية إحصائيات العملاء.');
    }

  } catch (error) {
    console.error('❌ خطأ في فحص البيانات:', error);
  } finally {
    mongoose.connection.close();
  }
};

checkData();