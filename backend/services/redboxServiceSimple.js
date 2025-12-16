import axios from 'axios';
import ShippingProvider from '../models/ShippingProvider.js';

class RedBoxServiceSimple {
  constructor() {
    this.baseURL = 'https://api.redboxsa.com/v1';
    this.organizationId = process.env.REDBOX_ORGANIZATION_ID;
    this.apiKey = process.env.REDBOX_API_KEY;
  }

  // الحصول على إعدادات RedBox
  async getRedBoxConfig() {
    return {
      apiKey: this.apiKey,
      organizationId: this.organizationId,
      enabled: true,
      testMode: true // دائماً في وضع الاختبار حتى نحل مشكلة المصادقة
    };
  }

  // إنشاء شحنة جديدة (محاكاة)
  async createShipment(orderData) {
    try {
      console.log('📦 Creating RedBox shipment for order:', orderData.orderNumber);
      
      // في وضع الاختبار، نرجع بيانات وهمية
      const trackingNumber = `RB${Date.now()}${Math.floor(Math.random() * 1000)}`;
      
      // محاولة الاتصال بـ API الحقيقي (اختياري)
      let realApiResult = null;
      try {
        const shipmentData = {
          organization_id: this.organizationId,
          sender: {
            name: 'أبعاد التواصل',
            phone: '+966920000000',
            city: 'الرياض',
            address: 'الرياض، المملكة العربية السعودية'
          },
          receiver: {
            name: orderData.shippingAddress.name,
            phone: orderData.shippingAddress.phone,
            city: orderData.shippingAddress.city,
            address: `${orderData.shippingAddress.district || ''} ${orderData.shippingAddress.street || ''} ${orderData.shippingAddress.building || ''}`.trim()
          },
          shipment: {
            reference: orderData.orderNumber,
            description: `طلب من أبعاد التواصل - ${orderData.items.length} منتج`,
            weight: this.calculateWeight(orderData.items),
            value: orderData.subtotal,
            cod_amount: orderData.paymentMethod === 'cod' ? orderData.total : 0,
            service_type: 'standard'
          }
        };

        console.log('🔄 Attempting real API call...');
        const response = await axios.post(`${this.baseURL}/shipments`, shipmentData, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            'X-Organization-ID': this.organizationId
          },
          timeout: 10000
        });

        realApiResult = response.data;
        console.log('✅ Real API call successful!');

      } catch (apiError) {
        console.log('⚠️  Real API call failed, using mock data:', apiError.message);
      }

      // إرجاع النتيجة (حقيقية أو وهمية)
      return {
        success: true,
        trackingNumber: realApiResult?.tracking_number || trackingNumber,
        shipmentId: realApiResult?.shipment_id || `mock_${trackingNumber}`,
        estimatedDelivery: realApiResult?.estimated_delivery || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        cost: realApiResult?.shipping_cost || this.calculateDefaultCost(orderData.shippingAddress.city),
        isTest: !realApiResult,
        apiResponse: realApiResult
      };

    } catch (error) {
      console.error('❌ RedBox shipment creation failed:', error.message);
      throw error;
    }
  }

  // تتبع الشحنة
  async trackShipment(trackingNumber) {
    try {
      console.log('🔍 Tracking RedBox shipment:', trackingNumber);

      // محاولة الاتصال بـ API الحقيقي
      try {
        const response = await axios.get(`${this.baseURL}/shipments/${trackingNumber}/track`, {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'X-Organization-ID': this.organizationId
          },
          timeout: 10000
        });

        return {
          success: true,
          status: response.data.status,
          location: response.data.current_location,
          estimatedDelivery: response.data.estimated_delivery,
          history: response.data.tracking_history
        };

      } catch (apiError) {
        console.log('⚠️  Real tracking API failed, using mock data:', apiError.message);
      }

      // بيانات وهمية للاختبار
      return {
        success: true,
        status: 'in_transit',
        location: 'مركز التوزيع - الرياض',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        history: [
          {
            status: 'created',
            location: 'أبعاد التواصل - الرياض',
            date: new Date(Date.now() - 24 * 60 * 60 * 1000),
            note: 'تم إنشاء الشحنة'
          },
          {
            status: 'picked_up',
            location: 'أبعاد التواصل - الرياض',
            date: new Date(Date.now() - 12 * 60 * 60 * 1000),
            note: 'تم استلام الشحنة'
          },
          {
            status: 'in_transit',
            location: 'مركز التوزيع - الرياض',
            date: new Date(),
            note: 'الشحنة في الطريق'
          }
        ],
        isTest: true
      };

    } catch (error) {
      console.error('❌ RedBox tracking failed:', error.message);
      throw error;
    }
  }

  // حساب تكلفة الشحن
  async calculateShippingCost(city, weight = 1) {
    const cost = this.calculateDefaultCost(city);
    return {
      success: true,
      cost,
      estimatedDays: city === 'الرياض' ? 1 : 3,
      isDefault: true
    };
  }

  // حساب التكلفة الافتراضية
  calculateDefaultCost(city) {
    const defaultCosts = {
      'الرياض': 25,
      'جدة': 35,
      'الدمام': 40,
      'مكة': 35,
      'المدينة': 40,
      'الطائف': 35,
      'الخبر': 40,
      'القطيف': 40
    };
    return defaultCosts[city] || 45;
  }

  // حساب الوزن التقريبي
  calculateWeight(items) {
    const defaultWeight = 0.5; // كيلو
    return items.reduce((total, item) => total + (defaultWeight * item.quantity), 0);
  }

  // إلغاء الشحنة
  async cancelShipment(trackingNumber) {
    console.log('🚫 Cancelling RedBox shipment:', trackingNumber);
    return {
      success: true,
      message: 'تم إلغاء الشحنة بنجاح (محاكاة)'
    };
  }
}

export default new RedBoxServiceSimple();