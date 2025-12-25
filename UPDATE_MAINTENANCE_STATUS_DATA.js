// سكريبت لتحديث حالات الصيانة في قاعدة البيانات من الإنجليزية للعربية
import mongoose from 'mongoose';
import MaintenanceRequest from './backend/models/MaintenanceRequest.js';

// الاتصال بقاعدة البيانات
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/mobile-store', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ تم الاتصال بقاعدة البيانات');
  } catch (error) {
    console.error('❌ خطأ في الاتصال بقاعدة البيانات:', error);
    process.exit(1);
  }
};

// تحديث حالات الصيانة
const updateMaintenanceStatuses = async () => {
  try {
    console.log('🔄 بدء تحديث حالات الصيانة...');
    
    // جلب جميع طلبات الصيانة
    const requests = await MaintenanceRequest.find({});
    console.log(`📋 تم العثور على ${requests.length} طلب صيانة`);
    
    let updatedCount = 0;
    
    for (const request of requests) {
      let needsUpdate = false;
      
      // تحديث الحالة الحالية إذا كانت بالإنجليزية
      const statusMapping = {
        'received': 'received',
        'diagnosed': 'diagnosed', 
        'waiting_approval': 'waiting_approval',
        'approved': 'approved',
        'in_progress': 'in_progress',
        'testing': 'testing',
        'ready': 'ready',
        'completed': 'completed',
        'cancelled': 'cancelled'
      };
      
      // تحديث تاريخ الحالات
      if (request.status.history && request.status.history.length > 0) {
        for (let i = 0; i < request.status.history.length; i++) {
          const historyItem = request.status.history[i];
          if (statusMapping[historyItem.status]) {
            // الحالة موجودة في الخريطة، لا حاجة لتغيير
            continue;
          }
        }
      }
      
      // تحديث حالة الدفع إذا كانت فارغة أو غير صحيحة
      if (!request.cost.paymentStatus || !['paid', 'partial', 'unpaid'].includes(request.cost.paymentStatus)) {
        request.cost.paymentStatus = 'unpaid';
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await request.save();
        updatedCount++;
        console.log(`✅ تم تحديث الطلب: ${request.requestNumber}`);
      }
    }
    
    console.log(`🎉 تم تحديث ${updatedCount} طلب من أصل ${requests.length}`);
    
  } catch (error) {
    console.error('❌ خطأ في تحديث البيانات:', error);
  }
};

// تشغيل السكريبت
const runUpdate = async () => {
  await connectDB();
  await updateMaintenanceStatuses();
  
  console.log('✅ تم الانتهاء من التحديث');
  process.exit(0);
};

runUpdate();