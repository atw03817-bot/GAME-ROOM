import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function createAdmin() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    // Check if admin exists
    const existingAdmin = await User.findOne({ email: 'admin@ab-tw.com' });

    if (existingAdmin) {
      console.log('⚠️  حساب الأدمن موجود مسبقاً');
      console.log('📧 البريد: admin@ab-tw.com');
      console.log('🔑 كلمة المرور: 123456');
      console.log('👤 الدور: ADMIN');
      process.exit(0);
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('123456', 10);

    const adminUser = new User({
      email: 'admin@ab-tw.com',
      password: hashedPassword,
      name: 'المدير',
      phone: '0500000000',
      role: 'ADMIN',
    });

    await adminUser.save();

    console.log('✅ تم إنشاء حساب الأدمن بنجاح!');
    console.log('');
    console.log('📧 البريد: admin@ab-tw.com');
    console.log('🔑 كلمة المرور: 123456');
    console.log('👤 الدور: ADMIN');
    console.log('');
    console.log('يمكنك الآن تسجيل الدخول من: http://localhost:5173/login');

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

createAdmin();
