import axios from 'axios';
import crypto from 'crypto';

/**
 * Tabby Payment Service
 * Official integration based on Tabby API documentation
 * https://docs.tabby.ai/pay-in-4-custom-integration
 * Pay in 4 installments integration
 */
class TabbyPaymentService {
  constructor(publicKey, secretKey, apiUrl = 'https://api.tabby.ai', merchantCode = null) {
    this.publicKey = publicKey;
    this.secretKey = secretKey;
    this.apiUrl = apiUrl.replace(/\/$/, ''); // Remove trailing slash
    this.merchantCode = merchantCode;
    
    // Create axios instance with default headers matching Tabby docs
    this.client = axios.create({
      baseURL: this.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'TabbySDK/1.0'
      },
      timeout: 30000
    });

    // Add request interceptor for logging
    this.client.interceptors.request.use(
      (config) => {
        console.log(`🔄 Tabby API Request: ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Tabby Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.client.interceptors.response.use(
      (response) => {
        console.log(`✅ Tabby API Response: ${response.status} ${response.config.url}`);
        return response;
      },
      (error) => {
        console.error('❌ Tabby Response Error:', {
          status: error.response?.status,
          data: error.response?.data,
          url: error.config?.url
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * Create checkout session
   * Based on: https://docs.tabby.ai/pay-in-4-custom-integration/checkout-session
   * @param {Object} sessionData - Session information formatted for Tabby API
   * @returns {Promise<Object>} Checkout session data
   */
  async createCheckoutSession(sessionData) {
    try {
      console.log('🛒 Creating Tabby checkout session:', {
        orderId: sessionData.payment.order.reference_id,
        amount: sessionData.payment.amount,
        currency: sessionData.payment.currency
      });

      // Validate required fields according to Tabby docs
      this.validateSessionData(sessionData);

      const response = await this.client.post('/api/v2/checkout', sessionData);
      
      console.log('✅ Checkout session created:', {
        sessionId: response.data.id,
        paymentId: response.data.payment?.id,
        status: response.data.status,
        webUrl: response.data.configuration?.available_products?.installments?.[0]?.web_url
      });

      // Extract the checkout URL from the response
      const checkoutUrl = response.data.configuration?.available_products?.installments?.[0]?.web_url;
      
      // Check if installments are available
      const hasInstallments = response.data.configuration?.available_products?.installments?.length > 0;
      
      if (!hasInstallments) {
        console.warn('⚠️ No installment products available for this order');
      }

      return {
        success: true,
        sessionId: response.data.id,
        paymentId: response.data.payment?.id,
        status: response.data.status,
        checkoutUrl: checkoutUrl, // Add the actual checkout URL
        hasInstallments: hasInstallments,
        configuration: response.data.configuration,
        availableProducts: response.data.available_products
      };
    } catch (error) {
      console.error('❌ Error creating checkout session:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // Handle specific Tabby API errors
      if (error.response?.status === 400) {
        const errorData = error.response.data;
        let errorMsg = 'بيانات الطلب غير صحيحة';
        
        if (errorData?.errors && Array.isArray(errorData.errors)) {
          errorMsg = errorData.errors.map(err => err.message || err).join(', ');
        } else if (errorData?.message) {
          errorMsg = errorData.message;
        }
        
        throw new Error(`Tabby API Error: ${errorMsg}`);
      } else if (error.response?.status === 401) {
        throw new Error('مفتاح Tabby API غير صحيح أو منتهي الصلاحية');
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
        
        throw new Error(`Tabby Validation Error: ${errorMsg}`);
      } else if (error.response?.status === 403) {
        throw new Error('ليس لديك صلاحية للوصول إلى Tabby API');
      } else if (error.response?.status >= 500) {
        throw new Error('خطأ في خادم Tabby. يرجى المحاولة لاحقاً');
      }
      
      throw new Error(error.response?.data?.message || error.message || 'فشل في إنشاء جلسة الدفع');
    }
  }

  /**
   * Validate session data according to Tabby API requirements
   * @param {Object} sessionData - Session data to validate
   */
  validateSessionData(sessionData) {
    const required = [
      'payment',
      'lang',
      'merchant_code',
      'merchant_urls'
    ];

    for (const field of required) {
      if (!sessionData[field]) {
        throw new Error(`حقل مطلوب مفقود: ${field}`);
      }
    }

    // Validate payment structure
    const payment = sessionData.payment;
    if (!payment.amount || !payment.currency || !payment.buyer || !payment.order) {
      throw new Error('بنية payment غير صحيحة');
    }

    // Validate amount is positive number
    const amount = parseFloat(payment.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error('مبلغ الطلب يجب أن يكون رقم موجب');
    }

    // Validate buyer structure
    const buyer = payment.buyer;
    if (!buyer.phone || !buyer.email || !buyer.name) {
      throw new Error('بيانات المشتري غير مكتملة');
    }

    // Validate phone number format (Saudi mobile with international format)
    if (!buyer.phone || !buyer.phone.startsWith('+9665') || buyer.phone.length !== 13) {
      throw new Error(`رقم جوال المشتري غير صحيح: ${buyer.phone || 'غير موجود'}. يجب أن يكون رقم جوال سعودي بصيغة +966XXXXXXXXX`);
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(buyer.email)) {
      throw new Error(`البريد الإلكتروني غير صحيح: ${buyer.email}`);
    }

    // Validate order structure
    const order = payment.order;
    if (!order.reference_id || !order.items || !Array.isArray(order.items) || order.items.length === 0) {
      throw new Error('بيانات الطلب غير مكتملة');
    }

    // Validate each item
    order.items.forEach((item, index) => {
      if (!item.title || !item.unit_price || !item.quantity) {
        throw new Error(`بيانات المنتج رقم ${index + 1} غير مكتملة`);
      }
      
      if (parseFloat(item.unit_price) <= 0) {
        throw new Error(`سعر المنتج رقم ${index + 1} يجب أن يكون أكبر من صفر`);
      }
      
      if (parseInt(item.quantity) <= 0) {
        throw new Error(`كمية المنتج رقم ${index + 1} يجب أن تكون أكبر من صفر`);
      }
    });

    // Validate merchant URLs
    const urls = sessionData.merchant_urls;
    if (!urls.success || !urls.cancel || !urls.failure) {
      throw new Error('روابط التاجر غير مكتملة');
    }

    console.log('✅ Session data validation passed');
  }

  /**
   * Get payment details
   * @param {string} paymentId - Tabby payment ID
   * @returns {Promise<Object>} Payment details
   */
  async getPayment(paymentId) {
    try {
      console.log('📋 Getting payment details:', paymentId);

      const response = await this.client.get(`/api/v2/payments/${paymentId}`);

      console.log('✅ Payment details retrieved:', {
        paymentId,
        status: response.data.status
      });

      return {
        success: true,
        payment: response.data
      };
    } catch (error) {
      console.error('❌ Error getting payment:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل في جلب تفاصيل الدفع');
    }
  }

  /**
   * Capture payment
   * @param {string} paymentId - Tabby payment ID
   * @param {Object} captureData - Capture information
   * @returns {Promise<Object>} Capture result
   */
  async capturePayment(paymentId, captureData) {
    try {
      console.log('💰 Capturing payment:', paymentId, captureData);

      const response = await this.client.post(`/api/v2/payments/${paymentId}/captures`, captureData);

      console.log('✅ Payment captured:', {
        paymentId,
        captureId: response.data.id
      });

      return {
        success: true,
        captureId: response.data.id,
        amount: response.data.amount
      };
    } catch (error) {
      console.error('❌ Error capturing payment:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل في التقاط الدفع');
    }
  }

  /**
   * Refund payment
   * @param {string} paymentId - Tabby payment ID
   * @param {Object} refundData - Refund information
   * @returns {Promise<Object>} Refund result
   */
  async refundPayment(paymentId, refundData) {
    try {
      console.log('💸 Refunding payment:', paymentId, refundData);

      const response = await this.client.post(`/api/v2/payments/${paymentId}/refunds`, refundData);

      console.log('✅ Payment refunded:', {
        paymentId,
        refundId: response.data.id
      });

      return {
        success: true,
        refundId: response.data.id,
        amount: response.data.amount
      };
    } catch (error) {
      console.error('❌ Error refunding payment:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل في استرداد المبلغ');
    }
  }

  /**
   * Close payment
   * @param {string} paymentId - Tabby payment ID
   * @returns {Promise<Object>} Close result
   */
  async closePayment(paymentId) {
    try {
      console.log('🔒 Closing payment:', paymentId);

      const response = await this.client.post(`/api/v2/payments/${paymentId}/close`);

      console.log('✅ Payment closed:', {
        paymentId,
        status: response.data.status
      });

      return {
        success: true,
        status: response.data.status
      };
    } catch (error) {
      console.error('❌ Error closing payment:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل في إغلاق الدفع');
    }
  }

  /**
   * Process webhook data
   * @param {Object} webhookData - Webhook payload
   * @returns {Object} Processed webhook data
   */
  processWebhook(webhookData) {
    try {
      console.log('🔔 Processing Tabby webhook:', {
        eventType: webhookData.event_type,
        paymentId: webhookData.payment?.id
      });

      return {
        eventType: webhookData.event_type,
        paymentId: webhookData.payment?.id,
        orderId: webhookData.payment?.order?.reference_id,
        status: webhookData.payment?.status,
        amount: webhookData.payment?.amount,
        currency: webhookData.payment?.currency,
        data: webhookData
      };
    } catch (error) {
      console.error('❌ Error processing webhook:', error);
      throw new Error('فشل في معالجة webhook');
    }
  }

  /**
   * Format order data for Tabby API
   * Based on: https://docs.tabby.ai/api-reference/checkout/session-payload-model
   * @param {Object} orderInfo - Order information from your system
   * @returns {Object} Formatted session data matching Tabby API specification
   */
  formatSessionData(orderInfo) {
    try {
      console.log('📝 Formatting session data for Tabby:', {
        orderId: orderInfo.orderId,
        amount: orderInfo.amount
      });

      // Validate required fields
      if (!orderInfo.orderId || !orderInfo.amount) {
        throw new Error('معرف الطلب والمبلغ مطلوبان');
      }

      const currency = orderInfo.currency || 'SAR';
      
      const formattedData = {
        payment: {
          amount: parseFloat(orderInfo.amount).toFixed(2),
          currency: currency,
          description: orderInfo.description || `طلب رقم ${orderInfo.orderNumber || orderInfo.orderId}`,
          buyer: {
            name: `${orderInfo.customer.firstName || 'Customer'} ${orderInfo.customer.lastName || ''}`.trim(),
            email: orderInfo.customer.email || 'customer@example.com',
            phone: this.formatPhoneNumber(orderInfo.customer.phone),
            dob: orderInfo.customer.dateOfBirth || null
          },
          shipping_address: {
            city: orderInfo.shippingAddress.city || 'الرياض',
            address: orderInfo.shippingAddress.line1 || 'العنوان غير محدد',
            zip: orderInfo.shippingAddress.postalCode || '12345'
          },
          order: {
            reference_id: orderInfo.orderId.toString(),
            updated_at: new Date().toISOString(),
            tax_amount: parseFloat(orderInfo.taxAmount || 0).toFixed(2),
            shipping_amount: parseFloat(orderInfo.shippingAmount || 0).toFixed(2),
            discount_amount: parseFloat(orderInfo.discountAmount || 0).toFixed(2),
            items: orderInfo.items.map((item, index) => ({
              reference_id: (item.id || item.productId || `item_${index}`).toString(),
              title: item.name || 'منتج',
              description: item.description || item.name || 'منتج',
              quantity: parseInt(item.quantity || 1),
              unit_price: parseFloat(item.unitPrice || item.price || 0).toFixed(2),
              discount_amount: parseFloat(item.discountAmount || 0).toFixed(2),
              image_url: item.imageUrl || null,
              product_url: item.itemUrl || null,
              category: item.category || 'Electronics',
              gender: item.gender || null,
              color: item.color || null,
              size: item.size || null,
              brand: item.brand || null,
              is_refundable: true
            }))
          },
          buyer_history: {
            registered_since: orderInfo.customer.registeredSince || new Date().toISOString(),
            loyalty_level: orderInfo.customer.loyaltyLevel || 0,
            wishlist_count: orderInfo.customer.wishlistCount || 0,
            is_social_networks_connected: false,
            is_phone_number_verified: true,
            is_email_verified: !!orderInfo.customer.email
          },
          order_history: orderInfo.customer.orderHistory || [],
          meta: {
            customer: orderInfo.customer.id || orderInfo.customer.phone,
            order_id: orderInfo.orderId.toString()
          }
        },
        lang: orderInfo.locale || 'ar',
        merchant_code: this.merchantCode || 'default',
        merchant_urls: {
          success: orderInfo.successUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-success?provider=tabby&orderId=${orderInfo.orderId}`,
          cancel: orderInfo.cancelUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/checkout?cancelled=true`,
          failure: orderInfo.failureUrl || `${process.env.FRONTEND_URL || 'http://localhost:3000'}/order-failed?orderId=${orderInfo.orderId}`
        }
      };

      console.log('✅ Session data formatted for Tabby');
      return formattedData;
    } catch (error) {
      console.error('❌ Error formatting session data:', error);
      throw new Error(`فشل في تنسيق بيانات الجلسة: ${error.message}`);
    }
  }

  /**
   * Format phone number for Tabby API
   * Tabby expects: +966XXXXXXXXX format (full international format)
   * @param {string} phone - Phone number
   * @returns {string} Formatted phone number
   */
  formatPhoneNumber(phone) {
    if (!phone) {
      throw new Error('رقم الجوال مطلوب');
    }
    
    // Remove all non-digit characters
    let cleaned = phone.toString().replace(/\D/g, '');
    
    console.log('📱 تنسيق رقم الجوال:', { original: phone, cleaned });
    
    // Handle different input formats
    if (cleaned.startsWith('00966')) {
      // 00966XXXXXXXXX -> +966XXXXXXXXX
      cleaned = '+' + cleaned.substring(2);
    } else if (cleaned.startsWith('966')) {
      // 966XXXXXXXXX -> +966XXXXXXXXX
      cleaned = '+' + cleaned;
    } else if (cleaned.startsWith('05') && cleaned.length === 10) {
      // 05XXXXXXXX -> +9665XXXXXXXX (remove leading 0, add country code)
      cleaned = '+966' + cleaned.substring(1);
    } else if (cleaned.startsWith('5') && cleaned.length === 9) {
      // 5XXXXXXXX -> +9665XXXXXXXX
      cleaned = '+966' + cleaned;
    } else if (cleaned.length === 9 && !cleaned.startsWith('5')) {
      // XXXXXXXXX (9 digits without 5) -> assume it's missing the 5
      cleaned = '+9665' + cleaned;
    } else if (cleaned.length === 8) {
      // XXXXXXXX (8 digits) -> add +9665 at the beginning
      cleaned = '+9665' + cleaned;
    } else {
      // Try to fix common formats
      if (cleaned.length >= 8 && cleaned.length <= 12) {
        // Extract last 8-9 digits and add proper prefix
        const lastDigits = cleaned.slice(-8);
        cleaned = '+9665' + lastDigits;
      } else {
        throw new Error(`رقم الجوال غير صحيح: ${phone}. يجب أن يكون رقم سعودي صحيح`);
      }
    }
    
    // Validate final format: must be +9665XXXXXXXX (13 characters total)
    if (!cleaned.startsWith('+9665') || cleaned.length !== 13) {
      throw new Error(`رقم الجوال غير صحيح: ${phone}. يجب أن يكون رقم جوال سعودي بصيغة +966XXXXXXXXX`);
    }
    
    console.log('✅ رقم الجوال بعد التنسيق:', cleaned);
    return cleaned;
  }

  /**
   * Test API connection and validate credentials
   * @returns {Promise<Object>} Connection test result with detailed information
   */
  async testConnection() {
    try {
      console.log('🔍 Testing Tabby API connection and credentials...');

      // Test with a simple checkout session creation (will fail but test auth)
      const testData = {
        payment: {
          amount: "100.00",
          currency: "SAR",
          description: "Test connection",
          buyer: {
            phone: "+966501234567",
            email: "test@example.com",
            name: "Test User"
          },
          order: {
            tax_amount: "0.00",
            shipping_amount: "0.00",
            discount_amount: "0.00",
            reference_id: "test_" + Date.now(),
            items: [{
              title: "Test Item",
              description: "Test Item",
              quantity: 1,
              unit_price: "100.00",
              reference_id: "test_item"
            }]
          },
          shipping_address: {
            city: "Riyadh",
            address: "Test Address",
            zip: "12345"
          }
        },
        lang: "ar",
        merchant_code: this.merchantCode || "test",
        merchant_urls: {
          success: "https://example.com/success",
          cancel: "https://example.com/cancel",
          failure: "https://example.com/failure"
        }
      };

      try {
        await this.client.post('/api/v2/checkout', testData);
        console.log('✅ Test checkout session created successfully');
      } catch (testError) {
        // Even if checkout fails, if we get a proper API response, auth is working
        if (testError.response?.status === 400 || testError.response?.status === 422) {
          console.log('✅ API authentication successful (test data rejected as expected)');
        } else if (testError.response?.status === 401) {
          throw new Error('مفتاح API غير صحيح أو منتهي الصلاحية');
        } else if (testError.response?.status === 403) {
          throw new Error('ليس لديك صلاحية للوصول إلى هذا المورد');
        } else {
          throw testError;
        }
      }

      // Determine environment based on API URL
      const environment = this.apiUrl.includes('api.tabby.ai') ? 'production' : 'sandbox';
      
      console.log('✅ Tabby API connection successful');

      return {
        success: true,
        message: 'الاتصال بـ Tabby API ناجح',
        details: {
          environment: environment,
          apiUrl: this.apiUrl,
          merchantCode: this.merchantCode,
          hasPublicKey: !!this.publicKey,
          hasSecretKey: !!this.secretKey,
          timestamp: new Date().toISOString()
        }
      };
    } catch (error) {
      console.error('❌ Tabby API connection failed:', error.response?.data || error.message);
      
      let errorMessage = 'فشل في الاتصال بـ Tabby API';

      if (error.response?.status === 401) {
        errorMessage = 'مفتاح API غير صحيح أو منتهي الصلاحية';
      } else if (error.response?.status === 403) {
        errorMessage = 'ليس لديك صلاحية للوصول إلى هذا المورد';
      } else if (error.response?.status === 404) {
        errorMessage = 'نقطة النهاية غير موجودة - تحقق من رابط API';
      } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        errorMessage = 'فشل في الاتصال بالخادم - تحقق من رابط API';
      } else if (error.code === 'ETIMEDOUT') {
        errorMessage = 'انتهت مهلة الاتصال';
      }

      throw new Error(errorMessage);
    }
  }
}

export default TabbyPaymentService;