// سكريبت محدث لتحديث ملاحظات الصيانة
import mongoose from 'mongoose';

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

// تحديث الملاحظات
async function updateMaintenanceNotes() {
  try {
    console.log('🔄 البحث عن طلبات الصيانة...');
    
    // البحث في مجموعة maintenancerequests مباشرة
    const collection = mongoose.connection.db.collection('maintenancerequests');
    const requests = await collection.find({}).toArray();
    
    console.log(`📋 تم العثور على ${requests.length} طلب صيانة`);
    
    if (requests.length === 0) {
      console.log('❌ لم يتم العثور على طلبات صيانة');
      return;
    }
    
    let updatedCount = 0;
    
    for (const request of requests) {
      let needsUpdate = false;
      
      console.log(`🔍 فحص الطلب: ${request.requestNumber || request._id}`);
      
      if (request.status && request.status.history && request.status.history.length > 0) {
        console.log(`📝 عدد الملاحظات: ${request.status.history.length}`);
        
        for (let i = 0; i < request.status.history.length; i++) {
          const historyItem = request.status.history[i];
          
          if (historyItem.note) {
            let originalNote = historyItem.note;
            let updatedNote = originalNote;
            
            console.log(`📄 الملاحظة الأصلية: ${originalNote}`);
            
            // استبدال الحالات الإنجليزية بالعربية
            const statusReplacements = {
              'diagnosed': 'تم الفحص',
              'waiting_approval': 'في انتظار الموافقة',
              'in_progress': 'قيد الإصلاح',
              'testing': 'قيد الاختبار',
              'ready': 'جاهز للاستلام',
              'completed': 'مكتمل',
              'received': 'تم الاستلام',
              'approved': 'تمت الموافقة',
              'cancelled': 'ملغي'
            };
            
            for (const [english, arabic] of Object.entries(statusReplacements)) {
              if (updatedNote.includes(english)) {
                updatedNote = updatedNote.replace(new RegExp(english, 'g'), arabic);
                needsUpdate = true;
                console.log(`🔄 استبدال ${english} بـ ${arabic}`);
              }
            }
            
            if (updatedNote !== originalNote) {
              request.status.history[i].note = updatedNote;
              console.log(`✅ الملاحظة المحدثة: ${updatedNote}`);
            }
          }
        }
      }
      
      if (needsUpdate) {
        await collection.replaceOne({ _id: request._id }, request);
        updatedCount++;
        console.log(`✅ تم تحديث الطلب: ${request.requestNumber || request._id}`);
      } else {
        console.log(`ℹ️ لا يحتاج تحديث: ${request.requestNumber || request._id}`);
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
  await updateMaintenanceNotes();
  
  console.log('\n🎉 تم الانتهاء من التحديث');
  console.log('🔄 أعد تحميل صفحة الحساب لرؤية التحديثات');
  
  mongoose.connection.close();
}

run().catch(console.error);