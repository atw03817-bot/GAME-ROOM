import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    ar: { type: String },
    en: { type: String }
  },
  nameAr: { type: String }, // للتوافق مع الكود القديم
  nameEn: { type: String }, // للتوافق مع الكود القديم
  description: {
    ar: { type: String },
    en: { type: String }
  },
  descriptionAr: { type: String }, // للتوافق
  descriptionEn: { type: String }, // للتوافق
  price: {
    type: Number,
    required: true,
    min: 0
  },
  originalPrice: { // السعر الأصلي قبل الخصم
    type: Number,
    min: 0
  },
  comparePrice: {
    type: Number,
    min: 0
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: false // جعلها اختيارية
  },
  categoryName: { type: String }, // للتوافق - اسم الفئة كنص
  brand: {
    type: String,
    required: false // للتوافق مع الكود القديم
  },
  brandInfo: {
    text: { type: String, default: '' }, // النص
    image: { type: String, default: '' }, // رابط الصورة
    displayType: { 
      type: String, 
      enum: ['text', 'image', 'both'], 
      default: 'text' 
    } // نوع العرض
  },
  tagline: String, // شعار المنتج
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },
  colors: [String], // الألوان المتاحة
  storage: [String], // السعات المتاحة
  colorImages: {
    type: Map,
    of: [String], // كل لون يحتوي على مصفوفة من الصور
    default: {}
  },
  specifications: {
    type: Map,
    of: String
  },
  features: {
    ar: [String],
    en: [String]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  sales: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for search
productSchema.index({ 'name.ar': 'text', 'name.en': 'text' });

export default mongoose.model('Product', productSchema);
