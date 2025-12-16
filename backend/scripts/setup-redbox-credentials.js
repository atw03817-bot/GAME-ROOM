import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ShippingProvider from '../models/ShippingProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

async function setupRedBoxCredentials() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const redboxConfig = {
      name: 'redbox',
      displayName: 'ريدبوكس - RedBox',
      enabled: true,
      apiKey: process.env.REDBOX_API_KEY,
      apiSecret: process.env.REDBOX_ORGANIZATION_ID,
      apiUrl: process.env.REDBOX_API_URL,
      testMode: process.env.NODE_ENV === 'development',
      settings: {
        nameEn: 'RedBox',
        organizationId: process.env.REDBOX_ORGANIZATION_ID,
        defaultEstimatedDays: 3,
        supportsCOD: true,
        supportsTracking: true,
        webhookSecret: process.env.REDBOX_WEBHOOK_SECRET
      }
    };

    // تحديث أو إنشاء إعدادات RedBox
    const result = await ShippingProvider.findOneAndUpdate(
      { name: 'redbox' },
      redboxConfig,
      { 
        upsert: true, 
        new: true,
        runValidators: true 
      }
    );

    console.log('✅ RedBox credentials updated successfully!');
    console.log('📋 Configuration:');
    console.log(`   - Organization ID: ${process.env.REDBOX_ORGANIZATION_ID}`);
    console.log(`   - API URL: ${process.env.REDBOX_API_URL}`);
    console.log(`   - Enabled: ${result.enabled}`);
    console.log(`   - Test Mode: ${result.testMode}`);
    console.log(`   - Has API Key: ${!!result.apiKey}`);

    console.log('\n🚀 RedBox is now ready to use!');
    console.log('\n📝 Next steps:');
    console.log('1. Test the integration: npm run test:redbox');
    console.log('2. Create a test order to verify shipment creation');
    console.log('3. Configure webhook URL in RedBox dashboard');

  } catch (error) {
    console.error('❌ Error setting up RedBox credentials:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

setupRedBoxCredentials();