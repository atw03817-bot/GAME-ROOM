// تحديث schema التشخيص لإضافة الحقول المفقودة
const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/hotwav-maintenance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function updateDiagnosisSchema() {
  try {
    console.log('بدء تحديث schema التشخيص...');
    
    // الحصول على جميع طلبات الصيانة
    const MaintenanceRequest = mongoose.model('MaintenanceRequest');
    const requests = await MaintenanceRequest.find({});
    
    console.log(`تم العثور على ${requests.length} طلب صيانة`);
    
    let updatedCount = 0;
    
    for (const request of requests) {
      let needsUpdate = false;
      
      // التأكد من وجود diagnosis object
      if (!request.diagnosis) {
        request.diagnosis = {};
        needsUpdate = true;
      }
      
      // إضافة الحقول المفقودة إذا لم تكن موجودة
      if (!request.diagnosis.hasOwnProperty('problemFound')) {
        request.diagnosis.problemFound = '';
        needsUpdate = true;
      }
      
      if (!request.diagnosis.hasOwnProperty('rootCause')) {
        request.diagnosis.rootCause = '';
        needsUpdate = true;
      }
      
      if (!request.diagnosis.hasOwnProperty('recommendedSolution')) {
        request.diagnosis.recommendedSolution = '';
        needsUpdate = true;
      }
      
      if (!request.diagnosis.hasOwnProperty('technicianNotes')) {
        request.diagnosis.technicianNotes = '';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await request.save();
        updatedCount++;
        console.log(`تم تحديث الطلب: ${request.requestNumber}`);
      }
    }
    
    console.log(`تم تحديث ${updatedCount} طلب بنجاح`);
    console.log('تم الانتهاء من تحديث schema التشخيص');
    
  } catch (error) {
    console.error('خطأ في تحديث schema:', error);
  } finally {
    mongoose.connection.close();
  }
}

updateDiagnosisSchema();