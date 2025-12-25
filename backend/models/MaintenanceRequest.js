import mongoose from 'mongoose';

const maintenanceRequestSchema = new mongoose.Schema({
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
    address: { type: String, required: true },
    nationalId: { type: String }
  },
  
  device: {
    brand: { type: String, required: true }, // Apple, Samsung, Huawei
    model: { type: String, required: true }, // iPhone 14 Pro, Galaxy S23
    color: { type: String, required: true },
    storage: { type: String }, // 128GB, 256GB
    serialNumber: { type: String, required: true },
    purchaseDate: { type: Date },
    warrantyStatus: { 
      type: String, 
      enum: ['under_warranty', 'expired', 'unknown'],
      default: 'unknown'
    },
    // معلومات كلمة السر
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
      type: String, // سيحفظ النمط كـ JSON string
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
    images: { 
      type: [String], 
      required: true,
      validate: {
        validator: function(images) {
          return images && images.length >= 3; // على الأقل 3 صور (أمام، خلف، جانب)
        },
        message: 'يجب رفع 3 صور على الأقل للجهاز (أمام، خلف، جانب)'
      }
    },
    priority: { 
      type: String, 
      enum: ['normal', 'urgent', 'emergency'],
      default: 'normal'
    },
    symptoms: [{ type: String }]
  },
  
  diagnosis: {
    initialCheck: { type: String },
    problemFound: { type: String },
    rootCause: { type: String },
    recommendedSolution: { type: String },
    requiredParts: [{
      partName: String,
      partNumber: String,
      price: Number,
      availability: {
        type: String,
        enum: ['available', 'unavailable', 'special_order'],
        default: 'available'
      }
    }],
    repairability: { 
      type: String,
      enum: ['repairable', 'unrepairable', 'needs_parts'],
      default: 'repairable'
    },
    estimatedTime: { type: Number }, // in hours
    technicianNotes: { type: String }
  },
  
  status: {
    current: { 
      type: String, 
      enum: [
        'received',           // تم الاستلام
        'diagnosed',          // تم الفحص
        'waiting_approval',   // في انتظار الموافقة
        'approved',          // تمت الموافقة
        'in_progress',       // قيد الإصلاح
        'testing',           // قيد الاختبار
        'ready',             // جاهز للاستلام
        'completed',         // مكتمل
        'cancelled',         // ملغي
        'on_hold'            // معلق
      ],
      default: 'received'
    },
    history: [{
      status: String,
      date: { type: Date, default: Date.now },
      note: String,
      updatedBy: { type: String }
    }]
  },
  
  // معلومات الشحن (للعملاء خارج المدينة)
  shipping: {
    isRequired: { type: Boolean, default: false }, // هل يحتاج شحن؟
    provider: { 
      type: String, 
      enum: ['aramex', 'smsa', 'naqel', 'none'],
      default: 'none'
    },
    providerName: { type: String }, // اسم الشركة بالعربي
    cost: { type: Number, default: 0 }, // تكلفة الشحن
    trackingNumber: { type: String }, // رقم التتبع
    status: {
      type: String,
      enum: ['pending', 'picked_up', 'in_transit', 'delivered', 'cancelled'],
      default: 'pending'
    },
    pickupAddress: { type: String }, // عنوان الاستلام من العميل
    deliveryAddress: { type: String }, // عنوان التسليم للعميل
    notes: { type: String } // ملاحظات الشحن
  },
  
  cost: {
    diagnosticFee: { type: Number, default: 0 },
    partsCost: { type: Number, default: 0 },
    laborCost: { type: Number, default: 0 },
    priorityFee: { type: Number, default: 0 }, // رسوم الأولوية
    shippingFee: { type: Number, default: 0 }, // رسوم الشحن
    totalEstimated: { type: Number, default: 0 },
    totalFinal: { type: Number, default: 0 },
    paymentStatus: { 
      type: String, 
      enum: ['pending', 'partial', 'paid', 'refunded'],
      default: 'pending'
    },
    paymentMethod: { 
      type: String, 
      enum: ['cash', 'card', 'transfer', 'tamara'],
      default: 'cash'
    }
  },
  
  // معلومات موافقة العميل
  customerApproval: {
    status: { 
      type: String, 
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    decision: { type: String }, // 'approve' or 'reject'
    customerNotes: { type: String }, // ملاحظات العميل
    approvalDate: { type: Date },
    approvalMethod: { 
      type: String, 
      enum: ['online', 'phone', 'in_person'],
      default: 'online'
    }
  },
  
  timeline: {
    received: { type: Date, default: Date.now },
    diagnosed: { type: Date },
    approved: { type: Date },
    started: { type: Date },
    completed: { type: Date },
    delivered: { type: Date },
    estimatedDelivery: { type: Date }
  },
  
  technician: {
    id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    name: { type: String },
    specialization: { type: String },
    notes: { type: String },
    workHours: { type: Number, default: 0 }
  },
  
  quality: {
    testResults: { type: String },
    warrantyPeriod: { type: Number, default: 3 }, // months
    customerSatisfaction: { type: Number, min: 1, max: 5 },
    feedback: { type: String }
  },
  
  // للملصق والفاتورة
  labelPrinted: { type: Boolean, default: false },
  invoicePrinted: { type: Boolean, default: false },
  
  // ملاحظات إضافية
  adminNotes: { type: String },
  customerNotes: { type: String }
  
}, {
  timestamps: true
});

// إنشاء رقم الطلب التلقائي
maintenanceRequestSchema.pre('save', async function(next) {
  if (!this.requestNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.requestNumber = `MNT-${year}-${String(count + 1).padStart(4, '0')}`;
  }
  next();
});

// إضافة تحديث للحالة
maintenanceRequestSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  // ترجمة الحالات للعربية
  const getStatusTextAr = (status) => {
    const statusMap = {
      'received': 'تم الاستلام',
      'diagnosed': 'تم الفحص', 
      'waiting_approval': 'في انتظار الموافقة',
      'approved': 'تمت الموافقة',
      'in_progress': 'قيد الإصلاح',
      'testing': 'قيد الاختبار',
      'ready': 'جاهز للاستلام',
      'completed': 'مكتمل',
      'cancelled': 'ملغي'
    };
    return statusMap[status] || status;
  };

  this.status.history.push({
    status: this.status.current,
    date: new Date(),
    note: note || `تم تغيير الحالة إلى ${getStatusTextAr(newStatus)}`,
    updatedBy: updatedBy
  });
  this.status.current = newStatus;
  
  // تحديث التواريخ حسب الحالة
  const now = new Date();
  switch(newStatus) {
    case 'diagnosed':
      this.timeline.diagnosed = now;
      break;
    case 'approved':
      this.timeline.approved = now;
      break;
    case 'in_progress':
      this.timeline.started = now;
      break;
    case 'completed':
      this.timeline.completed = now;
      break;
    case 'ready':
      this.timeline.delivered = now;
      break;
  }
};

// حساب التكلفة الإجمالية
maintenanceRequestSchema.methods.calculateTotal = function() {
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

export default mongoose.model('MaintenanceRequest', maintenanceRequestSchema);