import axios from 'axios';

/**
 * Tap Payment Service
 * خدمة التكامل مع Tap Payment Gateway
 */

class TapPaymentService {
  constructor(secretKey, isTestMode = true) {
    this.secretKey = secretKey;
    this.baseURL = isTestMode 
      ? 'https://api.tap.company/v2' 
      : 'https://api.tap.company/v2';
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.secretKey}`,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * إنشاء عملية دفع جديدة
   * @param {Object} paymentData - بيانات الدفع
   * @returns {Promise<Object>} - استجابة Tap
   */
  async createCharge(paymentData) {
    try {
      const {
        amount,
        currency = 'SAR',
        orderId,
        customerName,
        customerEmail,
        customerPhone,
        description,
        redirectUrl,
        postUrl
      } = paymentData;

      const chargeData = {
        amount: parseFloat(amount).toFixed(2),
        currency: currency,
        threeDSecure: true,
        save_card: false,
        description: description || `Order #${orderId}`,
        statement_descriptor: 'Mobile Store',
        metadata: {
          udf1: orderId,
          udf2: 'mobile-store'
        },
        reference: {
          transaction: orderId,
          order: orderId
        },
        receipt: {
          email: true,
          sms: true
        },
        customer: {
          first_name: customerName || 'Customer',
          email: customerEmail,
          phone: {
            country_code: '966',
            number: customerPhone?.replace(/^0+/, '') || ''
          }
        },
        source: {
          id: 'src_all'
        },
        redirect: {
          url: redirectUrl || `${process.env.FRONTEND_URL}/order-success`
        },
        post: {
          url: postUrl || `${process.env.BACKEND_URL}/api/payments/tap/webhook`
        }
      };

      console.log('🔵 Creating Tap charge:', {
        amount: chargeData.amount,
        currency: chargeData.currency,
        orderId
      });

      const response = await this.client.post('/charges', chargeData);
      
      console.log('✅ Tap charge created:', {
        id: response.data.id,
        status: response.data.status,
        url: response.data.transaction?.url
      });

      return {
        success: true,
        chargeId: response.data.id,
        status: response.data.status,
        paymentUrl: response.data.transaction?.url,
        transactionId: response.data.id,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Tap charge creation failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'فشل إنشاء عملية الدفع');
    }
  }

  /**
   * التحقق من حالة الدفع
   * @param {string} chargeId - معرف عملية الدفع
   * @returns {Promise<Object>} - حالة الدفع
   */
  async retrieveCharge(chargeId) {
    try {
      console.log('🔍 Retrieving Tap charge:', chargeId);
      
      const response = await this.client.get(`/charges/${chargeId}`);
      
      console.log('✅ Tap charge retrieved:', {
        id: response.data.id,
        status: response.data.status,
        amount: response.data.amount
      });

      return {
        success: true,
        status: response.data.status,
        amount: response.data.amount,
        currency: response.data.currency,
        paid: response.data.status === 'CAPTURED',
        data: response.data
      };
    } catch (error) {
      console.error('❌ Tap charge retrieval failed:', error.response?.data || error.message);
      throw new Error('فشل التحقق من حالة الدفع');
    }
  }

  /**
   * استرجاع المبلغ
   * @param {string} chargeId - معرف عملية الدفع
   * @param {number} amount - المبلغ المراد استرجاعه
   * @param {string} reason - سبب الاسترجاع
   * @returns {Promise<Object>} - نتيجة الاسترجاع
   */
  async createRefund(chargeId, amount, reason = 'Customer request') {
    try {
      console.log('💰 Creating Tap refund:', { chargeId, amount });

      const refundData = {
        charge_id: chargeId,
        amount: parseFloat(amount).toFixed(2),
        currency: 'SAR',
        reason: reason,
        metadata: {
          udf1: reason
        }
      };

      const response = await this.client.post('/refunds', refundData);
      
      console.log('✅ Tap refund created:', {
        id: response.data.id,
        status: response.data.status
      });

      return {
        success: true,
        refundId: response.data.id,
        status: response.data.status,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Tap refund failed:', error.response?.data || error.message);
      throw new Error('فشل استرجاع المبلغ');
    }
  }

  /**
   * التحقق من صحة Webhook
   * @param {Object} webhookData - بيانات Webhook
   * @returns {boolean} - صحة البيانات
   */
  validateWebhook(webhookData) {
    // Tap sends webhook data with charge object
    return webhookData && webhookData.id && webhookData.status;
  }

  /**
   * معالجة Webhook
   * @param {Object} webhookData - بيانات Webhook
   * @returns {Object} - البيانات المعالجة
   */
  processWebhook(webhookData) {
    try {
      const charge = webhookData;
      
      return {
        chargeId: charge.id,
        status: charge.status,
        amount: charge.amount,
        currency: charge.currency,
        orderId: charge.reference?.order || charge.metadata?.udf1,
        paid: charge.status === 'CAPTURED',
        customerEmail: charge.customer?.email,
        customerPhone: charge.customer?.phone?.number
      };
    } catch (error) {
      console.error('❌ Webhook processing failed:', error);
      throw new Error('فشل معالجة Webhook');
    }
  }
}

export default TapPaymentService;
