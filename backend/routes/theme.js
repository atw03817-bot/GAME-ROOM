import express from 'express';
import StoreSettings from '../models/StoreSettings.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get theme and header settings (public)
router.get('/', async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    // If no settings exist, create default ones
    if (!settings) {
      settings = new StoreSettings();
      await settings.save();
    }
    
    // Return banner, header and theme data
    const themeData = {
      banner: settings.banner || {
        enabled: false,
        text: '',
        backgroundColor: '#7c3aed',
        textColor: '#ffffff',
        link: '',
        showCloseButton: false
      },
      header: settings.header || {
        logo: '/logo.png',
        storeName: 'أبعاد التواصل',
        tagline: 'أبعاد جديدة للتواصل التقني',
        showTagline: true,
        showStoreNameMobile: false,
        showTaglineMobile: false,
        showSearch: true,
        showCart: true,
        showUserMenu: true,
        sticky: true,
        transparent: false,
        shadow: true
      },
      theme: settings.theme || {
        colors: {
          primary: '#a855f7',
          primaryHover: '#9333ea',
          secondary: '#6b7280',
          accent: '#c084fc',
          success: '#10b981',
          warning: '#f59e0b',
          error: '#ef4444',
          background: '#ffffff',
          surface: '#f8fafc',
          textPrimary: '#1f2937',
          textSecondary: '#6b7280'
        },
        fonts: {
          primary: 'Cairo',
          secondary: 'Inter',
          size: {
            base: '16px',
            small: '14px',
            large: '18px',
            heading: '24px'
          }
        },
        layout: {
          borderRadius: '12px',
          spacing: '16px',
          containerWidth: '1200px'
        },
        effects: {
          animations: true,
          shadows: true,
          gradients: true
        }
      },
      siteMetadata: settings.siteMetadata || {
        title: 'أبعاد التواصل',
        titleEn: 'Mobile Store',
        description: 'متجرك الموثوق للجوالات والإكسسوارات',
        descriptionEn: 'Your trusted mobile store',
        keywords: 'جوالات, هواتف ذكية, إكسسوارات, أبعاد التواصل',
        keywordsEn: 'mobile, smartphones, accessories, electronics',
        favicon: '/favicon.ico',
        appleTouchIcon: '/apple-touch-icon.png',
        ogImage: '/og-image.jpg'
      }
    };
    
    res.json({
      success: true,
      data: themeData
    });
  } catch (error) {
    console.error('Error fetching theme settings:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إعدادات الثيم'
    });
  }
});

// Update theme settings (admin only)
router.put('/', auth, adminAuth, async (req, res) => {
  try {
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = new StoreSettings();
    }
    
    // Update banner, header and theme settings
    if (req.body.banner) {
      settings.banner = { ...settings.banner, ...req.body.banner };
    }

    if (req.body.header) {
      settings.header = { ...settings.header, ...req.body.header };
    }
    
    if (req.body.theme) {
      // تأكد من وجود effects مع قيم افتراضية
      const themeUpdate = {
        ...req.body.theme,
        effects: {
          animations: req.body.theme.effects?.animations ?? true,
          shadows: req.body.theme.effects?.shadows ?? true,
          gradients: req.body.theme.effects?.gradients ?? true
        }
      };
      settings.theme = { ...settings.theme, ...themeUpdate };
    }
    
    if (req.body.siteMetadata) {
      settings.siteMetadata = { ...settings.siteMetadata, ...req.body.siteMetadata };
    }
    
    await settings.save();
    
    res.json({
      success: true,
      message: 'تم تحديث إعدادات الثيم بنجاح',
      data: {
        banner: settings.banner,
        header: settings.header,
        theme: settings.theme,
        siteMetadata: settings.siteMetadata
      }
    });
  } catch (error) {
    console.error('Error updating theme settings:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث إعدادات الثيم'
    });
  }
});

// Update specific section (header or theme)
router.put('/:section', auth, adminAuth, async (req, res) => {
  try {
    const { section } = req.params;
    const allowedSections = ['banner', 'header', 'theme'];
    
    if (!allowedSections.includes(section)) {
      return res.status(400).json({
        success: false,
        message: 'قسم غير صحيح'
      });
    }
    
    let settings = await StoreSettings.findOne();
    
    if (!settings) {
      settings = new StoreSettings();
    }
    
    settings[section] = { ...settings[section], ...req.body };
    await settings.save();
    
    res.json({
      success: true,
      message: `تم تحديث إعدادات ${section} بنجاح`,
      data: settings[section]
    });
  } catch (error) {
    console.error('Error updating theme section:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث إعدادات الثيم'
    });
  }
});

export default router;