import mongoose from 'mongoose';
import StoreSettings from '../models/StoreSettings.js';
import dotenv from 'dotenv';

dotenv.config();

const initSettings = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store');
    console.log('✅ Connected to MongoDB');

    // Check if settings exist
    let settings = await StoreSettings.findOne({ singleton: true });

    if (settings) {
      console.log('📋 Settings already exist:');
      console.log('  - Store Name:', settings.storeName || 'Not set');
      console.log('  - COD Enabled:', settings.codEnabled);
      console.log('  - Tap Enabled:', settings.tapEnabled);
      console.log('  - Tap Secret Key:', settings.tapSecretKey ? '***' + settings.tapSecretKey.slice(-4) : 'Not set');
      console.log('  - Tap Public Key:', settings.tapPublicKey ? '***' + settings.tapPublicKey.slice(-4) : 'Not set');
    } else {
      console.log('🆕 Creating default settings...');
      settings = await StoreSettings.create({
        singleton: true,
        storeName: 'جيم روم',
        storeNameAr: 'جيم روم',
        storeDescription: 'متجر إلكتروني للجوالات والإلكترونيات',
        storeDescriptionAr: 'متجر إلكتروني للجوالات والإلكترونيات',
        contactEmail: 'info@gameroomstore.com',
        contactPhone: '+966500000000',
        currency: 'SAR',
        taxRate: 15,
        shippingEnabled: true,
        freeShippingEnabled: false,
        freeShippingThreshold: 200,
        codEnabled: true,
        tapEnabled: false,
        tapSecretKey: '',
        tapPublicKey: ''
      });
      console.log('✅ Default settings created successfully!');
    }

    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

initSettings();
