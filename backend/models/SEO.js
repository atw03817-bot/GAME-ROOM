import mongoose from 'mongoose';

const seoSchema = new mongoose.Schema({
  // معرف الصفحة
  pageId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // نوع الصفحة
  pageType: {
    type: String,
    required: true,
    enum: ['page', 'product', 'category', 'blog', 'custom']
  },
  
  // العنوان الأساسي
  title: {
    type: String,
    required: [true, 'العنوان مطلوب'],
    maxlength: [60, 'العنوان يجب أن يكون أقل من 60 حرف'],
    trim: true
  },
  
  // الوصف
  description: {
    type: String,
    required: [true, 'الوصف مطلوب'],
    maxlength: [160, 'الوصف يجب أن يكون أقل من 160 حرف'],
    trim: true
  },
  
  // الكلمات المفتاحية
  keywords: [{
    type: String,
    trim: true
  }],
  
  // الرابط المخصص (slug)
  slug: {
    type: String,
    unique: true,
    sparse: true, // يسمح بقيم فارغة متعددة
    lowercase: true,
    trim: true,
    validate: {
      validator: function(v) {
        // إذا كان فارغ، فهو صالح
        if (!v || v.trim() === '') return true;
        // إذا كان موجود، يجب أن يكون صالح
        return /^[a-z0-9-\/]+$/.test(v);
      },
      message: 'الرابط المخصص يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام وشرطات فقط'
    }
  },
  
  // العنوان الكامل للصفحة
  h1: {
    type: String,
    maxlength: 70
  },
  
  // الصورة المميزة
  featuredImage: {
    url: String,
    alt: String,
    width: Number,
    height: Number
  },
  
  // Open Graph
  openGraph: {
    title: String,
    description: String,
    image: {
      url: String,
      alt: String,
      width: Number,
      height: Number
    },
    type: {
      type: String,
      default: 'website'
    }
  },
  
  // Twitter Cards
  twitter: {
    card: {
      type: String,
      default: 'summary_large_image'
    },
    title: String,
    description: String,
    image: String
  },
  
  // Schema.org markup
  schemaMarkup: {
    type: {
      type: String,
      enum: ['Product', 'Organization', 'WebSite', 'BreadcrumbList', 'Article', 'LocalBusiness']
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  
  // إعدادات الفهرسة
  indexing: {
    index: {
      type: Boolean,
      default: true
    },
    follow: {
      type: Boolean,
      default: true
    },
    sitemap: {
      type: Boolean,
      default: true
    },
    priority: {
      type: Number,
      min: 0,
      max: 1,
      default: 0.5
    },
    changeFreq: {
      type: String,
      enum: ['always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'],
      default: 'weekly'
    }
  },
  
  // إحصائيات
  analytics: {
    clicks: {
      type: Number,
      default: 0
    },
    impressions: {
      type: Number,
      default: 0
    },
    ctr: {
      type: Number,
      default: 0
    },
    position: {
      type: Number,
      default: 0
    },
    lastUpdated: Date
  },
  
  // حالة النشر
  status: {
    type: String,
    enum: ['active', 'inactive', 'draft'],
    default: 'active'
  },
  
  // اللغة
  language: {
    type: String,
    default: 'ar'
  },
  
  // تاريخ آخر تحديث للمحتوى
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// فهارس للبحث السريع
seoSchema.index({ pageType: 1, status: 1 });
seoSchema.index({ 'indexing.sitemap': 1, status: 1 });
seoSchema.index({ keywords: 1 });

// Middleware لتحديث lastModified
seoSchema.pre('save', function(next) {
  if (this.isModified()) {
    this.lastModified = new Date();
  }
  next();
});

export default mongoose.model('SEO', seoSchema);