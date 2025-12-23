import mongoose from 'mongoose';
import ShippingProvider from '../models/ShippingProvider.js';
import ShippingRate from '../models/ShippingRate.js';
import dotenv from 'dotenv';

dotenv.config();

async function addSampleShippingRates() {
  try {
    console.log('🚚 إضافة أسعار شحن تجريبية...');
    
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // جلب شركات الشحن المفعلة
    const providers = await ShippingProvider.find({ enabled: true });
    console.log(`📦 تم العثور على ${providers.length} شركة شحن مفعلة`);

    if (providers.length === 0) {
      console.log('⚠️ لا توجد شركات شحن مفعلة. يرجى تفعيل شركات الشحن أولاً.');
      return;
    }

    // المدن الرئيسية في السعودية مع أسعار مختلفة
    const cities = [
      { name: 'الرياض', basePrice: 15 },
      { name: 'جدة', basePrice: 18 },
      { name: 'الدمام', basePrice: 20 },
      { name: 'مكة المكرمة', basePrice: 22 },
      { name: 'المدينة المنورة', basePrice: 25 },
      { name: 'الطائف', basePrice: 28 },
      { name: 'تبوك', basePrice: 30 },
      { name: 'بريدة', basePrice: 25 },
      { name: 'خميس مشيط', basePrice: 32 },
      { name: 'حائل', basePrice: 35 },
      { name: 'الجبيل', basePrice: 22 },
      { name: 'ينبع', basePrice: 28 },
      { name: 'الخبر', basePrice: 20 },
      { name: 'الأحساء', basePrice: 25 },
      { name: 'القطيف', basePrice: 22 },
      { name: 'نجران', basePrice: 40 },
      { name: 'جازان', basePrice: 45 },
      { name: 'أبها', basePrice: 35 },
      { name: 'الباحة', basePrice: 38 },
      { name: 'سكاكا', basePrice: 42 }
    ];

    let addedCount = 0;
    let skippedCount = 0;

    for (const provider of providers) {
      console.log(`\n🏢 معالجة شركة: ${provider.displayName}`);
      
      // تحديد معامل السعر لكل شركة
      let priceMultiplier = 1;
      let estimatedDays = 2;
      
      switch (provider.name) {
        case 'aramex':
          priceMultiplier = 1.2; // أرامكس أغلى قليلاً
          estimatedDays = 1; // أسرع
          break;
        case 'smsa':
          priceMultiplier = 0.9; // سمسا أرخص
          estimatedDays = 3; // أبطأ
          break;
        case 'redbox':
          priceMultiplier = 1.0; // السعر الأساسي
          estimatedDays = 2; // متوسط
          break;
        default:
          priceMultiplier = 1.1;
          estimatedDays = 2;
      }

      for (const city of cities) {
        // التحقق من وجود سعر مسبق
        const existingRate = await ShippingRate.findOne({
          providerId: provider._id,
          city: city.name
        });

        if (existingRate) {
          console.log(`   ⏭️ تم تخطي ${city.name} - يوجد سعر مسبق`);
          skippedCount++;
          continue;
        }

        // حساب السعر النهائي
        const finalPrice = Math.round(city.basePrice * priceMultiplier);

        // إنشاء سعر الشحن
        await ShippingRate.create({
          providerId: provider._id,
          city: city.name,
          price: finalPrice,
          estimatedDays: estimatedDays
        });

        console.log(`   ✅ ${city.name}: ${finalPrice} ر.س (${estimatedDays} أيام)`);
        addedCount++;
      }
    }

    console.log('\n📊 ملخص العملية:');
    console.log(`   ✅ تم إضافة: ${addedCount} سعر شحن`);
    console.log(`   ⏭️ تم تخطي: ${skippedCount} سعر موجود مسبقاً`);

    // عرض إحصائيات
    const totalRates = await ShippingRate.countDocuments();
    const totalCities = await ShippingRate.distinct('city');
    
    console.log('\n📈 الإحصائيات النهائية:');
    console.log(`   📦 إجمالي أسعار الشحن: ${totalRates}`);
    console.log(`   🏙️ عدد المدن المغطاة: ${totalCities.length}`);
    console.log(`   🚚 شركات الشحن المفعلة: ${providers.length}`);

    console.log('\n🎉 تم إضافة أسعار الشحن التجريبية بنجاح!');
    console.log('\n📝 الخطوات التالية:');
    console.log('   1. ادخل إلى لوحة الإدارة → أسعار الشحن');
    console.log('   2. راجع الأسعار وعدلها حسب الحاجة');
    console.log('   3. أضف مدن جديدة أو عدل الأسعار الموجودة');

  } catch (error) {
    console.error('❌ خطأ في إضافة أسعار الشحن:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

// تشغيل السكريبت
addSampleShippingRates();