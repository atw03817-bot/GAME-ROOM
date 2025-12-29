import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Shipment from '../models/Shipment.js';
import User from '../models/User.js';
import mongoose from 'mongoose';
import redboxService from '../services/redboxServiceProduction.js';

// إنشاء طلب جديد مع تكامل الشحن
export const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes, shippingCost, shippingProvider } = req.body;

    console.log('🛒 إنشاء طلب جديد:', {
      userId: req.user._id,
      itemsCount: items?.length || 0,
      paymentMethod,
      shippingProvider,
      shippingAddress: shippingAddress ? 'موجود' : 'مفقود'
    });

    // التحقق من البيانات المطلوبة
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'يجب أن يحتوي الطلب على منتج واحد على الأقل'
      });
    }

    if (!shippingAddress) {
      return res.status(400).json({
        success: false,
        message: 'عنوان الشحن مطلوب'
      });
    }

    if (!shippingAddress.name && !shippingAddress.fullName) {
      return res.status(400).json({
        success: false,
        message: 'اسم المستلم مطلوب'
      });
    }

    if (!shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'رقم الجوال مطلوب'
      });
    }

    if (!shippingAddress.city) {
      return res.status(400).json({
        success: false,
        message: 'المدينة مطلوبة'
      });
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'طريقة الدفع مطلوبة'
      });
    }

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
      // Tamara و Tabby يتم تحديث المخزون عند الموافقة على الدفع
      if (paymentMethod === 'cod') {
        product.stock = Math.max(0, product.stock - item.quantity);
        product.sales = (product.sales || 0) + item.quantity;
        await product.save();
      }
    }

    const finalShippingCost = shippingCost || 30;
    
    // حساب عمولة تمارا إذا كانت طريقة الدفع تمارا
    let tamaraCommission = {
      amount: 0,
      rate: 0,
      displayName: 'عمولة الأقساط - تمارا'
    };
    
    // حساب عمولة تابي إذا كانت طريقة الدفع تابي (نفس منطق تمارا)
    let tabbyCommission = {
      amount: 0,
      rate: 0,
      displayName: 'عمولة التقسيط - تابي'
    };
    
    if (paymentMethod === 'tamara' || paymentMethod === 'tabby') {
      try {
        // استيراد نموذج إعدادات تمارا (نستخدم نفس الإعدادات لتابي)
        const { default: TamaraSettings } = await import('../models/TamaraSettings.js');
        const commission = await TamaraSettings.calculateCommission(subtotal);
        
        if (paymentMethod === 'tamara') {
          tamaraCommission = commission;
          console.log('💰 عمولة تمارا محسوبة:', commission);
        } else if (paymentMethod === 'tabby') {
          tabbyCommission = {
            ...commission,
            displayName: 'عمولة التقسيط - تابي'
          };
          console.log('💰 عمولة تابي محسوبة:', tabbyCommission);
        }
      } catch (error) {
        console.error(`❌ خطأ في حساب عمولة ${paymentMethod}:`, error);
        // في حالة الخطأ، نستخدم القيم الافتراضية (بدون عمولة)
      }
    }
    
    // الآن الأسعار شاملة الضريبة، لا نحتاج لحساب ضريبة إضافية
    const tax = 0; // الضريبة مدمجة في أسعار المنتجات
    const total = subtotal + tamaraCommission.amount + tabbyCommission.amount + finalShippingCost;

    // إنشاء رقم الطلب
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

    // دالة تنسيق رقم الجوال
    const formatPhoneNumber = (phone) => {
      if (!phone) return '';
      
      // إزالة جميع الأحرف غير الرقمية
      let cleaned = phone.toString().replace(/\D/g, '');
      
      // معالجة التنسيقات المختلفة
      if (cleaned.startsWith('00966')) {
        // 00966XXXXXXXXX -> +966XXXXXXXXX
        cleaned = cleaned.substring(2);
      } else if (cleaned.startsWith('966')) {
        // 966XXXXXXXXX -> keep as is
        // cleaned = cleaned (already correct)
      } else if (cleaned.startsWith('5') && cleaned.length === 9) {
        // 5XXXXXXXX -> 966 + 5XXXXXXXX
        cleaned = '966' + cleaned;
      } else if (cleaned.startsWith('05') && cleaned.length === 10) {
        // 05XXXXXXXX -> 966 + 5XXXXXXXX (remove leading 0)
        cleaned = '966' + cleaned.substring(1);
      }
      
      // التأكد من التنسيق الصحيح: 966XXXXXXXXX (12 رقم إجمالي)
      if (cleaned.startsWith('966') && cleaned.length === 12) {
        return `+${cleaned}`;
      }
      
      // إذا كان الرقم 9 أرقام ويبدأ بـ 5
      if (cleaned.length === 9 && cleaned.startsWith('5')) {
        return `+966${cleaned}`;
      }
      
      // آخر محاولة: إرجاع رقم افتراضي صالح
      console.warn('⚠️ تنسيق رقم جوال غير صحيح، استخدام رقم افتراضي:', phone);
      return '+966500000000';
    };

    // التحقق من صحة رقم الجوال
    if (!shippingAddress.phone) {
      return res.status(400).json({
        success: false,
        message: 'رقم الجوال مطلوب في عنوان الشحن'
      });
    }

    // تنسيق عنوان الشحن
    const formattedAddress = {
      name: shippingAddress.fullName || shippingAddress.name,
      phone: formatPhoneNumber(shippingAddress.phone),
      city: shippingAddress.city,
      district: shippingAddress.district,
      street: shippingAddress.street,
      building: shippingAddress.building
    };

    console.log('📱 رقم الجوال بعد التنسيق:', {
      original: shippingAddress.phone,
      formatted: formattedAddress.phone
    });

    // إنشاء الطلب
    // للدفع الإلكتروني: ننشئ الطلب بحالة draft أولاً
    // للدفع عند الاستلام: ننشئ الطلب بحالة pending مباشرة
    const initialStatus = paymentMethod === 'cod' ? 'pending' : 'draft';
    
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
      tamaraCommission,
      tabbyCommission, // إضافة عمولة تابي
      total,
      shippingCompany: shippingProvider || 'redbox',
      status: initialStatus,
      statusHistory: [{
        status: initialStatus,
        note: paymentMethod === 'cod' ? 'تم إنشاء الطلب' : 'في انتظار الدفع',
        date: new Date()
      }]
    });

    await order.save();
    console.log(`✅ تم حفظ الطلب بحالة ${initialStatus}:`, orderNumber);

    // إنشاء شحنة مع RedBox (للدفع عند الاستلام فقط)
    // Tamara و Tabby: الشحنة تُنشأ بعد موافقة العميل على الدفع
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

