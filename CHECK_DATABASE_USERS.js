// فحص المستخدمين في قاعدة البيانات
import mongoose from 'mongoose';

// نموذج المستخدم المبسط للفحص
const userSchema = new mongoose.Schema({
  phone: String,
  email: String,
  password: String,
  role: String,
  createdAt: Date
});

const User = mongoose.model('User', userSchema);

async function checkUsers() {
  try {
    // الاتصال بقاعدة البيانات
    await mongoose.connect('mongodb://localhost:27017/mobile_store');
    console.log('✅ متصل بقاعدة البيانات');

    // جلب جميع المستخدمين
    const users = await User.find({}).select('phone email role createdAt');
    
    console.log('\n📊 المستخدمين في قاعدة البيانات:');
    console.log('العدد الكلي:', users.length);
    console.log('');

    users.forEach((user, index) => {
      console.log(`${index + 1}. الرقم: ${user.phone || 'غير محدد'} | الإيميل: ${user.email || 'غير محدد'} | الدور: ${user.role} | التاريخ: ${user.createdAt}`);
    });

    // فحص الرقم المحدد
    const testPhone = '0508675543';
    const existingUser = await User.findOne({ phone: testPhone });
    
    console.log('\n🔍 فحص الرقم:', testPhone);
    if (existingUser) {
      console.log('❌ الرقم موجود في قاعدة البيانات');
      console.log('تفاصيل المستخدم:', {
        phone: existingUser.phone,
        email: existingUser.email,
        role: existingUser.role,
        createdAt: existingUser.createdAt
      });
    } else {
      console.log('✅ الرقم غير موجود - يمكن التسجيل به');
    }

    // فحص أرقام مشابهة
    const similarPhones = await User.find({ 
      phone: { $regex: '0508675', $options: 'i' } 
    }).select('phone');
    
    if (similarPhones.length > 0) {
      console.log('\n📱 أرقام مشابهة موجودة:');
      similarPhones.forEach(user => {
        console.log('- ' + user.phone);
      });
    }

  } catch (error) {
    console.error('❌ خطأ:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 تم قطع الاتصال');
  }
}

checkUsers();