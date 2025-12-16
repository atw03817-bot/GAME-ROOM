import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store';

async function removeOldTapSettings() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Remove old Tap settings from StoreSettings
    const result = await mongoose.connection.db.collection('storesettings').updateMany(
      {},
      {
        $unset: {
          tapEnabled: '',
          tapSecretKey: '',
          tapPublicKey: ''
        }
      }
    );

    console.log('✅ Removed old Tap settings from StoreSettings');
    console.log(`   Modified ${result.modifiedCount} documents`);

    // Show current StoreSettings
    const settings = await mongoose.connection.db.collection('storesettings').findOne({ singleton: true });
    console.log('\n📋 Current StoreSettings:');
    console.log(JSON.stringify(settings, null, 2));

    console.log('\n✅ Done! Old Tap settings removed.');
    console.log('💡 Now use PaymentSettings for Tap Payment configuration.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
  }
}

removeOldTapSettings();
