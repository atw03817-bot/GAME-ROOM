// اختبار API عمولة تمارا
const testTamaraAPI = async () => {
  const baseURL = 'http://localhost:5000/api';
  
  console.log('🧪 اختبار نظام عمولة تمارا...\n');

  try {
    // 1. اختبار الحصول على الإعدادات
    console.log('1️⃣ اختبار الحصول على إعدادات تمارا...');
    const settingsResponse = await fetch(`${baseURL}/tamara-settings`);
    const settings = await settingsResponse.json();
    
    if (settings.success) {
      console.log('✅ تم جلب الإعدادات بنجاح');
      console.log(`   - تفعيل العمولة: ${settings.data.commissionEnabled ? 'نعم' : 'لا'}`);
      console.log(`   - نسبة العمولة: ${settings.data.commissionRate}%`);
      console.log(`   - اسم العمولة: ${settings.data.commissionDisplayName}`);
    } else {
      console.log('❌ فشل في جلب الإعدادات:', settings.message);
    }

    console.log('\n2️⃣ اختبار حساب العمولة...');
    
    // 2. اختبار حساب العمولة لمبالغ مختلفة
    const testAmounts = [100, 500, 1000, 2000];
    
    for (const amount of testAmounts) {
      const commissionResponse = await fetch(`${baseURL}/tamara-settings/calculate-commission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subtotal: amount })
      });
      
      const commissionResult = await commissionResponse.json();
      
      if (commissionResult.success) {
        const commission = commissionResult.data.commission;
        console.log(`   ✅ مبلغ ${amount} ر.س → عمولة ${commission.amount} ر.س (${commission.rate}%)`);
      } else {
        console.log(`   ❌ فشل حساب العمولة لمبلغ ${amount}: ${commissionResult.message}`);
      }
    }

    console.log('\n3️⃣ اختبار التحقق من الأهلية...');
    
    // 3. اختبار التحقق من أهلية تمارا
    const eligibilityResponse = await fetch(`${baseURL}/tamara-settings/check-eligibility`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ totalAmount: 500 })
    });
    
    const eligibilityResult = await eligibilityResponse.json();
    
    if (eligibilityResult.success) {
      const data = eligibilityResult.data;
      console.log(`   ✅ التحقق من الأهلية لمبلغ 500 ر.س:`);
      console.log(`      - مؤهل: ${data.eligible ? 'نعم' : 'لا'}`);
      console.log(`      - أقل مبلغ: ${data.minAmount} ر.س`);
      console.log(`      - أعلى مبلغ: ${data.maxAmount} ر.س`);
      console.log(`      - تمارا مفعل: ${data.enabled ? 'نعم' : 'لا'}`);
    } else {
      console.log(`   ❌ فشل التحقق من الأهلية: ${eligibilityResult.message}`);
    }

    console.log('\n🎉 انتهى الاختبار بنجاح!');
    
  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  }
};

// تشغيل الاختبار
testTamaraAPI();