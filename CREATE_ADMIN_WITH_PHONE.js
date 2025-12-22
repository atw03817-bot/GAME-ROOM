// إنشاء حساب مدير جديد برقم الجوال فقط
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './backend/models/User.js';

const createAdminWithPhone = async () => {
  try {
    // الاتصال بقاعدة البيانات
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store';
    await mongoose.connect(mongoUri);
    
    console.log('🔗 متصل بقاعدة البيانات');
    
    // بيانات المدير الجديد - فقط رقم الجوال وكلمة المرور
    const adminData = {
      phone: '0501234567', // غير هذا الرقم
      password: 'admin123456', // غير كلمة المرور
      role: 'ADMIN'
    };
    
    console.log('📝 بيانات المدير:');
    console.log(`رقم الجوال: ${adminData.phone}`);
    console.log(`كلمة المرور: ${adminData.password}`);
    
    // التحقق من وجود المدير
    const existingAdmin = await User.findOne({ phone: adminData.phone });
    
    if (existingAdmin) {
      console.log('⚠️ يوجد مستخدم بنفس رقم الجوال');
      console.log('بيانات المستخدم الموجود:');
      console.log(`الاسم: ${existingAdmin.getDisplayName()}`);
      console.log(`الدور: ${existingAdmin.role}`);
      console.log(`تاريخ الإنشاء: ${existingAdmin.createdAt}`);
      
      // تحديث الدور إلى مدير إذا لم يكن كذلك
      if (existingAdmin.role !== 'ADMIN') {
        existingAdmin.role = 'ADMIN';
        await existingAdmin.save();
        console.log('✅ تم تحديث دور المستخدم إلى مدير');
      }
      
      return;
    }
    
    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    
    // إنشاء المدير
    const admin = new User({
      phone: adminData.phone,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      phoneVerified: true
    });
    
    await admin.save();
    
    console.log('🎉 تم إنشاء حساب المدير بنجاح!');
    console.log('');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log(`رقم الجوال: ${adminData.phone}`);
    console.log(`كلمة المرور: ${adminData.password}`);
    console.log('');
    console.log('🔗 رابط تسجيل الدخول: http://localhost:5173/login');
    console.log('');
    console.log('💡 ملاحظة: الاسم سيظهر كـ "عميل ' + adminData.phone + '" حتى يتم إضافة عنوان شحن');
    console.log('⚠️ تأكد من تغيير كلمة المرور بعد تسجيل الدخول');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء المدير:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
};

// تشغيل الدالة
createAdminWithPhone();