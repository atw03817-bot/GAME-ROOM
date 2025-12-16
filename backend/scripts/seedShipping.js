import mongoose from 'mongoose';
import dotenv from 'dotenv';
import ShippingProvider from '../models/ShippingProvider.js';
import ShippingRate from '../models/ShippingRate.js';

dotenv.config();

const saudiCities = [
  'الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام', 'الخبر', 'الظهران',
  'الطائف', 'تبوك', 'بريدة', 'خميس مشيط', 'حائل', 'نجران', 'جازان', 'ينبع',
  'الأحساء', 'القطيف', 'الجبيل', 'أبها', 'عرعر', 'سكاكا', 'القريات'
];

const seedShipping = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB متصل');

    // Clear existing data
    await ShippingProvider.deleteMany({});
    await ShippingRate.deleteMany({});
    console.log('🗑️  تم حذف البيانات القديمة');

    // Create shipping providers
    const providers = await ShippingProvider.create([
      {
        name: 'smsa',
        displayName: 'سمسا - SMSA',
        enabled: true,
        testMode: true,
        settings: {
          description: 'شركة سمسا للشحن السريع'
        }
      },
      {
        name: 'aramex',
        displayName: 'أرامكس - Aramex',
        enabled: true,
        testMode: true,
        settings: {
          description: 'شركة أرامكس للشحن الدولي'
        }
      },
      {
        name: 'redbox',
        displayName: 'ريدبكس - RedBox',
        enabled: false,
        testMode: true,
        settings: {
          description: 'شركة ريدبكس للشحن'
        }
      }
    ]);

    console.log('✅ تم إنشاء شركات الشحن:', providers.length);

    // Create shipping rates for each provider and city
    const rates = [];
    
    for (const provider of providers) {
      for (const city of saudiCities) {
        let price, estimatedDays;
        
        // SMSA rates
        if (provider.name === 'smsa') {
          if (['الرياض', 'جدة', 'الدمام'].includes(city)) {
            price = 25;
            estimatedDays = 2;
          } else {
            price = 35;
            estimatedDays = 3;
          }
        }
        
        // Aramex rates
        else if (provider.name === 'aramex') {
          if (['الرياض', 'جدة', 'الدمام'].includes(city)) {
            price = 30;
            estimatedDays = 2;
          } else {
            price = 40;
            estimatedDays = 4;
          }
        }
        
        // RedBox rates
        else if (provider.name === 'redbox') {
          if (['الرياض', 'جدة', 'الدمام'].includes(city)) {
            price = 20;
            estimatedDays = 3;
          } else {
            price = 30;
            estimatedDays = 5;
          }
        }
        
        rates.push({
          providerId: provider._id,
          city,
          price,
          estimatedDays
        });
      }
    }

    await ShippingRate.insertMany(rates);
    console.log('✅ تم إنشاء أسعار الشحن:', rates.length);

    console.log('\n📊 الملخص:');
    console.log(`- شركات الشحن: ${providers.length}`);
    console.log(`- المدن: ${saudiCities.length}`);
    console.log(`- أسعار الشحن: ${rates.length}`);
    
    console.log('\n🎉 تم إضافة بيانات الشحن بنجاح!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedShipping();