// جلب طلبات العميل الحالي
export const getMyOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const userId = req.user._id || req.user.userId;
    
    console.log('🔍 جلب طلبات العميل:', userId);
    
    // بناء الاستعلام - استبعاد الطلبات المسودة
    let query = { 
      user: userId,
      status: { $ne: 'draft' } // استبعاد الطلبات المسودة
    };
    
    if (status && status !== 'all') {
      query.orderStatus = status;
    }

    const orders = await Order.find(query)
      .populate('items.product', 'name nameAr images price')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await Order.countDocuments(query);

    console.log(`📦 تم العثور على ${orders.length} طلب للعميل`);

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
      data: formattedOrders, // للتوافق مع الكود القديم
      pagination: {
        totalPages: Math.ceil(count / limit),
        currentPage: parseInt(page),
        total: count,
        hasNext: page < Math.ceil(count / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('❌ خطأ في جلب طلبات العميل:', error);
    res.status(500).json({ 
      success: false,
      message: 'خطأ في جلب تفاصيل الطلب',
      error: error.message 
    });
  }
};

// جلب تفاصيل الطلب
export const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // بناء الاستعلام بشكل صحيح
    let query = {};
    
    // إذا كان ID صالح كـ ObjectId، ابحث بواسطة _id أيضاً
    if (mongoose.Types.ObjectId.isValid(id)) {
      query = {
        $or: [
          { orderNumber: id },
          { _id: id }
        ]
      };
    } else {
      // إذا لم يكن ObjectId صالح، ابحث فقط بواسطة orderNumber
      query = { orderNumber: id };
    }
    
    let order = await Order.findOne(query)
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

