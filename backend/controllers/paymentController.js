import PaymentSettings from '../models/PaymentSettings.js';
import PaymentIntent from '../models/PaymentIntent.js';
import Order from '../models/Order.js';
import TapPaymentService from '../services/tapPaymentService.js';
import TamaraPaymentService from '../services/tamaraPaymentService.js';

import axios from 'axios';

// @desc    Get payment settings
// @route   GET /api/payments/settings
// @access  Private/Admin
export const getPaymentSettings = async (req, res) => {
  try {
    const settings = await PaymentSettings.find();
    
    // Hide sensitive data
    const sanitizedSettings = settings.map(setting => ({
      _id: setting._id,
      provider: setting.provider,
      enabled: setting.enabled,
      hasConfig: !!setting.config
    }));
    
    res.json({
      success: true,
      data: sanitizedSettings
    });
  } catch (error) {
    console.error('Error getting payment settings:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إعدادات الدفع'
    });
  }
};

// @desc    Get single payment setting
// @route   GET /api/payments/settings/:provider
// @access  Private/Admin
export const getPaymentSetting = async (req, res) => {
  try {
    const setting = await PaymentSettings.findOne({ provider: req.params.provider });
    
    if (!setting) {
      return res.status(404).json({
        success: false,
        message: 'إعدادات الدفع غير موجودة'
      });
    }
    
    res.json({
      success: true,
      data: setting
    });
  } catch (error) {
    console.error('Error getting payment setting:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إعدادات الدفع'
    });
  }
};

// @desc    Update payment settings
// @route   PUT /api/payments/settings/:provider
// @access  Private/Admin
export const updatePaymentSettings = async (req, res) => {
  try {
    const { enabled, config } = req.body;
    const { provider } = req.params;
    
    console.log('💾 Updating payment settings:', {
      provider,
      enabled,
      configKeys: Object.keys(config || {})
    });
    
    let setting = await PaymentSettings.findOne({ provider });
    
    if (!setting) {
      // Create new setting
      console.log('📝 Creating new payment setting for:', provider);
      setting = await PaymentSettings.create({
        provider,
        enabled,
        config
      });
      console.log('✅ Created:', setting._id);
    } else {
      // Update existing
      console.log('📝 Updating existing payment setting:', setting._id);
      setting.enabled = enabled;
      setting.config = config;
      await setting.save();
      console.log('✅ Updated successfully');
    }
    
    res.json({
      success: true,
      data: setting,
      message: 'تم تحديث إعدادات الدفع بنجاح'
    });
  } catch (error) {
    console.error('❌ Error updating payment settings:', {
      provider: req.params.provider,
      error: error.message,
      stack: error.stack
    });
    
    let errorMessage = 'خطأ في تحديث إعدادات الدفع';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'بيانات غير صحيحة: ' + Object.values(error.errors).map(e => e.message).join(', ');
      statusCode = 400;
    } else if (error.code === 11000) {
      errorMessage = 'مزود الدفع موجود بالفعل';
      statusCode = 400;
    } else if (error.message.includes('Cast to')) {
      errorMessage = 'نوع البيانات غير صحيح';
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Get enabled payment methods
// @route   GET /api/payments/methods
// @access  Public
export const getPaymentMethods = async (req, res) => {
  try {
    const methods = [];
    
    // Get all enabled payment settings
    const paymentSettings = await PaymentSettings.find({ enabled: true });
    
    // Add COD from StoreSettings
    const StoreSettings = (await import('../models/StoreSettings.js')).default;
    const storeSettings = await StoreSettings.findOne({ singleton: true });
    
    if (storeSettings?.codEnabled) {
      methods.push({
        provider: 'cod',
        enabled: true,
        name: 'الدفع عند الاستلام'
      });
    }
    
    // Add other payment methods from PaymentSettings
    for (const setting of paymentSettings) {
      if (setting.provider === 'tap' && setting.config?.secretKey) {
        methods.push({
          provider: 'tap',
          enabled: true,
          name: 'Tap Payment - بطاقة ائتمانية'
        });
      }
      
      if (setting.provider === 'tamara' && setting.config?.merchantToken) {
        methods.push({
          provider: 'tamara',
          enabled: true,
          name: 'Tamara - اشتري الآن وادفع لاحقاً'
        });
      }

    }
    
    console.log('📋 Available payment methods:', methods);
    
    res.json({
      success: true,
      data: methods
    });
  } catch (error) {
    console.error('Error getting payment methods:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب طرق الدفع'
    });
  }
};

// @desc    Create payment intent
// @route   POST /api/payments/intent
// @access  Private
export const createPaymentIntent = async (req, res) => {
  try {
    const { orderId, amount, provider } = req.body;
    
    if (!orderId || !amount || !provider) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }
    
    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }
    
    // Check if payment intent already exists
    const existingIntent = await PaymentIntent.findOne({ orderId });
    if (existingIntent) {
      return res.status(400).json({
        success: false,
        message: 'يوجد نية دفع بالفعل لهذا الطلب'
      });
    }
    
    // Get payment settings
    const settings = await PaymentSettings.findOne({ provider, enabled: true });
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'طريقة الدفع غير متاحة'
      });
    }
    
    let paymentUrl = null;
    let transactionId = null;
    
    // Handle different providers
    if (provider === 'tap') {
      // Tap Payment integration
      const tapResponse = await createTapPayment(amount, orderId, settings.config);
      paymentUrl = tapResponse.paymentUrl;
      transactionId = tapResponse.transactionId;

    } else if (provider === 'myfatoorah') {
      // MyFatoorah integration
      const mfResponse = await createMyFatoorahPayment(amount, orderId, settings.config);
      paymentUrl = mfResponse.paymentUrl;
      transactionId = mfResponse.transactionId;
    } else if (provider === 'cod') {
      // Cash on Delivery - no payment URL needed
      transactionId = `COD-${orderId}`;
    }
    
    // Create payment intent
    const intent = await PaymentIntent.create({
      orderId,
      amount,
      provider,
      paymentUrl,
      transactionId,
      status: provider === 'cod' ? 'PENDING' : 'PENDING'
    });
    
    res.status(201).json({
      success: true,
      data: intent,
      message: 'تم إنشاء نية الدفع بنجاح'
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء نية الدفع'
    });
  }
};

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private
export const verifyPayment = async (req, res) => {
  try {
    const { transactionId, provider } = req.body;
    
    if (!transactionId || !provider) {
      return res.status(400).json({
        success: false,
        message: 'معرف المعاملة ومزود الدفع مطلوبان'
      });
    }
    
    const intent = await PaymentIntent.findOne({ transactionId });
    if (!intent) {
      return res.status(404).json({
        success: false,
        message: 'نية الدفع غير موجودة'
      });
    }
    
    // Get payment settings
    const settings = await PaymentSettings.findOne({ provider });
    if (!settings) {
      return res.status(400).json({
        success: false,
        message: 'إعدادات الدفع غير موجودة'
      });
    }
    
    let verified = false;
    
    // Verify with provider
    if (provider === 'tap') {
      verified = await verifyTapPayment(transactionId, settings.config);

    } else if (provider === 'myfatoorah') {
      verified = await verifyMyFatoorahPayment(transactionId, settings.config);
    } else if (provider === 'cod') {
      verified = true; // COD is always verified
    }
    
    if (verified) {
      intent.status = 'COMPLETED';
      await intent.save();
      
      // Update order status
      await Order.findByIdAndUpdate(intent.orderId, {
        paymentStatus: 'COMPLETED',
        status: 'PROCESSING'
      });
    }
    
    res.json({
      success: true,
      verified,
      data: intent
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من الدفع'
    });
  }
};

