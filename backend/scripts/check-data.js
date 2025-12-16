import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

dotenv.config();

const checkData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات\n');

    // Check Users
    const users = await User.find();
    console.log('👥 المستخدمين:');
    console.log(`   - إجمالي: ${users.length}`);
    console.log(`   - أدمن: ${users.filter(u => u.role === 'admin').length}`);
    console.log(`   - عملاء: ${users.filter(u => u.role === 'user').length}\n`);

    if (users.length > 0) {
      console.log('   أمثلة:');
      users.slice(0, 3).forEach(user => {
        console.log(`   - ${user.name} (${user.email}) - ${user.role}`);
      });
      console.log('');
    }

    // Check Orders
    const orders = await Order.find();
    console.log('🛒 الطلبات:');
    console.log(`   - إجمالي: ${orders.length}`);
    console.log(`   - قيد الانتظار: ${orders.filter(o => o.status === 'pending' || o.orderStatus === 'pending').length}`);
    console.log(`   - قيد المعالجة: ${orders.filter(o => o.status === 'processing' || o.orderStatus === 'processing').length}`);
    console.log(`   - مكتملة: ${orders.filter(o => o.status === 'delivered' || o.orderStatus === 'delivered').length}\n`);

    if (orders.length > 0) {
      console.log('   أمثلة:');
      orders.slice(0, 3).forEach(order => {
        console.log(`   - ${order.orderNumber || order._id} - ${order.total} ر.س - ${order.status || order.orderStatus}`);
      });
      console.log('');
    }

    // Check Products
    const products = await Product.find();
    console.log('📦 المنتجات:');
    console.log(`   - إجمالي: ${products.length}`);
    console.log(`   - متوفر: ${products.filter(p => p.stock > 0).length}`);
    console.log(`   - نفذت الكمية: ${products.filter(p => p.stock === 0).length}\n`);

    if (products.length > 0) {
      console.log('   أمثلة:');
      products.slice(0, 3).forEach(product => {
        console.log(`   - ${product.nameAr || product.name?.ar} - ${product.price} ر.س - مخزون: ${product.stock}`);
      });
      console.log('');
    }

    console.log('✅ تم الفحص بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

checkData();
