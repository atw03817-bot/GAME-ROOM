import mongoose from 'mongoose';
import TamaraSettings from '../models/TamaraSettings.js';
import dotenv from 'dotenv';

dotenv.config();

async function initTamaraSettings() {
  try {
    console.log('🔧 تهيئة إعدادات تمارا...');
    
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // التحقق من وجود إعدادات تمارا
    let settings = await TamaraSettings.findOne();
    
    if (settings) {
      console.log('ℹ️ إعدادات تمارا موجودة بالفعل');
      console.log('📊 الإعدادات الحالية:');
      console.log(`   - تفعيل العمولة: ${settings.commissionEnabled ? 'نعم' : 'لا'}`);
      console.log(`   - نسبة العمولة: ${settings.commissionRate}%`);
      console.log(`   - اسم العمولة: ${settings.commissionDisplayName}`);
      console.log(`   - تفعيل تمارا: ${settings.enabled ? 'نعم' : 'لا'}`);
      console.log(`   - وضع التجربة: ${settings.testMode ? 'نعم' : 'لا'}`);
    } else {
      // إنشاء إعدادات افتراضية
      settings = new TamaraSettings({
        // إعدادات العمولة
        commissionEnabled: true,
        commissionRate: 3.0,
        commissionDisplayName: 'عمولة الأقساط - تمارا',
        
        // إعدادات تمارا العامة
        enabled: false, // معطل افتراضياً حتى يتم إدخال بيانات API
        apiUrl: 'https://api.tamara.co',
        merchantToken: '',
        notificationKey: '',
        testMode: true,
        
        // إعدادات العرض
        showInstallmentInfo: true,
        minOrderAmount: 100,
        maxOrderAmount: 10000
      });

      await settings.save();
      console.log('✅ تم إنشاء إعدادات تمارا الافتراضية');
      console.log('📊 الإعدادات المُنشأة:');
      console.log(`   - تفعيل العمولة: ${settings.commissionEnabled ? 'نعم' : 'لا'}`);
      console.log(`   - نسبة العمولة: ${settings.commissionRate}%`);
      console.log(`   - اسم العمولة: ${settings.commissionDisplayName}`);
      console.log(`   - تفعيل تمارا: ${settings.enabled ? 'نعم' : 'لا'}`);
      console.log(`   - وضع التجربة: ${settings.testMode ? 'نعم' : 'لا'}`);
      console.log(`   - أقل مبلغ طلب: ${settings.minOrderAmount} ر.س`);
      console.log(`   - أعلى مبلغ طلب: ${settings.maxOrderAmount} ر.س`);
    }

    // اختبار حساب العمولة
    console.log('\n🧮 اختبار حساب العمولة:');
    const testAmounts = [100, 500, 1000, 2000];
    
    for (const amount of testAmounts) {
      const commission = await TamaraSettings.calculateCommission(amount);
      console.log(`   - مبلغ ${amount} ر.س → عمولة ${commission.amount} ر.س (${commission.rate}%)`);
    }

    console.log('\n🎉 تم إعداد نظام عمولة تمارا بنجاح!');
    console.log('\n📝 الخطوات التالية:');
    console.log('   1. ادخل إلى لوحة الإدارة → إعدادات تمارا');
    console.log('   2. أدخل رمز التاجر ومفتاح الإشعارات من تمارا');
    console.log('   3. فعّل تمارا كوسيلة دفع');
    console.log('   4. اختبر النظام في وضع التجربة أولاً');

  } catch (error) {
    console.error('❌ خطأ في تهيئة إعدادات تمارا:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
}

// تشغيل السكريبت
initTamaraSettings();