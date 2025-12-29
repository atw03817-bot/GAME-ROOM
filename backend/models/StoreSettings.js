import mongoose from 'mongoose';

const storeSettingsSchema = new mongoose.Schema({
  // General Settings
  storeName: { type: String, default: '' },
  storeNameAr: { type: String, default: '' },
  storeDescription: { type: String, default: '' },
  storeDescriptionAr: { type: String, default: '' },
  contactEmail: { type: String, default: '' },
  contactPhone: { type: String, default: '' },
  currency: { type: String, default: 'SAR' },
  taxRate: { type: Number, default: 15 },

  // Site Metadata
  siteMetadata: {
    title: { type: String, default: 'جيم روم' },
    titleEn: { type: String, default: 'Game Room Store' },
    description: { type: String, default: 'متجرك الموثوق للألعاب والتقنية' },
    descriptionEn: { type: String, default: 'Your trusted mobile store' },
    keywords: { type: String, default: 'جوالات, هواتف ذكية, إكسسوارات, جيم روم' },
    keywordsEn: { type: String, default: 'games, gaming, technology, accessories' },
    favicon: { type: String, default: '/favicon.ico' },
    appleTouchIcon: { type: String, default: '/apple-touch-icon.png' },
    ogImage: { type: String, default: '/og-image.jpg' }
  },
  
  // Shipping Settings
  shippingEnabled: { type: Boolean, default: true },
  freeShippingEnabled: { type: Boolean, default: false },
  freeShippingThreshold: { type: Number, default: 200 },
  
  // Payment Settings - COD only (other payment methods in PaymentSettings model)
  codEnabled: { type: Boolean, default: true },
  
  // Banner Settings
  banner: {
    enabled: { type: Boolean, default: false },
    text: { type: String, default: '' },
    backgroundColor: { type: String, default: '#7c3aed' },
    textColor: { type: String, default: '#ffffff' },
    link: { type: String, default: '' },
    showCloseButton: { type: Boolean, default: false }
  },

  // Header Settings
  header: {
    // Logo and Brand
    logo: { type: String, default: '/logo.png' },
    storeName: { type: String, default: 'جيم روم' },
    tagline: { type: String, default: 'عالم الألعاب والتقنية' },
    showTagline: { type: Boolean, default: true },
    showStoreNameMobile: { type: Boolean, default: false },
    showTaglineMobile: { type: Boolean, default: false },
    
    // Navigation
    showSearch: { type: Boolean, default: true },
    showCart: { type: Boolean, default: true },
    showUserMenu: { type: Boolean, default: true },
    
    // Layout
    sticky: { type: Boolean, default: true },
    transparent: { type: Boolean, default: false },
    shadow: { type: Boolean, default: true }
  },
  
  // Theme Settings
  theme: {
    // Colors - مستوحاة من شعار جيم روم البنفسجي
    colors: {
      primary: { type: String, default: '#a855f7' },
      primaryHover: { type: String, default: '#9333ea' },
      secondary: { type: String, default: '#6b7280' },
      accent: { type: String, default: '#c084fc' },
      success: { type: String, default: '#10b981' },
      warning: { type: String, default: '#f59e0b' },
      error: { type: String, default: '#ef4444' },
      background: { type: String, default: '#ffffff' },
      surface: { type: String, default: '#f8fafc' },
      textPrimary: { type: String, default: '#1f2937' },
      textSecondary: { type: String, default: '#6b7280' }
    },
    
    // Typography
    fonts: {
      primary: { type: String, default: 'Cairo' },
      secondary: { type: String, default: 'Inter' },
      size: {
        base: { type: String, default: '16px' },
        small: { type: String, default: '14px' },
        large: { type: String, default: '18px' },
        heading: { type: String, default: '24px' }
      }
    },
    
    // Layout
    layout: {
      borderRadius: { type: String, default: '12px' },
      spacing: { type: String, default: '16px' },
      containerWidth: { type: String, default: '1200px' }
    },
    
    // Effects
    effects: {
      animations: { type: Boolean, default: true },
      shadows: { type: Boolean, default: true },
      gradients: { type: Boolean, default: true }
    }
  },
  
  // Footer Settings
  footer: {
    // Newsletter Section
    newsletter: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'اشترك معنا' },
      subtitle: { type: String, default: 'احصل على أحدث العروض والمنتجات' },
      buttonText: { type: String, default: 'اشترك' }
    },
    
    // Company Info
    company: {
      name: { type: String, default: 'جيم روم' },
      tagline: { type: String, default: 'عالم الألعاب والتقنية' },
      description: { type: String, default: 'متجرك الموثوق للألعاب والتقنية. نوفر أحدث الأجهزة بأفضل الأسعار مع ضمان الجودة والتوصيل السريع.' },
      logo: { type: String, default: '/logo.png' }
    },
    
    // Contact Info
    contact: {
      phone: { type: String, default: '+966 50 000 0000' },
      email: { type: String, default: 'info@store.com' },
      address: { type: String, default: 'الرياض، المملكة العربية السعودية' }
    },
    
    // Social Media Links
    social: {
      instagram: { type: String, default: 'https://instagram.com' },
      twitter: { type: String, default: 'https://twitter.com' },
      facebook: { type: String, default: 'https://facebook.com' },
      youtube: { type: String, default: '' },
      tiktok: { type: String, default: '' },
      snapchat: { type: String, default: '' }
    },
    
    // Features Section
    features: [{
      icon: { type: String, default: '🚚' },
      title: { type: String, default: 'شحن مجاني' },
      subtitle: { type: String, default: 'للطلبات فوق 200 ر.س' }
    }],
    
    // Copyright
    copyright: {
      text: { type: String, default: 'جيم روم. جميع الحقوق محفوظة.' },
      showYear: { type: Boolean, default: true }
    },
    
    // Quick Links (will be managed separately but can be customized)
    quickLinks: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'روابط سريعة' }
    },
    
    // Support Links
    supportLinks: {
      enabled: { type: Boolean, default: true },
      title: { type: String, default: 'خدمة العملاء' }
    }
  },
  
  // Singleton pattern - only one settings document
  singleton: { type: Boolean, default: true, unique: true }
}, {
  timestamps: true
});

export default mongoose.model('StoreSettings', storeSettingsSchema);
