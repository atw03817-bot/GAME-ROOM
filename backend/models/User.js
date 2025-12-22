import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function(v) {
        // التحقق من صحة رقم الجوال السعودي
        return /^(05|5)[0-9]{8}$/.test(v.replace(/[\s-]/g, ''));
      },
      message: 'رقم الجوال يجب أن يكون رقم سعودي صحيح'
    }
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  // الحقول الاختيارية التي تملأ من عناوين الشحن
  name: {
    type: String,
    required: false,
    default: null
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['USER', 'ADMIN', 'customer', 'admin'],
    default: 'USER'
  },
  addresses: [{
    name: String,
    phone: String,
    city: String,
    district: String,
    street: String,
    building: String,
    isDefault: Boolean
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  phoneVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// فهرس للبحث السريع برقم الجوال
userSchema.index({ phone: 1 });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// تنسيق رقم الجوال قبل الحفظ
userSchema.pre('save', function(next) {
  if (this.phone) {
    // إزالة المسافات والشرطات
    this.phone = this.phone.replace(/[\s-]/g, '');
    
    // إضافة 0 في البداية إذا كان الرقم يبدأ بـ 5
    if (this.phone.startsWith('5') && this.phone.length === 9) {
      this.phone = '0' + this.phone;
    }
  }
  next();
});

// دالة للحصول على الاسم من آخر عنوان شحن
userSchema.methods.getDisplayName = function() {
  if (this.name) {
    return this.name;
  }
  
  // البحث عن اسم من عناوين الشحن
  const defaultAddress = this.addresses.find(addr => addr.isDefault);
  if (defaultAddress && defaultAddress.name) {
    return defaultAddress.name;
  }
  
  // آخر عنوان شحن
  if (this.addresses.length > 0 && this.addresses[0].name) {
    return this.addresses[0].name;
  }
  
  // اسم افتراضي
  return `عميل ${this.phone}`;
};

export default mongoose.model('User', userSchema);
