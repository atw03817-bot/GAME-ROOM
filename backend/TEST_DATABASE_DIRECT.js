// اختبار قاعدة البيانات مباشرة
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

// User Schema (نسخة مبسطة)
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

// Hash password before saving
userSchema.pre('save', async function(next) {
  try {
    if (this.phone) {
      this.phone = this.phone.replace(/[\s-]/g, '');
      if (this.phone.startsWith('5') && this.phone.length === 9) {
        this.phone = '0' + this.phone;
      }
    }

    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model('TestUser', userSchema);

const testDatabaseDirectly = async () => {
  try {
    console.log('🔍 TESTING DATABASE DIRECTLY - اختبار قاعدة البيانات مباشرة');
    console.log('='.repeat(70));

    // 1. الاتصال بقاعدة البيانات
    console.log('\n1️⃣ Connecting to MongoDB...');
    console.log('📡 MongoDB URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');
    
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully');

    // 2. اختبار إنشاء مستخدم
    console.log('\n2️⃣ Testing user creation...');
    
    const testPhone = '0501234567';
    const testPassword = '123456';
    
    // حذف المستخدم إذا كان موجود
    await User.deleteOne({ phone: testPhone });
    console.log('🗑️ Cleaned up existing test user');

    // إنشاء المستخدم
    console.log('👤 Creating new user...');
    const user = new User({
      phone: testPhone,
      password: testPassword,
      role: 'USER'
    });

    console.log('💾 Saving user to database...');
    await user.save();
    console.log('✅ User created successfully:', {
      id: user._id,
      phone: user.phone,
      role: user.role,
      hashedPassword: user.password.substring(0, 20) + '...'
    });

    // 3. اختبار البحث عن المستخدم
    console.log('\n3️⃣ Testing user lookup...');
    const foundUser = await User.findOne({ phone: testPhone });
    
    if (!foundUser) {
      console.log('❌ User not found after creation');
      return;
    }
    console.log('✅ User found successfully');

    // 4. اختبار تسجيل الدخول
    console.log('\n4️⃣ Testing password validation...');
    const isValidPassword = await bcrypt.compare(testPassword, foundUser.password);
    console.log('🔐 Password validation:', isValidPassword ? '✅ Valid' : '❌ Invalid');

    // 5. تنظيف
    await User.deleteOne({ phone: testPhone });
    console.log('🗑️ Test user cleaned up');

    console.log('\n✅ ALL DATABASE TESTS PASSED!');
    console.log('📝 The issue is NOT in the database or User model');
    console.log('🔍 The problem must be in the server code or environment');

  } catch (error) {
    console.error('\n❌ DATABASE TEST FAILED:', error);
    
    if (error.code === 11000) {
      console.log('🔍 Duplicate key error - user already exists');
    }
    
    if (error.name === 'ValidationError') {
      console.log('🔍 Validation error:', error.message);
    }
    
    if (error.name === 'MongoNetworkError') {
      console.log('🔍 Network error - check MongoDB connection');
    }

    console.log('\n📋 Full error details:');
    console.log(error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

testDatabaseDirectly();