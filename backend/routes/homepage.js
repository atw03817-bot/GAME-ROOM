import express from 'express';
import {
  getHomepageConfig,
  updateHomepageConfig,
  addSection,
  updateSection,
  deleteSection,
  reorderSections,
  duplicateSection,
  toggleSection,
  getFeaturedDealsSettings,
  updateFeaturedDealsSettings,
  getExclusiveOffersSettings,
  updateExclusiveOffersSettings
} from '../controllers/homepageController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public route - get homepage config
router.get('/', getHomepageConfig);

// Featured Deals Settings
router.get('/featured-deals', getFeaturedDealsSettings);
router.put('/featured-deals', auth, adminAuth, updateFeaturedDealsSettings);

// Exclusive Offers Settings
router.get('/exclusive-offers', getExclusiveOffersSettings);
router.put('/exclusive-offers', auth, adminAuth, updateExclusiveOffersSettings);

// Admin routes - manage homepage
router.put('/', auth, adminAuth, updateHomepageConfig);

// Sections Management
router.post('/sections', auth, adminAuth, addSection);
router.put('/sections/:sectionId', auth, adminAuth, updateSection);
router.delete('/sections/:sectionId', auth, adminAuth, deleteSection);
router.post('/sections/reorder', auth, adminAuth, reorderSections);
router.post('/sections/:sectionId/duplicate', auth, adminAuth, duplicateSection);
router.post('/sections/:sectionId/toggle', auth, adminAuth, toggleSection);

export default router;
