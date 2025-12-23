import ShippingProvider from '../models/ShippingProvider.js';
import ShippingRate from '../models/ShippingRate.js';
import Shipment from '../models/Shipment.js';

// @desc    Get all shipping providers
// @route   GET /api/shipping/providers
// @access  Public
export const getShippingProviders = async (req, res) => {
  try {
    const providers = await ShippingProvider.find({ enabled: true });
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error getting shipping providers:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب شركات الشحن'
    });
  }
};

// @desc    Get all shipping providers (Admin)
// @route   GET /api/shipping/providers/all
// @access  Private/Admin
export const getAllShippingProviders = async (req, res) => {
  try {
    const providers = await ShippingProvider.find();
    
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    console.error('Error getting all shipping providers:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب شركات الشحن'
    });
  }
};

// @desc    Update shipping provider
// @route   PUT /api/shipping/providers/:id
// @access  Private/Admin
export const updateShippingProvider = async (req, res) => {
  try {
    const { displayName, enabled, apiKey, apiSecret, apiUrl, testMode, settings } = req.body;
    
    const provider = await ShippingProvider.findByIdAndUpdate(
      req.params.id,
      {
        displayName,
        enabled,
        apiKey,
        apiSecret,
        apiUrl,
        testMode,
        settings
      },
      { new: true, runValidators: true }
    );
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'شركة الشحن غير موجودة'
      });
    }
    
    res.json({
      success: true,
      data: provider,
      message: 'تم تحديث شركة الشحن بنجاح'
    });
  } catch (error) {
    console.error('Error updating shipping provider:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث شركة الشحن'
    });
  }
};

// @desc    Get all shipping rates (Admin)
// @route   GET /api/shipping/rates/all
// @access  Private/Admin
export const getAllShippingRates = async (req, res) => {
  try {
    const rates = await ShippingRate.find()
      .populate('providerId', 'name displayName enabled')
      .sort({ city: 1, providerId: 1 });
    
    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Error getting all shipping rates:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب أسعار الشحن'
    });
  }
};

// @desc    Create shipping rate
// @route   POST /api/shipping/rates
// @access  Private/Admin
export const createShippingRate = async (req, res) => {
  try {
    const { providerId, city, price, estimatedDays } = req.body;
    
    if (!providerId || !city || !price || !estimatedDays) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }
    
    // Check if rate already exists
    const existingRate = await ShippingRate.findOne({ providerId, city });
    if (existingRate) {
      return res.status(400).json({
        success: false,
        message: 'يوجد سعر بالفعل لهذه المدينة وشركة الشحن'
      });
    }
    
    const rate = await ShippingRate.create({
      providerId,
      city,
      price: parseFloat(price),
      estimatedDays: parseInt(estimatedDays)
    });
    
    await rate.populate('providerId', 'name displayName enabled');
    
    res.status(201).json({
      success: true,
      data: rate,
      message: 'تم إنشاء سعر الشحن بنجاح'
    });
  } catch (error) {
    console.error('Error creating shipping rate:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء سعر الشحن'
    });
  }
};

// @desc    Update shipping rate
// @route   PUT /api/shipping/rates/:id
// @access  Private/Admin
export const updateShippingRate = async (req, res) => {
  try {
    const { price, estimatedDays } = req.body;
    
    const rate = await ShippingRate.findByIdAndUpdate(
      req.params.id,
      {
        price: parseFloat(price),
        estimatedDays: parseInt(estimatedDays)
      },
      { new: true, runValidators: true }
    ).populate('providerId', 'name displayName enabled');
    
    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'سعر الشحن غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: rate,
      message: 'تم تحديث سعر الشحن بنجاح'
    });
  } catch (error) {
    console.error('Error updating shipping rate:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث سعر الشحن'
    });
  }
};

// @desc    Delete shipping rate
// @route   DELETE /api/shipping/rates/:id
// @access  Private/Admin
export const deleteShippingRate = async (req, res) => {
  try {
    const rate = await ShippingRate.findByIdAndDelete(req.params.id);
    
    if (!rate) {
      return res.status(404).json({
        success: false,
        message: 'سعر الشحن غير موجود'
      });
    }
    
    res.json({
      success: true,
      message: 'تم حذف سعر الشحن بنجاح'
    });
  } catch (error) {
    console.error('Error deleting shipping rate:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف سعر الشحن'
    });
  }
};