// @desc    Handle Tap callback
// @route   POST /api/payments/tap/callback
// @access  Public
export const handleTapCallback = async (req, res) => {
  try {
    const { tap_id, status, order_id } = req.body;
    
    const intent = await PaymentIntent.findOne({ orderId: order_id });
    if (!intent) {
      return res.status(404).json({
        success: false,
        message: 'نية الدفع غير موجودة'
      });
    }
    
    // Update intent status
    if (status === 'CAPTURED') {
      intent.status = 'COMPLETED';
      intent.transactionId = tap_id;
      await intent.save();
      
      // Update order
      await Order.findByIdAndUpdate(order_id, {
        paymentStatus: 'COMPLETED',
        status: 'PROCESSING'
      });
    } else {
      intent.status = 'FAILED';
      await intent.save();
    }
    
    res.json({
      success: true,
      message: 'تم معالجة الدفع'
    });
  } catch (error) {
    console.error('Error handling Tap callback:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في معالجة الدفع'
    });
  }
};

// @desc    Handle MyFatoorah callback
// @route   POST /api/payments/myfatoorah/callback
// @access  Public
export const handleMyFatoorahCallback = async (req, res) => {
  try {
    const { paymentId, status, orderId } = req.body;
    
    const intent = await PaymentIntent.findOne({ orderId });
    if (!intent) {
      return res.status(404).json({
        success: false,
        message: 'نية الدفع غير موجودة'
      });
    }
    
    // Update intent status
    if (status === 'SUCCESS') {
      intent.status = 'COMPLETED';
      intent.transactionId = paymentId;
      await intent.save();
      
      // Update order
      await Order.findByIdAndUpdate(orderId, {
        paymentStatus: 'COMPLETED',
        status: 'PROCESSING'
      });
    } else {
      intent.status = 'FAILED';
      await intent.save();
    }
    
    res.json({
      success: true,
      message: 'تم معالجة الدفع'
    });
  } catch (error) {
    console.error('Error handling MyFatoorah callback:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في معالجة الدفع'
    });
  }
};

// @desc    Refund payment
// @route   POST /api/payments/refund
// @access  Private/Admin
export const refundPayment = async (req, res) => {
  try {
    const { transactionId, amount, reason } = req.body;
    
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: 'معرف المعاملة مطلوب'
      });
    }
    
    const intent = await PaymentIntent.findOne({ transactionId });
    if (!intent) {
      return res.status(404).json({
        success: false,
        message: 'نية الدفع غير موجودة'
      });
    }
    
    if (intent.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن استرجاع دفعة غير مكتملة'
      });
    }
    
    // Get payment settings
    const settings = await PaymentSettings.findOne({ provider: intent.provider });
    
    let refunded = false;
    
    // Process refund with provider
    if (intent.provider === 'tap') {
      refunded = await refundTapPayment(transactionId, amount, settings.config);
    } else if (intent.provider === 'myfatoorah') {
      refunded = await refundMyFatoorahPayment(transactionId, amount, settings.config);
    }
    
    if (refunded) {
      intent.status = 'REFUNDED';
      intent.metadata = { ...intent.metadata, refundReason: reason };
      await intent.save();
      
      // Update order
      await Order.findByIdAndUpdate(intent.orderId, {
        paymentStatus: 'REFUNDED',
        status: 'CANCELLED'
      });
    }
    
    res.json({
      success: true,
      refunded,
      message: refunded ? 'تم استرجاع المبلغ بنجاح' : 'فشل استرجاع المبلغ'
    });
  } catch (error) {
    console.error('Error refunding payment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في استرجاع المبلغ'
    });
  }
};

// @desc    Create Tap payment charge
// @route   POST /api/payments/tap/charge
// @access  Private
export const createTapCharge = async (req, res) => {
  try {
    const { orderId, amount, customerInfo } = req.body;
    
    console.log('💳 Creating Tap charge:', { orderId, amount, customerInfo });
    
    if (!orderId || !amount) {
      console.log('❌ Missing orderId or amount');
      return res.status(400).json({
        success: false,
        message: 'معرف الطلب والمبلغ مطلوبان'
      });
    }

    // Get Tap settings from PaymentSettings
    const tapSettings = await PaymentSettings.findOne({ 
      provider: 'tap',
      enabled: true 
    });
    
    console.log('⚙️ Tap settings found:', !!tapSettings, 'Has secret:', !!tapSettings?.config?.secretKey);
    
    if (!tapSettings || !tapSettings.config?.secretKey) {
      console.log('❌ Tap Payment not configured');
      return res.status(400).json({
        success: false,
        message: 'Tap Payment غير مفعل أو المفاتيح غير موجودة'
      });
    }

    // Get order details
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      console.log('❌ Order not found:', orderId);
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    console.log('📦 Order found:', {
      id: order._id,
      total: order.total,
      user: order.user?.name
    });

    // Initialize Tap service
    const tapService = new TapPaymentService(
      tapSettings.config.secretKey,
      tapSettings.config.testMode !== false
    );

    // Create charge
    const paymentData = {
      amount: amount,
      currency: 'SAR',
      orderId: orderId,
      customerName: customerInfo?.name || order.shippingAddress?.name || order.user?.name || 'Customer',
      customerEmail: customerInfo?.email || order.user?.email || '',
      customerPhone: customerInfo?.phone || order.shippingAddress?.phone || order.user?.phone || '',
      description: `طلب رقم ${order.orderNumber || orderId}`,
      redirectUrl: `${process.env.FRONTEND_URL || 'https://ab-tw.com'}/order-success?orderId=${orderId}`,
      postUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/tap/webhook`
    };

    console.log('💳 Payment data prepared:', {
      amount: paymentData.amount,
      customerName: paymentData.customerName,
      customerPhone: paymentData.customerPhone
    });

    const result = await tapService.createCharge(paymentData);

    // Save payment intent
    const intent = await PaymentIntent.create({
      orderId: orderId,
      amount: amount,
      provider: 'tap',
      transactionId: result.chargeId,
      paymentUrl: result.paymentUrl,
      status: 'PENDING',
      metadata: {
        chargeId: result.chargeId
      }
    });

    res.json({
      success: true,
      data: {
        chargeId: result.chargeId,
        paymentUrl: result.paymentUrl,
        status: result.status
      },
      message: 'تم إنشاء عملية الدفع بنجاح'
    });
  } catch (error) {
    console.error('❌ Error creating Tap charge:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في إنشاء عملية الدفع'
    });
  }
};

// @desc    Handle Tap webhook
// @route   POST /api/payments/tap/webhook
// @access  Public
export const handleTapWebhook = async (req, res) => {
  try {
    console.log('🔔 Tap webhook received:', req.body);

    const webhookData = req.body;
    
    // Get Tap settings from PaymentSettings
    const tapSettings = await PaymentSettings.findOne({ 
      provider: 'tap',
      enabled: true 
    });
    
    if (!tapSettings || !tapSettings.config?.secretKey) {
      console.error('❌ Tap secret key not found');
      return res.status(400).json({ success: false });
    }

    // Initialize Tap service
    const tapService = new TapPaymentService(
      tapSettings.config.secretKey,
      tapSettings.config.testMode !== false
    );

    // Validate webhook
    if (!tapService.validateWebhook(webhookData)) {
      console.error('❌ Invalid webhook data');
      return res.status(400).json({ success: false });
    }

    // Process webhook
    const processedData = tapService.processWebhook(webhookData);
    
    console.log('✅ Webhook processed:', processedData);

    // Find payment intent
    const intent = await PaymentIntent.findOne({ 
      transactionId: processedData.chargeId 
    });

    if (!intent) {
      console.error('❌ Payment intent not found:', processedData.chargeId);
      return res.status(404).json({ success: false });
    }

    // Update payment intent status
    if (processedData.paid) {
      intent.status = 'COMPLETED';
      await intent.save();

      // Get order and update stock
      const order = await Order.findById(intent.orderId).populate('items.product');
      
      if (order) {
        // Update order status
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.paidAt = new Date();
        await order.save();

        // Update product stock and sales
        const Product = (await import('../models/Product.js')).default;
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product._id, {
            $inc: {
              stock: -item.quantity,
              sales: item.quantity
            }
          });
        }

        console.log('✅ Order payment completed and stock updated:', intent.orderId);
      }
    } else if (processedData.status === 'FAILED') {
      intent.status = 'FAILED';
      await intent.save();

      await Order.findByIdAndUpdate(intent.orderId, {
        paymentStatus: 'failed',
        orderStatus: 'cancelled'
      });

      console.log('❌ Order payment failed:', intent.orderId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    res.status(500).json({ success: false });
  }
};

// @desc    Verify Tap payment
// @route   GET /api/payments/tap/verify/:chargeId
// @access  Private
export const verifyTapPayment = async (req, res) => {
  try {
    const { chargeId } = req.params;
    
    console.log('🔍 Verifying Tap payment:', chargeId);

    // Get Tap settings from PaymentSettings
    const tapSettings = await PaymentSettings.findOne({ 
      provider: 'tap',
      enabled: true 
    });
    
    if (!tapSettings || !tapSettings.config?.secretKey) {
      console.log('❌ Tap settings not found');
      return res.status(400).json({
        success: false,
        message: 'Tap Payment غير مفعل'
      });
    }

    // Initialize Tap service
    const tapService = new TapPaymentService(
      tapSettings.config.secretKey,
      tapSettings.config.testMode !== false
    );

    // Retrieve charge
    const result = await tapService.retrieveCharge(chargeId);
    
    console.log('✅ Charge retrieved:', {
      chargeId,
      status: result.status,
      paid: result.paid
    });

    // Update payment intent
    const intent = await PaymentIntent.findOne({ transactionId: chargeId });
    
    console.log('📝 Payment intent found:', !!intent);
    
    if (intent) {
      if (result.paid && intent.status !== 'COMPLETED') {
        // Only update if not already completed (prevent duplicate stock deduction)
        intent.status = 'COMPLETED';
        await intent.save();

        const order = await Order.findByIdAndUpdate(intent.orderId, {
          paymentStatus: 'paid',
          orderStatus: 'confirmed',
          paidAt: new Date()
        }, { new: true });
        
        console.log('✅ Order updated:', intent.orderId, 'Status:', order?.paymentStatus);
        
        // Update stock only if order payment method is not COD (COD already deducted)
        if (order && order.paymentMethod !== 'cod') {
          const Product = (await import('../models/Product.js')).default;
          const fullOrder = await Order.findById(intent.orderId).populate('items.product');
          
          if (fullOrder) {
            for (const item of fullOrder.items) {
              const product = await Product.findById(item.product._id);
              if (product) {
                // Ensure stock doesn't go below 0
                const newStock = Math.max(0, product.stock - item.quantity);
                product.stock = newStock;
                product.sales += item.quantity;
                await product.save();
              }
            }
            console.log('✅ Stock updated for order:', intent.orderId);
          }
        } else {
          console.log('ℹ️ Stock already updated (COD order)');
        }
      } else if (intent.status === 'COMPLETED') {
        console.log('ℹ️ Payment already processed, skipping stock update');
      }
    }

    res.json({
      success: true,
      data: {
        paid: result.paid,
        status: result.status,
        amount: result.amount
      }
    });
  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحقق من الدفع'
    });
  }
};

// @desc    Test Tap connection
// @route   POST /api/payments/tap/test
// @access  Private/Admin
export const testTapConnection = async (req, res) => {
  try {
    const { secretKey } = req.body;
    
    if (!secretKey) {
      return res.status(400).json({
        success: false,
        message: 'المفتاح السري مطلوب'
      });
    }

    // Initialize Tap service with provided key
    const tapService = new TapPaymentService(
      secretKey,
      secretKey.includes('test')
    );

    // Try to make a simple API call to validate the key
    // We'll try to retrieve a non-existent charge to test authentication
    try {
      await tapService.client.get('/charges/test_validation');
    } catch (error) {
      // If we get 404, it means authentication worked
      if (error.response?.status === 404) {
        return res.json({
          success: true,
          message: 'المفاتيح صحيحة والاتصال ناجح',
          testMode: secretKey.includes('test')
        });
      }
      
      // If we get 401, authentication failed
      if (error.response?.status === 401) {
        return res.status(401).json({
          success: false,
          message: 'المفتاح السري غير صحيح'
        });
      }
      
      // Any other error
      throw error;
    }

    res.json({
      success: true,
      message: 'الاتصال ناجح',
      testMode: secretKey.includes('test')
    });
  } catch (error) {
    console.error('❌ Error testing Tap connection:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في اختبار الاتصال'
    });
  }
};

// @desc    Refund Tap payment
// @route   POST /api/payments/tap/refund
// @access  Private/Admin
export const refundTapPayment = async (req, res) => {
  try {
    const { chargeId, amount, reason } = req.body;

    if (!chargeId) {
      return res.status(400).json({
        success: false,
        message: 'معرف عملية الدفع مطلوب'
      });
    }

    // Get Tap settings from PaymentSettings
    const tapSettings = await PaymentSettings.findOne({ 
      provider: 'tap',
      enabled: true 
    });
    
    if (!tapSettings || !tapSettings.config?.secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Tap Payment غير مفعل'
      });
    }

    // Initialize Tap service
    const tapService = new TapPaymentService(
      tapSettings.config.secretKey,
      tapSettings.config.testMode !== false
    );

    // Create refund
    const result = await tapService.createRefund(chargeId, amount, reason);

    // Update payment intent
    const intent = await PaymentIntent.findOne({ transactionId: chargeId });
    if (intent) {
      intent.status = 'REFUNDED';
      intent.metadata = { 
        ...intent.metadata, 
        refundId: result.refundId,
        refundReason: reason 
      };
      await intent.save();

      await Order.findByIdAndUpdate(intent.orderId, {
        paymentStatus: 'REFUNDED',
        status: 'CANCELLED'
      });
    }

    res.json({
      success: true,
      data: result,
      message: 'تم استرجاع المبلغ بنجاح'
    });
  } catch (error) {
    console.error('❌ Error refunding payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في استرجاع المبلغ'
    });
  }
};

// Helper functions (placeholders - implement with actual API calls)

async function createTapPayment(amount, orderId, config) {
  // TODO: Implement Tap API integration
  return {
    paymentUrl: `https://tap.company/payment/${orderId}`,
    transactionId: `TAP-${Date.now()}`
  };
}

async function createMyFatoorahPayment(amount, orderId, config) {
  // TODO: Implement MyFatoorah API integration
  return {
    paymentUrl: `https://myfatoorah.com/payment/${orderId}`,
    transactionId: `MF-${Date.now()}`
  };
}

async function verifyMyFatoorahPayment(transactionId, config) {
  // TODO: Implement MyFatoorah verification
  return true;
}

async function refundMyFatoorahPayment(transactionId, amount, config) {
  // TODO: Implement MyFatoorah refund
  return true;
}

// ==================== TAMARA PAYMENT CONTROLLERS ====================

// @desc    Get Tamara payment types with installment options
// @route   GET /api/payments/tamara/payment-types
// @access  Public
export const getTamaraPaymentTypes = async (req, res) => {
  try {
    const { amount, currency = 'SAR', country = 'SA' } = req.query;
    
    console.log('🔍 Getting Tamara payment types:', { amount, currency, country });
    
    // Validate required parameters
    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'مبلغ الطلب مطلوب'
      });
    }

    const orderAmount = parseFloat(amount);
    if (isNaN(orderAmount) || orderAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'مبلغ الطلب يجب أن يكون رقم صحيح أكبر من صفر'
      });
    }

    // Check if amount is within Tamara limits
    if (orderAmount < 1 || orderAmount > 30000) {
      return res.json({
        success: true,
        data: [],
        message: 'المبلغ خارج النطاق المسموح لـ Tamara (1-30000 ريال)',
        eligible: false,
        reason: 'amount_out_of_range'
      });
    }

    // For testing, return mock data without requiring settings
    return res.json({
      success: true,
      data: [
        {
          name: 'PAY_BY_INSTALMENTS',
          description: 'ادفع على 3 أقساط بدون فوائد',
          min_limit: 1,
          max_limit: 30000,
          supported_instalments: [3],
          currency: currency,
          eligible: orderAmount >= 1 && orderAmount <= 30000
        }
      ],
      message: 'تم جلب أنواع الدفع بنجاح (وضع الاختبار)'
    });

    // Initialize Tamara service
    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.merchantToken,
      tamaraSettings.config.apiUrl || 'https://api.tamara.co',
      tamaraSettings.config.notificationToken,
      tamaraSettings.config.publicKey
    );

    // Get payment types from Tamara API
    const result = await tamaraService.getPaymentTypes(country, orderAmount, currency);

    // Process and enhance payment types data
    const enhancedPaymentTypes = result.paymentTypes.map(type => {
      const installmentAmount = type.supported_instalments && type.supported_instalments.length > 0 
        ? (orderAmount / type.supported_instalments[0]).toFixed(2)
        : null;

      return {
        ...type,
        eligible: orderAmount >= (type.min_limit || 0) && orderAmount <= (type.max_limit || 30000),
        installment_amount: installmentAmount,
        formatted_description: formatPaymentTypeDescription(type, orderAmount, currency)
      };
    });

    // Filter only eligible payment types
    const eligibleTypes = enhancedPaymentTypes.filter(type => type.eligible);

    console.log('✅ Payment types retrieved:', {
      total: result.paymentTypes.length,
      eligible: eligibleTypes.length,
      amount: orderAmount
    });

    res.json({
      success: true,
      data: eligibleTypes,
      meta: {
        total_types: result.paymentTypes.length,
        eligible_types: eligibleTypes.length,
        order_amount: orderAmount,
        currency: currency,
        country: country
      },
      message: eligibleTypes.length > 0 
        ? 'تم جلب أنواع الدفع بنجاح' 
        : 'لا توجد طرق دفع متاحة لهذا المبلغ'
    });
  } catch (error) {
    console.error('❌ Error getting Tamara payment types:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في جلب أنواع الدفع'
    });
  }
}

/**
 * Format payment type description for better UX
 * @param {Object} type - Payment type from Tamara
 * @param {number} amount - Order amount
 * @param {string} currency - Currency code
 * @returns {string} Formatted description
 */
function formatPaymentTypeDescription(type, amount, currency) {
  if (type.name === 'PAY_BY_INSTALMENTS' && type.supported_instalments?.length > 0) {
    const installments = type.supported_instalments[0];
    const installmentAmount = (amount / installments).toFixed(2);
    return `قسط على ${installments} دفعات - ${installmentAmount} ${currency} شهرياً`;
  } else if (type.name === 'PAY_BY_LATER') {
    return 'ادفع خلال 30 يوم بدون فوائد';
  } else if (type.name === 'PAY_NOW') {
    return 'ادفع الآن';
  }
  
  return type.description || type.name;
}

// @desc    Create Tamara checkout session - Direct Online Checkout
// @route   POST /api/payments/tamara/checkout
// @access  Private
export const createTamaraCheckout = async (req, res) => {
  try {
    const { orderId, paymentType, instalments } = req.body;
    
    console.log('🛒 Creating Tamara Direct Online Checkout:', { orderId, paymentType, instalments });
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطلب مطلوب'
      });
    }

    // Get order details with populated data
    const order = await Order.findById(orderId).populate('user').populate('items.product');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    console.log('📦 Order found:', {
      id: order._id,
      total: order.total,
      itemsCount: order.items?.length || 0,
      shippingAddress: !!order.shippingAddress
    });

    // Check if payment intent already exists
    const existingIntent = await PaymentIntent.findOne({ 
      orderId: orderId,
      provider: 'tamara',
      status: { $in: ['PENDING', 'APPROVED', 'AUTHORIZED'] }
    });

    if (existingIntent) {
      return res.status(400).json({
        success: false,
        message: 'يوجد جلسة دفع نشطة بالفعل لهذا الطلب'
      });
    }

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    console.log('⚙️ Tamara settings check:', {
      found: !!tamaraSettings,
      enabled: tamaraSettings?.enabled,
      hasToken: !!tamaraSettings?.config?.merchantToken,
      apiUrl: tamaraSettings?.config?.apiUrl
    });
    
    if (!tamaraSettings) {
      return res.status(400).json({
        success: false,
        message: 'Tamara غير مفعل. يرجى تفعيله من إعدادات الدفع أولاً'
      });
    }
    
    if (!tamaraSettings.config?.merchantToken) {
      return res.status(400).json({
        success: false,
        message: 'مفتاح Tamara غير موجود. يرجى إضافة Merchant Token في إعدادات Tamara'
      });
    }

    // Initialize Tamara service
    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.merchantToken,
      tamaraSettings.config.apiUrl || 'https://api.tamara.co',
      tamaraSettings.config.notificationToken,
      tamaraSettings.config.publicKey
    );

    // Validate payment type and amount
    const supportedPaymentTypes = ['PAY_BY_INSTALMENTS', 'PAY_BY_LATER', 'PAY_NOW'];
    const selectedPaymentType = paymentType || 'PAY_BY_INSTALMENTS';
    
    if (!supportedPaymentTypes.includes(selectedPaymentType)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الدفع غير مدعوم'
      });
    }

    // Check if order amount is eligible for Tamara
    if (order.total < 1 || order.total > 30000) {
      return res.status(400).json({
        success: false,
        message: 'مبلغ الطلب خارج النطاق المسموح لـ Tamara (1-30000 ريال)'
      });
    }

    // Validate required order data
    if (!order.shippingAddress || !order.shippingAddress.name || !order.shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'بيانات عنوان الشحن غير مكتملة (الاسم ورقم الجوال مطلوبان)'
      });
    }

    if (!order.items || order.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'الطلب يجب أن يحتوي على منتج واحد على الأقل'
      });
    }

    // Prepare customer information with validation
    const customerName = order.shippingAddress.name || order.user?.name || 'Customer';
    const nameParts = customerName.trim().split(' ').filter(part => part.length > 0);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    // Validate and format phone number
    let customerPhone = order.shippingAddress.phone || order.user?.phone || '';
    if (!customerPhone) {
      return res.status(400).json({
        success: false,
        message: 'رقم الجوال مطلوب لإتمام الدفع عبر Tamara'
      });
    }

    // Ensure phone is in correct format for Tamara
    customerPhone = customerPhone.toString().replace(/\D/g, '');
    if (customerPhone.startsWith('00966')) {
      customerPhone = customerPhone.substring(2);
    } else if (customerPhone.startsWith('966')) {
      // Keep as is
    } else if (customerPhone.startsWith('05') && customerPhone.length === 10) {
      customerPhone = '966' + customerPhone.substring(1);
    } else if (customerPhone.startsWith('5') && customerPhone.length === 9) {
      customerPhone = '966' + customerPhone;
    }

    if (!customerPhone.startsWith('966') || customerPhone.length !== 12) {
      return res.status(400).json({
        success: false,
        message: 'رقم الجوال يجب أن يكون بصيغة سعودية صحيحة'
      });
    }

    const formattedPhone = `+${customerPhone}`;

    console.log('📱 Customer info prepared:', {
      firstName,
      lastName,
      phone: formattedPhone,
      originalPhone: order.shippingAddress.phone
    });

    // Prepare order data for Tamara Direct Online Checkout
    const orderData = tamaraService.formatOrderData({
      orderId: order._id.toString(),
      orderNumber: order.orderNumber || order._id.toString(),
      amount: order.total,
      currency: 'SAR',
      description: `طلب رقم ${order.orderNumber || order._id}`,
      countryCode: 'SA',
      paymentType: selectedPaymentType,
      instalments: instalments || null,
      locale: 'ar_SA',
      isMobile: req.headers['user-agent']?.toLowerCase().includes('mobile') || false,
      
      // URLs - Required for Direct Online Checkout
      successUrl: `${process.env.FRONTEND_URL || 'https://ab-tw.com'}/tamara-callback?orderId=${orderId}&status=success`,
      failureUrl: `${process.env.FRONTEND_URL || 'https://ab-tw.com'}/tamara-callback?orderId=${orderId}&status=failed`,
      cancelUrl: `${process.env.FRONTEND_URL || 'https://ab-tw.com'}/tamara-callback?orderId=${orderId}&status=cancelled`,
      notificationUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/tamara/webhook`,
      
      // Customer information - Must be accurate for Tamara
      customer: {
        firstName: firstName,
        lastName: lastName,
        phone: formattedPhone,
        email: order.user?.email || 'customer@example.com', // Tamara requires email
        dateOfBirth: null,
        nationalId: null
      },
      
      // Billing address - Must be complete for Tamara
      billingAddress: {
        firstName: firstName,
        lastName: lastName,
        line1: order.shippingAddress?.street || order.shippingAddress?.address || 'شارع الملك فهد',
        line2: order.shippingAddress?.building || null,
        region: order.shippingAddress?.district || order.shippingAddress?.city || 'الرياض',
        postalCode: order.shippingAddress?.postalCode || '12345',
        city: order.shippingAddress?.city || 'الرياض',
        countryCode: 'SA',
        phone: formattedPhone
      },
      
      // Shipping address - Must be complete for Tamara
      shippingAddress: {
        firstName: firstName,
        lastName: lastName,
        line1: order.shippingAddress?.street || order.shippingAddress?.address || 'شارع الملك فهد',
        line2: order.shippingAddress?.building || null,
        region: order.shippingAddress?.district || order.shippingAddress?.city || 'الرياض',
        postalCode: order.shippingAddress?.postalCode || '12345',
        city: order.shippingAddress?.city || 'الرياض',
        countryCode: 'SA',
        phone: formattedPhone
      },
      
      // Items - Must match order total
      items: order.items.map((item, index) => ({
        id: item.product?._id?.toString() || item.productId || `item_${index}`,
        productId: item.product?._id?.toString() || item.productId,
        name: item.name || item.product?.name || 'منتج',
        sku: item.product?._id?.toString() || item.productId || `sku_${index}`,
        imageUrl: item.image || item.product?.images?.[0] || null,
        itemUrl: null,
        unitPrice: item.price || 0,
        discountAmount: 0,
        taxAmount: 0,
        totalAmount: (item.price || 0) * (item.quantity || 1),
        quantity: item.quantity || 1,
        type: 'Physical'
      })),
      
      // Additional amounts
      shippingAmount: order.shippingCost || 0,
      taxAmount: 0,
      discountAmount: order.discount || 0
    });

    console.log('📝 Order data prepared for Tamara Direct Checkout:', {
      orderId: orderData.order_reference_id,
      amount: orderData.total_amount.amount,
      paymentType: orderData.payment_type,
      itemsCount: orderData.items.length,
      customerPhone: orderData.consumer.phone_number,
      customerEmail: orderData.consumer.email,
      billingCity: orderData.billing_address.city,
      shippingCity: orderData.shipping_address.city
    });

    // Final validation before sending to Tamara
    try {
      // Validate that all required URLs are present
      if (!orderData.merchant_url.success || !orderData.merchant_url.failure || 
          !orderData.merchant_url.cancel || !orderData.merchant_url.notification) {
        throw new Error('روابط التاجر غير مكتملة');
      }

      // Validate total amount calculation
      const itemsTotal = orderData.items.reduce((sum, item) => sum + parseFloat(item.total_amount.amount), 0);
      const calculatedTotal = itemsTotal + parseFloat(orderData.shipping_amount.amount) + 
                             parseFloat(orderData.tax_amount.amount) - parseFloat(orderData.discount_amount.amount);
      
      if (Math.abs(calculatedTotal - parseFloat(orderData.total_amount.amount)) > 0.01) {
        console.warn('⚠️ Total amount mismatch detected, adjusting...');
        orderData.total_amount.amount = calculatedTotal.toFixed(2);
      }

      console.log('✅ Final validation passed, sending to Tamara...');
    } catch (validationError) {
      console.error('❌ Final validation failed:', validationError.message);
      return res.status(400).json({
        success: false,
        message: `خطأ في التحقق من البيانات: ${validationError.message}`
      });
    }

    // Create checkout session
    const result = await tamaraService.createCheckoutSession(orderData);

    // Save payment intent
    const intent = await PaymentIntent.create({
      orderId: orderId,
      amount: order.total,
      provider: 'tamara',
      transactionId: result.checkoutId,
      paymentUrl: result.checkoutUrl,
      status: 'PENDING',
      metadata: {
        checkoutId: result.checkoutId,
        tamaraOrderId: result.orderId,
        paymentType: selectedPaymentType,
        instalments: instalments,
        createdAt: new Date().toISOString()
      }
    });

    console.log('✅ Tamara Direct Checkout created:', {
      checkoutId: result.checkoutId,
      paymentUrl: result.checkoutUrl,
      tamaraOrderId: result.orderId
    });

    res.json({
      success: true,
      data: {
        checkoutId: result.checkoutId,
        checkoutUrl: result.checkoutUrl,
        tamaraOrderId: result.orderId,
        paymentType: selectedPaymentType,
        instalments: instalments
      },
      message: 'تم إنشاء جلسة الدفع بنجاح'
    });
  } catch (error) {
    console.error('❌ Error creating Tamara checkout:', {
      message: error.message,
      stack: error.stack,
      orderId: req.body.orderId
    });
    
    // Handle specific error types
    let errorMessage = 'خطأ في إنشاء جلسة الدفع';
    let statusCode = 500;
    
    if (error.message.includes('تنسيق رقم الجوال')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('بيانات العميل')) {
      errorMessage = error.message;
      statusCode = 400;
    } else if (error.message.includes('مفتاح API')) {
      errorMessage = 'خطأ في إعدادات Tamara. يرجى التحقق من المفاتيح';
      statusCode = 400;
    } else if (error.message.includes('401')) {
      errorMessage = 'مفتاح Tamara غير صحيح';
      statusCode = 400;
    } else if (error.message.includes('422')) {
      errorMessage = 'بيانات الطلب غير صحيحة: ' + error.message;
      statusCode = 400;
    }
    
    res.status(statusCode).json({
      success: false,
      message: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Handle Tamara webhook - Direct Online Checkout Events
// @route   POST /api/payments/tamara/webhook
// @access  Public
export const handleTamaraWebhook = async (req, res) => {
  try {
    console.log('🔔 Tamara webhook received:', {
      headers: req.headers,
      body: req.body
    });

    const webhookData = req.body;
    const signature = req.headers['x-tamara-signature'] || req.headers['X-Tamara-Signature'];
    
    // Validate webhook data structure
    if (!webhookData || !webhookData.event_type || !webhookData.order_reference_id) {
      console.error('❌ Invalid webhook data structure');
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid webhook data' 
      });
    }

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings || !tamaraSettings.config?.merchantToken) {
      console.error('❌ Tamara settings not found');
      return res.status(400).json({ 
        success: false, 
        message: 'Tamara not configured' 
      });
    }

    // Initialize Tamara service
    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.merchantToken,
      tamaraSettings.config.apiUrl || 'https://api.tamara.co',
      tamaraSettings.config.notificationToken,
      tamaraSettings.config.publicKey
    );

    // Validate webhook signature if notification token is configured
    if (tamaraSettings.config.notificationToken && signature) {
      const isValid = tamaraService.validateWebhookSignature(webhookData, signature);
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid signature' 
        });
      }
      console.log('✅ Webhook signature validated');
    } else {
      console.warn('⚠️ Webhook signature validation skipped (no notification token configured)');
    }

    // Process webhook
    const processedData = tamaraService.processWebhook(webhookData);
    
    console.log('✅ Webhook processed:', {
      eventType: processedData.eventType,
      orderReferenceId: processedData.orderReferenceId,
      tamaraOrderId: processedData.orderId
    });

    // Find payment intent by order reference ID
    const intent = await PaymentIntent.findOne({ 
      orderId: processedData.orderReferenceId,
      provider: 'tamara'
    });

    if (!intent) {
      console.error('❌ Payment intent not found:', processedData.orderReferenceId);
      return res.status(404).json({ 
        success: false, 
        message: 'Payment intent not found' 
      });
    }

    // Update payment intent based on event type according to Tamara docs
    switch (processedData.eventType) {
      case 'order_approved':
        // Customer approved for payment - order can be shipped
        intent.status = 'APPROVED';
        intent.metadata = { 
          ...intent.metadata, 
          tamaraOrderId: processedData.orderId,
          approvedAt: new Date().toISOString(),
          webhookData: processedData.data
        };
        await intent.save();

        // Update order status - ready for fulfillment
        await Order.findByIdAndUpdate(intent.orderId, {
          paymentStatus: 'approved',
          orderStatus: 'confirmed',
          approvedAt: new Date()
        });

        console.log('✅ Order approved by Tamara:', intent.orderId);
        break;

      case 'order_declined':
        // Customer declined or failed approval
        intent.status = 'DECLINED';
        intent.metadata = { 
          ...intent.metadata, 
          declinedAt: new Date().toISOString(),
          declineReason: processedData.data?.decline_reason || 'Customer declined',
          webhookData: processedData.data
        };
        await intent.save();

        await Order.findByIdAndUpdate(intent.orderId, {
          paymentStatus: 'declined',
          orderStatus: 'cancelled',
          declinedAt: new Date()
        });

        console.log('❌ Order declined by Tamara:', intent.orderId, processedData.data?.decline_reason);
        break;

      case 'order_expired':
        // Customer didn't complete payment in time
        intent.status = 'EXPIRED';
        intent.metadata = { 
          ...intent.metadata, 
          expiredAt: new Date().toISOString(),
          webhookData: processedData.data
        };
        await intent.save();

        await Order.findByIdAndUpdate(intent.orderId, {
          paymentStatus: 'expired',
          orderStatus: 'cancelled',
          expiredAt: new Date()
        });

        console.log('⏰ Order expired:', intent.orderId);
        break;

      case 'order_authorised':
        // Payment authorized - can capture payment
        intent.status = 'AUTHORIZED';
        intent.metadata = { 
          ...intent.metadata, 
          authorizedAt: new Date().toISOString(),
          webhookData: processedData.data
        };
        await intent.save();

        await Order.findByIdAndUpdate(intent.orderId, {
          paymentStatus: 'authorized',
          orderStatus: 'processing',
          authorizedAt: new Date()
        });

        console.log('🔐 Order authorized:', intent.orderId);
        break;

      case 'order_captured':
        // Payment captured - money received
        intent.status = 'COMPLETED';
        intent.metadata = { 
          ...intent.metadata, 
          capturedAt: new Date().toISOString(),
          captureId: processedData.data?.capture_id,
          webhookData: processedData.data
        };
        await intent.save();

        // Get order and update stock
        const order = await Order.findById(intent.orderId).populate('items.product');
        
        if (order) {
          order.paymentStatus = 'paid';
          order.orderStatus = 'confirmed';
          order.paidAt = new Date();
          await order.save();

          // Update product stock and sales only if not already updated
          if (order.stockUpdated !== true) {
            const Product = (await import('../models/Product.js')).default;
            for (const item of order.items) {
              if (item.product && item.product._id) {
                await Product.findByIdAndUpdate(item.product._id, {
                  $inc: {
                    stock: -item.quantity,
                    sales: item.quantity
                  }
                });
              }
            }
            
            // Mark stock as updated
            order.stockUpdated = true;
            await order.save();
            
            console.log('✅ Stock updated for order:', intent.orderId);
          }

          console.log('✅ Order payment completed:', intent.orderId);
        }
        break;

      case 'order_cancelled':
        // Order cancelled by merchant or Tamara
        intent.status = 'CANCELLED';
        intent.metadata = { 
          ...intent.metadata, 
          cancelledAt: new Date().toISOString(),
          cancelReason: processedData.data?.cancel_reason || 'Order cancelled',
          webhookData: processedData.data
        };
        await intent.save();

        await Order.findByIdAndUpdate(intent.orderId, {
          paymentStatus: 'cancelled',
          orderStatus: 'cancelled',
          cancelledAt: new Date()
        });

        console.log('❌ Order cancelled:', intent.orderId);
        break;

      case 'order_refunded':
        // Order refunded
        intent.status = 'REFUNDED';
        intent.metadata = { 
          ...intent.metadata, 
          refundedAt: new Date().toISOString(),
          refundId: processedData.data?.refund_id,
          refundAmount: processedData.data?.refund_amount,
          webhookData: processedData.data
        };
        await intent.save();

        await Order.findByIdAndUpdate(intent.orderId, {
          paymentStatus: 'refunded',
          orderStatus: 'cancelled',
          refundedAt: new Date()
        });

        console.log('💸 Order refunded:', intent.orderId);
        break;

      default:
        console.log('ℹ️ Unhandled webhook event:', processedData.eventType);
        // Still return success to prevent retries
    }

    // Always return success to Tamara to prevent webhook retries
    res.status(200).json({ 
      success: true,
      message: 'Webhook processed successfully',
      eventType: processedData.eventType,
      orderReferenceId: processedData.orderReferenceId
    });

  } catch (error) {
    console.error('❌ Webhook processing error:', error);
    
    // Return 200 to prevent Tamara from retrying if it's a processing error
    // Return 500 only for server errors that might be temporary
    if (error.message.includes('not found') || error.message.includes('Invalid')) {
      res.status(200).json({ 
        success: false, 
        message: 'Webhook processed with errors',
        error: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
};

// @desc    Authorize Tamara order
// @route   POST /api/payments/tamara/authorize/:orderId
// @access  Private/Admin
export const authorizeTamaraOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    console.log('🔐 Authorizing Tamara order:', orderId);

    // Find payment intent
    const intent = await PaymentIntent.findOne({ orderId });
    if (!intent || intent.provider !== 'tamara') {
      return res.status(404).json({
        success: false,
        message: 'طلب Tamara غير موجود'
      });
    }

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings || !tamaraSettings.config?.merchantToken) {
      return res.status(400).json({
        success: false,
        message: 'Tamara غير مفعل'
      });
    }

    // Initialize Tamara service
    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.merchantToken,
      tamaraSettings.config.apiUrl || 'https://api.tamara.co',
      tamaraSettings.config.notificationToken,
      tamaraSettings.config.publicKey
    );

    // Authorize order
    const result = await tamaraService.authorizeOrder(intent.metadata.tamaraOrderId);

    // Update payment intent
    intent.status = 'AUTHORIZED';
    intent.metadata = { 
      ...intent.metadata, 
      authorizedAt: result.authorizedAt
    };
    await intent.save();

    // Update order
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'authorized',
      orderStatus: 'processing'
    });

    res.json({
      success: true,
      data: result,
      message: 'تم تفويض الطلب بنجاح'
    });
  } catch (error) {
    console.error('❌ Error authorizing Tamara order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في تفويض الطلب'
    });
  }
};

// @desc    Capture Tamara order
// @route   POST /api/payments/tamara/capture/:orderId
// @access  Private/Admin
export const captureTamaraOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { shippingInfo } = req.body;
    
    console.log('💰 Capturing Tamara order:', orderId);

    // Find payment intent
    const intent = await PaymentIntent.findOne({ orderId });
    if (!intent || intent.provider !== 'tamara') {
      return res.status(404).json({
        success: false,
        message: 'طلب Tamara غير موجود'
      });
    }

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings || !tamaraSettings.config?.merchantToken) {
      return res.status(400).json({
        success: false,
        message: 'Tamara غير مفعل'
      });
    }

    // Initialize Tamara service
    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.merchantToken,
      tamaraSettings.config.apiUrl || 'https://api.tamara.co',
      tamaraSettings.config.notificationToken,
      tamaraSettings.config.publicKey
    );

    // Prepare capture data
    const captureData = {
      order_id: intent.metadata.tamaraOrderId,
      total_amount: {
        amount: order.total.toFixed(2),
        currency: 'SAR'
      },
      shipping_info: shippingInfo || {
        shipped_at: new Date().toISOString(),
        shipping_company: 'شركة الشحن',
        tracking_number: order.trackingNumber || null
      },
      items: order.items.map(item => ({
        reference_id: item.product?._id?.toString() || item.productId,
        name: item.name,
        type: 'Physical',
        unit_price: {
          amount: item.price.toFixed(2),
          currency: 'SAR'
        },
        total_amount: {
          amount: (item.price * item.quantity).toFixed(2),
          currency: 'SAR'
        },
        quantity: item.quantity
      }))
    };

    // Capture order
    const result = await tamaraService.captureOrder(intent.metadata.tamaraOrderId, captureData);

    // Update payment intent
    intent.status = 'COMPLETED';
    intent.metadata = { 
      ...intent.metadata, 
      captureId: result.captureId,
      capturedAt: new Date()
    };
    await intent.save();

    // Update order
    order.paymentStatus = 'paid';
    order.orderStatus = 'shipped';
    order.paidAt = new Date();
    await order.save();

    res.json({
      success: true,
      data: result,
      message: 'تم التقاط الدفع بنجاح'
    });
  } catch (error) {
    console.error('❌ Error capturing Tamara order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في التقاط الدفع'
    });
  }
};

// @desc    Cancel Tamara order
// @route   POST /api/payments/tamara/cancel/:orderId
// @access  Private/Admin
export const cancelTamaraOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { cancelReason } = req.body;
    
    console.log('❌ Cancelling Tamara order:', orderId);

    // Find payment intent
    const intent = await PaymentIntent.findOne({ orderId });
    if (!intent || intent.provider !== 'tamara') {
      return res.status(404).json({
        success: false,
        message: 'طلب Tamara غير موجود'
      });
    }

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings || !tamaraSettings.config?.merchantToken) {
      return res.status(400).json({
        success: false,
        message: 'Tamara غير مفعل'
      });
    }

    // Initialize Tamara service
    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.merchantToken,
      tamaraSettings.config.apiUrl || 'https://api.tamara.co',
      tamaraSettings.config.notificationToken,
      tamaraSettings.config.publicKey
    );

    // Prepare cancel data
    const cancelData = {
      order_id: intent.metadata.tamaraOrderId,
      total_amount: {
        amount: order.total.toFixed(2),
        currency: 'SAR'
      },
      cancel_reason: cancelReason || 'إلغاء من قبل التاجر',
      items: order.items.map(item => ({
        reference_id: item.product?._id?.toString() || item.productId,
        name: item.name,
        type: 'Physical',
        unit_price: {
          amount: item.price.toFixed(2),
          currency: 'SAR'
        },
        total_amount: {
          amount: (item.price * item.quantity).toFixed(2),
          currency: 'SAR'
        },
        quantity: item.quantity
      }))
    };

    // Cancel order
    const result = await tamaraService.cancelOrder(intent.metadata.tamaraOrderId, cancelData);

    // Update payment intent
    intent.status = 'CANCELLED';
    intent.metadata = { 
      ...intent.metadata, 
      cancelId: result.cancelId,
      cancelledAt: new Date(),
      cancelReason: cancelReason
    };
    await intent.save();

    // Update order
    order.paymentStatus = 'cancelled';
    order.orderStatus = 'cancelled';
    await order.save();

    res.json({
      success: true,
      data: result,
      message: 'تم إلغاء الطلب بنجاح'
    });
  } catch (error) {
    console.error('❌ Error cancelling Tamara order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في إلغاء الطلب'
    });
  }
};

// @desc    Refund Tamara order
// @route   POST /api/payments/tamara/refund/:orderId
// @access  Private/Admin
export const refundTamaraOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { refundAmount, refundReason } = req.body;
    
    console.log('💸 Refunding Tamara order:', orderId);

    // Find payment intent
    const intent = await PaymentIntent.findOne({ orderId });
    if (!intent || intent.provider !== 'tamara') {
      return res.status(404).json({
        success: false,
        message: 'طلب Tamara غير موجود'
      });
    }

    // Get order details
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings || !tamaraSettings.config?.merchantToken) {
      return res.status(400).json({
        success: false,
        message: 'Tamara غير مفعل'
      });
    }

    // Initialize Tamara service
    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.merchantToken,
      tamaraSettings.config.apiUrl || 'https://api.tamara.co',
      tamaraSettings.config.notificationToken,
      tamaraSettings.config.publicKey
    );

    // Prepare refund data
    const refundData = {
      order_id: intent.metadata.tamaraOrderId,
      total_amount: {
        amount: (refundAmount || order.total).toFixed(2),
        currency: 'SAR'
      },
      refund_reason: refundReason || 'استرداد من قبل التاجر',
      items: order.items.map(item => ({
        reference_id: item.product?._id?.toString() || item.productId,
        name: item.name,
        type: 'Physical',
        unit_price: {
          amount: item.price.toFixed(2),
          currency: 'SAR'
        },
        total_amount: {
          amount: (item.price * item.quantity).toFixed(2),
          currency: 'SAR'
        },
        quantity: item.quantity
      }))
    };

    // Refund order
    const result = await tamaraService.refundOrder(intent.metadata.tamaraOrderId, refundData);

    // Update payment intent
    intent.status = 'REFUNDED';
    intent.metadata = { 
      ...intent.metadata, 
      refundId: result.refundId,
      refundedAt: new Date(),
      refundReason: refundReason,
      refundAmount: refundAmount || order.total
    };
    await intent.save();

    // Update order
    order.paymentStatus = 'refunded';
    order.orderStatus = 'cancelled';
    await order.save();

    res.json({
      success: true,
      data: result,
      message: 'تم استرداد المبلغ بنجاح'
    });
  } catch (error) {
    console.error('❌ Error refunding Tamara order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في استرداد المبلغ'
    });
  }
};

// @desc    Get Tamara order details
// @route   GET /api/payments/tamara/order/:tamaraOrderId
// @access  Private/Admin
export const getTamaraOrder = async (req, res) => {
  try {
    const { tamaraOrderId } = req.params;
    
    console.log('📋 Getting Tamara order details:', tamaraOrderId);

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings || !tamaraSettings.config?.merchantToken) {
      return res.status(400).json({
        success: false,
        message: 'Tamara غير مفعل'
      });
    }

    // Initialize Tamara service
    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.merchantToken,
      tamaraSettings.config.apiUrl || 'https://api.tamara.co',
      tamaraSettings.config.notificationToken,
      tamaraSettings.config.publicKey
    );

    // Get order details
    const result = await tamaraService.getOrder(tamaraOrderId);

    res.json({
      success: true,
      data: result.order,
      message: 'تم جلب تفاصيل الطلب بنجاح'
    });
  } catch (error) {
    console.error('❌ Error getting Tamara order:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في جلب تفاصيل الطلب'
    });
  }
};

// @desc    Create default Tamara settings for testing
// @route   POST /api/payments/tamara/init
// @access  Private/Admin
export const initTamaraSettings = async (req, res) => {
  try {
    console.log('🔧 Initializing Tamara settings...');

    // Check if settings already exist
    const existingSettings = await PaymentSettings.findOne({ provider: 'tamara' });
    
    if (existingSettings) {
      return res.json({
        success: true,
        message: 'إعدادات Tamara موجودة بالفعل',
        data: {
          enabled: existingSettings.enabled,
          hasToken: !!existingSettings.config?.merchantToken
        }
      });
    }

    // Create default settings
    const defaultSettings = await PaymentSettings.create({
      provider: 'tamara',
      enabled: false, // Disabled by default until merchant token is added
      config: {
        merchantToken: '', // To be filled by admin
        apiUrl: 'https://api-sandbox.tamara.co', // Sandbox by default
        notificationToken: '',
        publicKey: '',
        merchantId: ''
      }
    });

    console.log('✅ Default Tamara settings created');

    res.json({
      success: true,
      message: 'تم إنشاء إعدادات Tamara الافتراضية. يرجى إضافة Merchant Token لتفعيل الخدمة',
      data: {
        id: defaultSettings._id,
        enabled: defaultSettings.enabled
      }
    });
  } catch (error) {
    console.error('❌ Error initializing Tamara settings:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء إعدادات Tamara'
    });
  }
};

// @desc    Test Tamara connection
// @route   POST /api/payments/tamara/test
// @access  Private/Admin
export const testTamaraConnection = async (req, res) => {
  try {
    const { merchantToken } = req.body;
    
    if (!merchantToken) {
      return res.status(400).json({
        success: false,
        message: 'مفتاح التاجر مطلوب'
      });
    }

    console.log('🔍 Testing Tamara connection...');

    // Initialize Tamara service with provided credentials
    const tamaraService = new TamaraPaymentService(
      merchantToken,
      'https://api-sandbox.tamara.co'
    );

    // Test connection
    const result = await tamaraService.testConnection();

    res.json({
      success: true,
      data: result,
      message: 'الاتصال بـ Tamara ناجح'
    });
  } catch (error) {
    console.error('❌ Error testing Tamara connection:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في اختبار الاتصال'
    });
  }
};




