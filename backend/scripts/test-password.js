import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function testPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    const user = await User.findOne({ email: 'admin@ab-tw.com' });

    if (!user) {
      console.log('❌ المستخدم غير موجود');
      process.exit(1);
    }

    console.log('✅ المستخدم موجود');
    console.log('Password Hash:', user.password);

    // Test password
    const testPassword = '123456';
    console.log('\n🔐 Testing password:', testPassword);
    
    const isMatch = await bcrypt.compare(testPassword, user.password);
    console.log('Result:', isMatch ? '✅ صحيحة' : '❌ خاطئة');

    // Test with comparePassword method
    const isMatch2 = await user.comparePassword(testPassword);
    console.log('Result (method):', isMatch2 ? '✅ صحيحة' : '❌ خاطئة');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

testPassword();
