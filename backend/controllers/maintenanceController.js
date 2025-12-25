import MaintenanceRequest from '../models/MaintenanceRequest.js';
import mongoose from 'mongoose';

// إنشاء طلب صيانة جديد
export const createMaintenanceRequest = async (req, res) => {
  try {
    console.log('📱 Request from:', req.get('User-Agent'));
    console.log('📥 Received maintenance request data:', JSON.stringify(req.body, null, 2));
    console.log('📋 Request headers:', req.headers);
    
    const { customerInfo, device, issue, shipping, userId } = req.body;
    
    // التحقق من البيانات المطلوبة بشكل أكثر تفصيلاً
    if (!customerInfo || !customerInfo.name || !customerInfo.phone) {
      console.log('❌ Missing customer info:', customerInfo);
      return res.status(400).json({
        success: false,
        message: 'معلومات العميل غير مكتملة'
      });
    }
    
    if (!device || !device.model || !device.serialNumber) {
      console.log('❌ Missing device info:', device);
      return res.status(400).json({
        success: false,
        message: 'معلومات الجهاز غير مكتملة'
      });
    }
    
    if (!issue || !issue.category || !issue.description) {
      console.log('❌ Missing issue info:', issue);
      return res.status(400).json({
        success: false,
        message: 'معلومات المشكلة غير مكتملة'
      });
    }

    // حساب رسوم الأولوية
    let priorityFee = 0;
    if (issue.priority === 'urgent') {
      priorityFee = 50;
    } else if (issue.priority === 'emergency') {
      priorityFee = 100;
    }

    // حساب رسوم الشحن مع معالجة أفضل للأخطاء
    let shippingFee = 0;
    if (shipping && shipping.isRequired && shipping.cost) {
      shippingFee = parseFloat(shipping.cost) || 0;
    }
    
    console.log('💰 Calculated fees:', { priorityFee, shippingFee });
    console.log('📦 Shipping data:', shipping);
    
    // التأكد من صحة بيانات الشحن
    const shippingData = {
      isRequired: shipping?.isRequired || false,
      provider: shipping?.isRequired ? 
        (shipping?.provider?.includes('aramex') ? 'aramex' :
         shipping?.provider?.includes('smsa') ? 'smsa' :
         shipping?.provider?.includes('naqel') ? 'naqel' :
         shipping?.provider?.includes('redbox') ? 'naqel' : // RedBox يستخدم نفس enum نقل
         'aramex') : 'none', // افتراضي أرامكس إذا كان مطلوب شحن
      providerName: shipping?.providerName || '',
      cost: shippingFee,
      pickupAddress: shipping?.pickupAddress || '',
      deliveryAddress: shipping?.deliveryAddress || customerInfo?.address || '',
      status: 'pending',
      trackingNumber: '',
      notes: ''
    };
    
    console.log('📦 Processed shipping data:', shippingData);
    
    const maintenanceRequest = new MaintenanceRequest({
      userId: userId, // ربط الطلب بحساب العميل
      customerInfo,
      device,
      issue,
      shipping: shippingData,
      cost: {
        diagnosticFee: 25, // رسوم فحص افتراضية
        partsCost: 0,
        laborCost: 0,
        priorityFee: priorityFee,
        shippingFee: shippingFee,
        totalEstimated: 25 + priorityFee + shippingFee,
        totalFinal: 0,
        paymentStatus: 'pending',
        paymentMethod: 'cash'
      }
    });
    
    // إضافة أول حالة للتاريخ
    maintenanceRequest.status.history.push({
      status: 'received',
      date: new Date(),
      note: shipping && shipping.isRequired ? 
        `تم استلام الطلب - يحتاج شحن عبر ${shipping.providerName || 'شركة شحن'}` : 
        'تم استلام الجهاز',
      updatedBy: 'System'
    });
    
    console.log('💾 Saving maintenance request...');
    
    // حساب التكلفة الإجمالية
    maintenanceRequest.calculateTotal();
    
    await maintenanceRequest.save();
    console.log('✅ Maintenance request created:', maintenanceRequest.requestNumber);
    
    res.status(201).json({
      success: true,
      data: maintenanceRequest,
      message: 'تم إنشاء طلب الصيانة بنجاح'
    });
  } catch (error) {
    console.error('❌ Error creating maintenance request:', error);
    console.error('❌ Error details:', error.stack);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء طلب الصيانة',
      error: error.message
    });
  }
};

