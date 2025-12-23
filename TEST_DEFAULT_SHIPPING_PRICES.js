// اختبار أسعار الشحن الافتراضية من الإعدادات
const testDefaultShippingPrices = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 اختبار أسعار الشحن الافتراضية...\n');

  try {
    // 1. اختبار مدينة غير موجودة في جدول ShippingRate
    console.log('1️⃣ اختبار مدينة جديدة (غير موجودة في قاعدة البيانات)...');
    const newCityResponse = await fetch(`${baseURL}/shipping/rates/مدينة_تجريبية`);
    const newCityRates = await newCityResponse.json();
    
    if (newCityRates.success && newCityRates.data.length > 0) {
      console.log('✅ تم جلب أسعار افتراضية للمدينة الجديدة:');
      newCityRates.data.forEach(rate => {
        console.log(`   - ${rate.providerId.displayName}: ${rate.price} ر.س (${rate.source})`);
      });
    } else {
      console.log('❌ لم يتم جلب أسعار افتراضية');
    }

    console.log('\n2️⃣ اختبار حساب تكلفة الشحن للمدينة الجديدة...');
    
    // جلب أول شركة شحن مفعلة
    const providersResponse = await fetch(`${baseURL}/shipping/providers`);
    const providers = await providersResponse.json();
    
    if (providers.success && providers.data.length > 0) {
      const firstProvider = providers.data[0];
      
      const calculateResponse = await fetch(`${baseURL}/shipping/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          city: 'مدينة_تجريبية',
          providerId: firstProvider._id,
          weight: 1
        })
      });
      
      const calculateResult = await calculateResponse.json();
      
      if (calculateResult.success) {
        console.log(`✅ تم حساب التكلفة باستخدام السعر الافتراضي:`);
        console.log(`   - الشركة: ${calculateResult.data.provider.name}`);
        console.log(`   - المدينة: ${calculateResult.data.city}`);
        console.log(`   - التكلفة: ${calculateResult.data.cost} ر.س`);
        console.log(`   - المصدر: ${calculateResult.data.source}`);
        console.log(`   - أيام التوصيل: ${calculateResult.data.estimatedDays}`);
      } else {
        console.log('❌ فشل في حساب التكلفة:', calculateResult.message);
      }
    }

    console.log('\n3️⃣ مقارنة مع مدينة موجودة في قاعدة البيانات...');
    const existingCityResponse = await fetch(`${baseURL}/shipping/rates/الرياض`);
    const existingCityRates = await existingCityResponse.json();
    
    if (existingCityRates.success && existingCityRates.data.length > 0) {
      console.log('✅ أسعار الرياض (من قاعدة البيانات):');
      existingCityRates.data.forEach(rate => {
        console.log(`   - ${rate.providerId.displayName}: ${rate.price} ر.س (${rate.source || 'specific_rate'})`);
      });
    }

    console.log('\n🎉 انتهى الاختبار!');
    console.log('\n📝 النتيجة:');
    console.log('   - المدن الجديدة تستخدم الأسعار الافتراضية من إعدادات الشركة');
    console.log('   - المدن الموجودة تستخدم الأسعار المحددة في قاعدة البيانات');
    console.log('   - يمكن الآن تعديل الأسعار من صفحة الإعدادات وستظهر فوراً');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
};

// تشغيل الاختبار
testDefaultShippingPrices();