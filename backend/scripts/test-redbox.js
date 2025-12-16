import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import redboxService from '../services/redboxService.js';
import ShippingProvider from '../models/ShippingProvider.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testRedBoxIntegration() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // 1. اختبار إعدادات RedBox
    console.log('\n🔧 Testing RedBox configuration...');
    try {
      const config = await redboxService.getRedBoxConfig();
      console.log('✅ RedBox config found:', {
        organizationId: config.organizationId || 'Not set',
        enabled: config.enabled,
        testMode: config.testMode,
        hasApiKey: !!config.apiKey,
        apiUrl: process.env.REDBOX_API_URL
      });

      // التحقق من المفاتيح
      if (!config.apiKey) {
        throw new Error('API Key غير موجود');
      }
      if (!config.organizationId && !process.env.REDBOX_ORGANIZATION_ID) {
        throw new Error('Organization ID غير موجود');
      }

      console.log('✅ All credentials are properly configured');
      
    } catch (error) {
      console.log('❌ RedBox config error:', error.message);
      
      // إنشاء إعدادات من متغيرات البيئة
      if (process.env.REDBOX_API_KEY && process.env.REDBOX_ORGANIZATION_ID) {
        console.log('📝 Creating RedBox configuration from environment variables...');
        await ShippingProvider.findOneAndUpdate(
          { name: 'redbox' },
          {
            name: 'redbox',
            displayName: 'ريدبوكس - RedBox',
            enabled: true,
            testMode: process.env.NODE_ENV === 'development',
            apiKey: process.env.REDBOX_API_KEY,
            apiSecret: process.env.REDBOX_ORGANIZATION_ID,
            apiUrl: process.env.REDBOX_API_URL
          },
          { upsert: true }
        );
        console.log('✅ Configuration created from environment variables');
      } else {
        console.log('❌ Missing environment variables. Please check .env file');
        return;
      }
    }

    // 2. اختبار حساب تكلفة الشحن
    console.log('\n💰 Testing shipping cost calculation...');
    const cities = ['الرياض', 'جدة', 'الدمام', 'مكة'];
    
    for (const city of cities) {
      try {
        const result = await redboxService.calculateShippingCost(city, 2);
        console.log(`✅ ${city}: ${result.cost} ريال (${result.estimatedDays} أيام)${result.isDefault ? ' - افتراضي' : ''}`);
      } catch (error) {
        console.log(`❌ ${city}: ${error.message}`);
      }
    }

    // 3. اختبار إنشاء شحنة تجريبية
    console.log('\n📦 Testing shipment creation...');
    const testOrder = {
      orderNumber: `TEST-${Date.now()}`,
      shippingAddress: {
        name: 'أحمد محمد',
        phone: '+966501234567',
        city: 'الرياض',
        district: 'العليا',
        street: 'شارع الملك فهد',
        building: 'مبنى 123'
      },
      items: [
        {
          name: 'منتج تجريبي',
          quantity: 2,
          price: 100
        }
      ],
      subtotal: 200,
      total: 230,
      paymentMethod: 'cod'
    };

    try {
      const shipmentResult = await redboxService.createShipment(testOrder);
      console.log('✅ Shipment created:', {
        trackingNumber: shipmentResult.trackingNumber,
        cost: shipmentResult.cost,
        estimatedDelivery: shipmentResult.estimatedDelivery,
        isTest: shipmentResult.isTest
      });

      // 4. اختبار تتبع الشحنة
      if (shipmentResult.trackingNumber) {
        console.log('\n🔍 Testing shipment tracking...');
        try {
          const trackingResult = await redboxService.trackShipment(shipmentResult.trackingNumber);
          console.log('✅ Tracking result:', {
            status: trackingResult.status,
            location: trackingResult.location,
            estimatedDelivery: trackingResult.estimatedDelivery,
            historyCount: trackingResult.history?.length || 0,
            isTest: trackingResult.isTest
          });
        } catch (trackingError) {
          console.log('❌ Tracking error:', trackingError.message);
        }
      }

    } catch (shipmentError) {
      console.log('❌ Shipment creation error:', shipmentError.message);
    }

    console.log('\n✅ RedBox integration test completed!');
    console.log('\n📝 Next steps:');
    console.log('1. Update RedBox API credentials in Admin panel');
    console.log('2. Set testMode to false for production');
    console.log('3. Configure webhook URL: https://yourdomain.com/api/webhooks/redbox');
    console.log('4. Test with real orders');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testRedBoxIntegration();