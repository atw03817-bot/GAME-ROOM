import axios from 'axios';
import crypto from 'crypto';

/**
 * Tamara Payment Service
 * Official integration based on Tamara API documentation
 * https://docs.tamara.co/docs/direct-online-checkout
 * Updated to match latest API specifications
 */
class TamaraPaymentService {
  constructor(merchantToken, apiUrl = 'https://api.tamara.co', notificationToken = null, publicKey = null) {
    this.merchantToken = merchantToken;
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.notificationToken = notificationToken;
    this.publicKey = publicKey;
    
    // Create axios instance with default headers matching Tamara docs
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.merchantToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TamaraSDK/1.0'
      },
      timeout: 30000
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔄 Tamara API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Tamara Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Tamara API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Tamara Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create checkout session - Direct Online Checkout
   * Based on: https://docs.tamara.co/docs/direct-online-checkout
   * @param {Object} orderData - Order information formatted for Tamara API
   * @returns {Promise<Object>} Checkout session data
   */
  async createCheckoutSession(orderData) {
    try {
      console.log('🛒 Creating Tamara checkout session (Direct Online):', {
        orderId: orderData.order_reference_id,
        amount: orderData.total_amount?.amount,
        paymentType: orderData.payment_type
      });

      // Validate required fields according to Tamara docs
      this.validateCheckoutData(orderData);

      const response = await this.client.post('/checkout', orderData);
      
      console.log('✅ Checkout session created:', {
        checkoutId: response.data.checkout_id,
        checkoutUrl: response.data.checkout_url,
        orderId: response.data.order_id
      });

      return {
        success: true,
        checkoutId: response.data.checkout_id,
        checkoutUrl: response.data.checkout_url,
        orderId: response.data.order_id,
        status: response.data.status || 'created'
      };
    } catch (error) {
      console.error('❌ Error creating checkout session:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle specific Tamara API errors with detailed messages
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMsg = 'بيانات الطلب غير صحيحة';
        
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorMsg = errorData.errors.map(err => err.message || err).join(', ');
        } else if (errorData?.message) {
          errorMsg = errorData.message;
        }
        
        throw new Error(`Tamara API Error: ${errorMsg}`);
      } else if (error.response?.status === 401) {
        throw new Error('مفتاح Tamara API غير صحيح أو منتهي الصلاحية');
      } else if (error.response?.status === 422) {
        const errorData = error.response.data;
        let errorMsg = 'خطأ في التحقق من البيانات';
        
        if (errorData?.errors) {
          if (Array.isArray(errorData.errors)) {
            errorMsg = errorData.errors.map(err => err.message || err).join(', ');
          } else if (typeof errorData.errors === 'object') {
            errorMsg = Object.values(errorData.errors).flat().join(', ');
          }
        }
        
        throw new Error(`Tamara Validation Error: ${errorMsg}`);
      } else if (error.response?.status === 403) {
        throw new Error('ليس لديك صلاحية للوصول إلى Tamara API');
      } else if (error.response?.status >= 500) {
        throw new Error('خطأ في خادم Tamara. يرجى المحاولة لاحقاً');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'فشل في إنشاء جلسة الدفع');
    }
  }

  /**
   * Validate checkout data according to Tamara API requirements
   * @param {Object} orderData - Order data to validate
   */
  validateCheckoutData(orderData) {
    const required = [
      'order_reference_id',
      'total_amount',
      'description',
      'country_code',
      'payment_type',
      'locale',
      'merchant_url',
      'consumer',
      'billing_address',
      'shipping_address',
      'items'
    ];

    for (const field of required) {
      if (!orderData[field]) {
        throw new Error(`حقل مطلوب مفقود: ${field}`);
      }
    }

    // Validate total_amount structure
    if (!orderData.total_amount.amount || !orderData.total_amount.currency) {
      throw new Error('بنية total_amount غير صحيحة');
    }

    // Validate amount is positive number
    const amount = parseFloat(orderData.total_amount.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('مبلغ الطلب يجب أن يكون رقم موجب');
    }

    // Validate consumer structure
    const consumer = orderData.consumer;
    if (!consumer.first_name || !consumer.phone_number) {
      throw new Error('اسم العميل ورقم الجوال مطلوبان');
    }

    // Validate phone number format (must be Saudi mobile)
    if (!consumer.phone_number || !consumer.phone_number.startsWith('+9665') || consumer.phone_number.length !== 13) {
      throw new Error(`رقم جوال العميل غير صحيح: ${consumer.phone_number || 'غير موجود'}. يجب أن يكون رقم جوال سعودي بصيغة +966XXXXXXXXX`);
    }

    // Validate billing address
    const billing = orderData.billing_address;
    if (!billing.first_name || !billing.line1 || !billing.city || !billing.phone_number) {
      throw new Error('بيانات عنوان الفواتير غير مكتملة');
    }

    // Validate shipping address
    const shipping = orderData.shipping_address;
    if (!shipping.first_name || !shipping.line1 || !shipping.city || !shipping.phone_number) {
      throw new Error('بيانات عنوان الشحن غير مكتملة');
    }

    // Validate billing address phone
    if (!billing.phone_number || !billing.phone_number.startsWith('+9665') || billing.phone_number.length !== 13) {
      throw new Error(`رقم جوال عنوان الفواتير غير صحيح: ${billing.phone_number || 'غير موجود'}. يجب أن يكون رقم جوال سعودي`);
    }

    // Validate shipping address phone
    if (!shipping.phone_number || !shipping.phone_number.startsWith('+9665') || shipping.phone_number.length !== 13) {
      throw new Error(`رقم جوال عنوان الشحن غير صحيح: ${shipping.phone_number || 'غير موجود'}. يجب أن يكون رقم جوال سعودي`);
    }

    // Validate email format
    if (consumer.email && consumer.email !== 'customer@example.com') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(consumer.email)) {
        throw new Error(`البريد الإلكتروني غير صحيح: ${consumer.email}`);
      }
    }

    // Validate address completeness
    if (!billing.line1 || billing.line1.length < 5) {
      throw new Error('عنوان الفواتير يجب أن يكون مفصل أكثر (5 أحرف على الأقل)');
    }

    if (!shipping.line1 || shipping.line1.length < 5) {
      throw new Error('عنوان الشحن يجب أن يكون مفصل أكثر (5 أحرف على الأقل)');
    }

    // Validate items
    if (!Array.isArray(orderData.items) || orderData.items.length === 0) {
      throw new Error('يجب أن يحتوي الطلب على منتج واحد على الأقل');
    }

    // Validate each item
    orderData.items.forEach((item, index) => {
      if (!item.reference_id || !item.name || !item.unit_price || !item.total_amount || !item.quantity) {
        throw new Error(`بيانات المنتج رقم ${index + 1} غير مكتملة`);
      }
      
      if (parseFloat(item.unit_price.amount) <= 0 || parseFloat(item.total_amount.amount) <= 0) {
        throw new Error(`أسعار المنتج رقم ${index + 1} يجب أن تكون أكبر من صفر`);
      }
      
      if (parseInt(item.quantity) <= 0) {
        throw new Error(`كمية المنتج رقم ${index + 1} يجب أن تكون أكبر من صفر`);
      }
    });

    // Validate merchant URLs
    const urls = orderData.merchant_url;
    if (!urls.success || !urls.failure || !urls.cancel || !urls.notification) {
      throw new Error('روابط التاجر غير مكتملة');
    }

    console.log('✅ Checkout data validation passed');
  }

  /**
   * Get payment types available for amount
   * Based on: https://docs.tamara.co/docs/payment-types
   * @param {string} country - Country code (SA, AE, KW, BH)
   * @param {number} amount - Order amount
   * @param {string} currency - Currency code (SAR, AED, KWD, BHD)
   * @returns {Promise<Object>} Available payment types with installment options
   */
  async getPaymentTypes(country = 'SA', amount, currency = 'SAR') {
    try {
      console.log('💳 Getting Tamara payment types:', { country, amount, currency });

      // Validate inputs
      if (!amount || amount <= 0) {
        throw new Error('مبلغ الطلب يجب أن يكون أكبر من صفر');
      }

      const supportedCountries = ['SA', 'AE', 'KW', 'BH'];
      if (!supportedCountries.includes(country)) {
        throw new Error(`البلد غير مدعوم: ${country}`);
      }

      const response = await this.client.get('/checkout/payment-types', {
        params: {
          country: country,
          order_value: parseFloat(amount).toFixed(2),
          currency: currency
        }
      });

      console.log('✅ Payment types retrieved:', response.data.length, 'types available');

      // Process and format payment types according to Tamara response structure
      const paymentTypes = response.data.map(type => ({
        name: type.name,
        description: type.description,
        min_limit: type.min_limit,
        max_limit: type.max_limit,
        supported_instalments: type.supported_instalments || [],
        currency: type.currency || currency
      }));

      return {
        success: true,
        paymentTypes: paymentTypes,
        country: country,
        currency: currency,
        orderValue: amount
      };
    } catch (error) {
      console.error('❌ Error getting payment types:', error.response?.data || error.message);
      
      if (error.response?.status === 400) {
        throw new Error('معاملات البحث غير صحيحة');
      } else if (error.response?.status === 404) {
        throw new Error('لا توجد طرق دفع متاحة لهذا المبلغ');
      }
      
      throw new Error(error.response?.data?.message || 'فشل في جلب أنواع الدفع');
    }
  }

  /**
   * Authorize order payment
   * @param {string} orderId - Tamara order ID
   * @returns {Promise<Object>} Authorization result
   */
  async authorizeOrder(orderId) {
    try {
      console.log('🔐 Authorizing order:', orderId);

      const response = await this.client.post(`/orders/${orderId}/authorise`);

      console.log('✅ Order authorized:', {
        orderId,
        status: response.data.order_status
      });

      return {
        success: true,
        orderStatus: response.data.order_status,
        authorizedAt: response.data.authorized_at
      };
    } catch (error) {
      console.error('❌ Error authorizing order:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل في تفويض الطلب');
    }
  }

  /**
   * Capture order payment
   * @param {string} orderId - Tamara order ID
   * @param {Object} captureData - Capture information
   * @returns {Promise<Object>} Capture result
   */
  async captureOrder(orderId, captureData) {
    try {
      console.log('💰 Capturing order:', orderId, captureData);

      const response = await this.client.post(`/orders/${orderId}/capture`, captureData);

      console.log('✅ Order captured:', {
        orderId,
        captureId: response.data.capture_id
      });

      return {
        success: true,
        captureId: response.data.capture_id,
        capturedAmount: response.data.captured_amount
      };
    } catch (error) {
      console.error('❌ Error capturing order:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل في التقاط الدفع');
    }
  }

  /**
   * Cancel order
   * @param {string} orderId - Tamara order ID
   * @param {Object} cancelData - Cancellation information
   * @returns {Promise<Object>} Cancellation result
   */
  async cancelOrder(orderId, cancelData) {
    try {
      console.log('❌ Cancelling order:', orderId, cancelData);

      const response = await this.client.post(`/orders/${orderId}/cancel`, cancelData);

      console.log('✅ Order cancelled:', {
        orderId,
        cancelId: response.data.cancel_id
      });

      return {
        success: true,
        cancelId: response.data.cancel_id,
        cancelledAmount: response.data.cancelled_amount
      };
    } catch (error) {
      console.error('❌ Error cancelling order:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل في إلغاء الطلب');
    }
  }

  /**
   * Refund order
   * @param {string} orderId - Tamara order ID
   * @param {Object} refundData - Refund information
   * @returns {Promise<Object>} Refund result
   */
  async refundOrder(orderId, refundData) {
    try {
      console.log('💸 Refunding order:', orderId, refundData);

      const response = await this.client.post(`/orders/${orderId}/refund`, refundData);

      console.log('✅ Order refunded:', {
        orderId,
        refundId: response.data.refund_id
      });

      return {
        success: true,
        refundId: response.data.refund_id,
        refundedAmount: response.data.refunded_amount
      };
    } catch (error) {
      console.error('❌ Error refunding order:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل في استرداد المبلغ');
    }
  }

  /**
   * Get order details
   * @param {string} orderId - Tamara order ID
   * @returns {Promise<Object>} Order details
   */
  async getOrder(orderId) {
    try {
      console.log('📋 Getting order details:', orderId);

      const response = await this.client.get(`/orders/${orderId}`);

      console.log('✅ Order details retrieved:', {
        orderId,
        status: response.data.status
      });

      return {
        success: true,
        order: response.data
      };
    } catch (error) {
      console.error('❌ Error getting order:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل في جلب تفاصيل الطلب');
    }
  }

  /**
   * Validate webhook signature
   * @param {Object} payload - Webhook payload
   * @param {string} signature - Webhook signature
   * @returns {boolean} Is signature valid
   */
  validateWebhookSignature(payload, signature) {
    try {
      if (!this.notificationToken) {
        console.warn('⚠️ No notification token configured for webhook validation');
        return true; // Allow if no token configured
      }

      const expectedSignature = crypto
        .createHmac('sha256', this.notificationToken)
        .update(JSON.stringify(payload))
        .digest('hex');

      const isValid = signature === expectedSignature;
      
      console.log('🔐 Webhook signature validation:', isValid ? '✅ Valid' : '❌ Invalid');
      
      return isValid;
    } catch (error) {
      console.error('❌ Error validating webhook signature:', error);
      return false;
    }
  }

  /**
   * Process webhook data
   * @param {Object} webhookData - Webhook payload
   * @returns {Object} Processed webhook data
   */
  processWebhook(webhookData) {
    try {
      console.log('🔔 Processing Tamara webhook:', {
        eventType: webhookData.event_type,
        orderId: webhookData.order_id
      });

      return {
        eventType: webhookData.event_type,
        orderId: webhookData.order_id,
        orderReferenceId: webhookData.order_reference_id,
        orderStatus: webhookData.order_status,
        paymentStatus: webhookData.payment_status,
        data: webhookData.data
      };
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      throw new Error('فشل في معالجة webhook');
    }
  }

  /**
   * Format order data for Tamara API - Direct Online Checkout
   * Based on: https://docs.tamara.co/docs/direct-online-checkout
   * @param {Object} orderInfo - Order information from your system
   * @returns {Object} Formatted order data matching Tamara API specification
   */
  formatOrderData(orderInfo) {
    try {
      console.log('📝 Formatting order data for Tamara Direct Checkout:', {
        orderId: orderInfo.orderId,
        amount: orderInfo.amount,
        paymentType: orderInfo.paymentType
      });

      // Validate required fields
      if (!orderInfo.orderId || !orderInfo.amount) {
        throw new Error('معرف الطلب والمبلغ مطلوبان');
      }

      const currency = orderInfo.currency || 'SAR';
      
      const formattedData = {
        // Order identification
        order_reference_id: orderInfo.orderId.toString(),
        order_number: orderInfo.orderNumber || orderInfo.orderId.toString(),
        
        // Total amount - must match sum of items + shipping + tax - discount
        total_amount: {
          amount: parseFloat(orderInfo.amount).toFixed(2),
          currency: currency
        },
        
        // Order details
        description: orderInfo.description || `طلب رقم ${orderInfo.orderNumber || orderInfo.orderId}`,
        country_code: orderInfo.countryCode || 'SA',
        payment_type: orderInfo.paymentType || 'PAY_BY_INSTALMENTS',
        instalments: orderInfo.instalments || null,
        locale: orderInfo.locale || 'ar_SA',
        platform: 'web',
        is_mobile: Boolean(orderInfo.isMobile),
        
        // Merchant URLs - all required for Direct Online Checkout
        merchant_url: {
          success: orderInfo.successUrl,
          failure: orderInfo.failureUrl,
          cancel: orderInfo.cancelUrl,
          notification: orderInfo.notificationUrl
        },
        
        // Consumer information - all required fields
        consumer: {
          first_name: orderInfo.customer.firstName || 'Customer',
          last_name: orderInfo.customer.lastName || '',
          phone_number: this.formatPhoneNumber(orderInfo.customer.phone),
          email: orderInfo.customer.email || '',
          date_of_birth: orderInfo.customer.dateOfBirth || null,
          national_id: orderInfo.customer.nationalId || null
        },
        
        // Billing address - required for payment processing
        billing_address: {
          first_name: orderInfo.billingAddress.firstName || orderInfo.customer.firstName || 'Customer',
          last_name: orderInfo.billingAddress.lastName || orderInfo.customer.lastName || '',
          line1: orderInfo.billingAddress.line1 || 'العنوان غير محدد',
          line2: orderInfo.billingAddress.line2 || null,
          region: orderInfo.billingAddress.region || orderInfo.billingAddress.city || 'الرياض',
          postal_code: orderInfo.billingAddress.postalCode || null,
          city: orderInfo.billingAddress.city || 'الرياض',
          country_code: orderInfo.billingAddress.countryCode || 'SA',
          phone_number: this.formatPhoneNumber(orderInfo.billingAddress.phone || orderInfo.customer.phone)
        },
        
        // Shipping address - required for physical products
        shipping_address: {
          first_name: orderInfo.shippingAddress.firstName || orderInfo.customer.firstName || 'Customer',
          last_name: orderInfo.shippingAddress.lastName || orderInfo.customer.lastName || '',
          line1: orderInfo.shippingAddress.line1 || 'العنوان غير محدد',
          line2: orderInfo.shippingAddress.line2 || null,
          region: orderInfo.shippingAddress.region || orderInfo.shippingAddress.city || 'الرياض',
          postal_code: orderInfo.shippingAddress.postalCode || null,
          city: orderInfo.shippingAddress.city || 'الرياض',
          country_code: orderInfo.shippingAddress.countryCode || 'SA',
          phone_number: this.formatPhoneNumber(orderInfo.shippingAddress.phone || orderInfo.customer.phone)
        },
        
        // Items - at least one item required
        items: orderInfo.items.map((item, index) => ({
          reference_id: (item.id || item.productId || `item_${index}`).toString(),
          type: item.type || 'Physical',
          name: item.name || 'منتج',
          sku: (item.sku || item.id || item.productId || `sku_${index}`).toString(),
          image_url: item.imageUrl || null,
          item_url: item.itemUrl || null,
          unit_price: {
            amount: parseFloat(item.unitPrice || item.price || 0).toFixed(2),
            currency: currency
          },
          discount_amount: {
            amount: parseFloat(item.discountAmount || 0).toFixed(2),
            currency: currency
          },
          tax_amount: {
            amount: parseFloat(item.taxAmount || 0).toFixed(2),
            currency: currency
          },
          total_amount: {
            amount: parseFloat(item.totalAmount || (item.unitPrice || item.price || 0) * (item.quantity || 1)).toFixed(2),
            currency: currency
          },
          quantity: parseInt(item.quantity || 1)
        })),
        
        // Additional amounts
        shipping_amount: {
          amount: parseFloat(orderInfo.shippingAmount || 0).toFixed(2),
          currency: currency
        },
        tax_amount: {
          amount: parseFloat(orderInfo.taxAmount || 0).toFixed(2),
          currency: currency
        },
        discount_amount: {
          amount: parseFloat(orderInfo.discountAmount || 0).toFixed(2),
          currency: currency
        }
      };

      // Validate total amount calculation
      this.validateTotalAmount(formattedData);

      console.log('✅ Order data formatted for Tamara Direct Checkout');
      return formattedData;
    } catch (error) {
      console.error('❌ Error formatting order data:', error);
      throw new Error(`فشل في تنسيق بيانات الطلب: ${error.message}`);
    }
  }

  /**
   * Format phone number for Tamara API according to their requirements
   * Tamara expects: +966XXXXXXXXX format (Saudi Arabia)
   * @param {string} phone - Phone number
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phone) {
    if (!phone) {
      throw new Error('رقم الجوال مطلوب');
    }
    
    // Remove all non-digit characters
    let cleaned = phone.toString().replace(/\D/g, '');
    
    // Handle different input formats
    if (cleaned.startsWith('00966')) {
      // 00966XXXXXXXXX -> 966XXXXXXXXX
      cleaned = cleaned.substring(2);
    } else if (cleaned.startsWith('966')) {
      // 966XXXXXXXXX -> keep as is
    } else if (cleaned.startsWith('05') && cleaned.length === 10) {
      // 05XXXXXXXX -> 966 + 5XXXXXXXX (remove leading 0)
      cleaned = '966' + cleaned.substring(1);
    } else if (cleaned.startsWith('5') && cleaned.length === 9) {
      // 5XXXXXXXX -> 966 + 5XXXXXXXX
      cleaned = '966' + cleaned;
    }
    
    // Validate final format: must be 966XXXXXXXXX (12 digits total)
    if (!cleaned.startsWith('966') || cleaned.length !== 12) {
      throw new Error(`رقم الجوال غير صحيح: ${phone}. يجب أن يكون رقم سعودي صحيح`);
    }
    
    // Validate that it's a valid Saudi mobile number (starts with 966 5)
    if (!cleaned.startsWith('9665')) {
      throw new Error(`رقم الجوال يجب أن يكون رقم جوال سعودي (يبدأ بـ 05): ${phone}`);
    }
    
    return `+${cleaned}`;
  }

  /**
   * Validate that total amount matches sum of components
   * @param {Object} orderData - Formatted order data
   */
  validateTotalAmount(orderData) {
    const itemsTotal = orderData.items.reduce((sum, item) => {
      return sum + parseFloat(item.total_amount.amount);
    }, 0);
    
    const shippingAmount = parseFloat(orderData.shipping_amount.amount);
    const taxAmount = parseFloat(orderData.tax_amount.amount);
    const discountAmount = parseFloat(orderData.discount_amount.amount);
    
    const calculatedTotal = itemsTotal + shippingAmount + taxAmount - discountAmount;
    const declaredTotal = parseFloat(orderData.total_amount.amount);
    
    // Allow small rounding differences (1 cent)
    if (Math.abs(calculatedTotal - declaredTotal) > 0.01) {
      console.warn('⚠️ Total amount mismatch:', {
        declared: declaredTotal,
        calculated: calculatedTotal,
        items: itemsTotal,
        shipping: shippingAmount,
        tax: taxAmount,
        discount: discountAmount
      });
      
      // Adjust total to match calculation
      orderData.total_amount.amount = calculatedTotal.toFixed(2);
    }
  }

  /**
   * Test API connection and validate credentials
   * @returns {Promise<Object>} Connection test result with detailed information
   */
  async testConnection() {
    try {
      console.log('🔍 Testing Tamara API connection and credentials...');

      // Test 1: Basic authentication with payment types endpoint
      const paymentTypesResponse = await this.client.get('/checkout/payment-types', {
        params: {
          country: 'SA',
          order_value: 100,
          currency: 'SAR'
        }
      });

      console.log('✅ Payment types endpoint test passed');

      // Test 2: Try to get merchant information (if available)
      let merchantInfo = null;
      try {
        const merchantResponse = await this.client.get('/merchants/me');
        merchantInfo = {
          id: merchantResponse.data.id,
          name: merchantResponse.data.name,
          status: merchantResponse.data.status
        };
        console.log('✅ Merchant info retrieved');
      } catch (merchantError) {
        console.log('ℹ️ Merchant info endpoint not available or not accessible');
      }

      // Determine environment based on API URL
      const environment = this.apiUrl.includes('sandbox') ? 'sandbox' : 'production';
      
      console.log('✅ Tamara API connection successful');

      return {
        success: true,
        message: 'الاتصال بـ Tamara API ناجح',
        details: {
          environment: environment,
          apiUrl: this.apiUrl,
          paymentTypesCount: paymentTypesResponse.data?.length || 0,
          merchantInfo: merchantInfo,
          hasNotificationToken: !!this.notificationToken,
          hasPublicKey: !!this.publicKey,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Tamara API connection failed:', error.response?.data || error.message);
      
      let errorMessage = 'فشل في الاتصال بـ Tamara API';
      let errorDetails = {};

      if (error.response?.status === 401) {
        errorMessage = 'مفتاح API غير صحيح أو منتهي الصلاحية';
        errorDetails.authError = true;
      } else if (error.response?.status === 403) {
        errorMessage = 'ليس لديك صلاحية للوصول إلى هذا المورد';
        errorDetails.permissionError = true;
      } else if (error.response?.status === 404) {
        errorMessage = 'نقطة النهاية غير موجودة - تحقق من رابط API';
        errorDetails.endpointError = true;
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = 'فشل في الاتصال بالخادم - تحقق من رابط API';
        errorDetails.connectionError = true;
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'انتهت مهلة الاتصال';
        errorDetails.timeoutError = true;
      }

      throw new Error(errorMessage);
    }
  }
}

export default TamaraPaymentService;