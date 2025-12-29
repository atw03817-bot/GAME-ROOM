import React, { useState, useEffect } from 'react';
import { 
  FiShoppingBag, 
  FiDollarSign, 
  FiTrendingUp,
  FiEye,
  FiHeart,
  FiClock,
  FiPackage,
  FiStar,
  FiRefreshCw
} from 'react-icons/fi';
import api from '../../utils/api';
import useAuthStore from '../../store/useAuthStore';

const CustomerAnalytics = () => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuthStore();

  useEffect(() => {
    if (user) {
      fetchCustomerAnalytics();
    }
  }, [user]);

  const fetchCustomerAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 جلب إحصائيات العميل...');
      
      // جلب طلبات العميل
      const ordersResponse = await api.get('/orders/my-orders');
      const orders = ordersResponse.data.orders || ordersResponse.data.data || [];
      
      console.log(`📦 تم العثور على ${orders.length} طلب`);
      
      // حساب الإحصائيات الحقيقية
      const totalOrders = orders.length;
      const completedOrders = orders.filter(order => 
        order.orderStatus === 'delivered' || 
        order.paymentStatus === 'paid'
      );
      
      const totalSpent = completedOrders.reduce((sum, order) => 
        sum + (parseFloat(order.total) || parseFloat(order.totalAmount) || 0), 0
      );
      
      const averageOrderValue = completedOrders.length > 0 ? 
        Math.round(totalSpent / completedOrders.length) : 0;
      
      // آخر 3 طلبات
      const recentOrders = orders.slice(0, 3).map(order => ({
        id: order.orderNumber || order._id,
        date: new Date(order.createdAt).toLocaleDateString('ar-SA'),
        total: parseFloat(order.total) || parseFloat(order.totalAmount) || 0,
        status: getOrderStatusText(order.orderStatus, order.paymentStatus)
      }));
      
      // الإنفاق الشهري (آخر 4 أشهر)
      const monthlySpending = calculateMonthlySpending(completedOrders);
      
      // الفئة المفضلة (من المنتجات المطلوبة)
      const favoriteCategory = calculateFavoriteCategory(orders);
      
      // آخر طلب
      const lastOrderDate = orders.length > 0 ? 
        new Date(orders[0].createdAt).toLocaleDateString('ar-SA') : 
        'لا توجد طلبات';
      
      const realData = {
        totalOrders,
        totalSpent: Math.round(totalSpent),
        averageOrderValue,
        favoriteCategory: favoriteCategory || 'غير محدد',
        lastOrderDate,
        loyaltyPoints: Math.floor(totalSpent / 10), // نقطة لكل 10 ريال
        savedItems: 0, // يحتاج API منفصل
        reviewsCount: 0, // يحتاج API منفصل
        averageRating: 0,
        recentOrders,
        monthlySpending,
        completedOrdersCount: completedOrders.length,
        pendingOrdersCount: orders.filter(o => o.orderStatus === 'pending').length
      };
      
      console.log('📊 الإحصائيات الحقيقية:', realData);
      setCustomerData(realData);
      
    } catch (error) {
      console.error('❌ خطأ في جلب بيانات العميل:', error);
      setError('فشل في جلب البيانات. يرجى المحاولة مرة أخرى.');
    } finally {
      setLoading(false);
    }
  };

  const getOrderStatusText = (orderStatus, paymentStatus) => {
    if (orderStatus === 'delivered') return 'تم التسليم';
    if (orderStatus === 'shipped') return 'قيد الشحن';
    if (orderStatus === 'processing') return 'قيد المعالجة';
    if (orderStatus === 'cancelled') return 'ملغي';
    if (paymentStatus === 'paid') return 'مدفوع';
    if (paymentStatus === 'pending') return 'في انتظار الدفع';
    return 'قيد المراجعة';
  };

  const calculateMonthlySpending = (orders) => {
    const months = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
                   'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
    
    const monthlyData = {};
    const now = new Date();
    
    // آخر 4 أشهر
    for (let i = 3; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
      const monthName = months[date.getMonth()];
      monthlyData[monthKey] = { month: monthName, amount: 0 };
    }
    
    orders.forEach(order => {
      const orderDate = new Date(order.createdAt);
      const monthKey = `${orderDate.getFullYear()}-${orderDate.getMonth()}`;
      
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].amount += parseFloat(order.total) || parseFloat(order.totalAmount) || 0;
      }
    });
    
    return Object.values(monthlyData).map(data => ({
      month: data.month,
      amount: Math.round(data.amount)
    }));
  };

  const calculateFavoriteCategory = (orders) => {
    const categories = {};
    
    orders.forEach(order => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach(item => {
          const category = item.category || item.categoryName || 'غير محدد';
          categories[category] = (categories[category] || 0) + item.quantity;
        });
      }
    });
    
    const sortedCategories = Object.entries(categories)
      .sort(([,a], [,b]) => b - a);
    
    return sortedCategories.length > 0 ? sortedCategories[0][0] : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64 bg-[#111111]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#E08713] mx-auto mb-4"></div>
          <p className="text-gray-300">جاري تحميل إحصائياتك...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-64 bg-[#111111]">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h3 className="text-xl font-bold text-white mb-2">خطأ في تحميل البيانات</h3>
          <p className="text-gray-300 mb-4">{error}</p>
          <button
            onClick={fetchCustomerAnalytics}
            className="bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-2 mx-auto"
          >
            <FiRefreshCw />
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
    <div className="bg-[#111111] border border-[#C72C15] rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-300">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="p-3 rounded-full bg-gradient-to-r from-[#E08713] to-[#C72C15]">
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  // استخدام البيانات الحقيقية أو رسالة "لا توجد بيانات"
  const data = customerData || {
    totalOrders: 0,
    totalSpent: 0,
    averageOrderValue: 0,
    favoriteCategory: 'لا توجد طلبات بعد',
    lastOrderDate: 'لا توجد طلبات',
    loyaltyPoints: 0,
    savedItems: 0,
    reviewsCount: 0,
    recentOrders: [],
    monthlySpending: []
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[#111111] min-h-screen">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">إحصائياتي الشخصية</h1>
          <p className="text-gray-300">تتبع مشترياتك وأنشطتك في المتجر - بيانات حقيقية 100%</p>
        </div>
        <button
          onClick={fetchCustomerAnalytics}
          className="bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center gap-2"
        >
          <FiRefreshCw />
          تحديث
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="إجمالي الطلبات"
          value={data.totalOrders}
          icon={FiShoppingBag}
          color="blue"
          subtitle={`${data.completedOrdersCount || 0} مكتمل`}
        />
        <StatCard
          title="إجمالي المشتريات"
          value={`${data.totalSpent.toLocaleString()} ر.س`}
          icon={FiDollarSign}
          color="green"
          subtitle="القيمة الإجمالية"
        />
        <StatCard
          title="متوسط قيمة الطلب"
          value={`${data.averageOrderValue} ر.س`}
          icon={FiTrendingUp}
          color="purple"
          subtitle="لكل طلب مكتمل"
        />
        <StatCard
          title="نقاط الولاء"
          value={data.loyaltyPoints}
          icon={FiStar}
          color="yellow"
          subtitle="نقطة متاحة"
        />
      </div>

      {/* Content based on data availability */}
      {data.totalOrders === 0 ? (
        <div className="bg-[#111111] border border-[#C72C15] rounded-lg shadow-md p-12 text-center mb-8">
          <div className="text-6xl mb-4">🛍️</div>
          <h3 className="text-xl font-bold text-white mb-2">لم تقم بأي طلبات بعد</h3>
          <p className="text-gray-300 mb-6">ابدأ التسوق الآن واستمتع بتجربة رائعة</p>
          <button
            onClick={() => window.location.href = '/products'}
            className="bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white px-6 py-3 rounded-lg hover:opacity-90 transition-all"
          >
            تصفح المنتجات
          </button>
        </div>
      ) : (
        <>
          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
            {/* Recent Orders */}
            <div className="bg-[#111111] border border-[#C72C15] rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-white mb-4">الطلبات الأخيرة</h3>
              <div className="space-y-4">
                {data.recentOrders.length > 0 ? data.recentOrders.map((order, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-[#1a1a1a] border border-[#C72C15] rounded-lg">
                    <div>
                      <p className="font-medium text-white">{order.id}</p>
                      <p className="text-sm text-gray-300">{order.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-[#991b1b]">{order.total.toLocaleString()} ر.س</p>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'تم التسليم' ? 'bg-green-100 text-green-800' :
                        order.status === 'قيد الشحن' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'مدفوع' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                )) : (
                  <p className="text-gray-400 text-center py-4">لا توجد طلبات حديثة</p>
                )}
              </div>
            </div>

            {/* Additional Stats */}
            <div className="bg-[#111111] border border-[#C72C15] rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-white mb-4">إحصائيات إضافية</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiPackage className="h-5 w-5 text-gray-400 ml-3" />
                    <span className="text-sm text-gray-300">الفئة المفضلة</span>
                  </div>
                  <span className="text-sm font-medium text-white">{data.favoriteCategory}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiClock className="h-5 w-5 text-gray-400 ml-3" />
                    <span className="text-sm text-gray-300">آخر طلب</span>
                  </div>
                  <span className="text-sm font-medium text-white">{data.lastOrderDate}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <FiShoppingBag className="h-5 w-5 text-gray-400 ml-3" />
                    <span className="text-sm text-gray-300">طلبات معلقة</span>
                  </div>
                  <span className="text-sm font-medium text-white">{data.pendingOrdersCount || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Spending Chart */}
          {data.monthlySpending.length > 0 && (
            <div className="bg-[#111111] border border-[#C72C15] rounded-lg shadow-md p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">الإنفاق الشهري</h3>
              <div className="space-y-4">
                {data.monthlySpending.map((month, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-20 text-sm text-gray-300">{month.month}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-[#1a1a1a] border border-[#C72C15] rounded-full h-3">
                        <div 
                          className="bg-gradient-to-r from-[#E08713] to-[#C72C15] h-3 rounded-full transition-all duration-300"
                          style={{ 
                            width: `${data.monthlySpending.length > 0 ? 
                              (month.amount / Math.max(...data.monthlySpending.map(m => m.amount))) * 100 : 0}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="w-24 text-right text-sm font-medium text-[#991b1b]">
                      {month.amount.toLocaleString()} ر.س
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tips Section */}
      <div className="bg-gradient-to-r from-[#E08713] to-[#C72C15] rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-3">💡 نصائح لتوفير المال</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-white">
          <div className="flex items-start">
            <span className="text-white ml-2">•</span>
            <span>تابع العروض الأسبوعية لتوفير حتى 30%</span>
          </div>
          <div className="flex items-start">
            <span className="text-white ml-2">•</span>
            <span>استخدم نقاط الولاء للحصول على خصومات</span>
          </div>
          <div className="flex items-start">
            <span className="text-white ml-2">•</span>
            <span>اشترك في النشرة البريدية للعروض الحصرية</span>
          </div>
          <div className="flex items-start">
            <span className="text-white ml-2">•</span>
            <span>قارن الأسعار قبل الشراء</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;