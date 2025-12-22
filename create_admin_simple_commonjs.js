// سكريبت بسيط لإنشاء المدير - CommonJS
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store';
  const adminData = {
    phone: '0500909030',     // رقم الجوال
    password: '123456'       // كلمة المرور
  };

  console.log('🚀 إنشاء حساب المدير...');
  console.log(`📱 رقم الجوال: ${adminData.phone}`);
  
  let client;
  try {
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ متصل بقاعدة البيانات');
    
    const db = client.db('mobile-store');
    const users = db.collection('users');
    
    // تحقق من وجود المستخدم
    const existing = await users.findOne({ phone: adminData.phone });
    if (existing) {
      if (existing.role !== 'ADMIN') {
        await users.updateOne(
          { phone: adminData.phone },
          { $set: { role: 'ADMIN' } }
        );
        console.log('✅ تم تحديث المستخدم إلى مدير');
      } else {
        console.log('✅ المستخدم مدير بالفعل');
      }
      return;
    }
    
    // إنشاء مستخدم جديد
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const newUser = {
      phone: adminData.phone,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      phoneVerified: true,
      createdAt: new Date()
    };
    
    await users.insertOne(newUser);
    console.log('🎉 تم إنشاء المدير بنجاح!');
    console.log('🔗 سجل دخول على: https://www.ab-tw.com/login');
    
  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (client) await client.close();
  }
}

createAdmin();