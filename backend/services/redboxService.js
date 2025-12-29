import axios from 'axios';
import crypto from 'crypto';
import ShippingProvider from '../models/ShippingProvider.js';

class RedBoxService {
  constructor() {
    this.baseURL = process.env.REDBOX_API_URL || 'https://api.redboxsa.com/v1';
    this.organizationId = process.env.REDBOX_ORGANIZATION_ID;
    this.apiKey = process.env.REDBOX_API_KEY;
  }

  // إنشاء headers للمصادقة مع RedBox
  createAuthHeaders(method = 'GET', path = '/', body = null) {
    const timestamp = new Date().toISOString();
    
    // للتطوير، نستخدم JWT مباشرة
    if (process.env.NODE_ENV === 'development') {
      return {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Organization-ID': this.organizationId,
        'X-Timestamp': timestamp
      };
    }

    // للإنتاج، يمكن إضافة AWS Signature V4 هنا لاحقاً
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Organization-ID': this.organizationId
    };
  }

  // الحصول على إعدادات RedBox
  async getRedBoxConfig() {
    // استخدام المفاتيح من متغيرات البيئة أولاً
    if (this.apiKey && this.organizationId) {
      return {
        apiKey: this.apiKey,
        organizationId: this.organizationId,
        enabled: true,
        testMode: process.env.NODE_ENV === 'development'
      };
    }

    // إذا لم تكن متوفرة، جلبها من قاعدة البيانات
    const provider = await ShippingProvider.findOne({ name: 'redbox' });
    if (!provider || !provider.enabled) {
      throw new Error('RedBox غير مُفعل - تحقق من الإعدادات');
    }
    return provider;
  }

  // إنشاء شحنة جديدة
  async createShipment(orderData) {
    try {
      const config = await this.getRedBoxConfig();
      
      const shipmentData = {
        // بيانات المرسل (المتجر)
        sender: {
          name: 'جيم روم',
          phone: '+966920000000',
          city: 'الرياض',
          address: 'الرياض، المملكة العربية السعودية'
        },
        
        // بيانات المستلم
        receiver: {
          name: orderData.shippingAddress.name,
          phone: orderData.shippingAddress.phone,
          city: orderData.shippingAddress.city,
          address: `${orderData.shippingAddress.district || ''} ${orderData.shippingAddress.street || ''} ${orderData.shippingAddress.building || ''}`.trim()
        },
        
        // بيانات الشحنة
        shipment: {
          reference: orderData.orderNumber,
          description: `طلب من جيم روم - ${orderData.items.length} منتج`,
          weight: this.calculateWeight(orderData.items),
          value: orderData.subtotal,
          cod_amount: orderData.paymentMethod === 'cod' ? orderData.total : 0,
          service_type: 'standard' // أو 'express'
        }
      };

      const response = await axios.post(`${this.baseURL}/shipments`, shipmentData, {
        headers: this.createAuthHeaders('POST', '/shipments', shipmentData),
        timeout: 30000 // 30 ثانية
      });

      return {
        success: true,
        trackingNumber: response.data.tracking_number,
        shipmentId: response.data.shipment_id,
        estimatedDelivery: response.data.estimated_delivery,
        cost: response.data.shipping_cost
      };

    } catch (error) {
      console.error('RedBox API Error:', error.response?.data || error.message);
      
      // في حالة فشل API، نرجع بيانات وهمية للاختبار
      if (config?.testMode) {
        return {
          success: true,
          trackingNumber: `RB${Date.now()}`,
          shipmentId: `test_${Date.now()}`,
          estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 أيام
          cost: orderData.shippingCost || 30,
          isTest: true
        };
      }
      
      throw error;
    }
  }

  // تتبع الشحنة
  async trackShipment(trackingNumber) {
    try {
      const config = await this.getRedBoxConfig();
      
      const response = await axios.get(`${this.baseURL}/shipments/${trackingNumber}/track`, {
        headers: {
          'Authorization': config.apiKey,
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: true,
        status: response.data.status,
        location: response.data.current_location,
        estimatedDelivery: response.data.estimated_delivery,
        history: response.data.tracking_history
      };

    } catch (error) {
      console.error('RedBox Tracking Error:', error.response?.data || error.message);
      
      // في حالة فشل API، نرجع بيانات وهمية للاختبار
      if (config?.testMode) {
        return {
          success: true,
          status: 'in_transit',
          location: 'مركز التوزيع - الرياض',
          estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          history: [
            {
              status: 'picked_up',
              location: 'جيم روم - الرياض',
              date: new Date(Date.now() - 24 * 60 * 60 * 1000)
            },
            {
              status: 'in_transit',
              location: 'مركز التوزيع - الرياض',
              date: new Date()
            }
          ],
          isTest: true
        };
      }
      
      throw error;
    }
  }

  // حساب الوزن التقريبي
  calculateWeight(items) {
    // وزن افتراضي لكل منتج (يمكن تحسينه لاحقاً)
    const defaultWeight = 0.5; // كيلو
    return items.reduce((total, item) => total + (defaultWeight * item.quantity), 0);
  }

  // حساب تكلفة الشحن
  async calculateShippingCost(city, weight = 1) {
    try {
      const config = await this.getRedBoxConfig();
      
      const response = await axios.post(`${this.baseURL}/calculate`, {
        origin_city: 'الرياض',
        destination_city: city,
        weight: weight,
        service_type: 'standard'
      }, {
        headers: {
          'Authorization': config.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: true,
        cost: response.data.cost,
        estimatedDays: response.data.estimated_days
      };

    } catch (error) {
      console.error('RedBox Calculate Error:', error.response?.data || error.message);
      
      // في حالة فشل API، نرجع تكلفة افتراضية
      const defaultCosts = {
        'الرياض': 25,
        'جدة': 35,
        'الدمام': 40,
        'مكة': 35,
        'المدينة': 40
      };
      
      return {
        success: true,
        cost: defaultCosts[city] || 45,
        estimatedDays: city === 'الرياض' ? 1 : 3,
        isDefault: true
      };
    }
  }

  // إلغاء الشحنة
  async cancelShipment(trackingNumber) {
    try {
      const config = await this.getRedBoxConfig();
      
      const response = await axios.post(`${this.baseURL}/shipments/${trackingNumber}/cancel`, {}, {
        headers: {
          'Authorization': config.apiKey,
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: true,
        message: response.data.message || 'تم إلغاء الشحنة بنجاح'
      };

    } catch (error) {
      console.error('RedBox Cancel Error:', error.response?.data || error.message);
      throw new Error('فشل في إلغاء الشحنة');
    }
  }

  // تحديث عنوان الشحنة
  async updateShipmentAddress(trackingNumber, newAddress) {
    try {
      const config = await this.getRedBoxConfig();
      
      const response = await axios.put(`${this.baseURL}/shipments/${trackingNumber}/address`, {
        receiver: {
          name: newAddress.name,
          phone: newAddress.phone,
          city: newAddress.city,
          address: `${newAddress.district || ''} ${newAddress.street || ''} ${newAddress.building || ''}`.trim()
        }
      }, {
        headers: {
          'Authorization': config.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: true,
        message: 'تم تحديث العنوان بنجاح'
      };

    } catch (error) {
      console.error('RedBox Update Address Error:', error.response?.data || error.message);
      throw new Error('فشل في تحديث العنوان');
    }
  }

  // جدولة إعادة التسليم
  async rescheduleDelivery(trackingNumber, newDate) {
    try {
      const config = await this.getRedBoxConfig();
      
      const response = await axios.post(`${this.baseURL}/shipments/${trackingNumber}/reschedule`, {
        delivery_date: newDate
      }, {
        headers: {
          'Authorization': config.apiKey,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 15000
      });

      return {
        success: true,
        newDeliveryDate: response.data.delivery_date,
        message: 'تم جدولة إعادة التسليم بنجاح'
      };

    } catch (error) {
      console.error('RedBox Reschedule Error:', error.response?.data || error.message);
      throw new Error('فشل في جدولة إعادة التسليم');
    }
  }

  // الحصول على تقرير الشحنات
  async getShipmentsReport(startDate, endDate) {
    try {
      const config = await this.getRedBoxConfig();
      
      const response = await axios.get(`${this.baseURL}/reports/shipments`, {
        params: {
          start_date: startDate,
          end_date: endDate
        },
        headers: {
          'Authorization': config.apiKey,
          'Accept': 'application/json'
        },
        timeout: 30000
      });

      return {
        success: true,
        data: response.data
      };

    } catch (error) {
      console.error('RedBox Report Error:', error.response?.data || error.message);
      throw new Error('فشل في جلب التقرير');
    }
  }
}

export default new RedBoxService();