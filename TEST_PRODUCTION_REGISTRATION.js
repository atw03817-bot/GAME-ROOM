// اختبار التسجيل على السيرفر الحقيقي
const testRegistration = async () => {
  const testData = {
    phone: '0501234567',
    password: '123456'
  };

  console.log('🧪 Testing registration on production server...');
  console.log('📱 Phone:', testData.phone);
  console.log('🔐 Password:', testData.password);

  try {
    const response = await fetch('https://api.ab-tw.com/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));

    const data = await response.text();
    console.log('📄 Raw response:', data);

    try {
      const jsonData = JSON.parse(data);
      console.log('✅ Parsed JSON:', jsonData);
    } catch (e) {
      console.log('❌ Failed to parse JSON, raw response:', data);
    }

  } catch (error) {
    console.error('❌ Network error:', error);
  }
};

// اختبار الاتصال بالسيرفر أولاً
const testServerHealth = async () => {
  try {
    console.log('🏥 Testing server health...');
    const response = await fetch('https://api.ab-tw.com/api/health');
    const data = await response.json();
    console.log('✅ Server health:', data);
    return true;
  } catch (error) {
    console.error('❌ Server health check failed:', error);
    return false;
  }
};

// تشغيل الاختبارات
const runTests = async () => {
  console.log('🚀 Starting production server tests...\n');
  
  const isHealthy = await testServerHealth();
  if (!isHealthy) {
    console.log('❌ Server is not healthy, stopping tests');
    return;
  }

  console.log('\n' + '='.repeat(50));
  await testRegistration();
};

runTests();