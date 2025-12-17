import mongoose from 'mongoose';
import Order from '../models/Order.js';
import User from '../models/User.js';
import Product from '../models/Product.js';

// الحصول على إحصائيات المبيعات الحقيقية
export const getRealSalesStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // تحديد فترة البحث
    const matchCondition = {};
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // إحصائيات الطلبات الأساسية
    const [
      totalOrders,
      paidOrders,
      pendingOrders,
      cancelledOrders,
      totalRevenue,
      avgOrderValue
    ] = await Promise.all([
      Order.countDocuments(matchCondition),
      Order.countDocuments({ ...matchCondition, paymentStatus: { $in: ['paid', 'approved'] } }),
      Order.countDocuments({ ...matchCondition, orderStatus: 'pending' }),
      Order.countDocuments({ ...matchCondition, orderStatus: 'cancelled' }),
      Order.aggregate([
        { $match: { ...matchCondition, paymentStatus: { $in: ['paid', 'approved'] } } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      Order.aggregate([
        { $match: { ...matchCondition, paymentStatus: { $in: ['paid', 'approved'] } } },
        { $group: { _id: null, avg: { $avg: '$total' } } }
      ])
    ]);

    // إحصائيات طرق الدفع
    const paymentMethods = await Order.aggregate([
      { $match: { ...matchCondition, paymentStatus: { $in: ['paid', 'approved'] } } },
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // المبيعات اليومية
    const dailySales = await Order.aggregate([
      { $match: { ...matchCondition, paymentStatus: { $in: ['paid', 'approved'] } } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: '%Y-%m-%d',
              date: '$createdAt'
            }
          },
          orders: { $sum: 1 },
          revenue: { $sum: '$total' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // أكثر المنتجات مبيعاً
    const topProducts = await Order.aggregate([
      { $match: { ...matchCondition, paymentStatus: { $in: ['paid', 'approved'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      summary: {
        totalOrders,
        paidOrders,
        pendingOrders,
        cancelledOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        avgOrderValue: avgOrderValue[0]?.avg || 0,
        conversionRate: totalOrders > 0 ? ((paidOrders / totalOrders) * 100).toFixed(2) : 0
      },
      paymentMethods,
      dailySales,
      topProducts
    });

  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات المبيعات:', error);
    res.status(500).json({ error: 'فشل في الحصول على إحصائيات المبيعات' });
  }
};

// الحصول على إحصائيات العملاء الحقيقية
export const getRealCustomerStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchCondition = {};
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // إحصائيات العملاء الأساسية
    const [
      totalCustomers,
      newCustomers,
      activeCustomers,
      customersWithOrders
    ] = await Promise.all([
      User.countDocuments({ role: { $in: ['USER', 'customer'] }, ...matchCondition }),
      User.countDocuments({ 
        role: { $in: ['USER', 'customer'] }, 
        ...matchCondition,
        createdAt: { 
          $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // آخر 30 يوم
        }
      }),
      User.countDocuments({ 
        role: { $in: ['USER', 'customer'] }, 
        isActive: true,
        ...matchCondition
      }),
      Order.distinct('user', matchCondition).then(users => users.length)
    ]);

    // أكثر العملاء شراءً
    const topCustomers = await Order.aggregate([
      { $match: { ...matchCondition, paymentStatus: { $in: ['paid', 'approved'] } } },
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'customerInfo'
        }
      },
      { $unwind: '$customerInfo' },
      {
        $project: {
          customerName: '$customerInfo.name',
          customerEmail: '$customerInfo.email',
          totalOrders: 1,
          totalSpent: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);

    // توزيع العملاء حسب المدن
    const customersByCity = await Order.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$shippingAddress.city',
          customers: { $addToSet: '$user' },
          orders: { $sum: 1 }
        }
      },
      {
        $project: {
          city: '$_id',
          customerCount: { $size: '$customers' },
          orderCount: '$orders'
        }
      },
      { $sort: { customerCount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      summary: {
        totalCustomers,
        newCustomers,
        activeCustomers,
        customersWithOrders,
        customerConversionRate: totalCustomers > 0 ? ((customersWithOrders / totalCustomers) * 100).toFixed(2) : 0
      },
      topCustomers,
      customersByCity
    });

  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات العملاء:', error);
    res.status(500).json({ error: 'فشل في الحصول على إحصائيات العملاء' });
  }
};

// الحصول على إحصائيات المنتجات الحقيقية
export const getRealProductStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchCondition = {};
    if (startDate && endDate) {
      matchCondition.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    // إحصائيات المنتجات الأساسية
    const [
      totalProducts,
      productsInStock,
      productsOutOfStock
    ] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stock: { $gt: 0 } }),
      Product.countDocuments({ stock: { $lte: 0 } })
    ]);

    // أكثر المنتجات مبيعاً
    const bestSellingProducts = await Order.aggregate([
      { $match: { ...matchCondition, paymentStatus: { $in: ['paid', 'approved'] } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          productName: { $first: '$items.name' },
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          orderCount: { $sum: 1 }
        }
      },
      { $sort: { totalSold: -1 } },
      { $limit: 20 }
    ]);

    // المنتجات حسب الفئات
    const productsByCategory = await Order.aggregate([
      { $match: { ...matchCondition, paymentStatus: { $in: ['paid', 'approved'] } } },
      { $unwind: '$items' },
      {
        $lookup: {
          from: 'products',
          localField: 'items.product',
          foreignField: '_id',
          as: 'productInfo'
        }
      },
      { $unwind: '$productInfo' },
      {
        $group: {
          _id: '$productInfo.categoryName',
          totalSold: { $sum: '$items.quantity' },
          revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          productCount: { $addToSet: '$items.product' }
        }
      },
      {
        $project: {
          category: '$_id',
          totalSold: 1,
          revenue: 1,
          uniqueProducts: { $size: '$productCount' }
        }
      },
      { $sort: { revenue: -1 } }
    ]);

    // المنتجات الأقل مبيعاً (قد تحتاج تحسين)
    const lowPerformingProducts = await Product.aggregate([
      {
        $lookup: {
          from: 'orders',
          let: { productId: '$_id' },
          pipeline: [
            { $unwind: '$items' },
            { $match: { 
              $expr: { $eq: ['$items.product', '$$productId'] },
              paymentStatus: { $in: ['paid', 'approved'] },
              ...matchCondition
            }},
            { $group: { _id: null, totalSold: { $sum: '$items.quantity' } } }
          ],
          as: 'sales'
        }
      },
      {
        $project: {
          name: { $ifNull: ['$name.ar', '$nameAr'] },
          price: 1,
          stock: 1,
          totalSold: { $ifNull: [{ $arrayElemAt: ['$sales.totalSold', 0] }, 0] }
        }
      },
      { $sort: { totalSold: 1 } },
      { $limit: 10 }
    ]);

    res.json({
      summary: {
        totalProducts,
        productsInStock,
        productsOutOfStock,
        stockRate: totalProducts > 0 ? ((productsInStock / totalProducts) * 100).toFixed(2) : 0
      },
      bestSellingProducts,
      productsByCategory,
      lowPerformingProducts
    });

  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات المنتجات:', error);
    res.status(500).json({ error: 'فشل في الحصول على إحصائيات المنتجات' });
  }
};

// لوحة التحكم الشاملة - بيانات حقيقية فقط
export const getRealDashboardStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // الحصول على جميع الإحصائيات بشكل متوازي
    const [salesStats, customerStats, productStats] = await Promise.all([
      getRealSalesStatsData(req.query),
      getRealCustomerStatsData(req.query),
      getRealProductStatsData(req.query)
    ]);

    // إحصائيات اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todayStats = await Promise.all([
      Order.countDocuments({ 
        createdAt: { $gte: today, $lt: tomorrow }
      }),
      Order.aggregate([
        { 
          $match: { 
            createdAt: { $gte: today, $lt: tomorrow },
            paymentStatus: { $in: ['paid', 'approved'] }
          }
        },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ]),
      User.countDocuments({ 
        createdAt: { $gte: today, $lt: tomorrow },
        role: { $in: ['USER', 'customer'] }
      })
    ]);

    res.json({
      sales: salesStats,
      customers: customerStats,
      products: productStats,
      today: {
        orders: todayStats[0],
        revenue: todayStats[1][0]?.total || 0,
        newCustomers: todayStats[2]
      },
      generatedAt: new Date(),
      period: {
        startDate: startDate || 'البداية',
        endDate: endDate || 'اليوم'
      }
    });

  } catch (error) {
    console.error('خطأ في الحصول على إحصائيات لوحة التحكم:', error);
    res.status(500).json({ error: 'فشل في الحصول على إحصائيات لوحة التحكم' });
  }
};

