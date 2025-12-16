import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import ShippingProvider from '../models/ShippingProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

const providers = [
  {
    name: 'smsa',
    displayName: 'سمسا - SMSA',
    enabled: true,
    apiKey: '',
    apiSecret: '',
    apiUrl: 'https://api.smsa.com/v1',
    testMode: true,
    settings: {
      nameEn: 'SMSA Express',
      defaultEstimatedDays: 3,
      supportsCOD: true,
      supportsTracking: true
    }
  },
  {
    name: 'aramex',
    displayName: 'أرامكس - Aramex',
    enabled: true,
    apiKey: '',
    apiSecret: '',
    apiUrl: 'https://ws.aramex.net/ShippingAPI.V2',
    testMode: true,
    settings: {
      nameEn: 'Aramex',
      defaultEstimatedDays: 4,
      supportsCOD: true,
      supportsTracking: true
    }
  },
  {
    name: 'redbox',
    displayName: 'ريدبوكس - RedBox',
    enabled: true,
    apiKey: '',
    apiSecret: '',
    apiUrl: 'https://api.redboxsa.com/v1',
    testMode: true,
    settings: {
      nameEn: 'RedBox',
      defaultEstimatedDays: 3,
      supportsCOD: true,
      supportsTracking: true
    }
  }
];

async function initShippingProviders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    for (const providerData of providers) {
      const existing = await ShippingProvider.findOne({ name: providerData.name });
      
      if (existing) {
        console.log(`⏭️  ${providerData.displayName} already exists`);
      } else {
        await ShippingProvider.create(providerData);
        console.log(`✅ Created ${providerData.displayName}`);
      }
    }

    console.log('\n✅ Shipping providers initialized successfully!');
    console.log('\n📝 Next steps:');
    console.log('1. Go to Admin > Settings > شركات الشحن');
    console.log('2. Enable the providers you want to use');
    console.log('3. Add API credentials for each provider');
    console.log('4. Configure shipping rates in Admin > Shipping Rates');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

initShippingProviders();
