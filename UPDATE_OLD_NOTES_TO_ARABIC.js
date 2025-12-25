// سكريبت لتحديث الملاحظات القديمة من الإنجليزية للعربية
import mongoose from 'mongoose';

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

// ترجمة الحالات
const getStatusTextAr = (status) => {
  const statusMap = {
    'received': 'تم الاستلام',
    'diagnosed': 'تم الفحص', 
    'waiting_approval': 'في انتظار الموافقة',
    'approved': 'تمت الموافقة',
    'in_progress': 'قيد الإصلاح',
    'testing': 'قيد الاختبار',
    'ready': 'جاهز للاستلام',
    'completed': 'مكتمل',
    'cancelled': 'ملغي'
  };
  return statusMap[status] || status;
};

// تحديث الملاحظات القديمة
async function updateOldNotes() {
  try {
    console.log('🔄 بدء تحديث الملاحظات القديمة...');
    
    const requests = await MaintenanceRequest.find({});
    console.log(`📋 تم العثور على ${requests.length} طلب`);
    
    let updatedCount = 0;
    
    for (const request of requests) {
      let needsUpdate = false;
      
      if (request.status.history && request.status.history.length > 0) {
        for (let i = 0; i < request.status.history.length; i++) {
          const historyItem = request.status.history[i];
          
          // تحديث الملاحظات التي تحتوي على حالات بالإنجليزية
          if (historyItem.note) {
            let updatedNote = historyItem.note;
            
            // استبدال الحالات الإنجليزية بالعربية في الملاحظات
            const statusReplacements = {
              'received': 'تم الاستلام',
              'diagnosed': 'تم الفحص',
              'waiting_approval': 'في انتظار الموافقة',
              'approved': 'تمت الموافقة',
              'in_progress': 'قيد الإصلاح',
              'testing': 'قيد الاختبار',
              'ready': 'جاهز للاستلام',
              'completed': 'مكتمل',
              'cancelled': 'ملغي'
            };
            
            for (const [english, arabic] of Object.entries(statusReplacements)) {
              if (updatedNote.includes(english)) {
                updatedNote = updatedNote.replace(new RegExp(english, 'g'), arabic);
                needsUpdate = true;
              }
            }
            
            // تحديث الملاحظات التي تحتوي على "تم تغيير الحالة إلى"
            const statusChangePattern = /تم تغيير الحالة إلى (\w+)/g;
            updatedNote = updatedNote.replace(statusChangePattern, (match, status) => {
              const arabicStatus = getStatusTextAr(status);
              if (arabicStatus !== status) {
                needsUpdate = true;
                return `تم تغيير الحالة إلى ${arabicStatus}`;
              }
              return match;
            });
            
            if (needsUpdate) {
              request.status.history[i].note = updatedNote;
            }
          }
        }
      }
      
      if (needsUpdate) {
        await request.save();
        updatedCount++;
        console.log(`✅ تم تحديث الملاحظات للطلب: ${request.requestNumber}`);
      }
    }
    
    console.log(`🎉 تم تحديث ${updatedCount} طلب من أصل ${requests.length}`);
    
  } catch (error) {
    console.error('❌ خطأ في تحديث الملاحظات:', error);
  }
}

// تشغيل السكريبت
async function run() {
  await connectDB();
  await updateOldNotes();
  
  console.log('\n🎉 تم الانتهاء من تحديث الملاحظات');
  console.log('💡 الملاحظات الجديدة ستظهر بالعربية تلقائياً');
  
  mongoose.connection.close();
}

run().catch(console.error);