import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Shipment from '../models/Shipment.js';
import redboxService from '../services/redboxServiceProduction.js';

// إنشاء طلب جديد مع تكامل الشحن
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes, shippingCost, shippingProvider } = req.body;

    console.log('🛒 إنشاء طلب جديد:', {
      userId: req.user._id,
      itemsCount: items.length,
      paymentMethod,
      shippingProvider
    });

    // التحقق من المنتجات وحساب الإجمالي
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ 
          success: false,
          message: `المنتج ${item.product} غير موجود` 
        });
      }
      
      if (product.stock < item.quantity) {
        return res.status(400).json({ 
          success: false,
          message: `المخزون غير كافي للمنتج ${product.name?.ar || product.nameAr}` 
        });
      }

      // حساب السعر مع الخيارات
      let itemPrice = product.price;
      let selectedOptions = {};

      // إضافة خيارات المنتج إذا كانت موجودة
      if (item.selectedOptions) {
        // خيار اللون
        if (item.selectedOptions.color) {
          selectedOptions.color = {
            name: item.selectedOptions.color.name,
            nameAr: item.selectedOptions.color.nameAr,
            value: item.selectedOptions.color.value,
            price: item.selectedOptions.color.price || 0
          };
          itemPrice += selectedOptions.color.price;
        }

        // خيار السعة
        if (item.selectedOptions.storage) {
          selectedOptions.storage = {
            name: item.selectedOptions.storage.name,
            nameAr: item.selectedOptions.storage.nameAr,
            value: item.selectedOptions.storage.value,
            price: item.selectedOptions.storage.price || 0
          };
          itemPrice += selectedOptions.storage.price;
        }

        // خيارات أخرى
        if (item.selectedOptions.other && Array.isArray(item.selectedOptions.other)) {
          selectedOptions.other = item.selectedOptions.other.map(opt => ({
            name: opt.name,
            nameAr: opt.nameAr,
            value: opt.value,
            price: opt.price || 0
          }));
          selectedOptions.other.forEach(opt => {
            itemPrice += opt.price;
          });
        }
      } else {
        // دعم الطريقة القديمة للتوافق مع البيانات الموجودة
        if (item.selectedColor) {
          const colorOption = product.colors?.find(c => 
            c.name === item.selectedColor || c.nameAr === item.selectedColor
          );
          selectedOptions.color = {
            name: colorOption?.name || item.selectedColor,
            nameAr: colorOption?.nameAr || item.selectedColor,
            value: colorOption?.value || item.selectedColor,
            price: colorOption?.price || 0
          };
          itemPrice += selectedOptions.color.price;
        }

        if (item.selectedStorage) {
          const storageOption = product.storage?.find(s => 
            s.name === item.selectedStorage || s.nameAr === item.selectedStorage
          );
          selectedOptions.storage = {
            name: storageOption?.name || item.selectedStorage,
            nameAr: storageOption?.nameAr || item.selectedStorage,
            value: storageOption?.value || item.selectedStorage,
            price: storageOption?.price || 0
          };
          itemPrice += selectedOptions.storage.price;
        }
      }

      subtotal += itemPrice * item.quantity;
      orderItems.push({
        product: product._id,
        name: product.name?.ar || product.nameAr || product.name,
        price: itemPrice, // السعر مع الخيارات
        quantity: item.quantity,
        image: product.images?.[0],
        selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined
      });

      // تحديث المخزون للدفع عند الاستلام فقط
      if (paymentMethod === 'cod') {
        product.stock = Math.max(0, product.stock - item.quantity);
        product.sales = (product.sales || 0) + item.quantity;
        await product.save();
      }
    }

    const finalShippingCost = shippingCost || 30;
    const tax = subtotal * 0.15; // ضريبة القيمة المضافة 15%
    const total = subtotal + finalShippingCost + tax;

    // إنشاء رقم الطلب
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

    // تنسيق عنوان الشحن
    const formattedAddress = {
      name: shippingAddress.fullName || shippingAddress.name,
      phone: shippingAddress.phone,
      city: shippingAddress.city,
      district: shippingAddress.district,
      street: shippingAddress.street,
      building: shippingAddress.building
    };

    // إنشاء الطلب
    const order = new Order({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      shippingAddress: formattedAddress,
      paymentMethod,
      notes,
      subtotal,
      shippingCost: finalShippingCost,
      tax,
      total,
      shippingCompany: shippingProvider || 'redbox',
      statusHistory: [{
        status: 'pending',
        note: 'تم إنشاء الطلب',
        date: new Date()
      }]
    });

    await order.save();
    console.log('✅ تم حفظ الطلب:', orderNumber);

    // إنشاء شحنة مع RedBox (للدفع عند الاستلام فقط)
    if (paymentMethod === 'cod' && shippingProvider === 'redbox') {
      try {
        console.log('📦 إنشاء شحنة مع RedBox...');
        
        const shipmentResult = await redboxService.createShipment({
          orderNumber: order.orderNumber,
          shippingAddress: formattedAddress,
          items: orderItems,
          subtotal,
          total,
          paymentMethod
        });

        if (shipmentResult.success) {
          // حفظ معلومات الشحنة
          const shipment = new Shipment({
            orderId: order._id,
            providerId: null, // سيتم ربطه لاحقاً
            trackingNumber: shipmentResult.trackingNumber,
            shippingCost: shipmentResult.cost,
            estimatedDelivery: shipmentResult.estimatedDelivery,
            status: 'created'
          });

          await shipment.save();

          // تحديث الطلب برقم التتبع
          order.trackingNumber = shipmentResult.trackingNumber;
          order.orderStatus = 'confirmed';
          order.statusHistory.push({
            status: 'confirmed',
            note: `تم إنشاء شحنة مع RedBox - رقم التتبع: ${shipmentResult.trackingNumber}`,
            date: new Date()
          });
          
          await order.save();
          
          console.log('✅ تم إنشاء شحنة RedBox:', shipmentResult.trackingNumber);
        }
      } catch (shipmentError) {
        console.error('❌ خطأ في إنشاء شحنة RedBox:', shipmentError.message);
        // الطلب يبقى موجود حتى لو فشلت الشحنة
      }
    }

    res.status(201).json({ 
      success: true, 
      order,
      message: 'تم إنشاء الطلب بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في إنشاء الطلب:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطأ في إنشاء الطلب',
      error: error.message 
    });
  }
};

