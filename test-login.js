import axios from 'axios';

async function testLogin() {
  try {
    console.log('🔍 Testing login...');
    
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      email: 'admin@ab-tw.com',
      password: '123456'
    });

    console.log('✅ Login successful!');
    console.log('Response:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('❌ Login failed!');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message);
    console.error('Full error:', error.response?.data);
  }
}

testLogin();
