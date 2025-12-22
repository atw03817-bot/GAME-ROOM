// فحص وحذف المستخدمين المكررين
import mongoose from 'mongoose';
import User from './backend/models/User.js';

const checkDuplicateUsers = async () => {
  try {
    // الاتصال بقاعدة البيانات
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store';
    await mongoose.connect(mongoUri);
    
    console.log('🔗 متصل بقاعدة البيانات');
    
    // البحث عن المستخدمين المكررين برقم الجوال
    const duplicatePhones = await User.aggregate([
      {
        $group: {
          _id: "$phone",
          count: { $sum: 1 },
          users: { $push: { id: "$_id", name: "$name", role: "$role", createdAt: "$createdAt" } }
        }
      },
      {
        $match: {
          count: { $gt: 1 }
        }
      }
    ]);
    
    console.log(`📱 تم العثور على ${duplicatePhones.length} رقم جوال مكرر`);
    
    if (duplicatePhones.length === 0) {
      console.log('✅ لا توجد أرقام جوال مكررة');
      
      // فحص المستخدم المحدد
      const specificUser = await User.findOne({ phone: "0539796962" });
      if (specificUser) {
        console.log('\n📋 بيانات المستخدم الموجود برقم 0539796962:');
        console.log(`ID: ${specificUser._id}`);
        console.log(`الاسم: ${specificUser.name || 'غير محدد'}`);
        console.log(`الدور: ${specificUser.role}`);
        console.log(`تاريخ الإنشاء: ${specificUser.createdAt}`);
        console.log(`نشط: ${specificUser.isActive}`);
        
        console.log('\n❓ هل تريد حذف هذا المستخدم؟');
        console.log('إذا كان نعم، قم بتشغيل: DELETE_USER_BY_PHONE.js');
      } else {
        console.log('❌ لم يتم العثور على مستخدم برقم 0539796962');
      }
      
      return;
    }
    
    // عرض المستخدمين المكررين
    duplicatePhones.forEach((phoneGroup, index) => {
      console.log(`\n--- رقم ${index + 1}: ${phoneGroup._id} ---`);
      console.log(`عدد المستخدمين: ${phoneGroup.count}`);
      
      phoneGroup.users.forEach((user, userIndex) => {
        console.log(`  ${userIndex + 1}. ID: ${user.id}`);
        console.log(`     الاسم: ${user.name || 'غير محدد'}`);
        console.log(`     الدور: ${user.role}`);
        console.log(`     تاريخ الإنشاء: ${user.createdAt}`);
      });
    });
    
    console.log('\n🔧 لحل هذه المشكلة:');
    console.log('1. احتفظ بأحدث مستخدم لكل رقم جوال');
    console.log('2. احذف المستخدمين الأقدم');
    console.log('3. أو قم بتشغيل: CLEAN_DUPLICATE_USERS.js');
    
  } catch (error) {
    console.error('❌ خطأ في فحص المستخدمين:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
};

// تشغيل الفحص
checkDuplicateUsers();