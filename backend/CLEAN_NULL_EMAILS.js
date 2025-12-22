// تنظيف المستخدمين الذين عندهم email: null
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const cleanNullEmails = async () => {
  try {
    console.log('🧹 CLEANING NULL EMAIL USERS');
    console.log('='.repeat(40));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // البحث عن المستخدمين الذين عندهم email: null
    const nullEmailUsers = await User.find({ email: null });
    console.log(`📊 Found ${nullEmailUsers.length} users with email: null`);

    if (nullEmailUsers.length > 0) {
      console.log('👥 Users with null email:');
      nullEmailUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. Phone: ${user.phone}, Role: ${user.role}, Created: ${user.createdAt}`);
      });

      // تحديث email إلى undefined بدلاً من null
      const result = await User.updateMany(
        { email: null },
        { $unset: { email: 1 } } // حذف الحقل بالكامل
      );

      console.log(`✅ Updated ${result.modifiedCount} users`);
    } else {
      console.log('✅ No users with null email found');
    }

    // التحقق من النتيجة
    const remainingNullEmails = await User.find({ email: null });
    console.log(`📊 Remaining users with null email: ${remainingNullEmails.length}`);

    console.log('\n✅ Cleanup completed!');

  } catch (error) {
    console.error('❌ Cleanup failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

cleanNullEmails();