// @desc    Get shipping rates for a city
// @route   GET /api/shipping/rates/:city
// @access  Public
export const getShippingRates = async (req, res) => {
  try {
    const { city } = req.params;
    
    // جلب جميع شركات الشحن المفعلة
    const enabledProviders = await ShippingProvider.find({ enabled: true });
    
    if (enabledProviders.length === 0) {
      return res.json({
        success: true,
        data: []
      });
    }
    
    const rates = [];
    
    for (const provider of enabledProviders) {
      // استخدام السعر من إعدادات الشركة مباشرة
      const defaultPrice = provider.settings?.defaultPrice || 30;
      rates.push({
        _id: `settings_${provider._id}`, // معرف من الإعدادات
        providerId: {
          _id: provider._id,
          name: provider.name,
          displayName: provider.displayName,
          enabled: provider.enabled
        },
        city: city,
        price: defaultPrice,
        estimatedDays: 2, // افتراضي
        source: 'settings_price'
      });
    }
    
    res.json({
      success: true,
      data: rates
    });
  } catch (error) {
    console.error('Error getting shipping rates:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب أسعار الشحن'
    });
  }
};

// @desc    Calculate shipping cost
// @route   POST /api/shipping/calculate
// @access  Public
export const calculateShipping = async (req, res) => {
  try {
    const { city, providerId, weight } = req.body;
    
    if (!city || !providerId) {
      return res.status(400).json({
        success: false,
        message: 'المدينة وشركة الشحن مطلوبة'
      });
    }
    
    // Get provider
    const provider = await ShippingProvider.findById(providerId);
    if (!provider || !provider.enabled) {
      return res.status(404).json({
        success: false,
        message: 'شركة الشحن غير متاحة'
      });
    }
    
    // استخدام السعر من إعدادات الشركة مباشرة
    const cost = provider.settings?.defaultPrice || 30; // 30 ريال افتراضي
    const estimatedDays = 2; // يومين افتراضي
    
    console.log(`📦 استخدام السعر من الإعدادات لـ ${provider.displayName} في ${city}: ${cost} ر.س`);
    
    // Add weight-based cost if needed
    let finalCost = cost;
    if (weight && weight > 5) {
      const extraWeight = weight - 5;
      finalCost += extraWeight * 2; // 2 SAR per extra kg
    }
    
    res.json({
      success: true,
      data: {
        provider: {
          id: provider._id,
          name: provider.displayName
        },
        city,
        cost: finalCost,
        estimatedDays,
        weight,
        source: 'settings_price' // دائماً من الإعدادات
      }
    });
  } catch (error) {
    console.error('Error calculating shipping:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حساب تكلفة الشحن'
    });
  }
};

// @desc    Create shipment
// @route   POST /api/shipping/shipments
// @access  Private/Admin
export const createShipment = async (req, res) => {
  try {
    const { orderId, providerId, shippingCost, estimatedDelivery } = req.body;
    
    if (!orderId || !providerId || !shippingCost) {
      return res.status(400).json({
        success: false,
        message: 'جميع الحقول مطلوبة'
      });
    }
    
    // Check if shipment already exists for this order
    const existingShipment = await Shipment.findOne({ orderId });
    if (existingShipment) {
      return res.status(400).json({
        success: false,
        message: 'يوجد شحنة بالفعل لهذا الطلب'
      });
    }
    
    const shipment = await Shipment.create({
      orderId,
      providerId,
      shippingCost,
      estimatedDelivery,
      status: 'pending'
    });
    
    res.status(201).json({
      success: true,
      data: shipment,
      message: 'تم إنشاء الشحنة بنجاح'
    });
  } catch (error) {
    console.error('Error creating shipment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء الشحنة'
    });
  }
};

// @desc    Get shipment by order ID
// @route   GET /api/shipping/shipments/order/:orderId
// @access  Private
export const getShipmentByOrder = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ orderId: req.params.orderId })
      .populate('providerId', 'name displayName')
      .populate('orderId');
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'الشحنة غير موجودة'
      });
    }
    
    res.json({
      success: true,
      data: shipment
    });
  } catch (error) {
    console.error('Error getting shipment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الشحنة'
    });
  }
};

// @desc    Track shipment
// @route   GET /api/shipping/track/:trackingNumber
// @access  Public
export const trackShipment = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    const shipment = await Shipment.findOne({ trackingNumber })
      .populate('providerId', 'name displayName')
      .populate('orderId');
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'رقم التتبع غير صحيح'
      });
    }
    
    res.json({
      success: true,
      data: {
        trackingNumber: shipment.trackingNumber,
        status: shipment.status,
        provider: shipment.providerId.displayName,
        estimatedDelivery: shipment.estimatedDelivery,
        actualDelivery: shipment.actualDelivery,
        createdAt: shipment.createdAt
      }
    });
  } catch (error) {
    console.error('Error tracking shipment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تتبع الشحنة'
    });
  }
};

