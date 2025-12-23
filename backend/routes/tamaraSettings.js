import express from 'express';
import {
  getTamaraSettings,
  updateTamaraSettings,
  calculateTamaraCommission,
  checkTamaraEligibility
} from '../controllers/tamaraSettingsController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// الحصول على إعدادات تمارا (عام - للعملاء)
router.get('/', getTamaraSettings);

// حساب عمولة تمارا (عام - للعملاء)
router.post('/calculate-commission', calculateTamaraCommission);

// التحقق من أهلية تمارا (عام - للعملاء)
router.post('/check-eligibility', checkTamaraEligibility);

// تحديث إعدادات تمارا (مدير فقط)
router.put('/', adminAuth, updateTamaraSettings);

export default router;