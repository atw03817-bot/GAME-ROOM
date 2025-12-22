// اختبار API التسجيل للتأكد من عمله بشكل صحيح
import axios from 'axios';

// إعدادات الاختبار
const API_BASE = 'https://api.ab-tw.com'; // أو http://localhost:5000 للاختبار المحلي
const TEST_PHONE = '0501234567'; // رقم اختبار
const TEST_PASSWORD = '123456';

async function testRegistration() {
  console.log('🧪 اختبار API التسجيل...');
  console.log('📱 الرقم:', TEST_PHONE);
  console.log('🔑 كلمة المرور:', TEST_PASSWORD);
  console.log('🌐 الخادم:', API_BASE);
  console.log('');

  try {
    // محاولة التسجيل
    console.log('📝 محاولة التسجيل...');
    const response = await axios.post(`${API_BASE}/api/auth/register`, {
      phone: TEST_PHONE,
      password: TEST_PASSWORD
    });

    console.log('✅ نجح التسجيل!');
    console.log('📋 الاستجابة:', {
      success: response.data.success,
      message: response.data.message,
      user: response.data.user,
      hasToken: !!response.data.token
    });

  } catch (error) {
    if (error.response) {
      console.log('❌ فشل التسجيل:');
      console.log('📊 كود الحالة:', error.response.status);
      console.log('💬 الرسالة:', error.response.data.message);
      console.log('📋 البيانات الكاملة:', error.response.data);
      
      // إذا كانت الرسالة تحتوي على "إيميل"، فهناك مشكلة
      if (error.response.data.message && error.response.data.message.includes('إيميل')) {
        console.log('');
        console.log('🚨 تحذير: الرسالة تحتوي على "إيميل" مع أن التسجيل بالرقم!');
        console.log('🔧 هذا يعني أن السيرفر لم يسحب التحديثات الجديدة');
        console.log('💡 الحل: تشغيل git pull origin main على السيرفر');
      }
      
      // إذا كانت الرسالة صحيحة (رقم الجوال مستخدم)
      if (error.response.data.message && error.response.data.message.includes('رقم الجوال')) {
        console.log('');
        console.log('✅ الرسالة صحيحة! السيرفر محدث');
        console.log('📱 الرقم موجود مسبقاً، جرب رقم آخر');
      }
    } else {
      console.log('❌ خطأ في الاتصال:', error.message);
      console.log('🔧 تأكد من أن السيرفر يعمل على:', API_BASE);
    }
  }
}

async function testWithNewPhone() {
  // إنشاء رقم عشوائي للاختبار
  const randomPhone = '050' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  
  console.log('');
  console.log('🆕 اختبار برقم جديد:', randomPhone);
  
  try {
    const response = await axios.post(`${API_BASE}/api/auth/register`, {
      phone: randomPhone,
      password: TEST_PASSWORD
    });

    console.log('✅ نجح إنشاء حساب جديد!');
    console.log('👤 المستخدم:', response.data.user);
    console.log('🎉 التسجيل يعمل بشكل صحيح!');

  } catch (error) {
    console.log('❌ فشل إنشاء حساب جديد:', error.response?.data?.message || error.message);
  }
}

// تشغيل الاختبارات
async function runTests() {
  console.log('========================================');
  console.log('🧪 اختبار نظام التسجيل');
  console.log('========================================');
  
  // اختبار 1: رقم موجود (للتأكد من الرسالة)
  await testRegistration();
  
  // اختبار 2: رقم جديد (للتأكد من عمل التسجيل)
  await testWithNewPhone();
  
  console.log('');
  console.log('========================================');
  console.log('✅ انتهى الاختبار');
  console.log('========================================');
}

runTests();