// @desc    Update shipment status
// @route   PUT /api/shipping/shipments/:id/status
// @access  Private/Admin
export const updateShipmentStatus = async (req, res) => {
  try {
    const { status, trackingNumber, actualDelivery } = req.body;
    
    const updateData = { status };
    
    if (trackingNumber) {
      updateData.trackingNumber = trackingNumber;
    }
    
    if (actualDelivery) {
      updateData.actualDelivery = actualDelivery;
    }
    
    const shipment = await Shipment.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('providerId', 'name displayName');
    
    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'الشحنة غير موجودة'
      });
    }
    
    res.json({
      success: true,
      data: shipment,
      message: 'تم تحديث حالة الشحنة بنجاح'
    });
  } catch (error) {
    console.error('Error updating shipment status:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث حالة الشحنة'
    });
  }
};

// @desc    Get all cities with shipping
// @route   GET /api/shipping/cities
// @access  Public
export const getShippingCities = async (req, res) => {
  try {
    const cities = await ShippingRate.distinct('city');
    
    res.json({
      success: true,
      data: cities
    });
  } catch (error) {
    console.error('Error getting cities:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المدن'
    });
  }
};

// @desc    Cancel shipment
// @route   POST /api/shipping/shipments/:id/cancel
// @access  Private/Admin
export const cancelShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findById(req.params.id)
      .populate('providerId');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'الشحنة غير موجودة'
      });
    }

    // إلغاء الشحنة مع شركة الشحن
    if (shipment.providerId.name === 'redbox' && shipment.trackingNumber) {
      const redboxService = await import('../services/redboxService.js');
      await redboxService.default.cancelShipment(shipment.trackingNumber);
    }

    // تحديث حالة الشحنة
    shipment.status = 'cancelled';
    await shipment.save();

    res.json({
      success: true,
      message: 'تم إلغاء الشحنة بنجاح'
    });

  } catch (error) {
    console.error('Error cancelling shipment:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إلغاء الشحنة',
      error: error.message
    });
  }
};

// @desc    Update shipment address
// @route   PUT /api/shipping/shipments/:id/address
// @access  Private/Admin
export const updateShipmentAddress = async (req, res) => {
  try {
    const { address } = req.body;
    const shipment = await Shipment.findById(req.params.id)
      .populate('providerId')
      .populate('orderId');

    if (!shipment) {
      return res.status(404).json({
        success: false,
        message: 'الشحنة غير موجودة'
      });
    }

    // تحديث العنوان مع شركة الشحن
    if (shipment.providerId.name === 'redbox' && shipment.trackingNumber) {
      const redboxService = await import('../services/redboxService.js');
      await redboxService.default.updateShipmentAddress(shipment.trackingNumber, address);
    }

    // تحديث عنوان الطلب
    const order = await Order.findById(shipment.orderId);
    if (order) {
      order.shippingAddress = { ...order.shippingAddress, ...address };
      await order.save();
    }

    res.json({
      success: true,
      message: 'تم تحديث العنوان بنجاح'
    });

  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث العنوان',
      error: error.message
    });
  }
};

// @desc    Get shipping reports
// @route   GET /api/shipping/reports
// @access  Private/Admin
export const getShippingReports = async (req, res) => {
  try {
    const { startDate, endDate, provider } = req.query;

    // تقرير أساسي من قاعدة البيانات
    const matchQuery = {};
    
    if (startDate && endDate) {
      matchQuery.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (provider) {
      const shippingProvider = await ShippingProvider.findOne({ name: provider });
      if (shippingProvider) {
        matchQuery.providerId = shippingProvider._id;
      }
    }

    const shipments = await Shipment.find(matchQuery)
      .populate('providerId', 'name displayName')
      .populate('orderId', 'orderNumber total')
      .sort({ createdAt: -1 });

    // إحصائيات
    const stats = {
      totalShipments: shipments.length,
      totalCost: shipments.reduce((sum, s) => sum + s.shippingCost, 0),
      statusBreakdown: {},
      providerBreakdown: {}
    };

    shipments.forEach(shipment => {
      // إحصائيات الحالة
      stats.statusBreakdown[shipment.status] = 
        (stats.statusBreakdown[shipment.status] || 0) + 1;

      // إحصائيات المزود
      const providerName = shipment.providerId?.displayName || 'غير محدد';
      stats.providerBreakdown[providerName] = 
        (stats.providerBreakdown[providerName] || 0) + 1;
    });

    // جلب تقرير من RedBox إذا كان مطلوب
    let redboxReport = null;
    if (provider === 'redbox' && startDate && endDate) {
      try {
        const redboxService = await import('../services/redboxService.js');
        redboxReport = await redboxService.default.getShipmentsReport(startDate, endDate);
      } catch (error) {
        console.log('Could not fetch RedBox report:', error.message);
      }
    }

    res.json({
      success: true,
      data: {
        shipments,
        stats,
        redboxReport: redboxReport?.data || null
      }
    });

  } catch (error) {
    console.error('Error getting reports:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التقارير',
      error: error.message
    });
  }
};
