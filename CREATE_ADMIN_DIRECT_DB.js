#!/usr/bin/env node

// سكريبت إنشاء حساب مدير مباشرة في قاعدة البيانات MongoDB
// يعمل بدون الحاجة لـ API أو server

import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// إعدادات قاعدة البيانات - غير هذه حسب إعداداتك
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store';
const DB_NAME = 'mobile-store'; // اسم قاعدة البيانات

// بيانات المدير - غير هذه البيانات
const ADMIN_DATA = {
  phone: '0500909030',        // رقم الجوال
  password: '123456',         // كلمة المرور
  role: 'ADMIN'
};

async function createAdminDirectly() {
  let client;
  
  try {
    console.log('🚀 بدء إنشاء حساب المدير مباشرة في قاعدة البيانات');
    console.log('================================================');
    console.log('');
    
    // الاتصال بقاعدة البيانات
    console.log('🔗 الاتصال بقاعدة البيانات...');
    console.log(`📍 URI: ${MONGODB_URI.replace(/\/\/.*@/, '//***:***@')}`);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db(DB_NAME);
    const usersCollection = db.collection('users');
    
    console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    console.log('');
    
    // عرض بيانات المدير
    console.log('📝 بيانات المدير المطلوب إنشاؤه:');
    console.log(`📱 رقم الجوال: ${ADMIN_DATA.phone}`);
    console.log(`🔐 كلمة المرور: ${ADMIN_DATA.password}`);
    console.log(`👤 الدور: ${ADMIN_DATA.role}`);
    console.log('');
    
    // التحقق من وجود مستخدم بنفس رقم الجوال
    console.log('🔍 البحث عن مستخدم موجود...');
    const existingUser = await usersCollection.findOne({ phone: ADMIN_DATA.phone });
    
    if (existingUser) {
      console.log('⚠️ يوجد مستخدم بنفس رقم الجوال');
      console.log(`📋 معلومات المستخدم الموجود:`);
      console.log(`   - ID: ${existingUser._id}`);
      console.log(`   - رقم الجوال: ${existingUser.phone}`);
      console.log(`   - الدور: ${existingUser.role}`);
      console.log(`   - تاريخ الإنشاء: ${existingUser.createdAt}`);
      console.log(`   - نشط: ${existingUser.isActive ? 'نعم' : 'لا'}`);
      
      if (existingUser.role !== 'ADMIN') {
        console.log('');
        console.log('🔄 تحديث دور المستخدم إلى مدير...');
        
        const updateResult = await usersCollection.updateOne(
          { _id: existingUser._id },
          { 
            $set: { 
              role: 'ADMIN',
              updatedAt: new Date()
            }
          }
        );
        
        if (updateResult.modifiedCount > 0) {
          console.log('✅ تم تحديث دور المستخدم إلى مدير بنجاح');
        } else {
          console.log('❌ فشل في تحديث دور المستخدم');
        }
      } else {
        console.log('✅ المستخدم مدير بالفعل - لا حاجة للتحديث');
      }
      
      console.log('');
      console.log('🔗 يمكنك الآن تسجيل الدخول:');
      console.log(`   📱 رقم الجوال: ${ADMIN_DATA.phone}`);
      console.log(`   🔐 كلمة المرور: كلمة المرور الحالية`);
      console.log(`   🌐 الرابط: https://www.ab-tw.com/login`);
      return;
    }
    
    console.log('👤 لم يتم العثور على مستخدم - سيتم إنشاء حساب جديد');
    console.log('');
    
    // تشفير كلمة المرور
    console.log('🔐 تشفير كلمة المرور...');
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(ADMIN_DATA.password, saltRounds);
    console.log('✅ تم تشفير كلمة المرور');
    
    // إنشاء بيانات المستخدم
    const now = new Date();
    const adminUser = {
      phone: ADMIN_DATA.phone,
      password: hashedPassword,
      role: ADMIN_DATA.role,
      isActive: true,
      phoneVerified: true,
      createdAt: now,
      updatedAt: now,
      lastLogin: null,
      // حقول إضافية قد تكون مطلوبة
      email: null,
      name: null,
      addresses: [],
      preferences: {
        language: 'ar',
        notifications: true
      }
    };
    
    // إدراج المستخدم في قاعدة البيانات
    console.log('💾 حفظ المدير في قاعدة البيانات...');
    const insertResult = await usersCollection.insertOne(adminUser);
    
    if (insertResult.acknowledged) {
      console.log('✅ تم حفظ المدير في قاعدة البيانات بنجاح');
      console.log(`📋 ID المستخدم: ${insertResult.insertedId}`);
    } else {
      throw new Error('فشل في حفظ المستخدم');
    }
    
    console.log('');
    console.log('🎉 تم إنشاء حساب المدير بنجاح!');
    console.log('=====================================');
    console.log('');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log(`📱 رقم الجوال: ${ADMIN_DATA.phone}`);
    console.log(`🔐 كلمة المرور: ${ADMIN_DATA.password}`);
    console.log(`👤 الدور: ${ADMIN_DATA.role}`);
    console.log(`🆔 معرف المستخدم: ${insertResult.insertedId}`);
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
    console.log('   4. أضف عنوان بريد إلكتروني في الملف الشخصي');
    console.log('');
    
    // إحصائيات قاعدة البيانات
    const totalUsers = await usersCollection.countDocuments();
    const totalAdmins = await usersCollection.countDocuments({ role: 'ADMIN' });
    
    console.log('📊 إحصائيات قاعدة البيانات:');
    console.log(`   👥 إجمالي المستخدمين: ${totalUsers}`);
    console.log(`   👑 إجمالي المديرين: ${totalAdmins}`);
    console.log('');
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء المدير:', error.message);
    console.log('');
    
    if (error.code === 11000) {
      console.log('💡 السبب: رقم الجوال مستخدم بالفعل (Duplicate Key Error)');
      console.log('🔧 الحل: استخدم رقم جوال آخر أو احذف المستخدم الموجود');
    } else if (error.name === 'MongoNetworkError') {
      console.log('💡 السبب: خطأ في الاتصال بقاعدة البيانات');
      console.log('🔧 الحل: تأكد من أن MongoDB يعمل وأن الاتصال صحيح');
      console.log('   - تحقق من MONGODB_URI في متغيرات البيئة');
      console.log('   - تأكد من أن MongoDB يعمل: sudo systemctl status mongod');
    } else if (error.name === 'MongoServerError') {
      console.log('💡 السبب: خطأ في خادم MongoDB');
      console.log('🔧 الحل: تحقق من إعدادات قاعدة البيانات والصلاحيات');
    }
    
    console.log('');
    console.log('🔍 للمساعدة في التشخيص:');
    console.log('   1. تحقق من متغيرات البيئة: echo $MONGODB_URI');
    console.log('   2. تحقق من حالة MongoDB: sudo systemctl status mongod');
    console.log('   3. تحقق من الاتصال: mongo --eval "db.adminCommand(\'ismaster\')"');
    
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
console.log('🚀 سكريبت إنشاء حساب المدير مباشرة في قاعدة البيانات');
console.log('📅 التاريخ:', new Date().toLocaleString('ar-SA'));
console.log('💻 Node.js Version:', process.version);
console.log('📁 المجلد الحالي:', process.cwd());
console.log('');

// تشغيل الدالة
createAdminDirectly().catch((error) => {
  console.error('💥 خطأ غير متوقع:', error);
  process.exit(1);
});