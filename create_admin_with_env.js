// سكريبت إنشاء المدير - يقرأ من backend/.env
const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

// قراءة ملف .env من مجلد backend
function loadEnv() {
  try {
    const envPath = path.join(__dirname, 'backend', '.env');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
    
    console.log('✅ تم تحميل متغيرات البيئة من backend/.env');
    return true;
  } catch (error) {
    console.error('❌ خطأ في قراءة ملف .env:', error.message);
    return false;
  }
}

// بيانات المدير
const ADMIN_DATA = {
  phone: '0500909030',
  password: '123456'
};

async function createAdmin() {
  console.log('🚀 إنشاء حساب المدير على قاعدة البيانات الحقيقية');
  console.log('====================================================');
  console.log(`📱 رقم الجوال: ${ADMIN_DATA.phone}`);
  console.log(`🔐 كلمة المرور: ${ADMIN_DATA.password}`);
  console.log('');

  // تحميل متغيرات البيئة
  if (!loadEnv()) {
    console.log('⚠️ فشل في تحميل ملف .env');
    return;
  }

  const MONGODB_URI = process.env.MONGODB_URI;
  
  if (!MONGODB_URI) {
    console.error('❌ MONGODB_URI غير موجود في ملف .env');
    return;
  }

  // إخفاء كلمة المرور في العرض
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

    // عدد المستخدمين الحاليين
    const userCount = await users.countDocuments();
    console.log(`👥 عدد المستخدمين الحاليين: ${userCount}`);

    // البحث عن مستخدم موجود
    console.log('🔍 البحث عن مستخدم موجود...');
    const existingUser = await users.findOne({ phone: ADMIN_DATA.phone });

    if (existingUser) {
      console.log('⚠️ يوجد مستخدم بنفس رقم الجوال');
      console.log(`   - الدور الحالي: ${existingUser.role}`);
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
          console.log('⚠️ لم يتم تحديث أي شيء');
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
    console.log('==================');
    console.log('');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log(`📱 رقم الجوال: ${ADMIN_DATA.phone}`);
    console.log(`🔐 كلمة المرور: ${ADMIN_DATA.password}`);
    console.log('');
    console.log('🔗 روابط مهمة:');
    console.log('   🌐 تسجيل الدخول: https://www.ab-tw.com/login');
    console.log('   ⚙️  لوحة الإدارة: https://www.ab-tw.com/admin');
    console.log('');
    console.log('⚠️ تذكر تغيير كلمة المرور بعد تسجيل الدخول!');

  } catch (error) {
    console.error('❌ خطأ في العملية:', error.message);
    console.log('');
    
    if (error.message.includes('authentication')) {
      console.log('💡 مشكلة المصادقة:');
      console.log('   - تحقق من اسم المستخدم وكلمة المرور في MONGODB_URI');
    } else if (error.message.includes('network') || error.message.includes('ENOTFOUND')) {
      console.log('💡 مشكلة الشبكة:');
      console.log('   - تحقق من الاتصال بالإنترنت');
      console.log('   - تأكد من أن MongoDB Atlas متاح');
    }
    
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
console.log('🚀 سكريبت إنشاء حساب المدير');
console.log('📅 التاريخ:', new Date().toLocaleString('ar-SA'));
console.log('💻 Node.js:', process.version);
console.log('📁 المجلد:', process.cwd());
console.log('');

// تشغيل الدالة
createAdmin().catch((error) => {
  console.error('💥 خطأ غير متوقع:', error);
  process.exit(1);
});