// اختبار التسجيل برقم جديد تماماً
import axios from 'axios';

const API_BASE = 'https://api.ab-tw.com';

async function testNewRegistration() {
  // إنشاء رقم عشوائي جديد
  const randomPhone = '050' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  const password = '123456';

  console.log('🧪 اختبار التسجيل برقم جديد');
  console.log('📱 الرقم:', randomPhone);
  console.log('🔑 كلمة المرور:', password);
  console.log('');

  try {
    const response = await axios.post(`${API_BASE}/api/auth/register`, {
      phone: randomPhone,
      password: password
    });

    console.log('✅ نجح التسجيل!');
    console.log('📋 الاستجابة:', {
      success: response.data.success,
      message: response.data.message,
      user: response.data.user
    });

    // اختبار تسجيل الدخول بنفس الرقم
    console.log('\n🔐 اختبار تسجيل الدخول...');
    const loginResponse = await axios.post(`${API_BASE}/api/auth/login`, {
      phone: randomPhone,
      password: password
    });

    console.log('✅ نجح تسجيل الدخول!');
    console.log('👤 المستخدم:', loginResponse.data.user);

  } catch (error) {
    console.log('❌ فشل:', error.response?.data?.message || error.message);
    
    if (error.response?.data) {
      console.log('📋 تفاصيل الخطأ:', error.response.data);
    }
  }
}

async function testSpecificPhone() {
  const testPhone = '0508675543';
  const password = '123456';

  console.log('\n🔍 اختبار الرقم المحدد:', testPhone);

  try {
    const response = await axios.post(`${API_BASE}/api/auth/register`, {
      phone: testPhone,
      password: password
    });

    console.log('✅ نجح التسجيل بالرقم المحدد!');
    console.log('📋 الاستجابة:', response.data);

  } catch (error) {
    console.log('❌ فشل التسجيل بالرقم المحدد:', error.response?.data?.message || error.message);
    
    if (error.response?.data?.message?.includes('رقم الجوال مستخدم')) {
      console.log('💡 الرقم موجود مسبقاً في قاعدة البيانات');
    }
  }
}

// تشغيل الاختبارات
console.log('========================================');
console.log('🧪 اختبار شامل للتسجيل');
console.log('========================================');

await testNewRegistration();
await testSpecificPhone();

console.log('\n========================================');
console.log('✅ انتهى الاختبار');
console.log('========================================');