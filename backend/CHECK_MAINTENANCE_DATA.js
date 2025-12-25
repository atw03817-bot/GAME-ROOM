// فحص بيانات الصيانة في قاعدة البيانات
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

// فحص البيانات
async function checkData() {
  try {
    // عرض جميع المجموعات
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📋 المجموعات الموجودة:');
    collections.forEach(col => console.log(`- ${col.name}`));
    
    // البحث عن مجموعة طلبات الصيانة
    const maintenanceCollections = collections.filter(col => 
      col.name.toLowerCase().includes('maintenance') || 
      col.name.toLowerCase().includes('request')
    );
    
    console.log('\n🔧 مجموعات الصيانة المحتملة:');
    maintenanceCollections.forEach(col => console.log(`- ${col.name}`));
    
    // فحص كل مجموعة محتملة
    for (const col of maintenanceCollections) {
      console.log(`\n📊 فحص مجموعة: ${col.name}`);
      const collection = mongoose.connection.db.collection(col.name);
      const count = await collection.countDocuments();
      console.log(`عدد الوثائق: ${count}`);
      
      if (count > 0) {
        const sample = await collection.findOne();
        console.log('عينة من البيانات:');
        console.log(JSON.stringify(sample, null, 2));
      }
    }
    
  } catch (error) {
    console.error('❌ خطأ في فحص البيانات:', error);
  }
}

// تشغيل الفحص
async function run() {
  await connectDB();
  await checkData();
  
  console.log('\n✅ تم الانتهاء من الفحص');
  mongoose.connection.close();
}

run().catch(console.error);