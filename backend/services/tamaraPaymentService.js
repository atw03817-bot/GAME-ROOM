import axios from 'axios';

class TamaraPaymentService {
  constructor(apiToken, merchantUrl, testMode = true) {
    this.apiToken = apiToken;
    this.merchantUrl = merchantUrl;
    this.testMode = testMode;
    
    // Tamara API URLs
    this.baseURL = testMode 
      ? 'https://api-sandbox.tamara.co' 
      : 'https://api.tamara.co';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Create checkout session - حسب الدليل الرسمي
  async createCheckout(orderData) {
    try {
      console.log('🛒 Creating Tamara checkout (Official API):', orderData);
      
      // Payload حسب الدليل الرسمي: https://docs.tamara.co/reference/create-checkout-session
      const payload = {
        order_reference_id: orderData.orderId,
        total_amount: {
          amount: parseFloat(orderData.amount).toFixed(2),
          currency: orderData.currency || 'SAR'
        },
        description: orderData.description || `Order ${orderData.orderId}`,
        country_code: 'SA',
        payment_type: orderData.paymentType || 'PAY_BY_INSTALMENTS',
        instalments: parseInt(orderData.instalments) || 3,
        locale: 'ar_SA',
        items: orderData.items?.map(item => ({
          name: item.name,
          type: item.type || 'Physical',
          reference_id: item.reference_id || item.id,
          sku: item.sku || item.reference_id,
          quantity: parseInt(item.quantity),
          unit_price: {
            amount: parseFloat(item.unit_price.amount).toFixed(2),
            currency: item.unit_price.currency || 'SAR'
          },
          total_amount: {
            amount: parseFloat(item.total_amount.amount).toFixed(2),
            currency: item.total_amount.currency || 'SAR'
          }
        })) || [],
        consumer: {
          first_name: orderData.customerName?.split(' ')[0] || 'Customer',
          last_name: orderData.customerName?.split(' ').slice(1).join(' ') || '',
          phone_number: orderData.customerPhone || '',
          email: orderData.customerEmail || ''
        },
        billing_address: {
          first_name: orderData.customerName?.split(' ')[0] || 'Customer',
          last_name: orderData.customerName?.split(' ').slice(1).join(' ') || '',
          line1: orderData.billingAddress?.line1 || 'Address',
          city: orderData.billingAddress?.city || 'Riyadh',
          country_code: 'SA',
          phone_number: orderData.customerPhone || ''
        },
        shipping_address: {
          first_name: orderData.customerName?.split(' ')[0] || 'Customer',
          last_name: orderData.customerName?.split(' ').slice(1).join(' ') || '',
          line1: orderData.shippingAddress?.line1 || 'Address',
          city: orderData.shippingAddress?.city || 'Riyadh',
          country_code: 'SA',
          phone_number: orderData.customerPhone || ''
        },
        merchant_url: {
          success: orderData.successUrl,
          failure: orderData.failureUrl,
          cancel: orderData.cancelUrl,
          notification: orderData.webhookUrl
        },
        platform: 'web'
      };

      // استخدام endpoint الصحيح حسب الدليل الرسمي
      const response = await this.client.post('/checkout', payload);
      
      console.log('✅ Tamara checkout created:', response.data);
      
      return {
        checkoutId: response.data.checkout_id,
        checkoutUrl: response.data.checkout_url,
        status: 'PENDING'
      };
    } catch (error) {
      console.error('❌ Tamara checkout error:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل في إنشاء جلسة الدفع');
    }
  }

  // Get checkout details
  async getCheckout(checkoutId) {
    try {
      const response = await this.client.get(`/checkout/${checkoutId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting checkout:', error.response?.data || error.message);
      throw new Error('فشل في جلب تفاصيل الدفع');
    }
  }

  // Capture payment (for PAY_BY_LATER)
  async capturePayment(orderId, totalAmount, shippingInfo = null) {
    try {
      const payload = {
        order_id: orderId,
        total_amount: {
          amount: totalAmount,
          currency: 'SAR'
        }
      };

      if (shippingInfo) {
        payload.shipping_info = shippingInfo;
      }

      const response = await this.client.post('/payments/capture', payload);
      return response.data;
    } catch (error) {
      console.error('❌ Error capturing payment:', error.response?.data || error.message);
      throw new Error('فشل في تأكيد الدفع');
    }
  }

  // Cancel order
  async cancelOrder(orderId, totalAmount, cancelReason = 'Customer request') {
    try {
      const payload = {
        order_id: orderId,
        total_amount: {
          amount: totalAmount,
          currency: 'SAR'
        },
        cancel_reason: cancelReason
      };

      const response = await this.client.post('/orders/cancel', payload);
      return response.data;
    } catch (error) {
      console.error('❌ Error cancelling order:', error.response?.data || error.message);
      throw new Error('فشل في إلغاء الطلب');
    }
  }

  // Refund payment
  async refundPayment(orderId, refundAmount, refundReason = 'Customer request') {
    try {
      const payload = {
        order_id: orderId,
        total_amount: {
          amount: refundAmount,
          currency: 'SAR'
        },
        comment: refundReason
      };

      const response = await this.client.post('/payments/refund', payload);
      return response.data;
    } catch (error) {
      console.error('❌ Error refunding payment:', error.response?.data || error.message);
      throw new Error('فشل في استرداد المبلغ');
    }
  }

  // Get order details
  async getOrder(orderId) {
    try {
      const response = await this.client.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error('❌ Error getting order:', error.response?.data || error.message);
      throw new Error('فشل في جلب تفاصيل الطلب');
    }
  }

  // Validate webhook signature
  validateWebhook(payload, signature, secret) {
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      console.error('❌ Webhook validation error:', error);
      return false;
    }
  }

  // Process webhook data
  processWebhook(webhookData) {
    const { order_id, order_status, payment_status } = webhookData;
    
    return {
      orderId: order_id,
      orderStatus: order_status,
      paymentStatus: payment_status,
      paid: payment_status === 'paid',
      approved: order_status === 'approved',
      cancelled: order_status === 'cancelled',
      expired: order_status === 'expired'
    };
  }

  // Check if amount is eligible for Tamara
  isEligibleAmount(amount) {
    // Tamara minimum and maximum amounts (in SAR)
    const minAmount = 100; // 100 SAR
    const maxAmount = 10000; // 10,000 SAR
    
    return amount >= minAmount && amount <= maxAmount;
  }

  // Get installment options
  getInstallmentOptions(amount) {
    const options = [];
    
    if (this.isEligibleAmount(amount)) {
      // 3 installments
      if (amount >= 300) {
        options.push({
          instalments: 3,
          installmentAmount: Math.ceil(amount / 3),
          description: `3 أقساط بقيمة ${Math.ceil(amount / 3)} ريال`
        });
      }
      
      // 4 installments
      if (amount >= 400) {
        options.push({
          instalments: 4,
          installmentAmount: Math.ceil(amount / 4),
          description: `4 أقساط بقيمة ${Math.ceil(amount / 4)} ريال`
        });
      }
      
      // Pay later (30 days)
      options.push({
        instalments: 1,
        installmentAmount: amount,
        description: `ادفع لاحقاً خلال 30 يوم`
      });
    }
    
    return options;
  }

  // Test connection - حسب الدليل الرسمي
  async testConnection() {
    try {
      // استخدام endpoint الصحيح للاختبار حسب الدليل الرسمي
      const response = await this.client.get('/merchants/criteria');
      
      console.log('✅ Tamara API connection successful:', {
        baseURL: this.baseURL,
        testMode: this.testMode,
        responseStatus: response.status
      });
      
      return {
        success: true,
        testMode: this.testMode,
        merchantUrl: this.merchantUrl,
        apiVersion: 'v1',
        baseURL: this.baseURL
      };
    } catch (error) {
      console.error('❌ Tamara connection test failed:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
      
      // تحليل نوع الخطأ حسب الدليل الرسمي
      if (error.response?.status === 401) {
        throw new Error('رمز API غير صحيح أو منتهي الصلاحية');
      } else if (error.response?.status === 403) {
        throw new Error('ليس لديك صلاحية للوصول لهذا الـ API');
      } else if (error.response?.status === 404) {
        throw new Error('الـ endpoint غير موجود - تحقق من إعدادات الـ API');
      } else {
        throw new Error(error.response?.data?.message || 'فشل في الاتصال بتمارا');
      }
    }
  }

  // Get payment types - حسب الدليل الرسمي
  async getPaymentTypes() {
    try {
      const response = await this.client.get('/payment_types');
      return response.data;
    } catch (error) {
      console.error('❌ Error getting payment types:', error);
      throw new Error('فشل في جلب أنواع الدفع');
    }
  }
}

export default TamaraPaymentService;