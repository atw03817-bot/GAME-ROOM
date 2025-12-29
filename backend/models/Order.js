import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    image: String,
    // خيارات المنتج
    selectedOptions: {
      color: {
        name: String,
        nameAr: String,
        value: String, // hex code أو اسم اللون
        price: { type: Number, default: 0 }
      },
      storage: {
        name: String,
        nameAr: String,
        value: String, // مثل "128GB"
        price: { type: Number, default: 0 }
      },
      // خيارات إضافية أخرى
      other: [{
        name: String,
        nameAr: String,
        value: String,
        price: { type: Number, default: 0 }
      }]
    }
  }],
  shippingAddress: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    district: String,
    street: String,
    building: String
  },
  paymentMethod: {
    type: String,
    enum: ['cod', 'tap', 'stripe', 'tamara', 'tabby'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded', 'approved', 'declined', 'expired', 'authorized', 'cancelled'],
    default: 'pending'
  },
  status: {
    type: String,
    enum: ['draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  // عمولة تمارا
  tamaraCommission: {
    amount: {
      type: Number,
      default: 0
    },
    rate: {
      type: Number,
      default: 0
    },
    displayName: {
      type: String,
      default: 'عمولة الأقساط - تمارا'
    }
  },
  // عمولة تابي
  tabbyCommission: {
    amount: {
      type: Number,
      default: 0
    },
    rate: {
      type: Number,
      default: 0
    },
    displayName: {
      type: String,
      default: 'عمولة التقسيط - تابي'
    }
  },
  total: {
    type: Number,
    required: true
  },
  notes: String,
  trackingNumber: String,
  shippingCompany: String,
  
  // Tamara specific fields
  paidAt: Date,
  approvedAt: Date,
  authorizedAt: Date,
  declinedAt: Date,
  expiredAt: Date,
  cancelledAt: Date,
  refundedAt: Date,
  stockUpdated: { type: Boolean, default: false },
  paymentData: Object, // لحفظ بيانات الدفع
  
  statusHistory: [{
    status: String,
    note: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Generate order number
orderSchema.pre('save', async function(next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `ORD-${Date.now()}-${count + 1}`;
  }
  next();
});

export default mongoose.model('Order', orderSchema);
