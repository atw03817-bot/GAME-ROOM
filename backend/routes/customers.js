import express from 'express';
import {
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
  getCustomerOrders,
  getCustomerStats
} from '../controllers/customerController.js';
import { adminAuth } from '../middleware/auth.js';

const router = express.Router();

// All routes require admin authentication
router.use(adminAuth);

// Get overall stats (must be before /:id routes)
router.get('/stats/overview', async (req, res) => {
  try {
    const User = (await import('../models/User.js')).default;
    const Order = (await import('../models/Order.js')).default;

    const totalCustomers = await User.countDocuments({ 
      $or: [{ role: 'USER' }, { role: 'customer' }]
    });
    const activeCustomers = await User.countDocuments({ 
      $or: [{ role: 'USER' }, { role: 'customer' }],
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    
    const orders = await Order.find();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    res.json({
      totalCustomers,
      activeCustomers,
      inactiveCustomers: totalCustomers - activeCustomers,
      totalOrders,
      totalRevenue
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ message: error.message });
  }
});

// Customer routes
router.get('/', getCustomers);
router.get('/:id', getCustomer);
router.put('/:id', updateCustomer);
router.delete('/:id', deleteCustomer);

// Customer orders & stats
router.get('/:id/orders', getCustomerOrders);
router.get('/:id/stats', getCustomerStats);

export default router;

