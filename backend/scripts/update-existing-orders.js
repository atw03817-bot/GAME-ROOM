import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Order from '../models/Order.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

async function updateExistingOrders() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // جلب جميع الطلبات التي لا تحتوي على selectedOptions
    const orders = await Order.find({
      'items.selectedOptions': { $exists: false }
    });

    console.log(`📦 Found ${orders.length} orders to update`);

    let updatedCount = 0;

    for (const order of orders) {
      let hasChanges = false;

      // تحديث كل عنصر في الطلب
      order.items = order.items.map(item => {
        // إذا لم تكن هناك خيارات محددة، أضف حقل فارغ
        if (!item.selectedOptions) {
          item.selectedOptions = {};
          hasChanges = true;
        }
        return item;
      });

      if (hasChanges) {
        await order.save();
        updatedCount++;
        console.log(`✅ Updated order: ${order.orderNumber}`);
      }
    }

    console.log(`\n✅ Successfully updated ${updatedCount} orders`);
    console.log('📝 All existing orders now have selectedOptions field');

  } catch (error) {
    console.error('❌ Error updating orders:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

updateExistingOrders();