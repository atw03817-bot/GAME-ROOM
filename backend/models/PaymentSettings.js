import mongoose from 'mongoose';

const paymentSettingsSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    unique: true,
    enum: ['tap', 'myfatoorah', 'tabby', 'cod', 'tamara']
  },
  enabled: {
    type: Boolean,
    default: false
  },
  config: {
    type: mongoose.Schema.Types.Mixed,
    // يحتوي على:
    // - apiKey
    // - apiSecret
    // - merchantId
    // - testMode
    // - webhookUrl
    // - etc.
  }
}, {
  timestamps: true
});

export default mongoose.model('PaymentSettings', paymentSettingsSchema);