// تحديث حالة الدفع
export const updatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'الطلب غير موجود' 
      });
    }

    // تحديث حالة الدفع
    order.paymentStatus = paymentStatus;
    
    // إضافة سجل في تاريخ الحالة
    order.statusHistory.push({
      status: order.orderStatus,
      note: `تم تحديث حالة الدفع إلى ${paymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}`,
      date: new Date()
    });

    await order.save();

    res.json({ 
      success: true, 
      order,
      message: 'تم تحديث حالة الدفع بنجاح'
    });

  } catch (error) {
    console.error('خطأ في تحديث حالة الدفع:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطأ في تحديث حالة الدفع',
      error: error.message 
    });
  }
};

// تحديث حالة الطلب مع إشعار شركة الشحن
export const updateOrderStatus = async (req, res) => {
  try {
    const { status, note, trackingNumber } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'الطلب غير موجود' 
      });
    }

    // تحديث حالة الطلب
    order.orderStatus = status;
    
    if (trackingNumber) {
      order.trackingNumber = trackingNumber;
    }

    order.statusHistory.push({
      status,
      note: note || `تم تحديث حالة الطلب إلى ${status}`,
      date: new Date()
    });

    await order.save();

    // إذا كانت الحالة "shipped"، أنشئ شحنة إذا لم تكن موجودة
    if (status === 'shipped' && !order.trackingNumber && order.shippingCompany === 'redbox') {
      try {
        const shipmentResult = await redboxService.createShipment({
          orderNumber: order.orderNumber,
          shippingAddress: order.shippingAddress,
          items: order.items,
          subtotal: order.subtotal,
          total: order.total,
          paymentMethod: order.paymentMethod
        });

        if (shipmentResult.success) {
          order.trackingNumber = shipmentResult.trackingNumber;
          await order.save();
          
          console.log('✅ تم إنشاء شحنة متأخرة:', shipmentResult.trackingNumber);
        }
      } catch (shipmentError) {
        console.error('❌ خطأ في إنشاء شحنة متأخرة:', shipmentError.message);
      }
    }

    res.json({ 
      success: true, 
      order,
      message: 'تم تحديث حالة الطلب بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في تحديث الطلب:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطأ في تحديث الطلب',
      error: error.message 
    });
  }
};

