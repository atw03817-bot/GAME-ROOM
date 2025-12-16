import express from 'express';
import { getDeals, addDealToProduct, updateDeal, removeDealFromProduct } from '../controllers/dealsController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getDeals);

// Admin routes
router.post('/:productId', auth, adminAuth, addDealToProduct);
router.put('/:productId', auth, adminAuth, updateDeal);
router.delete('/:productId', auth, adminAuth, removeDealFromProduct);

export default router;
