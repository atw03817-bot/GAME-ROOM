import mongoose from 'mongoose';

const featuredDealsSettingsSchema = new mongoose.Schema({
  enabled: { type: Boolean, default: true },
  title: { type: String, default: 'عروض حصرية' },
  subtitle: { type: String, default: 'خصومات تصل إلى {maxDiscount}% على أفضل الأجهزة' },
  bannerTitle: { type: String, default: 'عروض لفترة محدودة' },
  bannerSubtitle: { type: String, default: 'لا تفوت الفرصة - العروض تنتهي قريباً' },
  productsCount: { type: Number, default: 6 },
  ctaText: { type: String, default: 'اكتشف جميع العروض' },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

export default mongoose.model('FeaturedDealsSettings', featuredDealsSettingsSchema);