// جلب جميع طلبات الصيانة (للإدارة)
export const getAllMaintenanceRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const priority = req.query.priority;
    const search = req.query.search;
    
    // بناء الفلتر
    let filter = {};
    if (status) filter['status.current'] = status;
    if (priority) filter['issue.priority'] = priority;
    if (search) {
      filter.$or = [
        { requestNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.name': { $regex: search, $options: 'i' } },
        { 'customerInfo.phone': { $regex: search, $options: 'i' } },
        { 'device.serialNumber': { $regex: search, $options: 'i' } },
        { 'device.imei': { $regex: search, $options: 'i' } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const requests = await MaintenanceRequest.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('technician.id', 'name email');
    
    const total = await MaintenanceRequest.countDocuments(filter);
    
    // إحصائيات سريعة
    const stats = await MaintenanceRequest.aggregate([
      {
        $group: {
          _id: '$status.current',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        requests,
        pagination: {
          current: page,
          pages: Math.ceil(total / limit),
          total
        },
        stats: stats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance requests:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب طلبات الصيانة'
    });
  }
};

// جلب طلب صيانة واحد
export const getMaintenanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await MaintenanceRequest.findById(id)
      .populate('technician.id', 'name email phone');
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: request
    });
  } catch (error) {
    console.error('Error fetching maintenance request:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب طلب الصيانة'
    });
  }
};

// تحديث طلب الصيانة
export const updateMaintenanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedBy = req.user?.name || 'Admin';
    
    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }
    
    // تحديث الحقول
    Object.keys(updates).forEach(key => {
      if (key !== 'status') {
        request[key] = updates[key];
      }
    });
    
    // تحديث الحالة إذا تم تمريرها
    if (updates.status && updates.status !== request.status.current) {
      request.updateStatus(updates.status, updates.statusNote, updatedBy);
    }
    
    // إعادة حساب التكلفة
    request.calculateTotal();
    
    await request.save();
    
    res.json({
      success: true,
      data: request,
      message: 'تم تحديث طلب الصيانة بنجاح'
    });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث طلب الصيانة'
    });
  }
};

// تحديث بسيط لطلب الصيانة (للملصق وغيره)
export const updateMaintenanceRequestSimple = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const request = await MaintenanceRequest.findByIdAndUpdate(
      id, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }
    
    res.json({
      success: true,
      data: request,
      message: 'تم التحديث بنجاح'
    });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في التحديث'
    });
  }
};

// تحديث حالة الطلب
export const updateStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;
    const updatedBy = req.user?.name || 'Admin';
    
    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }
    
    request.updateStatus(status, note, updatedBy);
    await request.save();
    
    res.json({
      success: true,
      data: request,
      message: 'تم تحديث حالة الطلب بنجاح'
    });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الحالة'
    });
  }
};

// تحديث حالة الدفع
export const updatePaymentStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { paymentStatus } = req.body;
    
    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }
    
    // تحديث حالة الدفع
    request.cost.paymentStatus = paymentStatus;
    
    // إضافة ملاحظة في التاريخ
    const statusNote = paymentStatus === 'paid' ? 'تم دفع المبلغ كاملاً' :
                      paymentStatus === 'partial' ? 'تم دفع جزء من المبلغ' : 'لم يتم الدفع بعد';
    
    request.status.history.push({
      status: request.status.current,
      date: new Date(),
      note: `تحديث حالة الدفع: ${statusNote}`,
      updatedBy: req.user?.name || 'Admin'
    });
    
    await request.save();
    
    res.json({
      success: true,
      data: request,
      message: 'تم تحديث حالة الدفع بنجاح'
    });
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث حالة الدفع'
    });
  }
};

