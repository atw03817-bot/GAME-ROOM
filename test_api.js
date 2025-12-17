// اختبار API التحليلات
const testAPI = async () => {
  try {
    // تسجيل دخول admin
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'admin@ab-tw.com',
        password: 'admin123'
      })
    });

    const loginData = await loginResponse.json();
    console.log('Login response:', loginData);

    if (loginData.success && loginData.token) {
      // اختبار API التحليلات
      const analyticsResponse = await fetch('http://localhost:5000/api/real-analytics/dashboard', {
        headers: {
          'Authorization': `Bearer ${loginData.token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Analytics response status:', analyticsResponse.status);
      const analyticsData = await analyticsResponse.json();
      console.log('Analytics data:', analyticsData);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

testAPI();