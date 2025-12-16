import express from 'express';
import {
  getPaymentSettings,
  getPaymentSetting,
  updatePaymentSettings,
  getPaymentMethods,
  createPaymentIntent,
  verifyPayment,
  handleTapCallback,
  handleMyFatoorahCallback,
  refundPayment,
  createTapCharge,
  handleTapWebhook,
  verifyTapPayment,
  refundTapPayment,
  testTapConnection,
  // Tamara functions
  createTamaraCheckout,
  handleTamaraWebhook,
  getTamaraInstallments,
  captureTamaraPayment,
  cancelTamaraOrder,
  refundTamaraPayment,
  testTamaraConnection
} from '../controllers/paymentController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods);
router.post('/tap/callback', handleTapCallback);
router.post('/tap/webhook', handleTapWebhook);
router.post('/myfatoorah/callback', handleMyFatoorahCallback);
router.post('/tamara/webhook', handleTamaraWebhook);
router.get('/tamara/installments/:amount', getTamaraInstallments);

// Protected routes
router.post('/intent', auth, createPaymentIntent);
router.post('/verify', auth, verifyPayment);
router.post('/tap/charge', auth, createTapCharge); // يعمل مع auth و adminAuth
router.get('/tap/verify/:chargeId', auth, verifyTapPayment);
router.post('/tamara/checkout', auth, createTamaraCheckout);

// Admin routes
router.get('/settings', adminAuth, getPaymentSettings);
router.get('/settings/:provider', adminAuth, getPaymentSetting);
router.put('/settings/:provider', adminAuth, updatePaymentSettings);
router.post('/refund', adminAuth, refundPayment);
router.post('/tap/refund', adminAuth, refundTapPayment);
router.post('/tap/test', adminAuth, testTapConnection);
router.post('/tamara/capture', adminAuth, captureTamaraPayment);
router.post('/tamara/cancel', adminAuth, cancelTamaraOrder);
router.post('/tamara/refund', adminAuth, refundTamaraPayment);
router.post('/tamara/test', adminAuth, testTamaraConnection);

export default router;
