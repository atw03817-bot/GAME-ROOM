// تشخيص مشكلة التسجيل بالتفصيل
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// محاكاة User model
const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN'],
    default: 'USER'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

const diagnoseRegistration = async () => {
  try {
    console.log('🔍 DIAGNOSIS: Registration Error Analysis');
    console.log('==========================================');

    // 1. اختبار الاتصال بقاعدة البيانات
    console.log('1️⃣ Testing MongoDB connection...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // 2. اختبار إنشاء مستخدم جديد
    console.log('\n2️⃣ Testing user creation...');
    
    const testPhone = '0501234567';
    const testPassword = '123456';
    
    // حذف المستخدم إذا كان موجود
    await User.deleteOne({ phone: testPhone });
    console.log('🗑️ Cleaned up existing test user');

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(testPassword, 10);
    console.log('🔐 Password hashed successfully');

    // إنشاء المستخدم
    const user = new User({
      phone: testPhone,
      password: hashedPassword,
      role: 'USER'
    });

    await user.save();
    console.log('✅ User created successfully:', {
      id: user._id,
      phone: user.phone,
      role: user.role
    });

    // 3. اختبار تسجيل الدخول
    console.log('\n3️⃣ Testing login...');
    const foundUser = await User.findOne({ phone: testPhone });
    
    if (!foundUser) {
      console.log('❌ User not found after creation');
      return;
    }

    const isValidPassword = await bcrypt.compare(testPassword, foundUser.password);
    console.log('🔐 Password validation:', isValidPassword ? '✅ Valid' : '❌ Invalid');

    // 4. تنظيف
    await User.deleteOne({ phone: testPhone });
    console.log('🗑️ Test user cleaned up');

    console.log('\n✅ All tests passed! Registration should work now.');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error);
    
    if (error.code === 11000) {
      console.log('🔍 Duplicate key error - user already exists');
    }
    
    if (error.name === 'ValidationError') {
      console.log('🔍 Validation error:', error.message);
    }
    
    if (error.name === 'MongoNetworkError') {
      console.log('🔍 Network error - check MongoDB connection');
    }
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
};

diagnoseRegistration();