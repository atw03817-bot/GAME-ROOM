import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/mobile-store';

async function fixNegativeStock() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Product = mongoose.model('Product', new mongoose.Schema({}, {strict: false}));
    
    // Find products with negative stock
    const negativeProducts = await Product.find({ stock: { $lt: 0 } });
    
    console.log(`\n📊 Found ${negativeProducts.length} products with negative stock`);
    
    if (negativeProducts.length > 0) {
      console.log('\n🔧 Fixing negative stock...\n');
      
      for (const product of negativeProducts) {
        const oldStock = product.stock;
        // Set to 0 or a reasonable number
        product.stock = 10; // أو أي رقم تبغاه
        await product.save();
        
        console.log(`✅ Fixed: ${product.nameAr || product.name}`);
        console.log(`   Old stock: ${oldStock} → New stock: ${product.stock}`);
      }
      
      console.log('\n✅ All products fixed!');
    } else {
      console.log('✅ No products with negative stock found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Disconnected from MongoDB');
  }
}

fixNegativeStock();
