// إصلاح حساب المجموع ليشمل رسوم الشحن
import mongoose from 'mongoose';
import MaintenanceRequest from './backend/models/MaintenanceRequest.js';
import dotenv from 'dotenv';

dotenv.config();

async function fixTotalCalculation() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('🔗 Connected to MongoDB');

    // جلب جميع طلبات الصيانة
    const requests = await MaintenanceRequest.find({});
    console.log(`📋 Found ${requests.length} maintenance requests`);

    let updatedCount = 0;

    for (const request of requests) {
      const oldTotal = request.cost.totalEstimated;
      
      // إعادة حساب التكلفة
      request.calculateTotal();
      
      const newTotal = request.cost.totalEstimated;
      
      if (oldTotal !== newTotal) {
        await request.save();
        updatedCount++;
        console.log(`✅ Updated request ${request.requestNumber}: ${oldTotal} → ${newTotal} ريال`);
      }
    }

    console.log(`\n🎉 Updated ${updatedCount} requests with correct totals`);
    
    // عرض ملخص
    console.log('\n📊 Summary of all requests:');
    for (const request of requests) {
      const breakdown = {
        diagnostic: request.cost.diagnosticFee || 0,
        parts: request.cost.partsCost || 0,
        labor: request.cost.laborCost || 0,
        priority: request.cost.priorityFee || 0,
        shipping: request.cost.shippingFee || 0,
        total: request.cost.totalEstimated || 0
      };
      
      console.log(`${request.requestNumber}: ${breakdown.diagnostic}+${breakdown.parts}+${breakdown.labor}+${breakdown.priority}+${breakdown.shipping} = ${breakdown.total} ريال`);
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

fixTotalCalculation();