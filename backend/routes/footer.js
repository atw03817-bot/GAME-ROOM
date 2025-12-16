import express from 'express';
import FooterSettings from '../models/FooterSettings.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get footer settings (public)
router.get('/', async (req, res) => {
  try {
    let footerSettings = await FooterSettings.findOne();
    
    // If no settings exist, create default ones
    if (!footerSettings) {
      footerSettings = new FooterSettings({
        features: [
          {
            icon: '🚚',
            title: 'شحن مجاني',
            subtitle: 'للطلبات فوق 200 ر.س'
          },
          {
            icon: '✅',
            title: 'ضمان الجودة',
            subtitle: 'منتجات أصلية 100%'
          },
          {
            icon: '🔄',
            title: 'إرجاع مجاني',
            subtitle: 'خلال 14 يوم'
          },
          {
            icon: '💳',
            title: 'دفع آمن',
            subtitle: 'حماية كاملة'
          }
        ],
        paymentMethods: {
          enabled: true,
          title: 'طرق الدفع المقبولة',
          methods: [
            {
              name: 'mada',
              image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/mada_mini.png',
              alt: 'مدى',
              enabled: true
            },
            {
              name: 'visa',
              image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/credit_card_mini.png',
              alt: 'فيزا وماستركارد',
              enabled: true
            },
            {
              name: 'bank_transfer',
              image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/bank_mini.png',
              alt: 'تحويل بنكي',
              enabled: true
            },
            {
              name: 'stc_pay',
              image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/stc_pay_mini.png',
              alt: 'STC Pay',
              enabled: true
            },
            {
              name: 'apple_pay',
              image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/apple_pay_mini.png',
              alt: 'Apple Pay',
              enabled: true
            },

            {
              name: 'cod',
              image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/cod_mini.png',
              alt: 'الدفع عند الاستلام',
              enabled: true
            },
            {
              name: 'sbc',
              image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/sbc.png',
              alt: 'السجل التجاري السعودي',
              link: 'https://eauthenticate.saudibusiness.gov.sa/certificate-details/0000193908',
              enabled: true
            }
          ]
        }
      });
      await footerSettings.save();
    }
    
    // Add default payment methods if missing
    if (!footerSettings.paymentMethods) {
      footerSettings.paymentMethods = {
        enabled: true,
        title: 'طرق الدفع المقبولة',
        methods: [
          {
            name: 'mada',
            image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/mada_mini.png',
            alt: 'مدى',
            enabled: true
          },
          {
            name: 'visa',
            image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/credit_card_mini.png',
            alt: 'فيزا وماستركارد',
            enabled: true
          },
          {
            name: 'stc_pay',
            image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/stc_pay_mini.png',
            alt: 'STC Pay',
            enabled: true
          },
          {
            name: 'apple_pay',
            image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/apple_pay_mini.png',
            alt: 'Apple Pay',
            enabled: true
          },
          {
            name: 'cod',
            image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/cod_mini.png',
            alt: 'الدفع عند الاستلام',
            enabled: true
          },
          {
            name: 'sbc',
            image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/sbc.png',
            alt: 'السجل التجاري السعودي',
            link: 'https://eauthenticate.saudibusiness.gov.sa/certificate-details/0000193908',
            enabled: true
          }
        ]
      };
      await footerSettings.save();
    }
    
    res.json({
      success: true,
      data: footerSettings
    });
  } catch (error) {
    console.error('Error fetching footer settings:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إعدادات Footer'
    });
  }
});

// Update footer settings (admin only)
router.put('/', auth, adminAuth, async (req, res) => {
  try {
    let footerSettings = await FooterSettings.findOne();
    
    if (!footerSettings) {
      footerSettings = new FooterSettings();
    }
    
    // Safe update - only update fields that exist in the schema
    const allowedFields = [
      'newsletter', 'company', 'contact', 'social', 'features', 
      'quickLinks', 'supportLinks', 'copyright', 'display', 'paymentMethods'
    ];
    
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        try {
          let value = req.body[key];
          
          // Special handling for paymentMethods - don't filter, just clean
          if (key === 'paymentMethods' && value && value.methods) {
            value = {
              ...value,
              methods: value.methods.map(method => ({
                name: method.name || '',
                image: method.image || '',
                alt: method.alt || '',
                link: method.link || '',
                enabled: method.enabled !== false
              }))
            };
          }
          
          footerSettings[key] = value;
        } catch (fieldError) {
          console.warn(`Warning: Could not update field ${key}:`, fieldError.message);
        }
      }
    });
    
    await footerSettings.save();
    
    res.json({
      success: true,
      message: 'تم تحديث إعدادات Footer بنجاح',
      data: footerSettings
    });
  } catch (error) {
    console.error('Error updating footer settings:', error);
    
    // More detailed error handling
    let errorMessage = 'خطأ في تحديث إعدادات Footer';
    
    if (error.name === 'ValidationError') {
      errorMessage = 'بيانات غير صحيحة في إعدادات Footer';
    } else if (error.name === 'CastError') {
      errorMessage = 'نوع البيانات غير صحيح';
    } else if (error.code === 11000) {
      errorMessage = 'بيانات مكررة';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Update specific section
router.put('/section/:section', auth, adminAuth, async (req, res) => {
  try {
    const { section } = req.params;
    const allowedSections = ['newsletter', 'company', 'contact', 'social', 'features', 'copyright', 'quickLinks', 'supportLinks'];
    
    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'قسم غير صحيح'
      });
    }
    
    let footerSettings = await FooterSettings.findOne();
    
    if (!footerSettings) {
      footerSettings = new FooterSettings();
    }
    
    footerSettings[section] = req.body;
    await footerSettings.save();
    
    res.json({
      success: true,
      message: `تم تحديث قسم ${section} بنجاح`,
      data: footerSettings
    });
  } catch (error) {
    console.error('Error updating footer section:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث قسم Footer'
    });
  }
});

export default router;