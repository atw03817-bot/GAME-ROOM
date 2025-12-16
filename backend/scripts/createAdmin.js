import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// نموذج المستخدم البسيط
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    // تحقق من وجود admin
    const existingAdmin = await User.findOne({ email: 'admin@ab-tw.com' });
    
    if (existingAdmin) {
      console.log('👤 Admin موجود مسبقاً');
      console.log('📧 Email: admin@ab-tw.com');
      console.log('🔑 Password: admin123');
      return;
    }

    // إنشاء admin جديد
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const admin = new User({
      name: 'مدير النظام',
      email: 'admin@ab-tw.com',
      password: hashedPassword,
      role: 'ADMIN'
    });

    await admin.save();
    
    console.log('✅ تم إنشاء حساب Admin بنجاح!');
    console.log('📧 Email: admin@ab-tw.com');
    console.log('🔑 Password: admin123');
    console.log('🔐 Role: ADMIN');

  } catch (error) {
    console.error('❌ خطأ في إنشاء Admin:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
};

createAdmin();