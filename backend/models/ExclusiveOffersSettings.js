import mongoose from 'mongoose';

const offerSchema = new mongoose.Schema({
  title: String,
  titleEn: String,
  discount: String,
  description: String,
  descriptionEn: String,
  link: String
}, { _id: false });

const exclusiveOffersSettingsSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  offer1: {
    type: offerSchema,
    default: {
      title: 'عرض الجمعة البيضاء',
      titleEn: 'Black Friday Deal',
      discount: '50%',
      description: 'خصم يصل إلى 50% على أجهزة مختارة',
      descriptionEn: 'Up to 50% off on selected devices',
      link: '/deals?category=black-friday'
    }
  },
  offer2: {
    type: offerSchema,
    default: {
      title: 'هدية مجانية',
      titleEn: 'Free Gift',
      discount: 'هدية',
      description: 'احصل على سماعات لاسلكية مع كل جهاز',
      descriptionEn: 'Get free wireless earbuds with every device',
      link: '/deals?category=free-gift'
    }
  },
  offer3: {
    type: offerSchema,
    default: {
      title: 'عرض محدود',
      titleEn: 'Limited Offer',
      discount: '30%',
      description: 'خصم 30% على الأجهزة الصلبة',
      descriptionEn: '30% off on rugged devices',
      link: '/deals?category=rugged'
    }
  },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('ExclusiveOffersSettings', exclusiveOffersSettingsSchema);
