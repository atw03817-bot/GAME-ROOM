// سكريبت لتشخيص المشكلة الحقيقية في السيرفر
const testServerAPI = async () => {
  console.log('🔍 DEBUGGING SERVER API - تشخيص مشكلة السيرفر');
  console.log('='.repeat(60));

  // 1. اختبار الاتصال بالسيرفر
  console.log('\n1️⃣ Testing server connection...');
  try {
    const healthResponse = await fetch('https://api.ab-tw.com/api/health');
    if (healthResponse.ok) {
      const healthData = await healthResponse.json();
      console.log('✅ Server is online:', healthData);
    } else {
      console.log('❌ Server health check failed:', healthResponse.status);
    }
  } catch (error) {
    console.log('❌ Cannot connect to server:', error.message);
    return;
  }

  // 2. اختبار التسجيل مع تفاصيل الخطأ
  console.log('\n2️⃣ Testing registration with detailed error logging...');
  
  const testData = {
    phone: '0501234567',
    password: '123456'
  };

  try {
    const response = await fetch('https://api.ab-tw.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Response Status:', response.status);
    console.log('📡 Response Headers:');
    for (const [key, value] of response.headers.entries()) {
      console.log(`   ${key}: ${value}`);
    }

    const responseText = await response.text();
    console.log('📄 Raw Response Body:', responseText);

    if (responseText) {
      try {
        const jsonData = JSON.parse(responseText);
        console.log('📋 Parsed JSON Response:', JSON.stringify(jsonData, null, 2));
      } catch (parseError) {
        console.log('❌ Response is not valid JSON');
        console.log('📄 Raw text response:', responseText);
      }
    } else {
      console.log('❌ Empty response body');
    }

  } catch (networkError) {
    console.log('❌ Network Error:', networkError.message);
  }

  // 3. اختبار endpoint مختلف للتأكد
  console.log('\n3️⃣ Testing different endpoint...');
  try {
    const productsResponse = await fetch('https://api.ab-tw.com/api/products?limit=1');
    console.log('📦 Products endpoint status:', productsResponse.status);
    
    if (productsResponse.status === 500) {
      const errorText = await productsResponse.text();
      console.log('📄 Products error response:', errorText);
    }
  } catch (error) {
    console.log('❌ Products endpoint error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🏁 Debugging completed. Check the logs above for the real issue.');
};

// تشغيل التشخيص
testServerAPI().catch(console.error);