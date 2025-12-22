// اختبار API تسجيل الدخول مباشرة
const https = require('https');

async function testLoginAPI() {
  console.log('🧪 اختبار API تسجيل الدخول');
  console.log('===========================');
  console.log('');

  const loginData = {
    phone: '0500909030',
    password: '123456'
  };

  console.log(`📱 رقم الجوال: ${loginData.phone}`);
  console.log(`🔐 كلمة المرور: ${loginData.password}`);
  console.log('🌐 الخادم: https://www.ab-tw.com/api/auth/login');
  console.log('');

  const postData = JSON.stringify(loginData);

  const options = {
    hostname: 'www.ab-tw.com',
    port: 443,
    path: '/api/auth/login',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      'User-Agent': 'Admin-Test-Script'
    }
  };

  return new Promise((resolve, reject) => {
    console.log('📡 إرسال طلب تسجيل الدخول...');
    
    const req = https.request(options, (res) => {
      let data = '';
      
      console.log(`📊 كود الحالة: ${res.statusCode}`);
      console.log(`📋 Headers: ${JSON.stringify(res.headers, null, 2)}`);
      console.log('');

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log('📥 استجابة الخادم:');
        console.log('==================');
        
        try {
          const response = JSON.parse(data);
          console.log(JSON.stringify(response, null, 2));
          
          if (res.statusCode === 200 && response.success) {
            console.log('');
            console.log('✅ تسجيل الدخول نجح!');
            console.log(`🔑 Token: ${response.token ? response.token.substring(0, 20) + '...' : 'غير موجود'}`);
            console.log(`👤 معلومات المستخدم:`);
            console.log(`   - الاسم: ${response.user?.name || 'غير محدد'}`);
            console.log(`   - الدور: ${response.user?.role || 'غير محدد'}`);
            console.log(`   - رقم الجوال: ${response.user?.phone || 'غير محدد'}`);
          } else {
            console.log('');
            console.log('❌ فشل تسجيل الدخول');
            console.log(`📝 الرسالة: ${response.message || 'غير محددة'}`);
            
            if (response.message) {
              if (response.message.includes('غير صحيحة') || response.message.includes('incorrect')) {
                console.log('💡 السبب: رقم الجوال أو كلمة المرور غير صحيحة');
              } else if (response.message.includes('غير مفعل') || response.message.includes('inactive')) {
                console.log('💡 السبب: الحساب غير مفعل');
              }
            }
          }
          
        } catch (parseError) {
          console.log('❌ خطأ في تحليل الاستجابة:');
          console.log(data);
        }
        
        resolve();
      });
    });

    req.on('error', (error) => {
      console.error('❌ خطأ في الطلب:', error.message);
      
      if (error.code === 'ENOTFOUND') {
        console.log('💡 السبب: لا يمكن الوصول للخادم');
        console.log('🔧 الحل: تحقق من الاتصال بالإنترنت أو عنوان الخادم');
      } else if (error.code === 'ECONNREFUSED') {
        console.log('💡 السبب: الخادم رفض الاتصال');
        console.log('🔧 الحل: تأكد من أن الخادم يعمل');
      }
      
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

// تشغيل الاختبار
console.log('🚀 بدء اختبار تسجيل الدخول');
console.log('📅 التاريخ:', new Date().toLocaleString('ar-SA'));
console.log('');

testLoginAPI().catch(console.error);