// تنظيف قاعدة البيانات - حذف الطلبات وإصلاح عدد العملاء
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Order from './models/Order.js';

dotenv.config();

const cleanDatabase = async () => {
  try {
    console.log('🧹 CLEANING DATABASE');
    console.log('='.repeat(40));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // 1. حذف جميع الطلبات
    console.log('\n1️⃣ Deleting all orders...');
    const orderDeleteResult = await Order.deleteMany({});
    console.log(`🗑️ Deleted ${orderDeleteResult.deletedCount} orders`);

    // 2. عرض إحصائيات المستخدمين الحالية
    console.log('\n2️⃣ Current user statistics:');
    
    const totalUsers = await User.countDocuments();
    const adminUsers = await User.countDocuments({ role: 'ADMIN' });
    const regularUsers = await User.countDocuments({ role: 'USER' });
    const customerUsers = await User.countDocuments({ role: 'customer' });
    const otherRoles = await User.countDocuments({ role: { $nin: ['ADMIN', 'USER', 'customer'] } });

    console.log(`📊 Total users: ${totalUsers}`);
    console.log(`👑 Admin users: ${adminUsers}`);
    console.log(`👤 USER role: ${regularUsers}`);
    console.log(`🛒 customer role: ${customerUsers}`);
    console.log(`❓ Other roles: ${otherRoles}`);

    // 3. عرض عينة من المستخدمين
    console.log('\n3️⃣ Sample users:');
    const sampleUsers = await User.find().limit(10).select('phone name role createdAt');
    sampleUsers.forEach((user, index) => {
      console.log(`   ${index + 1}. Phone: ${user.phone}, Name: ${user.name || 'N/A'}, Role: ${user.role}, Created: ${user.createdAt?.toISOString().split('T')[0]}`);
    });

    // 4. البحث عن مستخدمين مكررين
    console.log('\n4️⃣ Checking for duplicate users...');
    const duplicatePhones = await User.aggregate([
      { $group: { _id: '$phone', count: { $sum: 1 }, users: { $push: '$_id' } } },
      { $match: { count: { $gt: 1 } } }
    ]);

    if (duplicatePhones.length > 0) {
      console.log(`⚠️ Found ${duplicatePhones.length} duplicate phone numbers:`);
      duplicatePhones.forEach((dup, index) => {
        console.log(`   ${index + 1}. Phone: ${dup._id}, Count: ${dup.count}`);
      });

      // حذف المستخدمين المكررين (الاحتفاظ بالأحدث)
      for (const dup of duplicatePhones) {
        const usersToDelete = dup.users.slice(0, -1); // حذف الكل عدا الأخير
        await User.deleteMany({ _id: { $in: usersToDelete } });
        console.log(`🗑️ Deleted ${usersToDelete.length} duplicate users for phone: ${dup._id}`);
      }
    } else {
      console.log('✅ No duplicate phone numbers found');
    }

    // 5. إحصائيات نهائية
    console.log('\n5️⃣ Final statistics:');
    const finalTotalUsers = await User.countDocuments();
    const finalCustomers = await User.countDocuments({ role: { $in: ['USER', 'customer'] } });
    const finalAdmins = await User.countDocuments({ role: 'ADMIN' });

    console.log(`📊 Final total users: ${finalTotalUsers}`);
    console.log(`👥 Final customers: ${finalCustomers}`);
    console.log(`👑 Final admins: ${finalAdmins}`);
    console.log(`🗑️ Total orders: ${await Order.countDocuments()}`);

    console.log('\n✅ Database cleanup completed!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

cleanDatabase();