// فحص خطأ إنشاء طلب الصيانة من الإدارة
const mongoose = require('mongoose');

// الاتصال بقاعدة البيانات
mongoose.connect('mongodb://localhost:27017/hotwav-maintenance', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// تعريف النموذج
const maintenanceSchema = new mongoose.Schema({
  requestNumber: {
    type: String,
    unique: true
  },
  
  // مصدر الطلب - لتحديد إمكانية التعديل/الحذف
  createdBy: {
    type: String,
    enum: ['customer', 'admin'],
    default: 'customer'
  },
  
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String },
    address: { type: String, required: true }
  },
  
  device: {
    brand: { type: String, required: true },
    model: { type: String, required: true },
    color: { type: String },
    storage: { type: String },
    serialNumber: { type: String, required: true },
    purchaseDate: { type: Date },
    hasPassword: { type: Boolean, required: true },
    passwordType: { 
      type: String, 
      enum: ['text', 'pattern', 'none'],
      required: function() { return this.hasPassword; }
    },
    passwordValue: { 
      type: String,
      required: function() { return this.hasPassword && this.passwordType === 'text'; }
    },
    patternValue: { 
      type: String,
      required: function() { return this.hasPassword && this.passwordType === 'pattern'; }
    }
  },
  
  issue: {
    category: { 
      type: String, 
      required: true,
      enum: ['screen', 'battery', 'software', 'hardware', 'water_damage', 'charging', 'audio', 'camera', 'other']
    },
    subCategory: { type: String },
    description: { type: String, required: true },
    images: [{ type: String }],
    priority: { 
      type: String, 
      enum: ['normal', 'urgent', 'emergency'],
      default: 'normal'
    },
    symptoms: [{ type: String }]
  },
  
  // معلومات الشحن (للعملاء خارج المدينة)
  shipping: {
    isRequired: { type: Boolean, default: false },
    provider: { 
      type: String, 
      enum: ['aramex', 'smsa', 'naqel', 'none'],
      default: 'none'
    },
    providerName: { type: String },
    cost: { type: Number, default: 0 },
    trackingNumber: { type: String },
    status: {
      type: String,
      enum: ['pending', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending'
    },
    pickupAddress: { type: String },
    deliveryAddress: { type: String },
    notes: { type: String }
  },
  
  status: {
    current: { 
      type: String, 
      enum: [
        'received', 'diagnosed', 'waiting_approval', 'approved', 'in_progress', 
        'testing', 'ready', 'completed', 'cancelled', 'on_hold'
      ],
      default: 'received'
    },
    history: [{
      status: String,
      date: { type: Date, default: Date.now },
      note: String,
      updatedBy: String
    }]
  },
  
  cost: {
    diagnosticFee: { type: Number, default: 0 },
    partsCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    priorityFee: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    totalEstimated: { type: Number, default: 0 },
    totalFinal: { type: Number, default: 0 },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    }
  }
}, {
  timestamps: true
});

// إضافة دالة لتوليد رقم الطلب
maintenanceSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const count = await mongoose.model('MaintenanceRequest').countDocuments();
    this.requestNumber = `MR-${String(count + 1).padStart(3, '0')}`;
  }
  next();
});

// حساب التكلفة الإجمالية
maintenanceSchema.methods.calculateTotal = function() {
  this.cost.totalEstimated = 
    this.cost.diagnosticFee + 
    this.cost.partsCost + 
    this.cost.laborCost + 
    this.cost.priorityFee +
    this.cost.shippingFee;
  
  if (this.cost.totalFinal === 0) {
    this.cost.totalFinal = this.cost.totalEstimated;
  }
};

const MaintenanceRequest = mongoose.model('MaintenanceRequest', maintenanceSchema);

async function testAdminCreate() {
  try {
    console.log('اختبار إنشاء طلب صيانة من الإدارة...');
    
    const testData = {
      customerInfo: {
        name: 'عميل تجريبي',
        phone: '0501234567',
        email: 'test@example.com',
        address: 'الرياض، حي النخيل'
      },
      device: {
        brand: 'HOTWAV',
        model: 'HOTWAV Cyber 15',
        color: 'أسود',
        storage: '256GB',
        serialNumber: 'TEST123456',
        purchaseDate: new Date(),
        hasPassword: true,
        passwordType: 'text',
        passwordValue: '123456'
      },
      issue: {
        category: 'screen',
        subCategory: 'شاشة مكسورة',
        description: 'اختبار المشكلة',
        priority: 'normal',
        symptoms: ['شاشة مكسورة'],
        images: []
      },
      shipping: {
        isRequired: false,
        provider: 'none',
        providerName: '',
        cost: 0,
        status: 'pending'
      }
    };

    console.log('البيانات المرسلة:', JSON.stringify(testData, null, 2));

    const maintenanceRequest = new MaintenanceRequest({
      createdBy: 'admin',
      ...testData,
      cost: {
        diagnosticFee: 25,
        partsCost: 0,
        laborCost: 0,
        priorityFee: 0,
        shippingFee: 0,
        totalEstimated: 25,
        totalFinal: 0,
        paymentStatus: 'pending'
      }
    });
    
    // إضافة أول حالة للتاريخ
    maintenanceRequest.status.history.push({
      status: 'received',
      date: new Date(),
      note: 'تم إنشاء الطلب من الإدارة',
      updatedBy: 'Admin Test'
    });
    
    await maintenanceRequest.save();
    console.log('✅ تم إنشاء الطلب بنجاح:', maintenanceRequest.requestNumber);
    console.log('ID:', maintenanceRequest._id);
    console.log('createdBy:', maintenanceRequest.createdBy);
    
  } catch (error) {
    console.error('❌ خطأ في إنشاء الطلب:', error);
    console.error('تفاصيل الخطأ:', error.message);
    if (error.errors) {
      console.error('أخطاء التحقق:', Object.keys(error.errors));
      for (const field in error.errors) {
        console.error(`- ${field}: ${error.errors[field].message}`);
      }
    }
  } finally {
    mongoose.connection.close();
  }
}

testAdminCreate();