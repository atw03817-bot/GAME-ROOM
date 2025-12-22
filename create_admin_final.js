// سكريبت إنشاء المدير - يشتغل بدون مشاكل
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

// بيانات المدير
const ADMIN_DATA = {
  phone: '0500909030',
  password: '123456'
};

async function createAdmin() {
  console.log('🚀 إنشاء حساب المدير...');
  console.log(`📱 رقم الجوال: ${ADMIN_DATA.phone}`);
  console.log(`🔐 كلمة المرور: ${ADMIN_DATA.password}`);
  console.log('');

  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store';
  let client;

  try {
    // الاتصال بقاعدة البيانات
    console.log('🔗 الاتصال بقاعدة البيانات...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ تم الاتصال بنجاح');

    const db = client.db('mobile-store');
    const users = db.collection('users');

    // البحث عن مستخدم موجود
    console.log('🔍 البحث عن مستخدم موجود...');
    const existingUser = await users.findOne({ phone: ADMIN_DATA.phone });

    if (existingUser) {
      console.log('⚠️ يوجد مستخدم بنفس رقم الجوال');
      console.log(`الدور الحالي: ${existingUser.role}`);
      
      if (existingUser.role !== 'ADMIN') {
        console.log('🔄 تحديث الدور إلى مدير...');
        await users.updateOne(
          { phone: ADMIN_DATA.phone },
          { $set: { role: 'ADMIN', updatedAt: new Date() } }
        );
        console.log('✅ تم تحديث المستخدم إلى مدير');
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
        updatedAt: new Date()
      };

      const result = await users.insertOne(newAdmin);
      console.log('✅ تم إنشاء المدير بنجاح!');
      console.log(`🆔 معرف المستخدم: ${result.insertedId}`);
    }

    console.log('');
    console.log('🎉 العملية مكتملة!');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log(`📱 رقم الجوال: ${ADMIN_DATA.phone}`);
    console.log(`🔐 كلمة المرور: ${ADMIN_DATA.password}`);
    console.log('🔗 رابط تسجيل الدخول: https://www.ab-tw.com/login');
    console.log('⚙️ لوحة الإدارة: https://www.ab-tw.com/admin');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('💡 تأكد من أن MongoDB يعمل: sudo systemctl start mongod');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
    }
  }
}

// تشغيل الدالة
createAdmin().catch(console.error);