// جلب تفاصيل الطلب بواسطة رقم الطلب (للفاتورة)
export const getOrderByNumber = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    let order = await Order.findOne({ orderNumber })
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

    // إضافة معلومات العميل من الطلب نفسه إذا لم تكن موجودة
    if (!order.customerInfo && order.shippingAddress) {
      order.customerInfo = {
        name: order.shippingAddress.name || order.shippingAddress.fullName,
        phone: order.shippingAddress.phone,
        email: order.user?.email
      };
    }

    res.json({ 
      success: true, 
      data: order 
    });

  } catch (error) {
    console.error('❌ خطأ في جلب تفاصيل الطلب بالرقم:', error);
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

    // استبعاد الطلبات المسودة فقط (draft orders)
    if (!status) {
      query.status = { $ne: 'draft' };
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

// تأكيد الطلب بعد نجاح الدفع
export const confirmOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { paymentData } = req.body;

    console.log('✅ تأكيد الطلب بعد نجاح الدفع:', orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'الطلب غير موجود'
      });
    }

    // التحقق من أن الطلب لم يتم تأكيده مسبقاً
    if (order.status === 'confirmed' || order.paymentStatus === 'paid') {
      console.log('ℹ️ الطلب مؤكد مسبقاً:', {
        status: order.status,
        paymentStatus: order.paymentStatus,
        stockUpdated: order.stockUpdated
      });
      
      // إذا كان الطلب مؤكد مسبقاً، أرجع نجاح بدلاً من خطأ
      return res.json({
        success: true,
        order,
        message: 'الطلب مؤكد مسبقاً'
      });
    }

    // تحديث المخزون للمنتجات
    if (!order.stockUpdated) {
      for (const item of order.items) {
        const product = await Product.findById(item.product);
        if (product) {
          product.stock = Math.max(0, product.stock - item.quantity);
          product.sales = (product.sales || 0) + item.quantity;
          await product.save();
          console.log(`📦 تم تحديث مخزون ${product.name?.ar || product.nameAr}: ${product.stock}`);
        }
      }
      order.stockUpdated = true;
    }

    // تحديث حالة الطلب
    order.status = 'confirmed'; // تغيير من pending إلى confirmed
    order.orderStatus = 'confirmed'; // تحديث orderStatus أيضاً
    order.paymentStatus = 'paid';
    order.paidAt = new Date();

    // إضافة سجل في تاريخ الحالة
    order.statusHistory.push({
      status: 'confirmed',
      note: `تم تأكيد الطلب بعد نجاح الدفع - ${paymentData?.provider || 'غير محدد'}`,
      date: new Date()
    });

    // حفظ بيانات الدفع إذا كانت متوفرة
    if (paymentData) {
      order.paymentData = paymentData;
    }

    await order.save();

    // إنشاء شحنة مع RedBox إذا كان مطلوباً
    if (order.shippingCompany === 'redbox') {
      try {
        console.log('📦 إنشاء شحنة مع RedBox...');
        
        const shipmentResult = await redboxService.createShipment({
          orderNumber: order.orderNumber,
          shippingAddress: order.shippingAddress,
          items: order.items,
          subtotal: order.subtotal,
          total: order.total,
          paymentMethod: order.paymentMethod
        });

        if (shipmentResult.success) {
          // حفظ معلومات الشحنة
          const shipment = new Shipment({
            orderId: order._id,
            providerId: null,
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
        // الطلب يبقى مؤكد حتى لو فشلت الشحنة
      }
    }

    console.log('✅ تم تأكيد الطلب بنجاح:', order.orderNumber);

    res.json({
      success: true,
      order,
      message: 'تم تأكيد الطلب بنجاح'
    });

  } catch (error) {
    console.error('❌ خطأ في تأكيد الطلب:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تأكيد الطلب',
      error: error.message
    });
  }
};