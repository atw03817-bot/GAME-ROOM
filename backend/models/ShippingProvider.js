import mongoose from 'mongoose';

const shippingProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    enum: ['smsa', 'redbox', 'aramex', 'other']
  },
  displayName: {
    type: String,
    required: true
    // مثال: "سمسا", "ريدبكس", "أرامكس"
  },
  enabled: {
    type: Boolean,
    default: false
  },
  apiKey: {
    type: String
  },
  apiSecret: {
    type: String
  },
  apiUrl: {
    type: String
  },
  testMode: {
    type: Boolean,
    default: true
  },
  settings: {
    type: mongoose.Schema.Types.Mixed
    // إعدادات إضافية خاصة بكل شركة
  }
}, {
  timestamps: true
});

export default mongoose.model('ShippingProvider', shippingProviderSchema);
