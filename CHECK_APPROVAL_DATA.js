// فحص بيانات موافقة العميل
const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/hotwav-maintenance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

async function checkApprovalData() {
  try {
    console.log('فحص بيانات موافقة العميل...');
    
    // الحصول على جميع طلبات الصيانة في حالة انتظار الموافقة
    const MaintenanceRequest = mongoose.model('MaintenanceRequest');
    const requests = await MaintenanceRequest.find({
      'status.current': 'waiting_approval'
    });
    
    console.log(`تم العثور على ${requests.length} طلب في انتظار الموافقة`);
    
    for (const request of requests) {
      console.log('\n--- طلب رقم:', request.requestNumber, '---');
      console.log('معلومات الجهاز:');
      console.log('- النوع:', request.device?.model || 'غير محدد');
      console.log('- اللون:', request.device?.color || 'غير محدد');
      console.log('- السيريال:', request.device?.serialNumber || 'غير محدد');
      
      console.log('\nمعلومات العميل:');
      console.log('- الاسم:', request.customerInfo?.name || 'غير محدد');
      console.log('- الهاتف:', request.customerInfo?.phone || 'غير محدد');
      console.log('- العنوان:', request.customerInfo?.address || 'غير محدد');
      
      console.log('\nتقرير التشخيص:');
      console.log('- الفحص الأولي:', request.diagnosis?.initialCheck || 'غير متوفر');
      console.log('- المشكلة المكتشفة:', request.diagnosis?.problemFound || 'غير متوفر');
      console.log('- السبب الجذري:', request.diagnosis?.rootCause || 'غير متوفر');
      console.log('- الحل المقترح:', request.diagnosis?.recommendedSolution || 'غير متوفر');
      console.log('- الملاحظات الفنية:', request.diagnosis?.technicianNotes || 'غير متوفر');
      
      console.log('\nالقطع المطلوبة:');
      if (request.diagnosis?.requiredParts && request.diagnosis.requiredParts.length > 0) {
        request.diagnosis.requiredParts.forEach((part, index) => {
          console.log(`  ${index + 1}. ${part.partName} - ${part.price} ريال`);
        });
      } else {
        console.log('  لا توجد قطع مطلوبة');
      }
      
      console.log('\nالتكلفة:');
      console.log('- رسوم الفحص:', request.cost?.diagnosticFee || 0, 'ريال');
      console.log('- تكلفة القطع:', request.cost?.partsCost || 0, 'ريال');
      console.log('- تكلفة العمالة:', request.cost?.laborCost || 0, 'ريال');
      console.log('- رسوم الأولوية:', request.cost?.priorityFee || 0, 'ريال');
      console.log('- الإجمالي:', request.cost?.totalEstimated || 0, 'ريال');
      
      console.log('\n' + '='.repeat(50));
    }
    
    if (requests.length === 0) {
      console.log('\nلا توجد طلبات في انتظار الموافقة');
      console.log('جاري البحث عن جميع الطلبات...');
      
      const allRequests = await MaintenanceRequest.find({}).limit(5);
      console.log(`تم العثور على ${allRequests.length} طلب إجمالي`);
      
      allRequests.forEach(request => {
        console.log(`- ${request.requestNumber}: ${request.status.current}`);
      });
    }
    
  } catch (error) {
    console.error('خطأ في فحص البيانات:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkApprovalData();