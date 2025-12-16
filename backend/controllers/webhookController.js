import Order from '../models/Order.js';
import Shipment from '../models/Shipment.js';

// @desc    Handle RedBox webhook updates
// @route   POST /api/webhooks/redbox
// @access  Public (but secured with signature)
export const handleRedBoxWebhook = async (req, res) => {
  try {
    const { tracking_number, status, location, estimated_delivery, timestamp } = req.body;

    console.log('📦 RedBox Webhook received:', {
      tracking_number,
      status,
      location,
      timestamp
    });

    // البحث عن الطلب والشحنة
    const order = await Order.findOne({ trackingNumber: tracking_number });
    const shipment = await Shipment.findOne({ trackingNumber: tracking_number });

    if (!order) {
      console.log('❌ Order not found for tracking:', tracking_number);
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // تحديث حالة الطلب
    const statusMapping = {
      'picked_up': 'shipped',
      'in_transit': 'shipped',
      'out_for_delivery': 'shipped',
      'delivered': 'delivered',
      'failed': 'cancelled',
      'returned': 'returned'
    };

    const newOrderStatus = statusMapping[status] || order.orderStatus;
    
    if (newOrderStatus !== order.orderStatus) {
      order.orderStatus = newOrderStatus;
      order.statusHistory.push({
        status: newOrderStatus,
        note: `تحديث من RedBox: ${status} - ${location || ''}`,
        date: new Date(timestamp || Date.now())
      });
      await order.save();
    }

    // تحديث الشحنة إذا كانت موجودة
    if (shipment) {
      shipment.status = status;
      if (estimated_delivery) {
        shipment.estimatedDelivery = new Date(estimated_delivery);
      }
      if (status === 'delivered') {
        shipment.actualDelivery = new Date(timestamp || Date.now());
      }
      shipment.apiResponse = req.body; // حفظ الاستجابة الكاملة
      await shipment.save();
    }

    console.log('✅ Webhook processed successfully');
    res.json({ success: true, message: 'Webhook processed' });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};

// @desc    Handle SMSA webhook updates
// @route   POST /api/webhooks/smsa
// @access  Public
export const handleSMSAWebhook = async (req, res) => {
  try {
    // TODO: Implement SMSA webhook handling
    console.log('📦 SMSA Webhook received:', req.body);
    res.json({ success: true, message: 'SMSA webhook received' });
  } catch (error) {
    console.error('❌ SMSA Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// @desc    Handle Aramex webhook updates
// @route   POST /api/webhooks/aramex
// @access  Public
export const handleAramexWebhook = async (req, res) => {
  try {
    // TODO: Implement Aramex webhook handling
    console.log('📦 Aramex Webhook received:', req.body);
    res.json({ success: true, message: 'Aramex webhook received' });
  } catch (error) {
    console.error('❌ Aramex Webhook error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};