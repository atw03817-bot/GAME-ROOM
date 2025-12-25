// تشخيص خطأ إنشاء طلب الصيانة
const testMaintenanceRequest = {
  customerInfo: {
    name: "أحمد محمد",
    phone: "0501234567",
    email: "test@example.com",
    address: "الرياض، الملز"
  },
  device: {
    brand: "HOTWAV",
    model: "HOTWAV Pad 13 Pro",
    color: "أسود",
    storage: "64GB",
    serialNumber: "HW2024TEST123",
    purchaseDate: "2024-01-15",
    hasPassword: true,
    passwordType: "text",
    passwordValue: "123456",
    patternValue: ""
  },
  issue: {
    category: "screen",
    subCategory: "شاشة مكسورة",
    description: "الشاشة مكسورة من الجانب الأيمن",
    symptoms: ["الشاشة مظلمة", "لمس لا يعمل"],
    priority: "normal",
    images: []
  },
  shipping: {
    isRequired: true,
    provider: "aramex_test_id",
    providerName: "أرامكس",
    cost: 25,
    pickupAddress: "الرياض، الملز، شارع التحلية",
    deliveryAddress: "الرياض، الملز",
    status: "pending"
  }
};

console.log('🧪 Test data for maintenance request:');
console.log(JSON.stringify(testMaintenanceRequest, null, 2));

// اختبار البيانات المرسلة
console.log('\n📋 Validation checks:');
console.log('✅ customerInfo exists:', !!testMaintenanceRequest.customerInfo);
console.log('✅ device exists:', !!testMaintenanceRequest.device);
console.log('✅ issue exists:', !!testMaintenanceRequest.issue);
console.log('✅ shipping exists:', !!testMaintenanceRequest.shipping);

console.log('\n💰 Cost calculation:');
const priorityFee = testMaintenanceRequest.issue.priority === 'urgent' ? 50 : 
                   testMaintenanceRequest.issue.priority === 'emergency' ? 100 : 0;
const shippingFee = testMaintenanceRequest.shipping?.isRequired ? 
                   (parseFloat(testMaintenanceRequest.shipping.cost) || 0) : 0;
const totalEstimated = 25 + priorityFee + shippingFee;

console.log('Priority fee:', priorityFee);
console.log('Shipping fee:', shippingFee);
console.log('Total estimated:', totalEstimated);

console.log('\n🔍 Potential issues to check:');
console.log('1. Check if MaintenanceRequest model schema matches the data');
console.log('2. Verify database connection is working');
console.log('3. Check if all required fields are present');
console.log('4. Verify shipping provider ID format');
console.log('5. Check console logs on server for detailed error');