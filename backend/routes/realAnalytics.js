import express from 'express';
import {
  getRealSalesStats,
  getRealCustomerStats,
  getRealProductStats,
  getRealDashboardStats
} from '../controllers/realAnalyticsController.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// مسارات الإحصائيات الحقيقية (للإدارة فقط)
router.get('/sales', adminAuth, getRealSalesStats);
router.get('/customers', adminAuth, getRealCustomerStats);
router.get('/products', adminAuth, getRealProductStats);
router.get('/dashboard', adminAuth, getRealDashboardStats);

export default router;