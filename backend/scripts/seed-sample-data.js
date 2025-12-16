import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

dotenv.config();

const sampleProducts = [
  {
    nameAr: 'آيفون 15 برو ماكس',
    nameEn: 'iPhone 15 Pro Max',
    descriptionAr: 'أحدث هاتف من آبل بمواصفات رائعة',
    descriptionEn: 'Latest iPhone with amazing specs',
    price: 5499,
    comparePrice: 5999,
    category: 'جوالات',
    stock: 50,
    images: ['https://via.placeholder.com/400x400?text=iPhone+15+Pro+Max'],
    featured: true,
    sales: 0
  },
  {
    nameAr: 'سامسونج جالاكسي S24 الترا',
    nameEn: 'Samsung Galaxy S24 Ultra',
    descriptionAr: 'هاتف سامسونج الرائد',
    descriptionEn: 'Samsung flagship phone',
    price: 4799,
    comparePrice: 5299,
    category: 'جوالات',
    stock: 40,
    images: ['https://via.placeholder.com/400x400?text=Galaxy+S24+Ultra'],
    featured: true,
    sales: 0
  },
  {
    nameAr: 'ساعة آبل الإصدار 9',
    nameEn: 'Apple Watch Series 9',
    descriptionAr: 'ساعة ذكية من آبل',
    descriptionEn: 'Smart watch from Apple',
    price: 1799,
    comparePrice: 1999,
    category: 'ساعات ذكية',
    stock: 30,
    images: ['https://via.placeholder.com/400x400?text=Apple+Watch+9'],
    featured: false,
    sales: 0
  },
  {
    nameAr: 'إيربودز برو 2',
    nameEn: 'AirPods Pro 2',
    descriptionAr: 'سماعات لاسلكية من آبل',
    descriptionEn: 'Wireless earbuds from Apple',
    price: 999,
    comparePrice: 1099,
    category: 'سماعات',
    stock: 60,
    images: ['https://via.placeholder.com/400x400?text=AirPods+Pro+2'],
    featured: false,
    sales: 0
  },
  {
    nameAr: 'آيباد برو 12.9',
    nameEn: 'iPad Pro 12.9',
    descriptionAr: 'تابلت احترافي من آبل',
    descriptionEn: 'Professional tablet from Apple',
    price: 4299,
    comparePrice: 4599,
    category: 'تابلت',
    stock: 20,
    images: ['https://via.placeholder.com/400x400?text=iPad+Pro'],
    featured: true,
    sales: 0
  }
];

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات\n');

    // Check if products already exist
    const existingProducts = await Product.countDocuments();
    
    if (existingProducts > 0) {
      console.log(`⚠️  يوجد ${existingProducts} منتج بالفعل`);
      console.log('هل تريد حذفهم وإضافة منتجات جديدة؟ (y/n)');
      console.log('تشغيل: node scripts/seed-sample-data.js --force لإضافة بدون سؤال\n');
      
      if (!process.argv.includes('--force')) {
        console.log('❌ تم الإلغاء. استخدم --force للإضافة بدون سؤال');
        process.exit(0);
      }
    }

    // Add products
    console.log('📦 إضافة منتجات تجريبية...');
    const products = await Product.insertMany(sampleProducts);
    console.log(`✅ تم إضافة ${products.length} منتج\n`);

    // Get a customer user
    const customer = await User.findOne({ 
      $or: [{ role: 'user' }, { role: 'customer' }]
    });

    if (customer) {
      console.log('🛒 إضافة طلبات تجريبية...');
      
      // Create sample orders
      const sampleOrders = [
        {
          orderNumber: `ORD-${Date.now()}-1`,
          user: customer._id,
          items: [
            {
              product: products[0]._id,
              name: products[0].nameAr,
              price: products[0].price,
              quantity: 1,
              image: products[0].images[0]
            }
          ],
          shippingAddress: {
            name: customer.name,
            phone: customer.phone || '0501234567',
            city: 'الرياض',
            district: 'العليا',
            street: 'شارع التحلية',
            building: '123'
          },
          paymentMethod: 'cod',
          subtotal: products[0].price,
          shippingCost: 30,
          tax: products[0].price * 0.15,
          total: products[0].price + 30 + (products[0].price * 0.15),
          status: 'pending',
          orderStatus: 'pending',
          statusHistory: [{
            status: 'pending',
            note: 'تم إنشاء الطلب'
          }]
        },
        {
          orderNumber: `ORD-${Date.now()}-2`,
          user: customer._id,
          items: [
            {
              product: products[1]._id,
              name: products[1].nameAr,
              price: products[1].price,
              quantity: 1,
              image: products[1].images[0]
            },
            {
              product: products[2]._id,
              name: products[2].nameAr,
              price: products[2].price,
              quantity: 1,
              image: products[2].images[0]
            }
          ],
          shippingAddress: {
            name: customer.name,
            phone: customer.phone || '0501234567',
            city: 'جدة',
            district: 'الروضة',
            street: 'شارع الأمير سلطان',
            building: '456'
          },
          paymentMethod: 'cod',
          subtotal: products[1].price + products[2].price,
          shippingCost: 30,
          tax: (products[1].price + products[2].price) * 0.15,
          total: products[1].price + products[2].price + 30 + ((products[1].price + products[2].price) * 0.15),
          status: 'processing',
          orderStatus: 'processing',
          statusHistory: [
            {
              status: 'pending',
              note: 'تم إنشاء الطلب'
            },
            {
              status: 'processing',
              note: 'جاري تجهيز الطلب'
            }
          ]
        }
      ];

      const orders = await Order.insertMany(sampleOrders);
      console.log(`✅ تم إضافة ${orders.length} طلب\n`);
    } else {
      console.log('⚠️  لا يوجد عملاء لإضافة طلبات لهم\n');
    }

    // Summary
    console.log('📊 الملخص:');
    console.log(`   - المنتجات: ${await Product.countDocuments()}`);
    console.log(`   - الطلبات: ${await Order.countDocuments()}`);
    console.log(`   - العملاء: ${await User.countDocuments({ $or: [{ role: 'user' }, { role: 'customer' }] })}`);
    console.log('');
    console.log('✅ تم إضافة البيانات التجريبية بنجاح!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ:', error);
    process.exit(1);
  }
};

seedData();
