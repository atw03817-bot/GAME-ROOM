import mongoose from 'mongoose';
import PaymentSettings from './backend/models/PaymentSettings.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkTabbySettings() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile_store');
    console.log('✅ Connected to MongoDB');

    // Check Tabby settings
    const tabbySettings = await PaymentSettings.findOne({ provider: 'tabby' });
    
    if (tabbySettings) {
      console.log('✅ Tabby settings found:');
      console.log('- Provider:', tabbySettings.provider);
      console.log('- Enabled:', tabbySettings.enabled);
      console.log('- Has Public Key:', !!tabbySettings.config?.publicKey);
      console.log('- Has Secret Key:', !!tabbySettings.config?.secretKey);
      console.log('- Merchant Code:', tabbySettings.config?.merchantCode || 'Not set');
      console.log('- API URL:', tabbySettings.config?.apiUrl || 'Not set');
      
      if (!tabbySettings.enabled) {
        console.log('⚠️ Tabby is not enabled');
      }
      
      if (!tabbySettings.config?.publicKey || !tabbySettings.config?.secretKey) {
        console.log('⚠️ Missing API keys');
      }
    } else {
      console.log('❌ No Tabby settings found in database');
      console.log('Creating default Tabby settings...');
      
      const newTabbySettings = new PaymentSettings({
        provider: 'tabby',
        enabled: true,
        config: {
          publicKey: 'pk_test_01968174-594d-7042-be8f-f9d25036ec54',
          secretKey: 'sk_test_01968174-594d-7042-be8f-f9d2b3c79dce',
          merchantCode: 'top1',
          apiUrl: 'https://api.tabby.ai'
        }
      });
      
      await newTabbySettings.save();
      console.log('✅ Created default Tabby settings');
    }

    // Check all payment methods
    console.log('\n📋 All payment settings:');
    const allSettings = await PaymentSettings.find({});
    allSettings.forEach(setting => {
      console.log(`- ${setting.provider}: ${setting.enabled ? 'Enabled' : 'Disabled'}`);
    });

    // Test the payment methods endpoint logic
    console.log('\n🧪 Testing payment methods logic:');
    const enabledSettings = await PaymentSettings.find({ enabled: true });
    const methods = [];
    
    for (const setting of enabledSettings) {
      if (setting.provider === 'tabby' && setting.config?.secretKey && setting.config?.publicKey) {
        methods.push({
          provider: 'tabby',
          enabled: true,
          name: 'Tabby - ادفع على 4 دفعات'
        });
        console.log('✅ Tabby would be included in payment methods');
      }
    }
    
    if (methods.length === 0) {
      console.log('❌ Tabby would NOT be included in payment methods');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

checkTabbySettings();