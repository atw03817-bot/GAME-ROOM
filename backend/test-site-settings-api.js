import axios from 'axios';

async function testSiteSettingsAPI() {
  try {
    console.log('🧪 Testing Site Settings API...');
    
    // Test GET
    console.log('\n1. Testing GET /api/site-settings');
    const getResponse = await axios.get('http://localhost:5000/api/site-settings');
    console.log('✅ GET Success:', getResponse.data.success);
    console.log('📄 Current settings keys:', Object.keys(getResponse.data.settings || {}));
    
    // Test PUT with simple data
    console.log('\n2. Testing PUT /api/site-settings');
    const testData = {
      header: {
        storeName: 'Test Store Name',
        showStoreNameMobile: true
      }
    };
    
    const putResponse = await axios.put('http://localhost:5000/api/site-settings', testData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-token'
      }
    });
    
    console.log('✅ PUT Success:', putResponse.data.success);
    console.log('💾 Updated settings:', putResponse.data.settings?.header?.storeName);
    
  } catch (error) {
    console.error('❌ API Test Failed:');
    console.error('Status:', error.response?.status);
    console.error('Message:', error.response?.data?.message || error.message);
    console.error('Error:', error.response?.data?.error);
  }
}

testSiteSettingsAPI();