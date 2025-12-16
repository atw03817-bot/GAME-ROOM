import express from 'express';
import * as seoController from '../controllers/seoController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Routes عامة (بدون مصادقة)
router.get('/sitemap.xml', seoController.generateSitemap);
router.get('/robots.txt', seoController.generateRobots);
router.get('/page/:slug', seoController.getSEOBySlug);

// Routes للاختبار (بدون مصادقة مؤقتاً)
router.get('/test', seoController.getAllSEO);
router.post('/test', seoController.createSEO);
router.post('/test-auto-generate', seoController.autoGenerateProductSEO);

// Routes الإدارة (تحتاج مصادقة) - تطبق فقط على routes الإدارة
// router.use(auth);
// router.use(adminAuth);

// CRUD operations (تحتاج مصادقة)
router.get('/', auth, adminAuth, seoController.getAllSEO);
router.post('/', auth, adminAuth, seoController.createSEO);
router.put('/:id', auth, adminAuth, seoController.updateSEO);
router.delete('/:id', auth, adminAuth, seoController.deleteSEO);

// تحليل وأدوات SEO (تحتاج مصادقة)
router.get('/:id/analyze', auth, adminAuth, seoController.analyzeSEO);
router.post('/auto-generate-products', auth, adminAuth, seoController.autoGenerateProductSEO);
router.get('/keywords/suggestions', auth, adminAuth, seoController.keywordSuggestions);

export default router;