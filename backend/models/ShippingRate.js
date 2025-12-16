import mongoose from 'mongoose';

const shippingRateSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingProvider',
    required: true
  },
  city: {
    type: String,
    required: true
    // مثال: "الرياض", "جدة", "الدمام"
  },
  price: {
    type: Number,
    required: true
  },
  estimatedDays: {
    type: Number,
    required: true
    // عدد أيام التوصيل المتوقعة
  }
}, {
  timestamps: true
});

// Index للبحث السريع
shippingRateSchema.index({ providerId: 1, city: 1 });
shippingRateSchema.index({ city: 1 });

export default mongoose.model('ShippingRate', shippingRateSchema);
