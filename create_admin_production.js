// سكريبت إنشاء المدير للسيرفر الحقيقي
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// بيانات المدير
const ADMIN_DATA = {
  phone: '0500909030',
  password: '123456'
};

// قاعدة البيانات - غير هذا حسب إعداداتك
const MONGODB_URI = process.env.MONGODB_URI || 
  'mongodb://127.0.0.1:27017/mobile-store'; // للسيرفر المحلي

async function createAdmin() {
  console.log('🚀 إنشاء حساب المدير على السيرفر الحقيقي');
  console.log('===============================================');
  console.log(`📱 رقم الجوال: ${ADMIN_DATA.phone}`);
  console.log(`🔐 كلمة المرور: ${ADMIN_DATA.password}`);
  console.log(`🗄️ قاعدة البيانات: ${MONGODB_URI}`);
  console.log('');

  let client;

  try {
    console.log('🔗 الاتصال بقاعدة البيانات...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ تم الاتصال بنجاح');

    const db = client.db('mobile-store');
    const users = db.collection('users');

    // عدد المستخدمين الحاليين
    const userCount = await users.countDocuments();
    console.log(`👥 عدد المستخدمين الحاليين: ${userCount}`);

    // البحث عن مستخدم موجود
    console.log('🔍 البحث عن مستخدم موجود...');
    const existingUser = await users.findOne({ phone: ADMIN_DATA.phone });

    if (existingUser) {
      console.log('⚠️ يوجد مستخدم بنفس رقم الجوال');
      console.log(`   - الاسم: ${existingUser.name || 'غير محدد'}`);
      console.log(`   - الدور: ${existingUser.role}`);
      console.log(`   - نشط: ${existingUser.isActive ? 'نعم' : 'لا'}`);
      
      if (existingUser.role !== 'ADMIN') {
        console.log('🔄 تحديث الدور إلى مدير...');
        const updateResult = await users.updateOne(
          { phone: ADMIN_DATA.phone },
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
          console.log('❌ فشل في تحديث المستخدم');
        }
      } else {
        console.log('✅ المستخدم مدير بالفعل');
      }
    } else {
      // إنشاء مستخدم جديد
      console.log('👤 إنشاء مستخدم جديد...');
      console.log('🔐 تشفير كلمة المرور...');
      
      const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, 10);
      
      const newAdmin = {
        phone: ADMIN_DATA.phone,
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

      console.log('💾 حفظ المدير في قاعدة البيانات...');
      const result = await users.insertOne(newAdmin);
      
      if (result.acknowledged) {
        console.log('✅ تم إنشاء المدير بنجاح!');
        console.log(`🆔 معرف المستخدم: ${result.insertedId}`);
      } else {
        console.log('❌ فشل في إنشاء المدير');
      }
    }

    // إحصائيات نهائية
    const finalUserCount = await users.countDocuments();
    const adminCount = await users.countDocuments({ role: 'ADMIN' });
    
    console.log('');
    console.log('📊 إحصائيات قاعدة البيانات:');
    console.log(`   👥 إجمالي المستخدمين: ${finalUserCount}`);
    console.log(`   👑 إجمالي المديرين: ${adminCount}`);
    console.log('');
    console.log('🎉 العملية مكتملة!');
    console.log('================');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log(`📱 رقم الجوال: ${ADMIN_DATA.phone}`);
    console.log(`🔐 كلمة المرور: ${ADMIN_DATA.password}`);
    console.log('🔗 رابط تسجيل الدخول: https://www.ab-tw.com/login');
    console.log('⚙️ لوحة الإدارة: https://www.ab-tw.com/admin');
    console.log('');
    console.log('⚠️ تذكر تغيير كلمة المرور بعد تسجيل الدخول!');

  } catch (error) {
    console.error('❌ خطأ في العملية:', error.message);
    console.log('');
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 مشكلة الاتصال:');
      console.log('   - تأكد من أن MongoDB يعمل: sudo systemctl status mongod');
      console.log('   - أو ابدأ تشغيله: sudo systemctl start mongod');
    } else if (error.message.includes('authentication')) {
      console.log('💡 مشكلة المصادقة:');
      console.log('   - تحقق من اسم المستخدم وكلمة المرور في MONGODB_URI');
    } else if (error.message.includes('network')) {
      console.log('💡 مشكلة الشبكة:');
      console.log('   - تحقق من عنوان قاعدة البيانات');
      console.log('   - تأكد من أن المنافذ مفتوحة');
    }
    
    console.log('');
    console.log('🔍 للتشخيص:');
    console.log('   1. تحقق من متغيرات البيئة: cat .env');
    console.log('   2. تحقق من حالة MongoDB: sudo systemctl status mongod');
    console.log('   3. اختبر الاتصال: mongo --eval "db.version()"');
    
  } finally {
    if (client) {
      try {
        await client.close();
        console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
      } catch (closeError) {
        console.error('⚠️ خطأ في قطع الاتصال:', closeError.message);
      }
    }
  }
}

// معلومات النظام
console.log('🚀 سكريبت إنشاء حساب المدير - السيرفر الحقيقي');
console.log('📅 التاريخ:', new Date().toLocaleString('ar-SA'));
console.log('💻 Node.js:', process.version);
console.log('📁 المجلد:', process.cwd());
console.log('🌍 البيئة:', process.env.NODE_ENV || 'development');
console.log('');

// تشغيل الدالة
createAdmin().catch((error) => {
  console.error('💥 خطأ غير متوقع:', error);
  process.exit(1);
});