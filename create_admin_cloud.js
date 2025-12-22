// إنشاء المدير في قاعدة البيانات السحابية
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// رابط قاعدة البيانات السحابية من الصورة
const MONGODB_URI = 'mongodb+srv://atw03817:jP9AouAfbaifknI4@mobile-store-cluster.cylotee.mongodb.net/mobile-store?retryWrites=true&w=majority&appName=mobile-store-cluster';

// بيانات المدير
const adminData = {
  phone: '0500909030',
  password: '123456'
};

async function createAdminInCloud() {
  console.log('🚀 إنشاء حساب المدير في قاعدة البيانات السحابية');
  console.log('================================================');
  console.log(`📱 رقم الجوال: ${adminData.phone}`);
  console.log(`🔐 كلمة المرور: ${adminData.password}`);
  console.log('☁️ قاعدة البيانات: MongoDB Atlas (السحابية)');
  console.log('');

  let client;

  try {
    console.log('🔗 الاتصال بقاعدة البيانات السحابية...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ تم الاتصال بنجاح مع MongoDB Atlas');

    const db = client.db('mobile-store');
    const users = db.collection('users');

    // عدد المستخدمين الحاليين
    const userCount = await users.countDocuments();
    console.log(`👥 عدد المستخدمين الحاليين: ${userCount}`);

    // البحث عن مستخدم موجود
    console.log('🔍 البحث عن مستخدم موجود...');
    const existingUser = await users.findOne({ phone: adminData.phone });

    if (existingUser) {
      console.log('⚠️ يوجد مستخدم بنفس رقم الجوال');
      console.log(`   - الدور الحالي: ${existingUser.role}`);
      console.log(`   - نشط: ${existingUser.isActive ? 'نعم' : 'لا'}`);
      console.log(`   - تاريخ الإنشاء: ${existingUser.createdAt}`);
      
      if (existingUser.role !== 'ADMIN') {
        console.log('🔄 تحديث الدور إلى مدير...');
        const updateResult = await users.updateOne(
          { phone: adminData.phone },
          { 
            $set: { 
              role: 'ADMIN', 
              updatedAt: new Date(),
              isActive: true 
            } 
          }
        );
        
        if (updateResult.modifiedCount > 0) {
          console.log('✅ تم تحديث المستخدم إلى مدير بنجاح');
        } else {
          console.log('⚠️ لم يتم تحديث أي شيء');
        }
      } else {
        console.log('✅ المستخدم مدير بالفعل');
      }
    } else {
      // إنشاء مستخدم جديد
      console.log('👤 إنشاء مستخدم جديد...');
      console.log('🔐 تشفير كلمة المرور...');
      
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      console.log('✅ تم تشفير كلمة المرور');
      
      const newAdmin = {
        phone: adminData.phone,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        phoneVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLogin: null,
        email: null,
        name: null,
        addresses: []
      };

      console.log('💾 حفظ المدير في قاعدة البيانات السحابية...');
      const result = await users.insertOne(newAdmin);
      
      if (result.acknowledged) {
        console.log('✅ تم إنشاء المدير بنجاح في السحابة!');
        console.log(`🆔 معرف المستخدم: ${result.insertedId}`);
      } else {
        console.log('❌ فشل في إنشاء المدير');
      }
    }

    // إحصائيات نهائية
    const finalUserCount = await users.countDocuments();
    const adminCount = await users.countDocuments({ role: 'ADMIN' });
    
    console.log('');
    console.log('📊 إحصائيات قاعدة البيانات السحابية:');
    console.log(`   👥 إجمالي المستخدمين: ${finalUserCount}`);
    console.log(`   👑 إجمالي المديرين: ${adminCount}`);
    console.log('');
    console.log('🎉 العملية مكتملة بنجاح!');
    console.log('==========================');
    console.log('');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log(`📱 رقم الجوال: ${adminData.phone}`);
    console.log(`🔐 كلمة المرور: ${adminData.password}`);
    console.log('');
    console.log('🔗 روابط مهمة:');
    console.log('   🌐 تسجيل الدخول: https://www.ab-tw.com/login');
    console.log('   ⚙️  لوحة الإدارة: https://www.ab-tw.com/admin');
    console.log('   🏠 الموقع الرئيسي: https://www.ab-tw.com');
    console.log('');
    console.log('⚠️ تذكر تغيير كلمة المرور بعد تسجيل الدخول!');

  } catch (error) {
    console.error('❌ خطأ في العملية:', error.message);
    console.log('');
    
    if (error.message.includes('authentication')) {
      console.log('💡 مشكلة المصادقة:');
      console.log('   - تحقق من اسم المستخدم وكلمة المرور في رابط قاعدة البيانات');
      console.log('   - تأكد من أن المستخدم له صلاحيات الكتابة');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.log('💡 مشكلة الشبكة:');
      console.log('   - تحقق من الاتصال بالإنترنت');
      console.log('   - تأكد من أن MongoDB Atlas متاح');
    } else if (error.message.includes('timeout')) {
      console.log('💡 مشكلة انتهاء الوقت:');
      console.log('   - الشبكة بطيئة، جرب مرة أخرى');
    }
    
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('🔌 تم قطع الاتصال بقاعدة البيانات السحابية');
      } catch (closeError) {
        console.error('⚠️ خطأ في قطع الاتصال:', closeError.message);
      }
    }
  }
}

// معلومات النظام
console.log('☁️ سكريبت إنشاء حساب المدير في MongoDB Atlas');
console.log('📅 التاريخ:', new Date().toLocaleString('ar-SA'));
console.log('💻 Node.js:', process.version);
console.log('📁 المجلد:', process.cwd());
console.log('');

// تشغيل الدالة
createAdminInCloud().catch((error) => {
  console.error('💥 خطأ غير متوقع:', error);
  process.exit(1);
});