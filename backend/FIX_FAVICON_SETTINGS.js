// إصلاح إعدادات الفافيكون في قاعدة البيانات
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const fixFaviconSettings = async () => {
  try {
    console.log('🔧 FIXING FAVICON SETTINGS');
    console.log('='.repeat(40));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // البحث عن إعدادات المتجر
    const StoreSettings = mongoose.model('StoreSettings', new mongoose.Schema({}, { strict: false }));
    
    let settings = await StoreSettings.findOne({ singleton: true });
    
    if (!settings) {
      console.log('⚠️ No store settings found, creating default...');
      settings = await StoreSettings.create({
        singleton: true,
        storeName: 'جيم روم',
        storeNameAr: 'جيم روم',
        storeNameEn: 'Game Room',
        storeDescription: 'متجر إلكتروني للجوالات والإلكترونيات',
        siteMetadata: {
          title: 'جيم روم',
          titleEn: 'Game Room',
          description: 'أفضل متجر هواتف ذكية في السعودية',
          descriptionEn: 'Best smartphone store in Saudi Arabia',
          keywords: 'جوالات, هواتف ذكية, إكسسوارات, جيم روم',
          keywordsEn: 'mobile, smartphones, accessories, electronics',
          favicon: '/favicon.ico',
          appleTouchIcon: '/apple-touch-icon.png',
          ogImage: '/og-image.jpg'
        }
      });
    }

    console.log('📊 Current settings:');
    console.log('   Store Name:', settings.storeName);
    console.log('   Favicon:', settings.siteMetadata?.favicon);
    console.log('   Apple Touch Icon:', settings.siteMetadata?.appleTouchIcon);

    // التحقق من وجود الأيقونات المرفوعة
    const uploadedIcons = await mongoose.connection.db.collection('fs.files').find({
      filename: { $regex: /(favicon|apple-touch-icon)/ }
    }).toArray();

    console.log('\n📁 Uploaded icons found:');
    uploadedIcons.forEach((icon, index) => {
      console.log(`   ${index + 1}. ${icon.filename} (${new Date(icon.uploadDate).toLocaleDateString()})`);
    });

    // إذا كان فيه أيقونات مرفوعة، استخدمها
    if (uploadedIcons.length > 0) {
      const latestFavicon = uploadedIcons.find(icon => icon.filename.includes('favicon'));
      const latestAppleIcon = uploadedIcons.find(icon => icon.filename.includes('apple-touch-icon'));

      const updatedMetadata = { ...settings.siteMetadata };

      if (latestFavicon) {
        updatedMetadata.favicon = `/uploads/${latestFavicon.filename}`;
        console.log('✅ Updated favicon to:', updatedMetadata.favicon);
      }

      if (latestAppleIcon) {
        updatedMetadata.appleTouchIcon = `/uploads/${latestAppleIcon.filename}`;
        console.log('✅ Updated apple touch icon to:', updatedMetadata.appleTouchIcon);
      }

      // تحديث الإعدادات
      await StoreSettings.updateOne(
        { singleton: true },
        { $set: { siteMetadata: updatedMetadata } }
      );

      console.log('\n✅ Settings updated successfully!');
    } else {
      console.log('\n⚠️ No uploaded icons found. Using default paths.');
      
      // التأكد من وجود الإعدادات الافتراضية
      const defaultMetadata = {
        ...settings.siteMetadata,
        favicon: settings.siteMetadata?.favicon || '/favicon.ico',
        appleTouchIcon: settings.siteMetadata?.appleTouchIcon || '/apple-touch-icon.png'
      };

      await StoreSettings.updateOne(
        { singleton: true },
        { $set: { siteMetadata: defaultMetadata } }
      );
    }

    // عرض الإعدادات النهائية
    const finalSettings = await StoreSettings.findOne({ singleton: true });
    console.log('\n📋 Final favicon settings:');
    console.log('   Favicon:', finalSettings.siteMetadata?.favicon);
    console.log('   Apple Touch Icon:', finalSettings.siteMetadata?.appleTouchIcon);
    console.log('   OG Image:', finalSettings.siteMetadata?.ogImage);

    console.log('\n🎯 Next steps:');
    console.log('1. Restart the frontend to reload settings');
    console.log('2. Clear browser cache');
    console.log('3. Check if icons appear correctly');

  } catch (error) {
    console.error('❌ Fix failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

fixFaviconSettings();