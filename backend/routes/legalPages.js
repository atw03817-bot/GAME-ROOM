import express from 'express';
import LegalPages from '../models/LegalPages.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all legal pages (public)
router.get('/', async (req, res) => {
  try {
    let legalPages = await LegalPages.findOne();
    
    // If no legal pages exist, create default ones
    if (!legalPages) {
      legalPages = new LegalPages();
      await legalPages.save();
    }
    
    // Initialize FAQ if it doesn't exist
    if (!legalPages.faq || !legalPages.faq.questions || legalPages.faq.questions.length === 0) {
      if (!legalPages.faq) {
        legalPages.faq = {
          enabled: true,
          title: 'الأسئلة الشائعة',
          questions: []
        };
      }
      
      if (!legalPages.faq.questions || legalPages.faq.questions.length === 0) {
        legalPages.faq.questions = [
          {
            question: 'كم تستغرق مدة التوصيل؟',
            answer: 'عادة من 2-5 أيام عمل حسب موقعك',
            order: 1
          },
          {
            question: 'هل يمكنني إرجاع المنتج؟',
            answer: 'نعم، خلال 14 يوم من تاريخ الاستلام',
            order: 2
          },
          {
            question: 'هل المنتجات أصلية؟',
            answer: 'نعم، جميع منتجاتنا أصلية 100% مع ضمان الوكيل',
            order: 3
          },
          {
            question: 'ما هي طرق الدفع المتاحة؟',
            answer: 'الدفع عند الاستلام، البطاقات الائتمانية، Tabby',
            order: 4
          }
        ];
        await legalPages.save();
      }
    }
    
    console.log('Retrieved legal pages from DB:', JSON.stringify(legalPages.faq, null, 2));
    
    // Replace template variables with actual contact info
    const processContent = (content, contactInfo) => {
      return content
        .replace(/\{\{email\}\}/g, contactInfo.email)
        .replace(/\{\{phone\}\}/g, contactInfo.phone)
        .replace(/\{\{address\}\}/g, contactInfo.address)
        .replace(/\{\{companyName\}\}/g, contactInfo.companyName);
    };

    const processedPages = {
      privacyPolicy: {
        ...legalPages.privacyPolicy,
        content: processContent(legalPages.privacyPolicy.content, legalPages.contactInfo)
      },
      termsAndConditions: {
        ...legalPages.termsAndConditions,
        content: processContent(legalPages.termsAndConditions.content, legalPages.contactInfo)
      },
      returnPolicy: {
        ...legalPages.returnPolicy,
        content: processContent(legalPages.returnPolicy.content, legalPages.contactInfo)
      },
      contactInfo: legalPages.contactInfo,
      faq: legalPages.faq || {
        enabled: true,
        title: 'الأسئلة الشائعة',
        questions: []
      }
    };
    
    res.json({
      success: true,
      data: processedPages
    });
  } catch (error) {
    console.error('Error fetching legal pages:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الصفحات القانونية'
    });
  }
});

// Get specific legal page (public)
router.get('/:pageType', async (req, res) => {
  try {
    const { pageType } = req.params;
    const allowedPages = ['privacy-policy', 'terms-conditions', 'return-policy'];
    
    if (!allowedPages.includes(pageType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع صفحة غير صحيح'
      });
    }
    
    let legalPages = await LegalPages.findOne();
    
    if (!legalPages) {
      legalPages = new LegalPages();
      await legalPages.save();
    }
    
    // Map URL params to database fields
    const fieldMap = {
      'privacy-policy': 'privacyPolicy',
      'terms-conditions': 'termsAndConditions',
      'return-policy': 'returnPolicy'
    };
    
    const field = fieldMap[pageType];
    const pageData = legalPages[field];
    
    // Process template variables
    const processedContent = pageData.content
      .replace(/\{\{email\}\}/g, legalPages.contactInfo.email)
      .replace(/\{\{phone\}\}/g, legalPages.contactInfo.phone)
      .replace(/\{\{address\}\}/g, legalPages.contactInfo.address)
      .replace(/\{\{companyName\}\}/g, legalPages.contactInfo.companyName);
    
    res.json({
      success: true,
      data: {
        ...pageData,
        content: processedContent
      }
    });
  } catch (error) {
    console.error('Error fetching legal page:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الصفحة القانونية'
    });
  }
});

// Update legal pages (admin only)
router.put('/', auth, adminAuth, async (req, res) => {
  try {
    console.log('Received update request:', JSON.stringify(req.body, null, 2));
    
    let legalPages = await LegalPages.findOne();
    
    if (!legalPages) {
      legalPages = new LegalPages();
    }
    
    // Update provided fields
    Object.keys(req.body).forEach(key => {
      if (key !== '_id' && key !== '__v' && key !== 'createdAt' && key !== 'updatedAt') {
        console.log(`Updating ${key}:`, req.body[key]);
        
        // Direct assignment for all fields to ensure proper update
        legalPages[key] = req.body[key];
        
        // Update lastUpdated for page sections
        if (['privacyPolicy', 'termsAndConditions', 'returnPolicy'].includes(key)) {
          legalPages[key].lastUpdated = new Date();
        }
      }
    });
    
    console.log('Before save - FAQ:', JSON.stringify(legalPages.faq, null, 2));
    await legalPages.save();
    console.log('After save - FAQ:', JSON.stringify(legalPages.faq, null, 2));
    
    res.json({
      success: true,
      message: 'تم تحديث الصفحات القانونية بنجاح',
      data: legalPages
    });
  } catch (error) {
    console.error('Error updating legal pages:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الصفحات القانونية'
    });
  }
});

// Update specific legal page (admin only)
router.put('/:pageType', auth, adminAuth, async (req, res) => {
  try {
    const { pageType } = req.params;
    const allowedPages = ['privacy-policy', 'terms-conditions', 'return-policy', 'contact-info'];
    
    if (!allowedPages.includes(pageType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع صفحة غير صحيح'
      });
    }
    
    let legalPages = await LegalPages.findOne();
    
    if (!legalPages) {
      legalPages = new LegalPages();
    }
    
    // Map URL params to database fields
    const fieldMap = {
      'privacy-policy': 'privacyPolicy',
      'terms-conditions': 'termsAndConditions',
      'return-policy': 'returnPolicy',
      'contact-info': 'contactInfo'
    };
    
    const field = fieldMap[pageType];
    legalPages[field] = { ...legalPages[field], ...req.body };
    
    // Update lastUpdated for page sections
    if (['privacyPolicy', 'termsAndConditions', 'returnPolicy'].includes(field)) {
      legalPages[field].lastUpdated = new Date();
    }
    
    await legalPages.save();
    
    res.json({
      success: true,
      message: `تم تحديث ${pageType} بنجاح`,
      data: legalPages[field]
    });
  } catch (error) {
    console.error('Error updating legal page:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الصفحة القانونية'
    });
  }
});

export default router;