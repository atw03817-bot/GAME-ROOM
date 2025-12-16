import mongoose from 'mongoose';

const factoryShipmentSchema = new mongoose.Schema({
  shipmentCode: {
    type: String,
    required: true,
    unique: true
    // كود الشحنة الفريد
  },
  model: {
    type: String,
    required: true
    // موديل الجهاز (مثال: "HOTWAV W10")
  },
  color: {
    type: String,
    required: true
    // اللون (مثال: "أسود", "أزرق")
  },
  totalQuantity: {
    type: Number,
    required: true
    // الكمية الكلية في الشحنة
  },
  weight: {
    type: Number
    // الوزن بالكيلوجرام
  },
  factoryBoxNo: {
    type: String
    // رقم الكرتون من المصنع
  },
  receivedDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index للبحث السريع (shipmentCode already has unique index)
factoryShipmentSchema.index({ model: 1, color: 1 });

export default mongoose.model('FactoryShipment', factoryShipmentSchema);
