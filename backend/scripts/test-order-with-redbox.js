import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Order from '../models/Order.js';
import redboxService from '../services/redboxServiceSimple.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

async function testOrderWithRedBox() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // البحث عن آخر طلب تجريبي
    const testOrder = await Order.findOne({ orderNumber: /^TEST-/ }).sort({ createdAt: -1 });
    
    if (!testOrder) {
      console.log('❌ No test order found. Run CREATE_TEST_ORDER.bat first.');
      return;
    }

    console.log('📦 Testing RedBox integration with order:', testOrder.orderNumber);
    console.log('📋 Order details:');
    console.log(`   - Product: ${testOrder.items[0].name}`);
    console.log(`   - Color: ${testOrder.items[0].selectedOptions?.color?.nameAr || 'غير محدد'}`);
    console.log(`   - Storage: ${testOrder.items[0].selectedOptions?.storage?.nameAr || 'غير محدد'}`);
    console.log(`   - Total: ${testOrder.total} SAR`);

    // اختبار إنشاء شحنة
    console.log('\n🚚 Creating RedBox shipment...');
    try {
      const shipmentResult = await redboxService.createShipment({
        orderNumber: testOrder.orderNumber,
        shippingAddress: testOrder.shippingAddress,
        items: testOrder.items,
        subtotal: testOrder.subtotal,
        total: testOrder.total,
        paymentMethod: testOrder.paymentMethod
      });

      console.log('✅ Shipment created successfully!');
      console.log('📋 Shipment details:');
      console.log(`   - Tracking Number: ${shipmentResult.trackingNumber}`);
      console.log(`   - Shipment ID: ${shipmentResult.shipmentId}`);
      console.log(`   - Cost: ${shipmentResult.cost} SAR`);
      console.log(`   - Estimated Delivery: ${shipmentResult.estimatedDelivery}`);
      console.log(`   - Is Test: ${shipmentResult.isTest ? 'Yes' : 'No'}`);

      // تحديث الطلب برقم التتبع
      testOrder.trackingNumber = shipmentResult.trackingNumber;
      testOrder.orderStatus = 'confirmed';
      testOrder.statusHistory.push({
        status: 'confirmed',
        note: `تم إنشاء شحنة RedBox - رقم التتبع: ${shipmentResult.trackingNumber}`,
        date: new Date()
      });
      await testOrder.save();

      // اختبار التتبع
      console.log('\n🔍 Testing shipment tracking...');
      const trackingResult = await redboxService.trackShipment(shipmentResult.trackingNumber);
      
      console.log('✅ Tracking successful!');
      console.log('📋 Tracking details:');
      console.log(`   - Status: ${trackingResult.status}`);
      console.log(`   - Location: ${trackingResult.location}`);
      console.log(`   - History: ${trackingResult.history?.length || 0} events`);

      console.log('\n🎉 RedBox integration test completed successfully!');
      console.log('📱 Check the admin panel to see the updated order with tracking number');
      console.log(`🌐 Order URL: http://localhost:3000/admin/orders/${testOrder._id}`);

    } catch (shipmentError) {
      console.error('❌ Shipment creation failed:', shipmentError.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

testOrderWithRedBox();