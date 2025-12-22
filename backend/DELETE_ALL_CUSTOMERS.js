// حذف جميع العملاء والاحتفاظ بالمدير فقط
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Order from './models/Order.js';

dotenv.config();

const deleteAllCustomers = async () => {
  try {
    console.log('🗑️ DELETING ALL CUSTOMERS (KEEPING ADMIN ONLY)');
    console.log('='.repeat(50));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // 1. عرض المستخدمين الحاليين
    console.log('\n1️⃣ Current users:');
    const allUsers = await User.find().select('phone name role createdAt');
    allUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. Phone: ${user.phone}, Name: ${user.name || 'N/A'}, Role: ${user.role}`);
    });

    // 2. حذف جميع الطلبات أولاً
    console.log('\n2️⃣ Deleting all orders...');
    const orderDeleteResult = await Order.deleteMany({});
    console.log(`🗑️ Deleted ${orderDeleteResult.deletedCount} orders`);

    // 3. حذف جميع العملاء (الاحتفاظ بالمدير فقط)
    console.log('\n3️⃣ Deleting all customers (keeping admin only)...');
    const customerDeleteResult = await User.deleteMany({ 
      role: { $in: ['USER', 'customer'] } 
    });
    console.log(`🗑️ Deleted ${customerDeleteResult.deletedCount} customers`);

    // 4. التأكد من وجود المدير
    console.log('\n4️⃣ Checking admin account...');
    const adminCount = await User.countDocuments({ role: 'ADMIN' });
    console.log(`👑 Admin accounts: ${adminCount}`);

    if (adminCount === 0) {
      console.log('⚠️ No admin found! Creating admin account...');
      const admin = new User({
        phone: '0500909030',
        password: '123456',
        name: 'مدير',
        role: 'ADMIN'
      });
      await admin.save();
      console.log('✅ Admin account created');
    }

    // 5. إحصائيات نهائية
    console.log('\n5️⃣ Final statistics:');
    const finalStats = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'ADMIN' }),
      User.countDocuments({ role: { $in: ['USER', 'customer'] } }),
      Order.countDocuments()
    ]);

    console.log(`📊 Total users: ${finalStats[0]}`);
    console.log(`👑 Admins: ${finalStats[1]}`);
    console.log(`👥 Customers: ${finalStats[2]}`);
    console.log(`📦 Orders: ${finalStats[3]}`);

    // 6. عرض المستخدمين المتبقيين
    console.log('\n6️⃣ Remaining users:');
    const remainingUsers = await User.find().select('phone name role');
    remainingUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. Phone: ${user.phone}, Name: ${user.name || 'N/A'}, Role: ${user.role}`);
    });

    console.log('\n✅ All customers deleted successfully!');
    console.log('🎯 Dashboard should now show 0 customers');

  } catch (error) {
    console.error('❌ Delete operation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

deleteAllCustomers();