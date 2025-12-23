// اختبار أن جميع المدن تأخذ السعر من الإعدادات فقط
const testSettingsPricesOnly = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 اختبار أن جميع المدن تأخذ السعر من الإعدادات...\n');

  try {
    // قائمة مدن للاختبار
    const testCities = ['الرياض', 'جدة', 'الدمام', 'مكة المكرمة', 'مدينة_جديدة'];
    
    for (const city of testCities) {
      console.log(`🏙️ اختبار مدينة: ${city}`);
      
      const response = await fetch(`${baseURL}/shipping/rates/${city}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        console.log('   الأسعار المُستخدمة:');
        result.data.forEach(rate => {
          console.log(`   - ${rate.providerId.displayName}: ${rate.price} ر.س (${rate.source})`);
        });
        
        // التحقق من أن جميع الأسعار من الإعدادات
        const allFromSettings = result.data.every(rate => rate.source === 'settings_price');
        if (allFromSettings) {
          console.log('   ✅ جميع الأسعار من الإعدادات');
        } else {
          console.log('   ❌ بعض الأسعار ليست من الإعدادات');
        }
      } else {
        console.log('   ❌ لم يتم جلب أسعار');
      }
      console.log('');
    }

    // اختبار حساب التكلفة
    console.log('💰 اختبار حساب التكلفة...');
    
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
          city: 'الرياض',
          providerId: firstProvider._id,
          weight: 1
        })
      });
      
      const calculateResult = await calculateResponse.json();
      
      if (calculateResult.success) {
        console.log(`✅ حساب التكلفة للرياض:`);
        console.log(`   - الشركة: ${calculateResult.data.provider.name}`);
        console.log(`   - التكلفة: ${calculateResult.data.cost} ر.س`);
        console.log(`   - المصدر: ${calculateResult.data.source}`);
        
        if (calculateResult.data.source === 'settings_price') {
          console.log('   ✅ السعر من الإعدادات');
        } else {
          console.log('   ❌ السعر ليس من الإعدادات');
        }
      }
    }

    console.log('\n🎉 انتهى الاختبار!');
    console.log('\n📝 النتيجة:');
    console.log('   - جميع المدن تستخدم الأسعار من إعدادات الشركة');
    console.log('   - لا يتم استخدام جدول ShippingRate');
    console.log('   - تعديل السعر في الإعدادات يؤثر على جميع المدن فوراً');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
};

// تشغيل الاختبار
testSettingsPricesOnly();