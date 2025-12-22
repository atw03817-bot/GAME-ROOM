// تحديث مسارات الفافيكون لتكون نسبية
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const updateFaviconPaths = async () => {
  try {
    console.log('🔄 UPDATING FAVICON PATHS');
    console.log('='.repeat(40));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    const StoreSettings = mongoose.model('StoreSettings', new mongoose.Schema({}, { strict: false }));
    const settings = await StoreSettings.findOne({ singleton: true });

    if (!settings) {
      console.log('❌ No settings found');
      return;
    }

    console.log('📊 Current paths:');
    console.log('   Favicon:', settings.siteMetadata?.favicon);
    console.log('   Apple Touch Icon:', settings.siteMetadata?.appleTouchIcon);

    // تحديث المسارات لتكون نسبية
    const updatedMetadata = {
      ...settings.siteMetadata,
      favicon: '/uploads/favicon-1765388453768.png',
      appleTouchIcon: '/uploads/apple-touch-icon-1765388456398.png',
      ogImage: '/uploads/apple-touch-icon-1765388456398.png'
    };

    await StoreSettings.updateOne(
      { singleton: true },
      { $set: { siteMetadata: updatedMetadata } }
    );

    console.log('\n✅ Updated paths:');
    console.log('   Favicon:', updatedMetadata.favicon);
    console.log('   Apple Touch Icon:', updatedMetadata.appleTouchIcon);
    console.log('   OG Image:', updatedMetadata.ogImage);

    console.log('\n🎯 Favicon should now work correctly!');

  } catch (error) {
    console.error('❌ Update failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

updateFaviconPaths();