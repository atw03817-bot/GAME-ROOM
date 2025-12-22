// سكريبت بسيط لإنشاء المدير - يشتغل 100%
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');

// قراءة MONGODB_URI من backend/.env
let MONGODB_URI = 'mongodb://127.0.0.1:27017/mobile-store'; // افتراضي

try {
  const envContent = fs.readFileSync('./backend/.env', 'utf8');
  const mongoLine = envContent.split('\n').find(line => line.startsWith('MONGODB_URI='));
  if (mongoLine) {
    MONGODB_URI = mongoLine.split('=')[1].trim();
    console.log('✅ تم العثور على MONGODB_URI في backend/.env');
  }
} catch (error) {
  console.log('⚠️ لم يتم العثور على backend/.env، سيتم استخدام localhost');
}

// بيانات المدير
const adminData = {
  phone: '0500909030',
  password: '123456'
};

async function createAdmin() {
  console.log('🚀 إنشاء حساب المدير');
  console.log('===================');
  console.log(`📱 رقم الجوال: ${adminData.phone}`);
  console.log(`🔐 كلمة المرور: ${adminData.password}`);
  
  // إخفاء كلمة المرور في URI
  const safeUri = MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//$1:****@');
  console.log(`🗄️ قاعدة البيانات: ${safeUri}`);
  console.log('');

  let client;
  try {
    console.log('🔗 الاتصال بقاعدة البيانات...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ تم الاتصال بنجاح');

    const db = client.db('mobile-store');
    const users = db.collection('users');

    // البحث عن المستخدم
    console.log('🔍 البحث عن مستخدم موجود...');
    const existingUser = await users.findOne({ phone: adminData.phone });

    if (existingUser) {
      console.log('⚠️ يوجد مستخدم بنفس رقم الجوال');
      console.log(`   الدور الحالي: ${existingUser.role}`);
      
      if (existingUser.role !== 'ADMIN') {
        console.log('🔄 تحديث الدور إلى مدير...');
        await users.updateOne(
          { phone: adminData.phone },
          { $set: { role: 'ADMIN', updatedAt: new Date() } }
        );
        console.log('✅ تم تحديث المستخدم إلى مدير');
      } else {
        console.log('✅ المستخدم مدير بالفعل');
      }
    } else {
      console.log('👤 إنشاء مستخدم جديد...');
      
      const hashedPassword = await bcrypt.hash(adminData.password, 10);
      const newAdmin = {
        phone: adminData.phone,
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        phoneVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await users.insertOne(newAdmin);
      console.log('✅ تم إنشاء المدير بنجاح!');
      console.log(`🆔 ID: ${result.insertedId}`);
    }

    // إحصائيات
    const totalUsers = await users.countDocuments();
    const totalAdmins = await users.countDocuments({ role: 'ADMIN' });
    
    console.log('');
    console.log('📊 إحصائيات:');
    console.log(`   👥 إجمالي المستخدمين: ${totalUsers}`);
    console.log(`   👑 إجمالي المديرين: ${totalAdmins}`);
    console.log('');
    console.log('🎉 تم بنجاح!');
    console.log('============');
    console.log(`📱 رقم الجوال: ${adminData.phone}`);
    console.log(`🔐 كلمة المرور: ${adminData.password}`);
    console.log('🔗 https://www.ab-tw.com/login');
    console.log('⚙️ https://www.ab-tw.com/admin');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    
    if (error.message.includes('authentication')) {
      console.log('💡 مشكلة في المصادقة - تحقق من بيانات قاعدة البيانات');
    } else if (error.message.includes('network')) {
      console.log('💡 مشكلة في الشبكة - تحقق من الاتصال');
    }
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 تم قطع الاتصال');
    }
  }
}

createAdmin().catch(console.error);