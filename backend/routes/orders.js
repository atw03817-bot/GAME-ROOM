import express from 'express';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { auth, adminAuth } from '../middleware/auth.js';
import { 
  createOrder, 
  getOrderById, 
  getAllOrders, 
  updateOrderStatus,
  updatePaymentStatus,
  trackOrder,
  getMyOrders 
} from '../controllers/orderController.js';

const router = express.Router();

// Create order
router.post('/', auth, createOrder);

// Get my orders (العميل الحالي)
router.get('/my-orders', auth, getMyOrders);

// Get user orders (للتوافق مع الكود القديم)
router.get('/user/me', auth, async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const orders = await Order.find({ user: userId })
      .populate('items.product')
      .sort('-createdAt');
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (Admin)
router.get('/admin/all', adminAuth, getAllOrders);
router.get('/', adminAuth, getAllOrders);

// Get order by ID
router.get('/:id', auth, getOrderById);

// Update order status (Admin)
router.patch('/:id/status', adminAuth, updateOrderStatus);

// Update payment status (Admin)
router.patch('/:id/payment-status', adminAuth, updatePaymentStatus);

// Track order
router.get('/track/:trackingNumber', trackOrder);

export default router;
