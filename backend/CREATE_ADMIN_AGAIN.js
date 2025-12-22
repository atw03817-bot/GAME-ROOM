// إنشاء حساب المدير مرة ثانية
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const createAdmin = async () => {
  try {
    console.log('👑 CREATING ADMIN ACCOUNT AGAIN');
    console.log('='.repeat(40));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const adminPhone = '0500909030';
    const adminPassword = '123456';

    // التحقق من وجود المدير
    const existingAdmin = await User.findOne({ phone: adminPhone });
    if (existingAdmin) {
      console.log('ℹ️ Admin already exists:', {
        phone: existingAdmin.phone,
        role: existingAdmin.role,
        created: existingAdmin.createdAt
      });
      return;
    }

    // إنشاء المدير
    console.log('👤 Creating admin user...');
    const admin = new User({
      phone: adminPhone,
      password: adminPassword,
      role: 'ADMIN'
    });

    await admin.save();

    console.log('✅ Admin created successfully:', {
      id: admin._id,
      phone: admin.phone,
      role: admin.role,
      created: admin.createdAt
    });

    console.log('\n🔑 Admin Login Credentials:');
    console.log(`   Phone: ${adminPhone}`);
    console.log(`   Password: ${adminPassword}`);

  } catch (error) {
    console.error('❌ Failed to create admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

createAdmin();