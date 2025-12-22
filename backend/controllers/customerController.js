import User from '../models/User.js';
import Order from '../models/Order.js';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private/Admin
export const getCustomers = async (req, res) => {
  try {
    console.log('🔍 Getting customers with query params:', req.query);
    const { page = 1, limit = 20, search, status } = req.query;
    
    // Build query - support both 'USER' and 'customer' roles
    const query = { 
      $or: [
        { role: 'USER' },
        { role: 'customer' }
      ]
    };
    
    console.log('📋 Initial query:', JSON.stringify(query));
    
    if (search) {
      // البحث في الاسم ورقم الجوال والإيميل
      const searchRegex = { $regex: search, $options: 'i' };
      query.$and = [
        query.$or ? { $or: query.$or } : {},
        {
          $or: [
            { name: searchRegex },
            { phone: searchRegex },
            { email: searchRegex }
          ]
        }
      ];
      
      // إزالة الشرط القديم لتجنب التعارض
      delete query.$or;
    }
    
    if (status) {
      query.status = status;
    }
    
    // Get customers
    const customers = await User.find(query)
      .select('-password')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    console.log(`👥 Found ${customers.length} customers`);
    console.log('📊 Sample customer roles:', customers.slice(0, 3).map(c => ({ name: c.name, role: c.role })));
    
    // Get total count
    const count = await User.countDocuments(query);
    console.log(`📈 Total customers count: ${count}`);
    
    // Get stats for each customer
    const customersWithStats = await Promise.all(
      customers.map(async (customer) => {
        const orders = await Order.find({ user: customer._id });
        const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
        const totalOrders = orders.length;
        
        return {
          ...customer.toObject(),
          stats: {
            totalOrders,
            totalSpent,
            lastOrderDate: orders[0]?.createdAt || null
          }
        };
      })
    );
    
    res.json({
      success: true,
      data: customersWithStats,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting customers:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب العملاء'
    });
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private/Admin
export const getCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id).select('-password');
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    // Get customer orders
    const orders = await Order.find({ user: customer._id })
      .sort('-createdAt')
      .limit(10);
    
    // Calculate stats
    const allOrders = await Order.find({ user: customer._id });
    const totalSpent = allOrders.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = allOrders.length;
    
    const stats = {
      totalOrders,
      totalSpent,
      averageOrderValue: totalOrders > 0 ? totalSpent / totalOrders : 0,
      lastOrderDate: orders[0]?.createdAt || null,
      ordersByStatus: {
        pending: allOrders.filter(o => o.status === 'pending').length,
        processing: allOrders.filter(o => o.status === 'processing').length,
        shipped: allOrders.filter(o => o.status === 'shipped').length,
        delivered: allOrders.filter(o => o.status === 'delivered').length,
        cancelled: allOrders.filter(o => o.status === 'cancelled').length
      }
    };
    
    res.json({
      success: true,
      data: {
        customer: customer.toObject(),
        recentOrders: orders,
        stats
      }
    });
  } catch (error) {
    console.error('Error getting customer:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات العميل'
    });
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private/Admin
export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, status } = req.body;
    
    const customer = await User.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    // Check if phone is already taken by another user
    if (phone && phone !== customer.phone) {
      const existingUser = await User.findOne({ phone });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'رقم الجوال مستخدم بالفعل'
        });
      }
    }
    
    // Check if email is already taken by another user (if provided)
    if (email && email !== customer.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'البريد الإلكتروني مستخدم بالفعل'
        });
      }
    }
    
    // Update fields
    if (name) customer.name = name;
    if (email) customer.email = email;
    if (phone) customer.phone = phone;
    if (status) customer.status = status;
    
    await customer.save();
    
    res.json({
      success: true,
      data: customer,
      message: 'تم تحديث بيانات العميل بنجاح'
    });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث بيانات العميل'
    });
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    // Check if customer has orders
    const orders = await Order.find({ user: customer._id });
    
    if (orders.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف عميل لديه طلبات. يمكنك تعطيل الحساب بدلاً من ذلك.'
      });
    }
    
    await customer.deleteOne();
    
    res.json({
      success: true,
      message: 'تم حذف العميل بنجاح'
    });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف العميل'
    });
  }
};

// @desc    Get customer orders
// @route   GET /api/customers/:id/orders
// @access  Private/Admin
export const getCustomerOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    
    // Check if customer exists
    const customer = await User.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    // Build query
    const query = { user: req.params.id };
    if (status) {
      query.status = status;
    }
    
    // Get orders
    const orders = await Order.find(query)
      .populate('items.product', 'name images price')
      .sort('-createdAt')
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const count = await Order.countDocuments(query);
    
    res.json({
      success: true,
      data: orders,
      pagination: {
        total: count,
        page: parseInt(page),
        pages: Math.ceil(count / limit)
      }
    });
  } catch (error) {
    console.error('Error getting customer orders:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب طلبات العميل'
    });
  }
};

// @desc    Get customer stats
// @route   GET /api/customers/:id/stats
// @access  Private/Admin
export const getCustomerStats = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);
    
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'العميل غير موجود'
      });
    }
    
    // Get all orders
    const orders = await Order.find({ user: customer._id });
    
    // Calculate stats
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Orders by status
    const ordersByStatus = {
      pending: orders.filter(o => o.status === 'pending').length,
      processing: orders.filter(o => o.status === 'processing').length,
      shipped: orders.filter(o => o.status === 'shipped').length,
      delivered: orders.filter(o => o.status === 'delivered').length,
      cancelled: orders.filter(o => o.status === 'cancelled').length
    };
    
    // Orders by month (last 12 months)
    const ordersByMonth = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      ordersByMonth[monthKey] = 0;
    }
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
      if (ordersByMonth[monthKey] !== undefined) {
        ordersByMonth[monthKey]++;
      }
    });
    
    // Most purchased products
    const productCounts = {};
    orders.forEach(order => {
      order.items.forEach(item => {
        const productId = item.product.toString();
        if (!productCounts[productId]) {
          productCounts[productId] = {
            productId,
            name: item.name,
            quantity: 0,
            totalSpent: 0
          };
        }
        productCounts[productId].quantity += item.quantity;
        productCounts[productId].totalSpent += item.price * item.quantity;
      });
    });
    
    const topProducts = Object.values(productCounts)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
    
    res.json({
      success: true,
      data: {
        overview: {
          totalOrders,
          totalSpent,
          averageOrderValue,
          firstOrderDate: orders[orders.length - 1]?.createdAt || null,
          lastOrderDate: orders[0]?.createdAt || null
        },
        ordersByStatus,
        ordersByMonth,
        topProducts
      }
    });
  } catch (error) {
    console.error('Error getting customer stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات العميل'
    });
  }
};

