// إنشاء حساب مدير بدون dependencies خارجية
const https = require('https');

const createAdmin = async () => {
  console.log('🚀 إنشاء حساب مدير عبر API...');
  
  // بيانات المدير - غير هذه البيانات
  const adminData = {
    phone: '0501234567', // ضع رقم جوالك
    password: 'Admin@123456' // ضع كلمة مرور قوية
  };
  
  console.log('📝 بيانات المدير:');
  console.log(`📱 رقم الجوال: ${adminData.phone}`);
  console.log(`🔐 كلمة المرور: ${adminData.password}`);
  console.log('');
  
  const postData = JSON.stringify(adminData);
  
  const options = {
    hostname: 'www.ab-tw.com',
    port: 443,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log(`📊 كود الحالة: ${res.statusCode}`);
        console.log('');
        
        try {
          const response = JSON.parse(data);
          
          if (res.statusCode === 201 || res.statusCode === 200) {
            console.log('✅ تم إنشاء الحساب بنجاح!');
            console.log('');
            console.log('📋 معلومات الحساب:');
            console.log(`ID: ${response.user?.id || 'غير متوفر'}`);
            console.log(`رقم الجوال: ${response.user?.phone || adminData.phone}`);
            console.log(`الاسم: ${response.user?.name || 'عميل ' + adminData.phone}`);
            console.log(`الدور: ${response.user?.role || 'USER'}`);
            console.log('');
            
            if (response.user?.role !== 'ADMIN') {
              console.log('⚠️ الحساب تم إنشاؤه كعميل عادي');
              console.log('💡 إذا كان هذا أول حساب، يجب أن يكون مدير تلقائياً');
              console.log('🔧 إذا لم يكن كذلك، تحقق من قاعدة البيانات');
            }
            
            console.log('🔗 روابط مهمة:');
            console.log(`   🌐 تسجيل الدخول: https://www.ab-tw.com/login`);
            console.log(`   ⚙️  لوحة الإدارة: https://www.ab-tw.com/admin`);
            console.log('');
            console.log('⚠️ تذكر تغيير كلمة المرور بعد تسجيل الدخول');
            
          } else {
            console.log('❌ فشل في إنشاء الحساب');
            console.log(`📋 الرسالة: ${response.message || 'خطأ غير معروف'}`);
            
            if (response.message && response.message.includes('مستخدم')) {
              console.log('');
              console.log('💡 السبب: رقم الجوال مستخدم بالفعل');
              console.log('🔧 الحل: استخدم رقم جوال آخر أو سجل دخول بالحساب الموجود');
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
      reject(error);
    });
    
    req.write(postData);
    req.end();
  });
};

// تشغيل الدالة
createAdmin().catch(console.error);