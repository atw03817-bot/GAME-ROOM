import mongoose from 'mongoose';

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  district: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  building: {
    type: String,
    required: true
  },
  postalCode: {
    type: String
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index للبحث السريع
addressSchema.index({ userId: 1 });
addressSchema.index({ userId: 1, isDefault: 1 });

export default mongoose.model('Address', addressSchema);
