// إنشاء حساب مدير على السيرفر Ubuntu
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// نموذج المستخدم
const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  isActive: { type: Boolean, default: true },
  phoneVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

// إضافة دالة getDisplayName
userSchema.methods.getDisplayName = function() {
  return `عميل ${this.phone}`;
};

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    console.log('🔗 الاتصال بقاعدة البيانات...');
    console.log(`📍 MongoDB URI: ${process.env.MONGODB_URI ? 'موجود' : 'غير موجود'}`);
    
    if (!process.env.MONGODB_URI) {
      console.error('❌ متغير MONGODB_URI غير موجود في ملف .env');
      console.log('💡 تأكد من وجود ملف .env مع MONGODB_URI');
      return;
    }
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');

    // بيانات المدير - غير هذه البيانات حسب احتياجك
    const adminData = {
      phone: '0501234567', // ضع رقم جوالك هنا
      password: 'Admin@123456', // ضع كلمة مرور قوية
      role: 'ADMIN'
    };

    console.log('');
    console.log('📝 بيانات المدير المطلوب إنشاؤه:');
    console.log(`📱 رقم الجوال: ${adminData.phone}`);
    console.log(`🔐 كلمة المرور: ${adminData.password}`);
    console.log(`👤 الدور: ${adminData.role}`);
    console.log('');

    // التحقق من وجود مستخدم بنفس رقم الجوال
    console.log('🔍 البحث عن مستخدم موجود...');
    const existingUser = await User.findOne({ phone: adminData.phone });
    
    if (existingUser) {
      console.log('⚠️ يوجد مستخدم بنفس رقم الجوال');
      console.log(`📋 معلومات المستخدم الموجود:`);
      console.log(`   - الاسم: ${existingUser.getDisplayName()}`);
      console.log(`   - الدور: ${existingUser.role}`);
      console.log(`   - تاريخ الإنشاء: ${existingUser.createdAt}`);
      console.log(`   - نشط: ${existingUser.isActive ? 'نعم' : 'لا'}`);
      
      if (existingUser.role !== 'ADMIN') {
        console.log('');
        console.log('🔄 تحديث دور المستخدم إلى مدير...');
        existingUser.role = 'ADMIN';
        await existingUser.save();
        console.log('✅ تم تحديث دور المستخدم إلى مدير بنجاح');
      } else {
        console.log('✅ المستخدم مدير بالفعل - لا حاجة للتحديث');
      }
      
      console.log('');
      console.log('🔗 يمكنك الآن تسجيل الدخول باستخدام:');
      console.log(`   📱 رقم الجوال: ${adminData.phone}`);
      console.log(`   🔐 كلمة المرور: كلمة المرور الحالية`);
      console.log(`   🌐 الرابط: https://www.ab-tw.com/login`);
      return;
    }

    console.log('👤 لم يتم العثور على مستخدم - سيتم إنشاء حساب جديد');
    console.log('');

    // تشفير كلمة المرور
    console.log('🔐 تشفير كلمة المرور...');
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    console.log('✅ تم تشفير كلمة المرور');

    // إنشاء المدير الجديد
    console.log('👤 إنشاء حساب المدير...');
    const admin = new User({
      phone: adminData.phone,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      phoneVerified: true
    });

    await admin.save();
    console.log('✅ تم حفظ المدير في قاعدة البيانات');

    console.log('');
    console.log('🎉 تم إنشاء حساب المدير بنجاح!');
    console.log('');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log(`📱 رقم الجوال: ${adminData.phone}`);
    console.log(`🔐 كلمة المرور: ${adminData.password}`);
    console.log(`👤 الدور: ${adminData.role}`);
    console.log('');
    console.log('🔗 روابط مهمة:');
    console.log(`   🌐 تسجيل الدخول: https://www.ab-tw.com/login`);
    console.log(`   ⚙️  لوحة الإدارة: https://www.ab-tw.com/admin`);
    console.log(`   🏠 الموقع الرئيسي: https://www.ab-tw.com`);
    console.log('');
    console.log('⚠️ ملاحظات مهمة:');
    console.log('   1. غير كلمة المرور بعد تسجيل الدخول');
    console.log('   2. تأكد من إعداد بيانات المتجر');
    console.log('   3. راجع إعدادات الأمان');
    console.log('');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المدير:', error);
    
    if (error.code === 11000) {
      console.log('');
      console.log('💡 السبب: رقم الجوال مستخدم بالفعل');
      console.log('🔧 الحل: استخدم رقم جوال آخر أو احذف المستخدم الموجود');
    } else if (error.name === 'ValidationError') {
      console.log('');
      console.log('💡 السبب: خطأ في التحقق من البيانات');
      console.log('🔧 الحل: تأكد من صحة رقم الجوال وكلمة المرور');
    } else if (error.name === 'MongoNetworkError') {
      console.log('');
      console.log('💡 السبب: خطأ في الاتصال بقاعدة البيانات');
      console.log('🔧 الحل: تأكد من أن MongoDB يعمل وأن الاتصال صحيح');
    }
    
  } finally {
    try {
      await mongoose.disconnect();
      console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
    } catch (disconnectError) {
      console.error('⚠️ خطأ في قطع الاتصال:', disconnectError.message);
    }
  }
};

// معلومات النظام
console.log('🚀 سكريبت إنشاء حساب المدير');
console.log('📅 التاريخ:', new Date().toLocaleString('ar-SA'));
console.log('💻 Node.js Version:', process.version);
console.log('📁 المجلد الحالي:', process.cwd());
console.log('');

// تشغيل الدالة
createAdmin().catch(console.error);