// تحديث schema المستخدمين لدعم الأدوار والصلاحيات الجديدة
import mongoose from 'mongoose';
import User from './backend/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function updateUserSchema() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // جلب جميع المستخدمين
    const users = await User.find({});
    console.log(`📋 Found ${users.length} users to update`);

    let updatedCount = 0;

    for (const user of users) {
      let needsUpdate = false;
      
      // تحديث الأدوار القديمة
      if (user.role === 'USER') {
        user.role = 'customer';
        needsUpdate = true;
      } else if (user.role === 'ADMIN') {
        user.role = 'admin';
        needsUpdate = true;
      }

      // إضافة الحقول الجديدة إذا لم تكن موجودة
      if (!user.permissions) {
        user.permissions = [];
        needsUpdate = true;
      }

      if (!user.department) {
        // تعيين قسم افتراضي حسب الدور
        if (user.role === 'admin') {
          user.department = 'admin';
        } else if (user.role === 'technician') {
          user.department = 'maintenance';
        } else {
          user.department = null;
        }
        needsUpdate = true;
      }

      if (needsUpdate) {
        await user.save();
        updatedCount++;
        console.log(`✅ Updated user: ${user.phone} (${user.role})`);
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} users successfully`);
    
    // عرض ملخص المستخدمين
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('\n📊 User roles summary:');
    roleStats.forEach(stat => {
      console.log(`   ${stat._id}: ${stat.count} users`);
    });

  } catch (error) {
    console.error('❌ Error updating user schema:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

updateUserSchema();