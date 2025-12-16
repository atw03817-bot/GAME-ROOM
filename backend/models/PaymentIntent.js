import mongoose from 'mongoose';

const paymentIntentSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'SAR'
  },
  provider: {
    type: String,
    required: true,
    enum: ['tap', 'myfatoorah', 'tamara', 'tabby', 'cod']
  },
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING'
  },
  paymentUrl: {
    type: String
  },
  transactionId: {
    type: String
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index للبحث السريع (orderId already has unique index)
paymentIntentSchema.index({ transactionId: 1 });
paymentIntentSchema.index({ status: 1 });

export default mongoose.model('PaymentIntent', paymentIntentSchema);
