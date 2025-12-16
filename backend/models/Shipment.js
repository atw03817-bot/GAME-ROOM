import mongoose from 'mongoose';

const shipmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingProvider'
  },
  trackingNumber: {
    type: String,
    unique: true,
    sparse: true // يسمح بقيم null متعددة
  },
  status: {
    type: String,
    enum: ['created', 'pending', 'picked_up', 'in_transit', 'out_for_delivery', 'delivered', 'failed', 'cancelled', 'returned'],
    default: 'created'
  },
  shippingCost: {
    type: Number,
    required: true
  },
  estimatedDelivery: {
    type: Date
  },
  actualDelivery: {
    type: Date
  },
  currentLocation: {
    type: String
  },
  deliveryAttempts: {
    type: Number,
    default: 0
  },
  notes: {
    type: String
  },
  apiResponse: {
    type: mongoose.Schema.Types.Mixed
    // استجابة API الكاملة من شركة الشحن
  },
  webhookHistory: [{
    status: String,
    location: String,
    timestamp: Date,
    rawData: mongoose.Schema.Types.Mixed
  }]
}, {
  timestamps: true
});

// Index للبحث السريع
shipmentSchema.index({ orderId: 1 });
shipmentSchema.index({ trackingNumber: 1 });
shipmentSchema.index({ status: 1 });

export default mongoose.model('Shipment', shipmentSchema);
