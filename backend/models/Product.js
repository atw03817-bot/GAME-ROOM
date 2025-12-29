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
  colorPrices: {
    type: Map,
    of: Number, // إضافات أسعار الألوان
    default: {}
  },
  storagePrices: {
    type: Map,
    of: Number, // إضافات أسعار السعات
    default: {}
  },
  customOptions: [{
    name: { type: String, required: true }, // اسم الخيار
    nameAr: { type: String, required: true }, // الاسم بالعربي
    type: { 
      type: String, 
      enum: ['text', 'textarea', 'select', 'checkbox', 'radio', 'number'], 
      required: true 
    }, // نوع الخيار
    options: [{
      value: String, // قيمة الخيار
      label: String, // تسمية الخيار
      price: { type: Number, default: 0 } // سعر هذا الخيار تحديداً
    }], // الخيارات المتاحة مع أسعارها
    basePrice: { type: Number, default: 0 }, // السعر الأساسي للخيار (للنص والرقم)
    required: { type: Boolean, default: false }, // إجباري أم لا
    placeholder: String, // نص المساعدة
    description: String, // وصف الخيار
    maxLength: Number, // الحد الأقصى للنص
    minValue: Number, // الحد الأدنى للرقم
    maxValue: Number // الحد الأقصى للرقم
  }],
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
