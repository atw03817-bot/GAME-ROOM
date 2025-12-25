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
    sparse: true, // هذا يسمح بـ null values متعددة
    lowercase: true,
    trim: true,
    default: undefined // بدلاً من null
  },
  role: {
    type: String,
    enum: ['customer', 'admin', 'technician', 'manager'],
    default: 'customer'
  },
  permissions: [{
    type: String,
    enum: [
      'maintenance_view',
      'maintenance_create', 
      'maintenance_edit',
      'maintenance_delete',
      'products_view',
      'products_manage',
      'orders_view',
      'orders_manage',
      'users_view',
      'users_manage',
      'analytics_view',
      'settings_manage'
    ]
  }],
  department: {
    type: String,
    enum: ['maintenance', 'sales', 'admin', 'warehouse'],
    default: null
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

// Hash password and format phone before saving
userSchema.pre('save', async function(next) {
  try {
    // تنسيق رقم الجوال
    if (this.phone) {
      // إزالة المسافات والشرطات
      this.phone = this.phone.replace(/[\s-]/g, '');
      
      // إضافة 0 في البداية إذا كان الرقم يبدأ بـ 5
      if (this.phone.startsWith('5') && this.phone.length === 9) {
        this.phone = '0' + this.phone;
      }
    }

    // تشفير كلمة المرور
    if (this.isModified('password')) {
      this.password = await bcrypt.hash(this.password, 10);
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

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