// جلب تفاصيل الطلب
export const getOrderById = async (req, res) => {
  try {
    let order = await Order.findById(req.params.id)
      .populate('user', 'name nameAr email phone');

    if (!order) {
      return res.status(404).json({ 
        success: false,
        message: 'الطلب غير موجود' 
      });
    }

    // تحويل إلى object عادي للتعديل
    order = order.toObject();

    // جلب تفاصيل المنتجات يدوياً
    for (let i = 0; i < order.items.length; i++) {
      const item = order.items[i];
      if (item.product) {
        try {
          const product = await Product.findById(item.product);
          if (product) {
            order.items[i].product = product.toObject();
          }
        } catch (productError) {
          console.log('Product not found:', item.product);
        }
      }
    }

    // التحقق من صلاحية الوصول
    const userId = req.user._id || req.user.userId;
    const isAdmin = req.user.role?.toUpperCase() === 'ADMIN';
    
    if (!isAdmin && order.user._id.toString() !== userId.toString()) {
      return res.status(403).json({ 
        success: false,
        message: 'غير مصرح لك بالوصول لهذا الطلب' 
      });
    }

    // إضافة تفاصيل الخيارات المحددة
    order.items = order.items.map(item => ({
      ...item,
      optionsDisplay: {
        color: item.selectedOptions?.color ? {
          name: item.selectedOptions.color.nameAr || item.selectedOptions.color.name,
          value: item.selectedOptions.color.value,
          price: item.selectedOptions.color.price
        } : null,
        storage: item.selectedOptions?.storage ? {
          name: item.selectedOptions.storage.nameAr || item.selectedOptions.storage.name,
          value: item.selectedOptions.storage.value,
          price: item.selectedOptions.storage.price
        } : null,
        other: item.selectedOptions?.other?.map(opt => ({
          name: opt.nameAr || opt.name,
          value: opt.value,
          price: opt.price
        })) || []
      }
    }));

    res.json({ 
      success: true, 
      order: order 
    });

  } catch (error) {
    console.error('❌ خطأ في جلب تفاصيل الطلب:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطأ في جلب تفاصيل الطلب',
      error: error.message 
    });
  }
};

// جلب جميع الطلبات (للإدارة)
export const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    // بناء الاستعلام
    let query = {};
    
    if (status && status !== 'all') {
      query.orderStatus = status;
    }
    
    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'shippingAddress.name': { $regex: search, $options: 'i' } },
        { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
      ];
    }

    // استبعاد الطلبات المعلقة الدفع إلا إذا طُلبت صراحة
    if (!status) {
      query.$or = [
        { paymentStatus: { $ne: 'pending' } },
        { paymentMethod: 'cod' }
      ];
    }

    const orders = await Order.find(query)
      .populate('user', 'name email phone')
      .populate('items.product', 'name nameAr images')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    // تنسيق البيانات
    const formattedOrders = orders.map(order => ({
      ...order.toObject(),
      items: order.items.map(item => ({
        ...item,
        optionsDisplay: {
          color: item.selectedOptions?.color ? {
            name: item.selectedOptions.color.nameAr || item.selectedOptions.color.name,
            value: item.selectedOptions.color.value
          } : null,
          storage: item.selectedOptions?.storage ? {
            name: item.selectedOptions.storage.nameAr || item.selectedOptions.storage.name,
            value: item.selectedOptions.storage.value
          } : null
        }
      }))
    }));

    res.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب الطلبات:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطأ في جلب الطلبات',
      error: error.message 
    });
  }
};

// تتبع الشحنة
export const trackOrder = async (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    if (!trackingNumber) {
      return res.status(400).json({
        success: false,
        message: 'رقم التتبع مطلوب'
      });
    }

    // البحث عن الطلب
    const order = await Order.findOne({ trackingNumber });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'رقم التتبع غير صحيح'
      });
    }

    // تتبع الشحنة مع RedBox
    if (order.shippingCompany === 'redbox') {
      try {
        const trackingResult = await redboxService.trackShipment(trackingNumber);
        
        return res.json({
          success: true,
          data: {
            orderNumber: order.orderNumber,
            trackingNumber,
            currentStatus: trackingResult.status,
            currentLocation: trackingResult.location,
            estimatedDelivery: trackingResult.estimatedDelivery,
            history: trackingResult.history,
            orderDetails: {
              total: order.total,
              items: order.items.length,
              shippingAddress: order.shippingAddress
            }
          }
        });
      } catch (trackingError) {
        console.error('❌ خطأ في تتبع RedBox:', trackingError.message);
      }
    }

    // إذا فشل التتبع، أرجع بيانات الطلب الأساسية
    res.json({
      success: true,
      data: {
        orderNumber: order.orderNumber,
        trackingNumber,
        currentStatus: order.orderStatus,
        estimatedDelivery: null,
        orderDetails: {
          total: order.total,
          items: order.items.length,
          shippingAddress: order.shippingAddress
        }
      }
    });

  } catch (error) {
    console.error('❌ خطأ في تتبع الطلب:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تتبع الطلب',
      error: error.message
    });
  }
};