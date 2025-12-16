import mongoose from 'mongoose';
import dotenv from 'dotenv';
import PaymentSettings from '../models/PaymentSettings.js';

dotenv.config();

const seedPayments = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB متصل');

    // Clear existing data
    await PaymentSettings.deleteMany({});
    console.log('🗑️  تم حذف البيانات القديمة');

    // Create payment settings
    const settings = await PaymentSettings.create([
      {
        provider: 'cod',
        enabled: true,
        config: {
          displayName: 'الدفع عند الاستلام',
          description: 'ادفع نقداً عند استلام الطلب',
          additionalFee: 0
        }
      },
      {
        provider: 'tap',
        enabled: false,
        config: {
          displayName: 'Tap Payment',
          description: 'الدفع عبر بطاقة الائتمان',
          apiKey: 'YOUR_TAP_API_KEY',
          secretKey: 'YOUR_TAP_SECRET_KEY',
          testMode: true,
          webhookUrl: 'https://yourdomain.com/api/payments/tap/callback'
        }
      },
      {
        provider: 'myfatoorah',
        enabled: false,
        config: {
          displayName: 'MyFatoorah',
          description: 'الدفع عبر MyFatoorah',
          apiKey: 'YOUR_MYFATOORAH_API_KEY',
          testMode: true,
          webhookUrl: 'https://yourdomain.com/api/payments/myfatoorah/callback'
        }
      },
      {
        provider: 'tamara',
        enabled: false,
        config: {
          displayName: 'تمارا - قسّط مشترياتك',
          description: 'قسّط مشترياتك على 3 أو 4 دفعات',
          apiKey: 'YOUR_TAMARA_API_KEY',
          testMode: true
        }
      },
      {
        provider: 'tabby',
        enabled: false,
        config: {
          displayName: 'Tabby - اشتري الآن وادفع لاحقاً',
          description: 'اشتري الآن وادفع على 4 دفعات',
          apiKey: 'YOUR_TABBY_API_KEY',
          testMode: true
        }
      }
    ]);

    console.log('✅ تم إنشاء إعدادات الدفع:', settings.length);

    console.log('\n📊 الملخص:');
    console.log('- طرق الدفع: 5');
    console.log('- المفعّل: COD فقط');
    console.log('- المعطّل: Tap, MyFatoorah, Tamara, Tabby');
    
    console.log('\n💡 ملاحظة:');
    console.log('- يمكنك تفعيل طرق الدفع الأخرى من لوحة التحكم');
    console.log('- لا تنسى إضافة API Keys الحقيقية');
    
    console.log('\n🎉 تم إضافة إعدادات الدفع بنجاح!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedPayments();
