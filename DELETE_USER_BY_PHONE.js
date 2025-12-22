// حذف مستخدم برقم الجوال
import mongoose from 'mongoose';
import User from './backend/models/User.js';

const deleteUserByPhone = async () => {
  try {
    // الاتصال بقاعدة البيانات
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store';
    await mongoose.connect(mongoUri);
    
    console.log('🔗 متصل بقاعدة البيانات');
    
    // رقم الجوال المراد حذفه
    const phoneToDelete = '0539796962'; // غير هذا الرقم إذا لزم الأمر
    
    console.log(`🔍 البحث عن مستخدم برقم: ${phoneToDelete}`);
    
    const user = await User.findOne({ phone: phoneToDelete });
    
    if (!user) {
      console.log('❌ لم يتم العثور على مستخدم بهذا الرقم');
      return;
    }
    
    console.log('\n📋 بيانات المستخدم:');
    console.log(`ID: ${user._id}`);
    console.log(`الاسم: ${user.name || 'غير محدد'}`);
    console.log(`الدور: ${user.role}`);
    console.log(`تاريخ الإنشاء: ${user.createdAt}`);
    console.log(`نشط: ${user.isActive}`);
    
    // حذف المستخدم
    await User.deleteOne({ _id: user._id });
    
    console.log('\n✅ تم حذف المستخدم بنجاح!');
    console.log('يمكنك الآن إنشاء حساب جديد بنفس رقم الجوال');
    
  } catch (error) {
    console.error('❌ خطأ في حذف المستخدم:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
};

// تشغيل الحذف
deleteUserByPhone();