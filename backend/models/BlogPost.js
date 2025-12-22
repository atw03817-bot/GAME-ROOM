// نموذج مقالات المدونة
import mongoose from 'mongoose';

const blogPostSchema = new mongoose.Schema({
  // العنوان
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  
  // الرابط المخصص
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  
  // المقدمة/الملخص
  excerpt: {
    type: String,
    required: true,
    maxlength: 300,
    trim: true
  },
  
  // المحتوى الكامل
  content: {
    type: String,
    required: true
  },
  
  // الصورة المميزة
  featuredImage: {
    url: String,
    alt: String,
    caption: String
  },
  
  // التصنيف
  category: {
    type: String,
    required: true,
    enum: [
      'اخبار-hotwav',
      'مراجعات-جوالات', 
      'مقارنات',
      'دليل-الشراء',
      'نصائح-استخدام',
      'تقنية',
      'اكسسوارات'
    ]
  },
  
  // الكلمات المفتاحية
  tags: [{
    type: String,
    trim: true
  }],
  
  // إعدادات SEO
  seo: {
    metaTitle: {
      type: String,
      maxlength: 80
    },
    metaDescription: {
      type: String,
      maxlength: 180
    },
    keywords: [String],
    canonicalUrl: String
  },
  
  // المؤلف
  author: {
    name: {
      type: String,
      default: 'فريق أبعاد التواصل'
    },
    avatar: String,
    bio: String
  },
  
  // إحصائيات
  stats: {
    views: {
      type: Number,
      default: 0
    },
    likes: {
      type: Number,
      default: 0
    },
    shares: {
      type: Number,
      default: 0
    },
    readingTime: {
      type: Number, // بالدقائق
      default: 5
    }
  },
  
  // حالة النشر
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  
  // تاريخ النشر المجدول
  publishedAt: {
    type: Date,
    default: null
  },
  
  // المنتجات المرتبطة
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // التعليقات مفعلة؟
  commentsEnabled: {
    type: Boolean,
    default: true
  },
  
  // مميز في الصفحة الرئيسية؟
  featured: {
    type: Boolean,
    default: false
  },
  
  // ترتيب العرض
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// فهارس للبحث السريع
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ category: 1, status: 1 });
blogPostSchema.index({ status: 1, publishedAt: -1 });
blogPostSchema.index({ featured: 1, publishedAt: -1 });
blogPostSchema.index({ tags: 1 });

// حساب وقت القراءة تلقائياً
blogPostSchema.pre('save', function(next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200; // متوسط سرعة القراءة
    const wordCount = this.content.split(/\s+/).length;
    this.stats.readingTime = Math.ceil(wordCount / wordsPerMinute);
  }
  
  // تحديث تاريخ النشر عند تغيير الحالة إلى منشور
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  
  next();
});

// دالة للحصول على URL المقال
blogPostSchema.methods.getUrl = function() {
  return `/blog/${this.slug}`;
};

// دالة للحصول على المقالات المشابهة
blogPostSchema.methods.getSimilarPosts = async function(limit = 3) {
  return await this.constructor.find({
    _id: { $ne: this._id },
    category: this.category,
    status: 'published'
  })
  .sort({ publishedAt: -1 })
  .limit(limit)
  .select('title slug excerpt featuredImage publishedAt stats.readingTime');
};

// إضافة pagination plugin - سنضيفها لاحقاً عند الحاجة
// blogPostSchema.plugin(mongoosePaginate);

export default mongoose.model('BlogPost', blogPostSchema);