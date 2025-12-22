// إنشاء حساب مدير على السيرفر الحقيقي
const createAdminOnServer = async () => {
  try {
    console.log('🚀 إنشاء حساب مدير على السيرفر الحقيقي...');
    
    // بيانات المدير
    const adminData = {
      phone: '0501234567', // غير هذا الرقم
      password: 'Admin@123456' // غير كلمة المرور
    };
    
    console.log('📝 بيانات المدير:');
    console.log(`رقم الجوال: ${adminData.phone}`);
    console.log(`كلمة المرور: ${adminData.password}`);
    console.log('');
    
    // إنشاء الحساب عبر API
    const response = await fetch('https://www.ab-tw.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adminData)
    });
    
    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ تم إنشاء الحساب بنجاح!');
      console.log('📋 معلومات الحساب:');
      console.log(`ID: ${result.user.id}`);
      console.log(`رقم الجوال: ${result.user.phone}`);
      console.log(`الاسم: ${result.user.name}`);
      console.log(`الدور: ${result.user.role}`);
      console.log('');
      console.log('🔑 Token:', result.token);
      console.log('');
      
      // إذا لم يكن مدير، نحتاج تحديث الدور يدوياً في قاعدة البيانات
      if (result.user.role !== 'ADMIN') {
        console.log('⚠️ الحساب تم إنشاؤه كعميل عادي');
        console.log('يجب تحديث الدور إلى ADMIN في قاعدة البيانات');
        console.log('');
        console.log('📝 استعلام MongoDB لتحديث الدور:');
        console.log(`db.users.updateOne({phone: "${adminData.phone}"}, {$set: {role: "ADMIN"}})`);
      }
      
      console.log('🔗 رابط تسجيل الدخول: https://www.ab-tw.com/login');
      
    } else {
      console.error('❌ فشل في إنشاء الحساب:');
      console.error(`الحالة: ${response.status}`);
      console.error(`الرسالة: ${result.message}`);
      
      if (result.message && result.message.includes('مستخدم')) {
        console.log('');
        console.log('💡 الحل: رقم الجوال مستخدم بالفعل');
        console.log('جرب رقم جوال آخر أو استخدم الحساب الموجود');
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في الاتصال بالسيرفر:', error.message);
    console.log('');
    console.log('🔍 تحقق من:');
    console.log('1. الاتصال بالإنترنت');
    console.log('2. أن السيرفر يعمل على https://www.ab-tw.com');
    console.log('3. أن API endpoint متاح');
  }
};

// تشغيل الدالة
createAdminOnServer();