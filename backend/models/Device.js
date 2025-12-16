import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema({
  shipmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FactoryShipment',
    required: true
  },
  imei1: {
    type: String,
    required: true,
    unique: true
    // IMEI الأول (إلزامي)
  },
  imei2: {
    type: String,
    unique: true,
    sparse: true
    // IMEI الثاني (اختياري للأجهزة ذات الشريحتين)
  },
  serialNo: {
    type: String
    // السيريال نمبر
  },
  status: {
    type: String,
    enum: ['IN_STOCK', 'ASSIGNED', 'DELIVERED', 'RETURNED'],
    default: 'IN_STOCK'
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DistributionGroup'
    // المجموعة اللي انضاف لها الجهاز
  }
}, {
  timestamps: true
});

// Index للبحث السريع (imei1 and imei2 already have unique indexes)
deviceSchema.index({ shipmentId: 1 });
deviceSchema.index({ status: 1 });
deviceSchema.index({ groupId: 1 });

export default mongoose.model('Device', deviceSchema);
