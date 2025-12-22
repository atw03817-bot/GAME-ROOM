// إنشاء مدير صحيح مع كل البيانات المطلوبة
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://atw03817_db_user:jP9AouAfbaifknI4@mobile-store-cluster.cylotee.mongodb.net/mobile_store?retryWrites=true&w=majority&appName=mobile-store-cluster';

async function createProperAdmin() {
  console.log('🔧 إنشاء مدير صحيح مع كل البيانات المطلوبة');
  console.log('===============================================');
  console.log('');

  let client;

  try {
    console.log('🔗 الاتصال بقاعدة البيانات...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ تم الاتصال بنجاح');

    const db = client.db('mobile_store');
    const users = db.collection('users');

    // حذف المدير القديم إذا كان موجود
    console.log('🗑️ حذف المدير القديم...');
    await users.deleteMany({ phone: '0500909030' });
    console.log('✅ تم حذف المدير القديم');

    // إنشاء مدير جديد بالبيانات الصحيحة
    console.log('👤 إنشاء مدير جديد...');
    
    const hashedPassword = await bcrypt.hash('123456', 10);
    console.log('🔐 تم تشفير كلمة المرور');
    
    const adminUser = {
      phone: '0500909030',
      password: hashedPassword,
      name: 'المدير العام', // إضافة اسم
      email: null, // يمكن إضافة إيميل لاحقاً
      role: 'ADMIN',
      isActive: true,
      phoneVerified: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: null,
      addresses: [],
      preferences: {
        language: 'ar',
        notifications: true
      }
    };

    const result = await users.insertOne(adminUser);
    console.log('✅ تم إنشاء المدير الجديد بنجاح!');
    console.log(`🆔 معرف المستخدم: ${result.insertedId}`);

    // التحقق من البيانات
    const createdUser = await users.findOne({ _id: result.insertedId });
    console.log('');
    console.log('👤 بيانات المدير المنشأ:');
    console.log(`   - رقم الجوال: ${createdUser.phone}`);
    console.log(`   - الاسم: ${createdUser.name}`);
    console.log(`   - الدور: ${createdUser.role}`);
    console.log(`   - نشط: ${createdUser.isActive ? 'نعم' : 'لا'}`);
    console.log(`   - رقم مؤكد: ${createdUser.phoneVerified ? 'نعم' : 'لا'}`);

    // اختبار كلمة المرور
    const passwordTest = await bcrypt.compare('123456', createdUser.password);
    console.log(`   - كلمة المرور تعمل: ${passwordTest ? 'نعم' : 'لا'}`);

    // إحصائيات
    const totalUsers = await users.countDocuments();
    const totalAdmins = await users.countDocuments({ role: 'ADMIN' });
    
    console.log('');
    console.log('📊 إحصائيات قاعدة البيانات:');
    console.log(`   👥 إجمالي المستخدمين: ${totalUsers}`);
    console.log(`   👑 إجمالي المديرين: ${totalAdmins}`);

    console.log('');
    console.log('🎉 العملية مكتملة بنجاح!');
    console.log('==========================');
    console.log('');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log('📱 رقم الجوال: 0500909030');
    console.log('🔐 كلمة المرور: 123456');
    console.log('👤 الاسم: المدير العام');
    console.log('');
    console.log('🔗 روابط مهمة:');
    console.log('   🌐 تسجيل الدخول: https://www.ab-tw.com/login');
    console.log('   ⚙️  لوحة الإدارة: https://www.ab-tw.com/admin');
    console.log('   🏠 الموقع الرئيسي: https://www.ab-tw.com');
    console.log('');
    console.log('✅ الآن يجب أن يعمل تسجيل الدخول والانتقال للوحة الإدارة بشكل صحيح!');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 تم قطع الاتصال');
    }
  }
}

createProperAdmin().catch(console.error);