// دوال مساعدة لجلب البيانات
async function getRealSalesStatsData(query) {
  const { startDate, endDate } = query;
  const matchCondition = {};
  
  if (startDate && endDate) {
    matchCondition.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const [totalOrders, paidOrders, totalRevenue] = await Promise.all([
    Order.countDocuments(matchCondition),
    Order.countDocuments({ ...matchCondition, paymentStatus: { $in: ['paid', 'approved'] } }),
    Order.aggregate([
      { $match: { ...matchCondition, paymentStatus: { $in: ['paid', 'approved'] } } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])
  ]);

  return {
    totalOrders,
    paidOrders,
    totalRevenue: totalRevenue[0]?.total || 0,
    avgOrderValue: paidOrders > 0 ? (totalRevenue[0]?.total || 0) / paidOrders : 0
  };
}

async function getRealCustomerStatsData(query) {
  const { startDate, endDate } = query;
  const matchCondition = {};
  
  if (startDate && endDate) {
    matchCondition.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const [totalCustomers, customersWithOrders] = await Promise.all([
    User.countDocuments({ role: { $in: ['USER', 'customer'] }, ...matchCondition }),
    Order.distinct('user', matchCondition).then(users => users.length)
  ]);

  return {
    totalCustomers,
    customersWithOrders
  };
}

async function getRealProductStatsData(query) {
  const totalProducts = await Product.countDocuments();
  const productsInStock = await Product.countDocuments({ stock: { $gt: 0 } });

  return {
    totalProducts,
    productsInStock
  };
}