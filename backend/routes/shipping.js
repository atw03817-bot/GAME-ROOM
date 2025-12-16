import express from 'express';
import {
  getShippingProviders,
  getAllShippingProviders,
  updateShippingProvider,
  getShippingRates,
  calculateShipping,
  createShipment,
  getShipmentByOrder,
  trackShipment,
  updateShipmentStatus,
  getShippingCities,
  cancelShipment,
  updateShipmentAddress,
  getShippingReports
} from '../controllers/shippingController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/providers', getShippingProviders);
router.get('/rates/:city', getShippingRates);
router.post('/calculate', calculateShipping);
router.get('/track/:trackingNumber', trackShipment);
router.get('/cities', getShippingCities);

// Protected routes
router.get('/shipments/order/:orderId', auth, getShipmentByOrder);

// Admin routes
router.get('/providers/all', adminAuth, getAllShippingProviders);
router.put('/providers/:id', adminAuth, updateShippingProvider);
router.put('/providers/:id/api', adminAuth, updateShippingProvider);
router.post('/shipments', adminAuth, createShipment);
router.put('/shipments/:id/status', adminAuth, updateShipmentStatus);
router.post('/shipments/:id/cancel', adminAuth, cancelShipment);
router.put('/shipments/:id/address', adminAuth, updateShipmentAddress);
router.get('/reports', adminAuth, getShippingReports);

export default router;
