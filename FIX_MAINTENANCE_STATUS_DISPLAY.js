// سكريبت لإصلاح عرض حالات الصيانة
const mongoose = require('mongoose');

// نموذج طلب الصيانة المبسط
const MaintenanceRequestSchema = new mongoose.Schema({
  requestNumber: String,
  status: {
    current: String,
    history: [{
      status: String,
      date: Date,
      note: String,
      updatedBy: String
    }]
  },
  cost: {
    paymentStatus: String
  }
}, { timestamps: true });

const MaintenanceRequest = mongoose.model('MaintenanceRequest', MaintenanceRequestSchema);

// الاتصال بقاعدة البيانات
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mobile-store');
    console.log('✅ تم الاتصال بقاعدة البيانات');
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error);
    process.exit(1);
  }
}

// إصلاح البيانات
async function fixMaintenanceData() {
  try {
    console.log('🔄 بدء إصلاح بيانات الصيانة...');
    
    // جلب جميع الطلبات
    const requests = await MaintenanceRequest.find({});
    console.log(`📋 تم العثور على ${requests.length} طلب`);
    
    let fixedCount = 0;
    
    for (const request of requests) {
      let needsUpdate = false;
      
      // إصلاح حالة الدفع إذا كانت فارغة
      if (!request.cost || !request.cost.paymentStatus) {
        if (!request.cost) request.cost = {};
        request.cost.paymentStatus = 'unpaid';
        needsUpdate = true;
        console.log(`🔧 إصلاح حالة الدفع للطلب: ${request.requestNumber}`);
      }
      
      // التأكد من وجود تاريخ الحالات
      if (!request.status.history || request.status.history.length === 0) {
        request.status.history = [{
          status: request.status.current || 'received',
          date: request.createdAt || new Date(),
          note: 'تم استلام الجهاز',
          updatedBy: 'System'
        }];
        needsUpdate = true;
        console.log(`📝 إضافة تاريخ الحالات للطلب: ${request.requestNumber}`);
      }
      
      if (needsUpdate) {
        await request.save();
        fixedCount++;
      }
    }
    
    console.log(`✅ تم إصلاح ${fixedCount} طلب من أصل ${requests.length}`);
    
    // عرض عينة من البيانات
    console.log('\n📊 عينة من البيانات المحدثة:');
    const sampleRequests = await MaintenanceRequest.find({}).limit(3);
    sampleRequests.forEach(req => {
      console.log(`- ${req.requestNumber}: ${req.status.current} | دفع: ${req.cost.paymentStatus}`);
    });
    
  } catch (error) {
    console.error('❌ خطأ في إصلاح البيانات:', error);
  }
}

// تشغيل السكريبت
async function run() {
  await connectDB();
  await fixMaintenanceData();
  
  console.log('\n🎉 تم الانتهاء من الإصلاح');
  console.log('💡 تأكد من إعادة تحميل صفحة الحساب لرؤية التحديثات');
  
  mongoose.connection.close();
}

run().catch(console.error);