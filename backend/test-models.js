// اختبار تحميل جميع الـ Models
import 'dotenv/config';

console.log('🧪 Testing Models...\n');

try {
  // Models الموجودة مسبقاً
  const { default: User } = await import('./models/User.js');
  const { default: Product } = await import('./models/Product.js');
  const { default: Category } = await import('./models/Category.js');
  const { default: Order } = await import('./models/Order.js');
  const { default: HomepageConfig } = await import('./models/HomepageConfig.js');
  const { default: FeaturedDealsSettings } = await import('./models/FeaturedDealsSettings.js');
  const { default: ExclusiveOffersSettings } = await import('./models/ExclusiveOffersSettings.js');
  
  console.log('✅ Existing Models:');
  console.log('  - User');
  console.log('  - Product');
  console.log('  - Category');
  console.log('  - Order');
  console.log('  - HomepageConfig');
  console.log('  - FeaturedDealsSettings');
  console.log('  - ExclusiveOffersSettings');
  
  // Models الجديدة (اليوم 1)
  const { default: Address } = await import('./models/Address.js');
  const { default: PaymentIntent } = await import('./models/PaymentIntent.js');
  const { default: PaymentSettings } = await import('./models/PaymentSettings.js');
  const { default: ShippingProvider } = await import('./models/ShippingProvider.js');
  const { default: ShippingRate } = await import('./models/ShippingRate.js');
  const { default: Shipment } = await import('./models/Shipment.js');
  const { default: StoreSettings } = await import('./models/StoreSettings.js');
  const { default: FactoryShipment } = await import('./models/FactoryShipment.js');
  const { default: Device } = await import('./models/Device.js');
  const { default: DistributionGroup } = await import('./models/DistributionGroup.js');
  
  console.log('\n✅ New Models (Day 1):');
  console.log('  - Address');
  console.log('  - PaymentIntent');
  console.log('  - PaymentSettings');
  console.log('  - ShippingProvider');
  console.log('  - ShippingRate');
  console.log('  - Shipment');
  console.log('  - StoreSettings');
  console.log('  - FactoryShipment');
  console.log('  - Device');
  console.log('  - DistributionGroup');
  
  console.log('\n🎉 All 17 models loaded successfully!');
  console.log('\n📊 Progress: 17/17 Models (100%)');
  
} catch (error) {
  console.error('❌ Error loading models:', error.message);
  process.exit(1);
}