// معالجة موافقة العميل
export const handleCustomerApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, note, decision, customerNotes, approvalDate, approvalMethod } = req.body;
    
    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }
    
    // تحديث معلومات الموافقة
    request.customerApproval = {
      status: decision === 'approve' ? 'approved' : 'rejected',
      decision: decision,
      customerNotes: customerNotes || '',
      approvalDate: approvalDate || new Date(),
      approvalMethod: approvalMethod || 'online'
    };
    
    // تحديث حالة الطلب
    request.updateStatus(status, note, 'العميل');
    
    // تحديث التاريخ الزمني
    if (decision === 'approve') {
      request.timeline.approved = new Date();
    }
    
    await request.save();
    
    res.json({
      success: true,
      data: request,
      message: decision === 'approve' ? 'تم قبول الإصلاح بنجاح' : 'تم رفض الإصلاح'
    });
  } catch (error) {
    console.error('Error handling customer approval:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في معالجة الموافقة'
    });
  }
};

// إضافة تشخيص
export const addDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const diagnosisData = req.body;
    const updatedBy = req.user?.name || 'Admin';
    
    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }
    
    // تحديث التشخيص
    request.diagnosis = { ...request.diagnosis, ...diagnosisData };
    
    // تحديث التكلفة
    if (diagnosisData.cost) {
      request.cost = { ...request.cost, ...diagnosisData.cost };
    }
    
    // حساب تكلفة القطع
    if (diagnosisData.requiredParts) {
      request.cost.partsCost = diagnosisData.requiredParts.reduce((total, part) => {
        return total + (part.price || 0);
      }, 0);
    }
    
    // التأكد من تضمين رسوم الشحن
    if (request.shipping?.isRequired && request.shipping.cost) {
      request.cost.shippingFee = request.shipping.cost;
    }
    
    // إعادة حساب التكلفة الإجمالية
    request.calculateTotal();
    
    // تحديث الحالة إلى "تم الفحص" إذا لم تكن كذلك
    if (request.status.current === 'received') {
      request.updateStatus('diagnosed', 'تم فحص الجهاز وتحديد المشكلة', updatedBy);
    }
    
    await request.save();
    
    res.json({
      success: true,
      data: request,
      message: 'تم إضافة التشخيص بنجاح'
    });
  } catch (error) {
    console.error('Error adding diagnosis:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إضافة التشخيص'
    });
  }
};

