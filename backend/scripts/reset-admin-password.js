import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function resetPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    const user = await User.findOne({ email: 'admin@ab-tw.com' });

    if (!user) {
      console.log('❌ المستخدم غير موجود');
      process.exit(1);
    }

    // Update password directly (bypass pre-save hook)
    const newPassword = '123456';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await User.updateOne(
      { email: 'admin@ab-tw.com' },
      { $set: { password: hashedPassword, role: 'ADMIN' } }
    );

    console.log('✅ تم تحديث كلمة المرور بنجاح!');
    console.log('');
    console.log('📧 البريد: admin@ab-tw.com');
    console.log('🔑 كلمة المرور: 123456');
    console.log('👤 الدور: ADMIN');

    // Test the new password
    const updatedUser = await User.findOne({ email: 'admin@ab-tw.com' });
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log('');
    console.log('✅ اختبار كلمة المرور:', isMatch ? 'نجح' : 'فشل');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

resetPassword();
