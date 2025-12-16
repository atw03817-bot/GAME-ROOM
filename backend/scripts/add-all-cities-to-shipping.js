import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// تحميل .env من مجلد backend
dotenv.config({ path: join(__dirname, '../.env') });

// قائمة جميع المدن السعودية
const allSaudiCities = [
  // منطقة الرياض
  { cityName: 'Riyadh', cityNameAr: 'الرياض', basePrice: 25 },
  { cityName: 'Al Kharj', cityNameAr: 'الخرج', basePrice: 30 },
  { cityName: 'Diriyah', cityNameAr: 'الدرعية', basePrice: 25 },
  { cityName: 'Al Dawadmi', cityNameAr: 'الدوادمي', basePrice: 35 },
  { cityName: 'Al Majmaah', cityNameAr: 'المجمعة', basePrice: 30 },
  { cityName: 'Al Quwayiyah', cityNameAr: 'القويعية', basePrice: 35 },
  { cityName: 'Wadi Al Dawasir', cityNameAr: 'وادي الدواسر', basePrice: 40 },
  { cityName: 'Al Aflaj', cityNameAr: 'الأفلاج', basePrice: 35 },
  { cityName: 'Al Zulfi', cityNameAr: 'الزلفي', basePrice: 30 },
  { cityName: 'Shaqra', cityNameAr: 'شقراء', basePrice: 30 },
  
  // منطقة مكة المكرمة
  { cityName: 'Makkah', cityNameAr: 'مكة المكرمة', basePrice: 30 },
  { cityName: 'Jeddah', cityNameAr: 'جدة', basePrice: 30 },
  { cityName: 'Taif', cityNameAr: 'الطائف', basePrice: 35 },
  { cityName: 'Al Qunfudhah', cityNameAr: 'القنفذة', basePrice: 40 },
  { cityName: 'Al Lith', cityNameAr: 'الليث', basePrice: 40 },
  { cityName: 'Rabigh', cityNameAr: 'رابغ', basePrice: 35 },
  { cityName: 'Khulais', cityNameAr: 'خليص', basePrice: 35 },
  
  // المدينة المنورة
  { cityName: 'Madinah', cityNameAr: 'المدينة المنورة', basePrice: 35 },
  { cityName: 'Yanbu', cityNameAr: 'ينبع', basePrice: 40 },
  { cityName: 'Al Ula', cityNameAr: 'العلا', basePrice: 45 },
  { cityName: 'Mahd Al Dhahab', cityNameAr: 'مهد الذهب', basePrice: 40 },
  { cityName: 'Badr', cityNameAr: 'بدر', basePrice: 35 },
  { cityName: 'Khaybar', cityNameAr: 'خيبر', basePrice: 40 },
  
  // المنطقة الشرقية
  { cityName: 'Dammam', cityNameAr: 'الدمام', basePrice: 30 },
  { cityName: 'Khobar', cityNameAr: 'الخبر', basePrice: 30 },
  { cityName: 'Dhahran', cityNameAr: 'الظهران', basePrice: 30 },
  { cityName: 'Jubail', cityNameAr: 'الجبيل', basePrice: 35 },
  { cityName: 'Al Ahsa', cityNameAr: 'الأحساء', basePrice: 35 },
  { cityName: 'Qatif', cityNameAr: 'القطيف', basePrice: 30 },
  { cityName: 'Hafar Al Batin', cityNameAr: 'حفر الباطن', basePrice: 40 },
  { cityName: 'Khafji', cityNameAr: 'الخفجي', basePrice: 45 },
  
  // منطقة عسير
  { cityName: 'Abha', cityNameAr: 'أبها', basePrice: 40 },
  { cityName: 'Khamis Mushait', cityNameAr: 'خميس مشيط', basePrice: 40 },
  { cityName: 'Bisha', cityNameAr: 'بيشة', basePrice: 45 },
  { cityName: 'Al Namas', cityNameAr: 'النماص', basePrice: 45 },
  { cityName: 'Muhayil', cityNameAr: 'محايل', basePrice: 45 },
  
  // منطقة تبوك
  { cityName: 'Tabuk', cityNameAr: 'تبوك', basePrice: 45 },
  { cityName: 'Al Wajh', cityNameAr: 'الوجه', basePrice: 50 },
  { cityName: 'Duba', cityNameAr: 'ضباء', basePrice: 50 },
  { cityName: 'Tayma', cityNameAr: 'تيماء', basePrice: 50 },
  { cityName: 'Umluj', cityNameAr: 'أملج', basePrice: 50 },
  { cityName: 'Haql', cityNameAr: 'حقل', basePrice: 55 },
  
  // منطقة القصيم
  { cityName: 'Buraidah', cityNameAr: 'بريدة', basePrice: 30 },
  { cityName: 'Unaizah', cityNameAr: 'عنيزة', basePrice: 30 },
  { cityName: 'Al Rass', cityNameAr: 'الرس', basePrice: 35 },
  { cityName: 'Al Mithnab', cityNameAr: 'المذنب', basePrice: 35 },
  { cityName: 'Al Bukayriyah', cityNameAr: 'البكيرية', basePrice: 35 },
  
  // منطقة حائل
  { cityName: 'Hail', cityNameAr: 'حائل', basePrice: 40 },
  { cityName: 'Baqaa', cityNameAr: 'بقعاء', basePrice: 45 },
  { cityName: 'Al Ghazalah', cityNameAr: 'الغزالة', basePrice: 45 },
  
  // منطقة الحدود الشمالية
  { cityName: 'Arar', cityNameAr: 'عرعر', basePrice: 50 },
  { cityName: 'Rafha', cityNameAr: 'رفحاء', basePrice: 55 },
  { cityName: 'Turaif', cityNameAr: 'طريف', basePrice: 55 },
  
  // منطقة جازان
  { cityName: 'Jazan', cityNameAr: 'جازان', basePrice: 45 },
  { cityName: 'Sabya', cityNameAr: 'صبيا', basePrice: 45 },
  { cityName: 'Abu Arish', cityNameAr: 'أبو عريش', basePrice: 45 },
  { cityName: 'Samtah', cityNameAr: 'صامطة', basePrice: 45 },
  { cityName: 'Baysh', cityNameAr: 'بيش', basePrice: 50 },
  { cityName: 'Farasan', cityNameAr: 'فرسان', basePrice: 55 },
  
  // منطقة نجران
  { cityName: 'Najran', cityNameAr: 'نجران', basePrice: 45 },
  { cityName: 'Sharurah', cityNameAr: 'شرورة', basePrice: 55 },
  { cityName: 'Habuna', cityNameAr: 'حبونا', basePrice: 50 },
  
  // منطقة الباحة
  { cityName: 'Al Bahah', cityNameAr: 'الباحة', basePrice: 40 },
  { cityName: 'Baljurashi', cityNameAr: 'بلجرشي', basePrice: 40 },
  { cityName: 'Al Mandaq', cityNameAr: 'المندق', basePrice: 45 },
  { cityName: 'Al Mikhwah', cityNameAr: 'المخواة', basePrice: 45 },
  
  // منطقة الجوف
  { cityName: 'Sakaka', cityNameAr: 'سكاكا', basePrice: 50 },
  { cityName: 'Al Qurayyat', cityNameAr: 'القريات', basePrice: 50 },
  { cityName: 'Dumat Al Jandal', cityNameAr: 'دومة الجندل', basePrice: 50 },
  { cityName: 'Tabarjal', cityNameAr: 'طبرجل', basePrice: 55 },
];

const ShippingProviderSchema = new mongoose.Schema({
  name: String,
  nameAr: String,
  isActive: Boolean,
  cities: [{
    cityName: String,
    cityNameAr: String,
    price: Number,
    isActive: Boolean
  }]
});

const ShippingProvider = mongoose.model('ShippingProvider', ShippingProviderSchema);

async function addAllCitiesToShipping() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // جلب جميع شركات الشحن
    const providers = await ShippingProvider.find();
    console.log(`📦 Found ${providers.length} shipping providers`);

    for (const provider of providers) {
      console.log(`\n🚚 Processing: ${provider.nameAr}`);
      
      // إنشاء قائمة المدن الجديدة
      const newCities = allSaudiCities.map(city => ({
        cityName: city.cityName,
        cityNameAr: city.cityNameAr,
        price: city.basePrice,
        isActive: true
      }));

      // تحديث شركة الشحن
      provider.cities = newCities;
      await provider.save();
      
      console.log(`✅ Added ${newCities.length} cities to ${provider.nameAr}`);
    }

    console.log('\n🎉 All cities added successfully!');
    console.log(`📊 Total cities per provider: ${allSaudiCities.length}`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

// تشغيل السكريبت
addAllCitiesToShipping();
