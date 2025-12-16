import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    const user = await User.findOne({ email: 'admin@ab-tw.com' });

    if (user) {
      console.log('✅ المستخدم موجود:');
      console.log('ID:', user._id);
      console.log('Name:', user.name);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Password Hash:', user.password.substring(0, 20) + '...');
      console.log('Phone:', user.phone);
    } else {
      console.log('❌ المستخدم غير موجود');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error.message);
    process.exit(1);
  }
}

checkUser();
