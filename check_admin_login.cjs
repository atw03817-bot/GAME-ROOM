// فحص بيانات المدير وتحديث كلمة المرور
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

const MONGODB_URI = 'mongodb+srv://atw03817_db_user:jP9AouAfbaifknI4@mobile-store-cluster.cylotee.mongodb.net/mobile_store?retryWrites=true&w=majority&appName=mobile-store-cluster';

async function checkAndFixAdmin() {
  console.log('🔍 فحص وإصلاح بيانات المدير');
  console.log('============================');
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
    console.log('🔍 البحث عن المستخدم برقم 0500909030...');
    const user = await users.findOne({ phone: '0500909030' });
    
    if (user) {
      console.log('👤 تم العثور على المستخدم:');
      console.log(`   - ID: ${user._id}`);
      console.log(`   - رقم الجوال: ${user.phone}`);
      console.log(`   - الدور: ${user.role}`);
      console.log(`   - نشط: ${user.isActive ? 'نعم' : 'لا'}`);
      console.log(`   - رقم مؤكد: ${user.phoneVerified ? 'نعم' : 'لا'}`);
      console.log(`   - تاريخ الإنشاء: ${user.createdAt}`);
      console.log(`   - كلمة المرور المشفرة: ${user.password.substring(0, 20)}...`);
      console.log('');

      // اختبار كلمة المرور الحالية
      console.log('🔐 اختبار كلمة المرور الحالية...');
      const isCurrentPasswordValid = await bcrypt.compare('123456', user.password);
      console.log(`   كلمة المرور "123456" صحيحة: ${isCurrentPasswordValid ? 'نعم' : 'لا'}`);
      
      if (!isCurrentPasswordValid) {
        console.log('');
        console.log('🔧 إنشاء كلمة مرور جديدة...');
        const newHashedPassword = await bcrypt.hash('123456', 10);
        console.log('✅ تم تشفير كلمة المرور الجديدة');
        
        // تحديث كلمة المرور والبيانات
        const updateResult = await users.updateOne(
          { phone: '0500909030' },
          { 
            $set: { 
              password: newHashedPassword,
              isActive: true,
              phoneVerified: true,
              role: 'ADMIN',
              updatedAt: new Date()
            } 
          }
        );

        if (updateResult.modifiedCount > 0) {
          console.log('✅ تم تحديث كلمة المرور والبيانات بنجاح');
          
          // اختبار كلمة المرور الجديدة
          const isNewPasswordValid = await bcrypt.compare('123456', newHashedPassword);
          console.log(`   كلمة المرور الجديدة صحيحة: ${isNewPasswordValid ? 'نعم' : 'لا'}`);
        } else {
          console.log('❌ فشل في تحديث كلمة المرور');
        }
      }

      // التحقق النهائي
      console.log('');
      console.log('🔍 التحقق النهائي من البيانات...');
      const finalUser = await users.findOne({ phone: '0500909030' });
      
      console.log('👤 البيانات النهائية:');
      console.log(`   - رقم الجوال: ${finalUser.phone}`);
      console.log(`   - الدور: ${finalUser.role}`);
      console.log(`   - نشط: ${finalUser.isActive ? 'نعم' : 'لا'}`);
      console.log(`   - رقم مؤكد: ${finalUser.phoneVerified ? 'نعم' : 'لا'}`);
      
      // اختبار كلمة المرور النهائية
      const finalPasswordTest = await bcrypt.compare('123456', finalUser.password);
      console.log(`   - كلمة المرور تعمل: ${finalPasswordTest ? 'نعم' : 'لا'}`);

    } else {
      console.log('❌ لم يتم العثور على المستخدم');
      console.log('');
      console.log('🔧 إنشاء مستخدم جديد...');
      
      const hashedPassword = await bcrypt.hash('123456', 10);
      const newAdmin = {
        phone: '0500909030',
        password: hashedPassword,
        role: 'ADMIN',
        isActive: true,
        phoneVerified: true,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      const result = await users.insertOne(newAdmin);
      console.log('✅ تم إنشاء المستخدم الجديد');
      console.log(`🆔 ID: ${result.insertedId}`);
    }

    console.log('');
    console.log('🎉 العملية مكتملة!');
    console.log('================');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log('📱 رقم الجوال: 0500909030');
    console.log('🔐 كلمة المرور: 123456');
    console.log('🔗 رابط تسجيل الدخول: https://www.ab-tw.com/login');
    console.log('⚙️ لوحة الإدارة: https://www.ab-tw.com/admin');

  } catch (error) {
    console.error('❌ خطأ:', error.message);
    console.error('تفاصيل الخطأ:', error);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 تم قطع الاتصال');
    }
  }
}

checkAndFixAdmin().catch(console.error);