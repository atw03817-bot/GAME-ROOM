// تفعيل حساب المدير
const { MongoClient } = require('mongodb');

// الرابط الصحيح
const MONGODB_URI = 'mongodb+srv://atw03817_db_user:jP9AouAfbaifknI4@mobile-store-cluster.cylotee.mongodb.net/mobile_store?retryWrites=true&w=majority&appName=mobile-store-cluster';

async function activateAdmin() {
  console.log('🔧 تفعيل حساب المدير');
  console.log('📱 رقم الجوال: 0500909030');
  console.log('');

  let client;

  try {
    console.log('🔗 الاتصال بقاعدة البيانات...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    console.log('✅ تم الاتصال بنجاح');

    const db = client.db('mobile_store');
    const users = db.collection('users');

    // البحث عن المستخدم
    const user = await users.findOne({ phone: '0500909030' });
    
    if (user) {
      console.log('👤 معلومات المستخدم الحالية:');
      console.log(`   - الدور: ${user.role}`);
      console.log(`   - نشط: ${user.isActive ? 'نعم' : 'لا'}`);
      console.log(`   - رقم مؤكد: ${user.phoneVerified ? 'نعم' : 'لا'}`);
      console.log('');

      // تفعيل الحساب
      console.log('🔄 تفعيل الحساب...');
      const updateResult = await users.updateOne(
        { phone: '0500909030' },
        { 
          $set: { 
            isActive: true,
            phoneVerified: true,
            role: 'ADMIN',
            updatedAt: new Date()
          } 
        }
      );

      if (updateResult.modifiedCount > 0) {
        console.log('✅ تم تفعيل الحساب بنجاح!');
        
        // التحقق من التحديث
        const updatedUser = await users.findOne({ phone: '0500909030' });
        console.log('');
        console.log('👤 معلومات المستخدم بعد التحديث:');
        console.log(`   - الدور: ${updatedUser.role}`);
        console.log(`   - نشط: ${updatedUser.isActive ? 'نعم' : 'لا'}`);
        console.log(`   - رقم مؤكد: ${updatedUser.phoneVerified ? 'نعم' : 'لا'}`);
        
      } else {
        console.log('⚠️ لم يتم تحديث أي شيء');
      }
    } else {
      console.log('❌ لم يتم العثور على المستخدم');
    }

    console.log('');
    console.log('🎉 العملية مكتملة!');
    console.log('================');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log('📱 رقم الجوال: 0500909030');
    console.log('🔐 كلمة المرور: 123456');
    console.log('🔗 https://www.ab-tw.com/login');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 تم قطع الاتصال');
    }
  }
}

activateAdmin().catch(console.error);