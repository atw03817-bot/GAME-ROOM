import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend directory
dotenv.config({ path: join(__dirname, '..', '.env') });

async function createTestOrderWithOptions() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // البحث عن مستخدم للاختبار
    let testUser = await User.findOne({ email: 'test@example.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'مستخدم تجريبي',
        email: 'test@example.com',
        password: 'password123',
        phone: '+966501234567',
        role: 'customer'
      });
      console.log('✅ Created test user');
    }

    // البحث عن منتج للاختبار
    const testProduct = await Product.findOne();
    if (!testProduct) {
      console.log('❌ No products found. Please add products first.');
      return;
    }

    console.log('📱 Using product:', testProduct.name?.ar || testProduct.nameAr);

    // إنشاء طلب تجريبي مع خيارات
    const orderCount = await Order.countDocuments();
    const orderNumber = `TEST-${Date.now()}-${orderCount + 1}`;

    const testOrder = new Order({
      orderNumber,
      user: testUser._id,
      items: [{
        product: testProduct._id,
        name: testProduct.name?.ar || testProduct.nameAr || testProduct.name,
        price: testProduct.price + 100, // سعر مع الخيارات
        quantity: 1,
        image: testProduct.images?.[0],
        selectedOptions: {
          color: {
            name: 'Blue',
            nameAr: 'أزرق',
            value: '#0066CC',
            price: 50
          },
          storage: {
            name: '256GB',
            nameAr: '256 جيجابايت',
            value: '256GB',
            price: 50
          },
          other: [{
            name: 'Screen Protector',
            nameAr: 'واقي الشاشة',
            value: 'Premium Glass',
            price: 0
          }]
        }
      }],
      shippingAddress: {
        name: 'أحمد محمد التجريبي',
        phone: '+966501234567',
        city: 'الرياض',
        district: 'العليا',
        street: 'شارع الملك فهد',
        building: 'مبنى 123'
      },
      paymentMethod: 'cod',
      paymentStatus: 'pending',
      orderStatus: 'pending',
      subtotal: testProduct.price + 100,
      shippingCost: 30,
      tax: (testProduct.price + 100) * 0.15,
      total: (testProduct.price + 100) + 30 + ((testProduct.price + 100) * 0.15),
      shippingCompany: 'redbox',
      statusHistory: [{
        status: 'pending',
        note: 'طلب تجريبي مع خيارات المنتج',
        date: new Date()
      }]
    });

    await testOrder.save();

    console.log('✅ Test order created successfully!');
    console.log('📋 Order Details:');
    console.log(`   - Order Number: ${testOrder.orderNumber}`);
    console.log(`   - Product: ${testOrder.items[0].name}`);
    console.log(`   - Color: ${testOrder.items[0].selectedOptions.color.nameAr} (${testOrder.items[0].selectedOptions.color.name})`);
    console.log(`   - Storage: ${testOrder.items[0].selectedOptions.storage.nameAr} (${testOrder.items[0].selectedOptions.storage.name})`);
    console.log(`   - Total Price: ${testOrder.total} SAR`);
    console.log(`   - Order ID: ${testOrder._id}`);

    console.log('\n🔍 Now check the admin panel to see if options are displayed correctly!');
    console.log(`📱 Order URL: http://localhost:3000/admin/orders/${testOrder._id}`);

  } catch (error) {
    console.error('❌ Error creating test order:', error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

createTestOrderWithOptions();