// اختبار التسجيل على السيرفر المحلي
import axios from 'axios';

const LOCAL_API = 'http://localhost:5000';

async function testLocalRegistration() {
  console.log('🧪 اختبار التسجيل على السيرفر المحلي');
  console.log('🌐 الخادم:', LOCAL_API);
  console.log('');

  // اختبار 1: رقم موجود (للتأكد من الرسالة)
  console.log('📝 اختبار 1: رقم موجود مسبقاً');
  try {
    const response = await axios.post(`${LOCAL_API}/api/auth/register`, {
      phone: '0501234567',
      password: '123456'
    });
    console.log('✅ نجح التسجيل (غير متوقع):', response.data);
  } catch (error) {
    console.log('❌ فشل التسجيل (متوقع):', error.response?.data?.message);
    
    if (error.response?.data?.message?.includes('رقم الجوال')) {
      console.log('✅ الرسالة صحيحة! يستخدم "رقم الجوال"');
    } else if (error.response?.data?.message?.includes('إيميل')) {
      console.log('❌ الرسالة خاطئة! لسه يستخدم "إيميل"');
    }
  }

  console.log('');

  // اختبار 2: رقم جديد
  const newPhone = '050' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
  console.log('📝 اختبار 2: رقم جديد -', newPhone);
  
  try {
    const response = await axios.post(`${LOCAL_API}/api/auth/register`, {
      phone: newPhone,
      password: '123456'
    });
    console.log('✅ نجح إنشاء حساب جديد!');
    console.log('👤 المستخدم:', response.data.user);
    console.log('🎉 التسجيل يعمل بشكل صحيح!');
  } catch (error) {
    console.log('❌ فشل إنشاء حساب جديد:', error.response?.data?.message);
  }
}

testLocalRegistration();