// إنشاء رابط موافقة العميل
export const generateApprovalLink = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }
    
    // إنشاء رابط الموافقة
    const approvalLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/maintenance/approval/${request.requestNumber}`;
    
    res.json({
      success: true,
      data: {
        approvalLink,
        requestNumber: request.requestNumber,
        customerPhone: request.customerInfo.phone
      },
      message: 'تم إنشاء رابط الموافقة'
    });
  } catch (error) {
    console.error('Error generating approval link:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء رابط الموافقة'
    });
  }
};

// تعيين فني
export const assignTechnician = async (req, res) => {
  try {
    const { id } = req.params;
    const { technicianId, technicianName, specialization } = req.body;
    const updatedBy = req.user?.name || 'Admin';
    
    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }
    
    request.technician = {
      id: technicianId,
      name: technicianName,
      specialization: specialization
    };
    
    // تحديث الحالة إذا لم تكن قيد الإصلاح
    if (!['in_progress', 'testing', 'ready', 'completed'].includes(request.status.current)) {
      request.updateStatus('in_progress', `تم تعيين الفني: ${technicianName}`, updatedBy);
    }
    
    await request.save();
    
    res.json({
      success: true,
      data: request,
      message: 'تم تعيين الفني بنجاح'
    });
  } catch (error) {
    console.error('Error assigning technician:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تعيين الفني'
    });
  }
};

// البحث بالرقم التسلسلي أو IMEI
export const searchByDevice = async (req, res) => {
  try {
    const { query } = req.params;
    
    const requests = await MaintenanceRequest.find({
      $or: [
        { 'device.serialNumber': { $regex: query, $options: 'i' } },
        { 'device.imei': { $regex: query, $options: 'i' } },
        { requestNumber: { $regex: query, $options: 'i' } }
      ]
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error searching device:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث'
    });
  }
};

// حذف طلب صيانة (للإدارة فقط - الطلبات المنشأة من الإدارة)
export const deleteMaintenanceRequest = async (req, res) => {
  try {
    const { id } = req.params;
    
    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }

    // التحقق من أن الطلب منشأ من الإدارة
    if (request.createdBy !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'لا يمكن حذف الطلبات المنشأة من العملاء'
      });
    }
    
    await MaintenanceRequest.findByIdAndDelete(id);
    
    res.json({
      success: true,
      message: 'تم حذف طلب الصيانة بنجاح'
    });
  } catch (error) {
    console.error('Error deleting maintenance request:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف طلب الصيانة'
    });
  }
};

// إنشاء طلب صيانة من الإدارة
export const createMaintenanceRequestAdmin = async (req, res) => {
  try {
    console.log('📥 Received admin maintenance request data:', req.body);
    
    const { customerInfo, device, issue, shipping } = req.body;
    
    // التحقق من البيانات المطلوبة
    if (!customerInfo || !device || !issue) {
      return res.status(400).json({
        success: false,
        message: 'بيانات غير مكتملة'
      });
    }

    // حساب رسوم الأولوية
    let priorityFee = 0;
    if (issue.priority === 'urgent') {
      priorityFee = 50;
    } else if (issue.priority === 'emergency') {
      priorityFee = 100;
    }

    // حساب رسوم الشحن
    let shippingFee = 0;
    if (shipping && shipping.isRequired && shipping.cost) {
      shippingFee = shipping.cost;
    }
    
    const maintenanceRequest = new MaintenanceRequest({
      createdBy: 'admin', // تحديد أن الطلب من الإدارة
      customerInfo,
      device,
      issue,
      shipping: shipping || {
        isRequired: false,
        provider: 'none',
        providerName: '',
        cost: 0,
        status: 'pending'
      },
      cost: {
        diagnosticFee: 25,
        partsCost: 0,
        laborCost: 0,
        priorityFee: priorityFee,
        shippingFee: shippingFee,
        totalEstimated: 25 + priorityFee + shippingFee,
        totalFinal: 0,
        paymentStatus: 'pending',
        paymentMethod: 'cash'
      }
    });
    
    // إضافة أول حالة للتاريخ
    maintenanceRequest.status.history.push({
      status: 'received',
      date: new Date(),
      note: shipping && shipping.isRequired ? 
        `تم إنشاء الطلب من الإدارة - يحتاج شحن عبر ${shipping.providerName}` : 
        'تم إنشاء الطلب من الإدارة',
      updatedBy: req.user?.name || 'Admin'
    });
    
    await maintenanceRequest.save();
    console.log('✅ Admin maintenance request created:', maintenanceRequest.requestNumber);
    
    res.status(201).json({
      success: true,
      data: maintenanceRequest,
      message: 'تم إنشاء طلب الصيانة بنجاح'
    });
  } catch (error) {
    console.error('❌ Error creating admin maintenance request:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء طلب الصيانة',
      error: error.message
    });
  }
};

// تعديل طلب صيانة (للإدارة فقط - الطلبات المنشأة من الإدارة)
export const updateMaintenanceRequestAdmin = async (req, res) => {
  try {
    const { id } = req.params;
    const { customerInfo, device, issue, shipping } = req.body;
    
    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }

    // التحقق من أن الطلب منشأ من الإدارة
    if (request.createdBy !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'لا يمكن تعديل الطلبات المنشأة من العملاء'
      });
    }

    // حساب رسوم الأولوية
    let priorityFee = 0;
    if (issue.priority === 'urgent') {
      priorityFee = 50;
    } else if (issue.priority === 'emergency') {
      priorityFee = 100;
    }

    // حساب رسوم الشحن
    let shippingFee = 0;
    if (shipping && shipping.isRequired && shipping.cost) {
      shippingFee = shipping.cost;
    }

    // تحديث البيانات
    request.customerInfo = customerInfo;
    request.device = device;
    request.issue = issue;
    request.shipping = shipping || request.shipping;
    
    // تحديث التكلفة
    request.cost.priorityFee = priorityFee;
    request.cost.shippingFee = shippingFee;
    request.calculateTotal();

    // إضافة ملاحظة في التاريخ
    request.status.history.push({
      status: request.status.current,
      date: new Date(),
      note: 'تم تعديل بيانات الطلب من الإدارة',
      updatedBy: req.user?.name || 'Admin'
    });
    
    await request.save();
    
    res.json({
      success: true,
      data: request,
      message: 'تم تحديث طلب الصيانة بنجاح'
    });
  } catch (error) {
    console.error('Error updating maintenance request:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث طلب الصيانة'
    });
  }
};

// تحديث حالة الشحن
export const updateShippingStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber, notes } = req.body;
    
    const request = await MaintenanceRequest.findById(id);
    if (!request) {
      return res.status(404).json({
        success: false,
        message: 'طلب الصيانة غير موجود'
      });
    }

    // التحقق من أن الطلب يحتاج شحن
    if (!request.shipping?.isRequired) {
      return res.status(400).json({
        success: false,
        message: 'هذا الطلب لا يحتاج شحن'
      });
    }

    // تحديث حالة الشحن
    request.shipping.status = status;
    if (trackingNumber) {
      request.shipping.trackingNumber = trackingNumber;
    }
    if (notes) {
      request.shipping.notes = notes;
    }

    // إضافة ملاحظة في التاريخ
    const statusText = {
      'pending': 'في الانتظار',
      'picked_up': 'تم الاستلام',
      'in_transit': 'في الطريق',
      'delivered': 'تم التسليم',
      'cancelled': 'ملغي'
    };

    request.status.history.push({
      status: request.status.current,
      date: new Date(),
      note: `تحديث حالة الشحن: ${statusText[status]}${trackingNumber ? ` - رقم التتبع: ${trackingNumber}` : ''}`,
      updatedBy: req.user?.name || 'Admin'
    });
    
    await request.save();
    
    res.json({
      success: true,
      data: request,
      message: 'تم تحديث حالة الشحن بنجاح'
    });
  } catch (error) {
    console.error('Error updating shipping status:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث حالة الشحن'
    });
  }
};

// جلب طلبات الصيانة الخاصة بالعميل
export const getCustomerMaintenanceRequests = async (req, res) => {
  try {
    const { phone } = req.query;
    
    if (!phone) {
      return res.status(400).json({
        success: false,
        message: 'رقم الجوال مطلوب'
      });
    }
    
    // البحث بالجوال
    const requests = await MaintenanceRequest.find({
      'customerInfo.phone': phone
    }).sort({ createdAt: -1 });
    
    res.json({
      success: true,
      data: requests
    });
  } catch (error) {
    console.error('Error fetching customer maintenance requests:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب طلبات الصيانة'
    });
  }
};

// إحصائيات الصيانة
export const getMaintenanceStats = async (req, res) => {
  try {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
    
    // إحصائيات عامة
    const totalRequests = await MaintenanceRequest.countDocuments();
    const thisMonthRequests = await MaintenanceRequest.countDocuments({
      createdAt: { $gte: startOfMonth }
    });
    const thisWeekRequests = await MaintenanceRequest.countDocuments({
      createdAt: { $gte: startOfWeek }
    });
    
    // إحصائيات الحالات
    const statusStats = await MaintenanceRequest.aggregate([
      {
        $group: {
          _id: '$status.current',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // إحصائيات الأولوية
    const priorityStats = await MaintenanceRequest.aggregate([
      {
        $group: {
          _id: '$issue.priority',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // إحصائيات الأجهزة
    const deviceStats = await MaintenanceRequest.aggregate([
      {
        $group: {
          _id: '$device.brand',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // متوسط وقت الإصلاح
    const avgRepairTime = await MaintenanceRequest.aggregate([
      {
        $match: {
          'timeline.completed': { $exists: true },
          'timeline.received': { $exists: true }
        }
      },
      {
        $project: {
          repairTime: {
            $divide: [
              { $subtract: ['$timeline.completed', '$timeline.received'] },
              1000 * 60 * 60 * 24 // تحويل إلى أيام
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avgDays: { $avg: '$repairTime' }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        overview: {
          total: totalRequests,
          thisMonth: thisMonthRequests,
          thisWeek: thisWeekRequests,
          avgRepairDays: avgRepairTime[0]?.avgDays || 0
        },
        statusBreakdown: statusStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        priorityBreakdown: priorityStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        deviceBreakdown: deviceStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      }
    });
  } catch (error) {
    console.error('Error fetching maintenance stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات'
    });
  }
};