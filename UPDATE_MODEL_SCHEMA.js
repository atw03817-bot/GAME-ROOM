// تحديث schema لإضافة حقل createdBy
const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/hotwav-maintenance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function updateSchema() {
  try {
    console.log('تحديث schema لإضافة حقل createdBy...');
    
    // الحصول على جميع طلبات الصيانة
    const MaintenanceRequest = mongoose.model('MaintenanceRequest');
    const requests = await MaintenanceRequest.find({});
    
    console.log(`تم العثور على ${requests.length} طلب صيانة`);
    
    let updatedCount = 0;
    
    for (const request of requests) {
      let needsUpdate = false;
      
      // إضافة حقل createdBy إذا لم يكن موجوداً
      if (!request.createdBy) {
        request.createdBy = 'customer'; // افتراضياً جميع الطلبات الموجودة من العملاء
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await request.save();
        updatedCount++;
        console.log(`تم تحديث الطلب: ${request.requestNumber} - createdBy: ${request.createdBy}`);
      }
    }
    
    console.log(`تم تحديث ${updatedCount} طلب بنجاح`);
    console.log('تم الانتهاء من تحديث schema');
    
  } catch (error) {
    console.error('خطأ في تحديث schema:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateSchema();