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
    console.error('❌ Error updating payment settings:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث إعدادات الدفع'
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
      
      if (setting.provider === 'tamara' && setting.config?.apiToken) {
        methods.push({
          provider: 'tamara',
          enabled: true,
          name: 'تمارا - اشتري الآن وادفع لاحقاً',
          config: {
            publicKey: setting.config.publicKey || '',
            defaultInstalments: setting.config.defaultInstalments || 3,
            minAmount: setting.config.minAmount || 100,
            maxAmount: setting.config.maxAmount || 10000
          }
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
    } else if (provider === 'tamara') {
      // Tamara integration
      const tamaraResponse = await createTamaraPayment(amount, orderId, settings.config, order);
      paymentUrl = tamaraResponse.paymentUrl;
      transactionId = tamaraResponse.transactionId;
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
    } else if (provider === 'tamara') {
      verified = await verifyTamaraPayment(transactionId, settings.config);
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
      redirectUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-success?orderId=${orderId}`,
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

// Tamara Payment Functions

// @desc    Create Tamara checkout
// @route   POST /api/payments/tamara/checkout
// @access  Private
export const createTamaraCheckout = async (req, res) => {
  try {
    const { orderId, paymentType, instalments } = req.body;
    
    console.log('🛒 Creating Tamara checkout:', { orderId, paymentType, instalments });
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطلب مطلوب'
      });
    }

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings || !tamaraSettings.config?.apiToken) {
      return res.status(400).json({
        success: false,
        message: 'تمارا غير مفعل أو المفاتيح غير موجودة'
      });
    }

    // Get order details
    const order = await Order.findById(orderId).populate('user').populate('items.product');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    // Check if amount is eligible for Tamara
    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.apiToken,
      tamaraSettings.config.merchantUrl,
      tamaraSettings.config.testMode !== false
    );

    if (!tamaraService.isEligibleAmount(order.total)) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ غير مؤهل للدفع عبر تمارا (الحد الأدنى 100 ريال والحد الأقصى 10,000 ريال)'
      });
    }

    // Prepare order data
    const orderData = {
      orderId: orderId,
      amount: order.total,
      currency: 'SAR',
      description: `طلب رقم ${order.orderNumber || orderId}`,
      paymentType: paymentType || 'PAY_BY_INSTALMENTS',
      instalments: instalments || 3,
      customerName: order.shippingAddress?.name || order.user?.name || 'Customer',
      customerEmail: order.user?.email || '',
      customerPhone: order.shippingAddress?.phone || order.user?.phone || '',
      items: order.items.map(item => ({
        name: item.product.name,
        type: 'Physical',
        reference_id: item.product._id.toString(),
        sku: item.product.sku || item.product._id.toString(),
        quantity: item.quantity,
        unit_price: {
          amount: item.price,
          currency: 'SAR'
        },
        total_amount: {
          amount: item.price * item.quantity,
          currency: 'SAR'
        }
      })),
      billingAddress: {
        line1: order.shippingAddress?.address || 'Address',
        city: order.shippingAddress?.city || 'Riyadh'
      },
      shippingAddress: {
        line1: order.shippingAddress?.address || 'Address',
        city: order.shippingAddress?.city || 'Riyadh'
      },
      successUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-success?orderId=${orderId}`,
      failureUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout?error=payment_failed`,
      cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout?error=payment_cancelled`,
      webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/tamara/webhook`
    };

    // Create checkout
    const result = await tamaraService.createCheckout(orderData);

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
        paymentType: paymentType,
        instalments: instalments
      }
    });

    res.json({
      success: true,
      data: {
        checkoutId: result.checkoutId,
        checkoutUrl: result.checkoutUrl,
        paymentType: paymentType,
        instalments: instalments
      },
      message: 'تم إنشاء جلسة الدفع بنجاح'
    });
  } catch (error) {
    console.error('❌ Error creating Tamara checkout:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في إنشاء جلسة الدفع'
    });
  }
};

// @desc    Handle Tamara webhook
// @route   POST /api/payments/tamara/webhook
// @access  Public
export const handleTamaraWebhook = async (req, res) => {
  try {
    console.log('🔔 Tamara webhook received:', req.body);

    const webhookData = req.body;
    
    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings || !tamaraSettings.config?.apiToken) {
      console.error('❌ Tamara settings not found');
      return res.status(400).json({ success: false });
    }

    // Initialize Tamara service
    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.apiToken,
      tamaraSettings.config.merchantUrl,
      tamaraSettings.config.testMode !== false
    );

    // Validate webhook (if webhook secret is configured)
    if (tamaraSettings.config.webhookSecret) {
      const signature = req.headers['x-tamara-signature'];
      if (!tamaraService.validateWebhook(webhookData, signature, tamaraSettings.config.webhookSecret)) {
        console.error('❌ Invalid webhook signature');
        return res.status(400).json({ success: false });
      }
    }

    // Process webhook
    const processedData = tamaraService.processWebhook(webhookData);
    
    console.log('✅ Webhook processed:', processedData);

    // Find payment intent by order ID
    const intent = await PaymentIntent.findOne({ 
      orderId: processedData.orderId,
      provider: 'tamara'
    });

    if (!intent) {
      console.error('❌ Payment intent not found:', processedData.orderId);
      return res.status(404).json({ success: false });
    }

    // Update payment intent status
    if (processedData.paid && processedData.approved) {
      intent.status = 'COMPLETED';
      await intent.save();

      // Update order
      const order = await Order.findById(intent.orderId).populate('items.product');
      
      if (order) {
        order.paymentStatus = 'paid';
        order.orderStatus = 'confirmed';
        order.paidAt = new Date();
        await order.save();

        // Update product stock
        const Product = (await import('../models/Product.js')).default;
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product._id, {
            $inc: {
              stock: -item.quantity,
              sales: item.quantity
            }
          });
        }

        console.log('✅ Order payment completed via Tamara:', intent.orderId);
      }
    } else if (processedData.cancelled || processedData.expired) {
      intent.status = 'FAILED';
      await intent.save();

      await Order.findByIdAndUpdate(intent.orderId, {
        paymentStatus: 'failed',
        orderStatus: 'cancelled'
      });

      console.log('❌ Order payment failed/cancelled via Tamara:', intent.orderId);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('❌ Tamara webhook processing error:', error);
    res.status(500).json({ success: false });
  }
};

// @desc    Get Tamara installment options
// @route   GET /api/payments/tamara/installments/:amount
// @access  Public
export const getTamaraInstallments = async (req, res) => {
  try {
    const { amount } = req.params;
    
    if (!amount || isNaN(amount)) {
      return res.status(400).json({
        success: false,
        message: 'المبلغ مطلوب ويجب أن يكون رقم'
      });
    }

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings) {
      return res.status(400).json({
        success: false,
        message: 'تمارا غير مفعل'
      });
    }

    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config?.apiToken,
      tamaraSettings.config?.merchantUrl,
      tamaraSettings.config?.testMode !== false
    );

    const options = tamaraService.getInstallmentOptions(parseFloat(amount));

    res.json({
      success: true,
      data: {
        eligible: tamaraService.isEligibleAmount(parseFloat(amount)),
        options: options
      }
    });
  } catch (error) {
    console.error('❌ Error getting installment options:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب خيارات التقسيط'
    });
  }
};

// @desc    Capture Tamara payment
// @route   POST /api/payments/tamara/capture
// @access  Private/Admin
export const captureTamaraPayment = async (req, res) => {
  try {
    const { orderId, shippingInfo } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطلب مطلوب'
      });
    }

    // Get order and payment intent
    const order = await Order.findById(orderId);
    const intent = await PaymentIntent.findOne({ orderId, provider: 'tamara' });
    
    if (!order || !intent) {
      return res.status(404).json({
        success: false,
        message: 'الطلب أو نية الدفع غير موجودة'
      });
    }

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings || !tamaraSettings.config?.apiToken) {
      return res.status(400).json({
        success: false,
        message: 'تمارا غير مفعل'
      });
    }

    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.apiToken,
      tamaraSettings.config.merchantUrl,
      tamaraSettings.config.testMode !== false
    );

    // Capture payment
    const result = await tamaraService.capturePayment(orderId, order.total, shippingInfo);

    // Update payment intent
    intent.status = 'COMPLETED';
    intent.metadata = { ...intent.metadata, captureResult: result };
    await intent.save();

    res.json({
      success: true,
      data: result,
      message: 'تم تأكيد الدفع بنجاح'
    });
  } catch (error) {
    console.error('❌ Error capturing Tamara payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في تأكيد الدفع'
    });
  }
};

// @desc    Cancel Tamara order
// @route   POST /api/payments/tamara/cancel
// @access  Private/Admin
export const cancelTamaraOrder = async (req, res) => {
  try {
    const { orderId, cancelReason } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطلب مطلوب'
      });
    }

    // Get order and payment intent
    const order = await Order.findById(orderId);
    const intent = await PaymentIntent.findOne({ orderId, provider: 'tamara' });
    
    if (!order || !intent) {
      return res.status(404).json({
        success: false,
        message: 'الطلب أو نية الدفع غير موجودة'
      });
    }

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings || !tamaraSettings.config?.apiToken) {
      return res.status(400).json({
        success: false,
        message: 'تمارا غير مفعل'
      });
    }

    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.apiToken,
      tamaraSettings.config.merchantUrl,
      tamaraSettings.config.testMode !== false
    );

    // Cancel order
    const result = await tamaraService.cancelOrder(orderId, order.total, cancelReason);

    // Update payment intent
    intent.status = 'CANCELLED';
    intent.metadata = { ...intent.metadata, cancelResult: result };
    await intent.save();

    // Update order
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'cancelled',
      orderStatus: 'cancelled'
    });

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

// @desc    Refund Tamara payment
// @route   POST /api/payments/tamara/refund
// @access  Private/Admin
export const refundTamaraPayment = async (req, res) => {
  try {
    const { orderId, refundAmount, refundReason } = req.body;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: 'معرف الطلب مطلوب'
      });
    }

    // Get order and payment intent
    const order = await Order.findById(orderId);
    const intent = await PaymentIntent.findOne({ orderId, provider: 'tamara' });
    
    if (!order || !intent) {
      return res.status(404).json({
        success: false,
        message: 'الطلب أو نية الدفع غير موجودة'
      });
    }

    if (intent.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن استرداد دفعة غير مكتملة'
      });
    }

    // Get Tamara settings
    const tamaraSettings = await PaymentSettings.findOne({ 
      provider: 'tamara',
      enabled: true 
    });
    
    if (!tamaraSettings || !tamaraSettings.config?.apiToken) {
      return res.status(400).json({
        success: false,
        message: 'تمارا غير مفعل'
      });
    }

    const tamaraService = new TamaraPaymentService(
      tamaraSettings.config.apiToken,
      tamaraSettings.config.merchantUrl,
      tamaraSettings.config.testMode !== false
    );

    // Refund payment
    const result = await tamaraService.refundPayment(
      orderId, 
      refundAmount || order.total, 
      refundReason
    );

    // Update payment intent
    intent.status = 'REFUNDED';
    intent.metadata = { 
      ...intent.metadata, 
      refundResult: result,
      refundReason: refundReason 
    };
    await intent.save();

    // Update order
    await Order.findByIdAndUpdate(orderId, {
      paymentStatus: 'refunded',
      orderStatus: 'cancelled'
    });

    res.json({
      success: true,
      data: result,
      message: 'تم استرداد المبلغ بنجاح'
    });
  } catch (error) {
    console.error('❌ Error refunding Tamara payment:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في استرداد المبلغ'
    });
  }
};

// @desc    Test Tamara connection
// @route   POST /api/payments/tamara/test
// @access  Private/Admin
export const testTamaraConnection = async (req, res) => {
  try {
    const { apiToken, merchantUrl } = req.body;
    
    if (!apiToken) {
      return res.status(400).json({
        success: false,
        message: 'رمز API مطلوب'
      });
    }

    // تحديد وضع الاختبار حسب نوع الـ token
    const isTestMode = apiToken.includes('sandbox') || apiToken.startsWith('sk_test_');

    console.log('🧪 Testing Tamara connection:', {
      tokenType: isTestMode ? 'sandbox' : 'live',
      tokenPrefix: apiToken.substring(0, 10) + '...'
    });

    // Initialize Tamara service with provided credentials
    const tamaraService = new TamaraPaymentService(
      apiToken,
      merchantUrl,
      isTestMode
    );

    // Test connection using official API
    const result = await tamaraService.testConnection();

    // اختبار إضافي: جلب أنواع الدفع المتاحة
    try {
      const paymentTypes = await tamaraService.getPaymentTypes();
      result.availablePaymentTypes = paymentTypes;
    } catch (error) {
      console.log('⚠️ Could not fetch payment types (not critical):', error.message);
    }

    res.json({
      success: true,
      message: 'الاتصال بتمارا ناجح ✅',
      data: result
    });
  } catch (error) {
    console.error('❌ Error testing Tamara connection:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'خطأ في اختبار الاتصال'
    });
  }
};

// Helper function for creating Tamara payment
async function createTamaraPayment(amount, orderId, config, order) {
  const tamaraService = new TamaraPaymentService(
    config.apiToken,
    config.merchantUrl,
    config.testMode !== false
  );

  const orderData = {
    orderId: orderId,
    amount: amount,
    currency: 'SAR',
    description: `طلب رقم ${order.orderNumber || orderId}`,
    paymentType: config.defaultPaymentType || 'PAY_BY_INSTALMENTS',
    instalments: config.defaultInstalments || 3,
    customerName: order.shippingAddress?.name || order.user?.name || 'Customer',
    customerEmail: order.user?.email || '',
    customerPhone: order.shippingAddress?.phone || order.user?.phone || '',
    items: order.items?.map(item => ({
      name: item.product?.name || 'Product',
      type: 'Physical',
      reference_id: item.product?._id?.toString() || 'product',
      sku: item.product?.sku || item.product?._id?.toString() || 'sku',
      quantity: item.quantity || 1,
      unit_price: {
        amount: item.price || 0,
        currency: 'SAR'
      },
      total_amount: {
        amount: (item.price || 0) * (item.quantity || 1),
        currency: 'SAR'
      }
    })) || [],
    billingAddress: {
      line1: order.shippingAddress?.address || 'Address',
      city: order.shippingAddress?.city || 'Riyadh'
    },
    shippingAddress: {
      line1: order.shippingAddress?.address || 'Address',
      city: order.shippingAddress?.city || 'Riyadh'
    },
    successUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/order-success?orderId=${orderId}`,
    failureUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout?error=payment_failed`,
    cancelUrl: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/checkout?error=payment_cancelled`,
    webhookUrl: `${process.env.BACKEND_URL || 'http://localhost:5000'}/api/payments/tamara/webhook`
  };

  const result = await tamaraService.createCheckout(orderData);
  
  return {
    paymentUrl: result.checkoutUrl,
    transactionId: result.checkoutId
  };
}

// Helper function for verifying Tamara payment
async function verifyTamaraPayment(checkoutId, config) {
  try {
    const tamaraService = new TamaraPaymentService(
      config.apiToken,
      config.merchantUrl,
      config.testMode !== false
    );

    const checkout = await tamaraService.getCheckout(checkoutId);
    return checkout.status === 'approved' && checkout.payment_status === 'paid';
  } catch (error) {
    console.error('❌ Error verifying Tamara payment:', error);
    return false;
  }
}
