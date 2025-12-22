// إنشاء حساب المدير مع اسم "مدير"
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';

dotenv.config();

const createAdminWithName = async () => {
  try {
    console.log('👑 CREATING ADMIN WITH PROPER NAME');
    console.log('='.repeat(40));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const adminPhone = '0500909030';
    const adminPassword = '123456';

    // حذف المدير إذا كان موجود
    const existingAdmin = await User.findOne({ phone: adminPhone });
    if (existingAdmin) {
      await User.deleteOne({ phone: adminPhone });
      console.log('🗑️ Deleted existing admin');
    }

    // إنشاء المدير الجديد مع اسم
    console.log('👤 Creating admin with name "مدير"...');
    const admin = new User({
      phone: adminPhone,
      password: adminPassword,
      name: 'مدير', // إضافة الاسم
      role: 'ADMIN'
    });

    await admin.save();

    console.log('✅ Admin created successfully:', {
      id: admin._id,
      phone: admin.phone,
      name: admin.name,
      displayName: admin.getDisplayName(),
      role: admin.role,
      created: admin.createdAt
    });

    console.log('\n🔑 Admin Login Credentials:');
    console.log(`   Phone: ${adminPhone}`);
    console.log(`   Password: ${adminPassword}`);
    console.log(`   Name: ${admin.name}`);

  } catch (error) {
    console.error('❌ Failed to create admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

createAdminWithName();