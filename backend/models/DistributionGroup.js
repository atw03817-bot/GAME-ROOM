import mongoose from 'mongoose';

const distributionGroupSchema = new mongoose.Schema({
  groupCode: {
    type: String,
    required: true,
    unique: true
    // كود المجموعة الفريد (يستخدم في QR Code)
  },
  shipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FactoryShipment',
    required: true
  },
  clientName: {
    type: String,
    required: true
    // اسم العميل/الموزع
  },
  clientPhone: {
    type: String
    // رقم جوال العميل
  },
  model: {
    type: String,
    required: true
    // موديل الأجهزة
  },
  color: {
    type: String,
    required: true
    // لون الأجهزة
  },
  quantity: {
    type: Number,
    required: true
    // عدد الأجهزة في المجموعة
  },
  qrCode: {
    type: String
    // QR Code data (base64 أو URL)
  },
  labelPrinted: {
    type: Boolean,
    default: false
    // هل تم طباعة الملصق
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index للبحث السريع (groupCode already has unique index)
distributionGroupSchema.index({ shipmentId: 1 });
distributionGroupSchema.index({ clientName: 1 });

export default mongoose.model('DistributionGroup', distributionGroupSchema);
