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
  // Tamara routes
  getTamaraPaymentTypes,
  createTamaraCheckout,
  handleTamaraWebhook,
  authorizeTamaraOrder,
  captureTamaraOrder,
  cancelTamaraOrder,
  refundTamaraOrder,
  getTamaraOrder,
  testTamaraConnection,
  initTamaraSettings,
  // Tabby routes
  createTabbyCheckout,
  handleTabbyWebhook,
  captureTabbyPayment,
  refundTabbyPayment,
  getTabbyPayment,
  testTabbyConnection
} from '../controllers/paymentController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods);
router.post('/tap/callback', handleTapCallback);
router.post('/tap/webhook', handleTapWebhook);
router.post('/myfatoorah/callback', handleMyFatoorahCallback);

// Tamara public routes
router.get('/tamara/payment-types', getTamaraPaymentTypes);
router.post('/tamara/webhook', handleTamaraWebhook);
router.post('/tamara/payment-types', testTamaraConnection); // Test endpoint using existing route

// Tabby public routes
router.post('/tabby/webhook', handleTabbyWebhook);

// Protected routes
router.post('/intent', auth, createPaymentIntent);
router.post('/verify', auth, verifyPayment);
router.post('/tap/charge', auth, createTapCharge); // يعمل مع auth و adminAuth
router.get('/tap/verify/:chargeId', auth, verifyTapPayment);

// Tamara protected routes
router.post('/tamara/checkout', auth, createTamaraCheckout);

// Tabby protected routes
router.post('/tabby/checkout', auth, createTabbyCheckout);

// Admin routes
router.get('/settings', adminAuth, getPaymentSettings);
router.get('/settings/:provider', adminAuth, getPaymentSetting);
router.put('/settings/:provider', adminAuth, updatePaymentSettings);
router.post('/refund', adminAuth, refundPayment);
router.post('/tap/refund', adminAuth, refundTapPayment);
router.post('/tap/test', adminAuth, testTapConnection);

// Tamara admin routes
router.post('/tamara/authorize/:orderId', adminAuth, authorizeTamaraOrder);
router.post('/tamara/capture/:orderId', adminAuth, captureTamaraOrder);
router.post('/tamara/cancel/:orderId', adminAuth, cancelTamaraOrder);
router.post('/tamara/refund/:orderId', adminAuth, refundTamaraOrder);
router.get('/tamara/order/:tamaraOrderId', adminAuth, getTamaraOrder);
router.post('/tamara/test', adminAuth, testTamaraConnection);
router.post('/tamara/test-public', testTamaraConnection); // Public test endpoint
router.post('/tamara/init', adminAuth, initTamaraSettings);

// Tabby admin routes
router.post('/tabby/capture/:paymentId', adminAuth, captureTabbyPayment);
router.post('/tabby/refund/:paymentId', adminAuth, refundTabbyPayment);
router.get('/tabby/payment/:paymentId', adminAuth, getTabbyPayment);
router.post('/tabby/test', adminAuth, testTabbyConnection);

export default router;
