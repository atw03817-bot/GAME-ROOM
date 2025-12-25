// إنشاء حساب موظف صيانة
import mongoose from 'mongoose';
import User from './backend/models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createTechnicianUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // بيانات موظف الصيانة
    const technicianData = {
      phone: '0500000001', // غير هذا الرقم
      password: '123456', // غير كلمة المرور
      name: 'أحمد محمد - فني صيانة',
      email: 'technician@ab-tw.com',
      role: 'technician',
      department: 'maintenance',
      permissions: [
        'maintenance_view',
        'maintenance_create',
        'maintenance_edit'
      ],
      isActive: true
    };

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ phone: technicianData.phone });
    if (existingUser) {
      console.log('❌ المستخدم موجود بالفعل برقم الجوال:', technicianData.phone);
      return;
    }

    // إنشاء المستخدم الجديد
    const user = new User(technicianData);
    await user.save();

    console.log('✅ تم إنشاء حساب موظف الصيانة بنجاح!');
    console.log('📱 رقم الجوال:', technicianData.phone);
    console.log('🔑 كلمة المرور:', technicianData.password);
    console.log('👤 الاسم:', technicianData.name);
    console.log('🏢 القسم:', technicianData.department);
    console.log('🔧 الدور:', technicianData.role);
    console.log('✅ الصلاحيات:', technicianData.permissions.join(', '));

    console.log('\n📋 معلومات تسجيل الدخول:');
    console.log('- يمكن للموظف تسجيل الدخول باستخدام رقم الجوال وكلمة المرور');
    console.log('- سيتمكن من الوصول لقسم الصيانة فقط');
    console.log('- يمكنه عرض وإنشاء وتعديل طلبات الصيانة');
    console.log('- لا يمكنه الوصول للأقسام الأخرى (المنتجات، الطلبات، إلخ)');

  } catch (error) {
    console.error('❌ Error creating technician user:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createTechnicianUser();