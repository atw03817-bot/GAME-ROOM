import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import Product from './models/Product.js';

dotenv.config();

async function testOrderAPI() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // جلب آخر طلب
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    
    if (!lastOrder) {
      console.log('❌ No orders found');
      return;
    }
    
    console.log('🔍 Testing order:', lastOrder._id);
    console.log('📦 Items in order:', lastOrder.items.length);

    // اختبار جلب المنتج يدوياً
    for (let i = 0; i < lastOrder.items.length; i++) {
      const item = lastOrder.items[i];
      console.log(`\n📱 Item ${i + 1}:`);
      console.log('  - Item name:', item.name);
      console.log('  - Item price:', item.price);
      console.log('  - Product ID:', item.product);

      if (item.product) {
        try {
          const product = await Product.findById(item.product);
          if (product) {
            console.log('  ✅ Product found:');
            console.log('    - Name:', product.name);
            console.log('    - NameAr:', product.nameAr);
            console.log('    - Price:', product.price);
            console.log('    - Images:', product.images?.length || 0);
            console.log('    - Brand:', product.brand);
          } else {
            console.log('  ❌ Product not found in database');
          }
        } catch (error) {
          console.log('  ❌ Error fetching product:', error.message);
        }
      }
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testOrderAPI();