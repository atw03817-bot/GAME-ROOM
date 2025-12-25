// البحث عن بيانات الصيانة في جميع المجموعات
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

// البحث في جميع المجموعات
async function searchAllCollections() {
  try {
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`\n🔍 البحث في ${collections.length} مجموعة...`);
    
    for (const col of collections) {
      try {
        const collection = mongoose.connection.db.collection(col.name);
        const count = await collection.countDocuments();
        
        if (count > 0) {
          // البحث عن وثائق تحتوي على كلمات مفتاحية للصيانة
          const maintenanceKeywords = [
            'maintenance', 'صيانة', 'repair', 'إصلاح', 
            'MNT-', 'requestNumber', 'deviceModel', 'HOTWAV'
          ];
          
          for (const keyword of maintenanceKeywords) {
            try {
              const docs = await collection.find({
                $or: [
                  { $text: { $search: keyword } },
                  { requestNumber: { $regex: keyword, $options: 'i' } },
                  { 'device.model': { $regex: keyword, $options: 'i' } },
                  { 'customerInfo.name': { $regex: keyword, $options: 'i' } }
                ]
              }).limit(1).toArray();
              
              if (docs.length > 0) {
                console.log(`\n🎯 وجدت بيانات صيانة في: ${col.name}`);
                console.log(`عدد الوثائق: ${count}`);
                console.log('عينة من البيانات:');
                console.log(JSON.stringify(docs[0], null, 2));
                break;
              }
            } catch (e) {
              // تجاهل أخطاء البحث النصي
            }
          }
          
          // فحص عينة من كل مجموعة تحتوي على بيانات
          if (count < 10) {
            const sample = await collection.findOne();
            if (sample && (
              sample.requestNumber || 
              sample.device || 
              sample.customerInfo ||
              JSON.stringify(sample).includes('MNT-') ||
              JSON.stringify(sample).includes('HOTWAV')
            )) {
              console.log(`\n🔍 مجموعة محتملة: ${col.name} (${count} وثائق)`);
              console.log('عينة:');
              console.log(JSON.stringify(sample, null, 2));
            }
          }
        }
      } catch (error) {
        // تجاهل أخطاء الوصول للمجموعات
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في البحث:', error);
  }
}

// تشغيل البحث
async function run() {
  await connectDB();
  await searchAllCollections();
  
  console.log('\n✅ تم الانتهاء من البحث');
  mongoose.connection.close();
}

run().catch(console.error);