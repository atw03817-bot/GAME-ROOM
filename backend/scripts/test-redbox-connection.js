import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import redboxService from '../services/redboxServiceFixed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testRedBoxConnection() {
  try {
    console.log('🧪 اختبار الاتصال بـ RedBox API...');
    console.log('📋 الإعدادات:');
    console.log(`   - Organization ID: ${process.env.REDBOX_ORGANIZATION_ID}`);
    console.log(`   - API URL: ${process.env.REDBOX_API_URL}`);
    console.log(`   - Has API Key: ${!!process.env.REDBOX_API_KEY}`);
    console.log('');

    // اختبار الاتصال
    const connectionTest = await redboxService.testConnection();
    
    if (connectionTest.success) {
      console.log('✅ نجح الاتصال بـ RedBox API!');
      console.log('📋 البيانات المُستلمة:', connectionTest.data);
      
      // اختبار حساب التكلفة
      console.log('\n💰 اختبار حساب تكلفة الشحن...');
      const cities = ['الرياض', 'جدة', 'الدمام'];
      
      for (const city of cities) {
        const costResult = await redboxService.calculateShippingCost(city, 2);
        console.log(`   ${city}: ${costResult.cost} ريال (${costResult.estimatedDays} أيام) ${costResult.isTest ? '- محاكاة' : '- حقيقي'}`);
      }
      
    } else {
      console.log('❌ فشل الاتصال بـ RedBox API');
      console.log('📋 الخطأ:', connectionTest.error);
      console.log('\n💡 الحلول المحتملة:');
      console.log('   1. تحقق من صحة API Key');
      console.log('   2. تحقق من صحة Organization ID');
      console.log('   3. تأكد من أن IP مُصرح له بالوصول');
      console.log('   4. تحقق من حالة خدمة RedBox');
    }

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error.message);
  } finally {
    process.exit(0);
  }
}

testRedBoxConnection();