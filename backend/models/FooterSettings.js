import mongoose from 'mongoose';

const footerSettingsSchema = new mongoose.Schema({
  // Newsletter Section
  newsletter: {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: 'اشترك في النشرة الإخبارية' },
    subtitle: { type: String, default: 'احصل على آخر العروض والمنتجات الجديدة' },
    placeholder: { type: String, default: 'أدخل بريدك الإلكتروني' },
    buttonText: { type: String, default: 'اشتراك' }
  },

  // Company Info
  company: {
    name: { type: String, default: 'جيم روم' },
    description: { type: String, default: 'متجرك الموثوق للألعاب والتقنية' },
    logo: { type: String, default: '/logo.png' }
  },

  // Contact Info
  contact: {
    phone: { type: String, default: '+966 50 123 4567' },
    email: { type: String, default: 'info@store.com' },
    address: { type: String, default: 'الرياض، المملكة العربية السعودية' },
    workingHours: { type: String, default: 'الأحد - الخميس: 9:00 ص - 10:00 م' }
  },

  // Social Media
  social: {
    facebook: { type: String, default: '' },
    twitter: { type: String, default: '' },
    instagram: { type: String, default: '' },
    youtube: { type: String, default: '' },
    tiktok: { type: String, default: '' },
    snapchat: { type: String, default: '' }
  },

  // Features Section
  features: [{
    icon: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true }
  }],

  // Quick Links
  quickLinks: {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: 'روابط سريعة' },
    links: [{
      title: { type: String, required: true },
      url: { type: String, required: true },
      external: { type: Boolean, default: false }
    }]
  },

  // Support Links
  supportLinks: {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: 'خدمة العملاء' },
    links: [{
      title: { type: String, required: true },
      url: { type: String, required: true },
      external: { type: Boolean, default: false }
    }]
  },

  // Copyright
  copyright: {
    text: { type: String, default: '© 2024 جيم روم. جميع الحقوق محفوظة.' },
    showYear: { type: Boolean, default: true }
  },

  // Payment Methods
  paymentMethods: {
    enabled: { type: Boolean, default: true },
    title: { type: String, default: 'طرق الدفع المقبولة' },
    methods: [{
      name: { type: String, default: '' }, // mada, visa, mastercard, etc.
      image: { type: String, default: '' }, // URL للصورة
      alt: { type: String, default: '' }, // النص البديل
      link: { type: String, default: '' }, // رابط اختياري (للسجل التجاري مثلاً)
      enabled: { type: Boolean, default: true }
    }]
  },

  // Display Settings
  display: {
    showNewsletter: { type: Boolean, default: true },
    showFeatures: { type: Boolean, default: true },
    showSocial: { type: Boolean, default: true },
    showQuickLinks: { type: Boolean, default: true },
    showSupportLinks: { type: Boolean, default: true },
    showPaymentMethods: { type: Boolean, default: true },
    backgroundColor: { type: String, default: '#1f2937' },
    textColor: { type: String, default: '#ffffff' }
  }
}, {
  timestamps: true,
  strict: false // Allow additional fields for backward compatibility
});

export default mongoose.model('FooterSettings', footerSettingsSchema);