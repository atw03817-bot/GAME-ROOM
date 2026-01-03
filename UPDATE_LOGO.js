// Script لتحديث الشعار في قاعدة البيانات
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './backend/.env' });

// نموذج الإعدادات
const storeSettingsSchema = new mongoose.Schema({}, { strict: false });
const StoreSettings = mongoose.model('StoreSettings', storeSettingsSchema);

async function updateLogo() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    // البحث عن إعدادات المتجر
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      console.log('❌ لم يتم العثور على إعدادات');
      return;
    }

    // تحديث الشعار
    if (!settings.header) {
      settings.header = {};
    }
    
    settings.header.logo = '/gameroom-logo.svg';
    settings.header.storeName = 'جيم روم';
    settings.header.tagline = 'متجر الألعاب الإلكترونية';

    await settings.save();
    console.log('✅ تم تحديث الشعار بنجاح');
    console.log('🎮 الشعار الجديد:', settings.header.logo);
    
  } catch (error) {
    console.error('❌ خطأ:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال');
  }
}

updateLogo();