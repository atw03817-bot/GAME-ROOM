import React, { useState, useEffect } from 'react';
import { 
  FiUsers, 
  FiShoppingCart, 
  FiDollarSign, 
  FiTrendingUp,
  FiPackage,
  FiRefreshCw,
  FiDownload,
  FiCalendar,
  FiAlertCircle
} from 'react-icons/fi';

const RealAnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetchRealAnalytics();
  }, [dateRange]);

  const fetchRealAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 محاولة جلب البيانات الحقيقية من السيرفر...');
      
      // قائمة المسارات المتاحة للتجربة
      const endpoints = [
        '/api/real-analytics/dashboard',
        '/api/orders/admin/all', 
        '/api/orders',
        '/api/orders/all'
      ];
      
      for (const endpoint of endpoints) {
        try {
          console.log(`🔗 محاولة الاتصال بـ: ${endpoint}`);
          
          const response = await fetch(endpoint, {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          });

          console.log(`📡 استجابة ${endpoint}:`, response.status, response.statusText);
          
          if (response.ok) {
            const contentType = response.headers.get('content-type');
            console.log(`📄 نوع المحتوى: ${contentType}`);
            
            if (contentType && contentType.includes('application/json')) {
              const data = await response.json();
              console.log(`✅ تم جلب البيانات من ${endpoint}:`, data);
              
              // إذا كانت البيانات من نظام التحليلات الحقيقي
              if (endpoint.includes('real-analytics')) {
                setAnalyticsData(data);
                return;
              }
              
              // إذا كانت البيانات من مسارات الطلبات، حساب الإحصائيات
              const analyticsData = calculateStatsFromOrders(data);
              setAnalyticsData(analyticsData);
              return;
            } else {
              console.log(`❌ ${endpoint} أرجع HTML بدلاً من JSON`);
            }
          } else {
            console.log(`❌ ${endpoint} أرجع خطأ: ${response.status}`);
          }
        } catch (error) {
          console.log(`❌ خطأ في الاتصال بـ ${endpoint}:`, error.message);
        }
      }

      // إذا فشلت جميع المحاولات
      console.log('⚠️ فشل في جلب البيانات من جميع المسارات');
      console.log('🔍 تجربة مسار بسيط للتأكد من الاتصال...');
      
      // تجربة أخيرة مع مسار بسيط
      try {
        const healthResponse = await fetch('/api/health');
        if (healthResponse.ok) {
          console.log('✅ السيرفر شغال، المشكلة في مسارات الطلبات');
        } else {
          console.log('❌ السيرفر مش شغال أو مش متاح');
        }
      } catch (error) {
        console.log('❌ مشكلة في الاتصال بالسيرفر:', error.message);
      }
      
      setAnalyticsData({
        sales: { totalOrders: 0, paidOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
        customers: { totalCustomers: 0, customersWithOrders: 0 },
        products: { totalProducts: 0, productsInStock: 0 },
        today: { orders: 0, revenue: 0, newCustomers: 0 },
        generatedAt: new Date(),
        period: { startDate: dateRange.startDate, endDate: dateRange.endDate },
        isEmpty: true,
        errorMessage: 'لم يتم العثور على مسارات API متاحة على السيرفر',
        debugInfo: {
          testedEndpoints: endpoints,
          serverStatus: 'غير معروف',
          suggestion: 'تحقق من أن السيرفر يحتوي على مسارات الطلبات'
        }
      });
      
    } catch (error) {
      console.error('❌ خطأ عام في جلب البيانات:', error);
      setError('فشل في الاتصال بالسيرفر. يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  // دالة حساب الإحصائيات من بيانات الطلبات
  const calculateStatsFromOrders = (ordersData) => {
    console.log('🧮 حساب الإحصائيات من البيانات:', ordersData);
    
    // استخراج الطلبات من البيانات
    let orders = [];
    if (Array.isArray(ordersData)) {
      orders = ordersData;
    } else if (ordersData.orders && Array.isArray(ordersData.orders)) {
      orders = ordersData.orders;
    } else if (ordersData.data && Array.isArray(ordersData.data)) {
      orders = ordersData.data;
    } else if (ordersData.success && ordersData.orders) {
      orders = ordersData.orders;
    }
    
    console.log(`📊 عدد الطلبات المستخرجة: ${orders.length}`);
    
    if (orders.length === 0) {
      console.log('⚠️ لا توجد طلبات في البيانات');
      return {
        sales: { totalOrders: 0, paidOrders: 0, totalRevenue: 0, avgOrderValue: 0 },
        customers: { totalCustomers: 0, customersWithOrders: 0 },
        products: { totalProducts: 0, productsInStock: 0 },
        today: { orders: 0, revenue: 0, newCustomers: 0 },
        generatedAt: new Date(),
        period: { startDate: dateRange.startDate, endDate: dateRange.endDate },
        dataSource: 'orders',
        isEmpty: true,
        message: 'لا توجد طلبات في قاعدة البيانات'
      };
    }
    
    // فلترة الطلبات المدفوعة
    const paidOrders = orders.filter(order => {
      const paymentStatus = order.paymentStatus?.toLowerCase();
      const orderStatus = order.orderStatus?.toLowerCase();
      return paymentStatus === 'paid' || 
             paymentStatus === 'approved' || 
             paymentStatus === 'completed' ||
             orderStatus === 'delivered' ||
             orderStatus === 'completed';
    });
    
    console.log(`💰 عدد الطلبات المدفوعة: ${paidOrders.length}`);
    
    // حساب الإيرادات
    const totalRevenue = paidOrders.reduce((sum, order) => {
      const orderTotal = parseFloat(order.total || order.totalAmount || order.amount) || 0;
      return sum + orderTotal;
    }, 0);
    
    console.log(`💵 إجمالي الإيرادات: ${totalRevenue}`);
    
    // حساب إحصائيات اليوم
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todayOrders = orders.filter(order => {
      const orderDate = new Date(order.createdAt || order.orderDate || order.date);
      return orderDate >= today;
    });
    
    const todayRevenue = todayOrders
      .filter(order => {
        const paymentStatus = order.paymentStatus?.toLowerCase();
        return paymentStatus === 'paid' || paymentStatus === 'approved';
      })
      .reduce((sum, order) => sum + (parseFloat(order.total || order.totalAmount || order.amount) || 0), 0);
    
    // حساب العملاء الفريدين
    const uniqueCustomers = [...new Set(orders.map(order => 
      order.user || order.userId || order.customerId || order.customer
    ).filter(Boolean))];
    
    console.log(`👥 عدد العملاء الفريدين: ${uniqueCustomers.length}`);

    // إحصائيات تفصيلية
    const pendingOrders = orders.filter(order => 
      order.orderStatus?.toLowerCase() === 'pending' || 
      order.paymentStatus?.toLowerCase() === 'pending'
    ).length;

    const cancelledOrders = orders.filter(order => 
      order.orderStatus?.toLowerCase() === 'cancelled' ||
      order.orderStatus?.toLowerCase() === 'canceled'
    ).length;

    return {
      sales: {
        totalOrders: orders.length,
        paidOrders: paidOrders.length,
        pendingOrders: pendingOrders,
        cancelledOrders: cancelledOrders,
        totalRevenue: totalRevenue,
        avgOrderValue: paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0,
        conversionRate: orders.length > 0 ? (paidOrders.length / orders.length * 100).toFixed(1) : 0
      },
      customers: {
        totalCustomers: uniqueCustomers.length,
        customersWithOrders: uniqueCustomers.length
      },
      products: {
        totalProducts: 0, // غير متاح من بيانات الطلبات
        productsInStock: 0
      },
      today: {
        orders: todayOrders.length,
        revenue: todayRevenue,
        newCustomers: 0 // غير متاح من بيانات الطلبات
      },
      generatedAt: new Date(),
      period: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      },
      dataSource: 'orders', // لتوضيح مصدر البيانات
      rawOrdersCount: orders.length,
      debugInfo: {
        sampleOrder: orders[0] || null,
        orderStatuses: [...new Set(orders.map(o => o.orderStatus))],
        paymentStatuses: [...new Set(orders.map(o => o.paymentStatus))]
      }
    };
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const exportReport = async () => {
    try {
      const dataStr = JSON.stringify(analyticsData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `real_analytics_${dateRange.startDate}_${dateRange.endDate}.json`;
      link.click();
      
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('خطأ في تصدير التقرير:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل البيانات الحقيقية...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiAlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">خطأ في تحميل البيانات</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchRealAnalytics}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  const StatCard = ({ title, value, icon: Icon, color = 'blue', subtitle }) => (
    <div className="bg-white rounded-lg shadow-md p-6 border-r-4 border-blue-500">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <Icon className={`h-6 w-6 text-${color}-600`} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">التحليلات الحقيقية</h1>
              <p className="text-gray-600">بيانات حقيقية 100% من قاعدة البيانات</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={fetchRealAnalytics}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                <FiRefreshCw className="ml-2" />
                تحديث
              </button>
              <button
                onClick={() => window.open('/QUICK_API_TEST.html', '_blank')}
                className="flex items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
              >
                <FiAlertCircle className="ml-2" />
                اختبار API
              </button>
              <button
                onClick={exportReport}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <FiDownload className="ml-2" />
                تصدير
              </button>
            </div>
          </div>
          
          {/* Date Range Selector */}
          <div className="flex items-center space-x-4 space-x-reverse">
            <div className="flex items-center">
              <FiCalendar className="ml-2 text-gray-500" />
              <label className="text-sm text-gray-600 ml-2">من:</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => handleDateRangeChange('startDate', e.target.value)}
                className="border border-gray-300 rounded px-3 py-1"
              />
            </div>
            <div className="flex items-center">
              <label className="text-sm text-gray-600 ml-2">إلى:</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => handleDateRangeChange('endDate', e.target.value)}
                className="border border-gray-300 rounded px-3 py-1"
              />
            </div>
          </div>
        </div>

        {analyticsData && (
          <>
            {/* Today's Stats */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">إحصائيات اليوم</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                  title="طلبات اليوم"
                  value={analyticsData.today?.orders || 0}
                  icon={FiShoppingCart}
                  color="blue"
                  subtitle="طلبات جديدة"
                />
                <StatCard
                  title="إيرادات اليوم"
                  value={`${(analyticsData.today?.revenue || 0).toLocaleString()} ر.س`}
                  icon={FiDollarSign}
                  color="green"
                  subtitle="من الطلبات المدفوعة"
                />
                <StatCard
                  title="عملاء جدد"
                  value={analyticsData.today?.newCustomers || 0}
                  icon={FiUsers}
                  color="purple"
                  subtitle="تسجيلات جديدة"
                />
              </div>
            </div>

            {/* Main Stats */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">الإحصائيات العامة</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                  title="إجمالي الطلبات"
                  value={analyticsData.sales?.totalOrders?.toLocaleString() || '0'}
                  icon={FiShoppingCart}
                  color="blue"
                  subtitle={`${analyticsData.sales?.paidOrders || 0} مدفوع`}
                />
                <StatCard
                  title="إجمالي الإيرادات"
                  value={`${(analyticsData.sales?.totalRevenue || 0).toLocaleString()} ر.س`}
                  icon={FiDollarSign}
                  color="green"
                  subtitle="من الطلبات المدفوعة فقط"
                />
                <StatCard
                  title="إجمالي العملاء"
                  value={analyticsData.customers?.totalCustomers?.toLocaleString() || '0'}
                  icon={FiUsers}
                  color="purple"
                  subtitle={`${analyticsData.customers?.customersWithOrders || 0} لديهم طلبات`}
                />
                <StatCard
                  title="إجمالي المنتجات"
                  value={analyticsData.products?.totalProducts?.toLocaleString() || '0'}
                  icon={FiPackage}
                  color="yellow"
                  subtitle={`${analyticsData.products?.productsInStock || 0} متوفر`}
                />
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Sales Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل المبيعات</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">متوسط قيمة الطلب:</span>
                    <span className="font-medium">{(analyticsData.sales?.avgOrderValue || 0).toFixed(2)} ر.س</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الطلبات المدفوعة:</span>
                    <span className="font-medium">{analyticsData.sales?.paidOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">معدل الدفع:</span>
                    <span className="font-medium">
                      {analyticsData.sales?.totalOrders > 0 
                        ? ((analyticsData.sales.paidOrders / analyticsData.sales.totalOrders) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Customer Details */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">تفاصيل العملاء</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">العملاء مع طلبات:</span>
                    <span className="font-medium">{analyticsData.customers?.customersWithOrders || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">معدل تحويل العملاء:</span>
                    <span className="font-medium">
                      {analyticsData.customers?.totalCustomers > 0 
                        ? ((analyticsData.customers.customersWithOrders / analyticsData.customers.totalCustomers) * 100).toFixed(1)
                        : 0}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">العملاء بدون طلبات:</span>
                    <span className="font-medium">
                      {(analyticsData.customers?.totalCustomers || 0) - (analyticsData.customers?.customersWithOrders || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Data Source Info */}
            <div className={`border rounded-lg p-6 ${
              analyticsData.isEmpty || analyticsData.errorMessage 
                ? 'bg-yellow-50 border-yellow-200' 
                : analyticsData.dataSource === 'orders'
                ? 'bg-orange-50 border-orange-200'
                : 'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  {analyticsData.isEmpty || analyticsData.errorMessage ? (
                    <FiAlertCircle className="h-8 w-8 text-yellow-500" />
                  ) : analyticsData.dataSource === 'orders' ? (
                    <FiRefreshCw className="h-8 w-8 text-orange-500" />
                  ) : (
                    <FiTrendingUp className="h-8 w-8 text-blue-400" />
                  )}
                </div>
                <div className="mr-3">
                  <h3 className={`text-sm font-medium ${
                    analyticsData.isEmpty || analyticsData.errorMessage 
                      ? 'text-yellow-800'
                      : analyticsData.dataSource === 'orders'
                      ? 'text-orange-800'
                      : 'text-blue-800'
                  }`}>
                    {analyticsData.isEmpty || analyticsData.errorMessage 
                      ? 'تحذير: لا توجد بيانات'
                      : analyticsData.dataSource === 'orders'
                      ? 'بيانات حقيقية (وضع الطوارئ)'
                      : 'بيانات حقيقية 100%'
                    }
                  </h3>
                  <div className={`mt-2 text-sm ${
                    analyticsData.isEmpty || analyticsData.errorMessage 
                      ? 'text-yellow-700'
                      : analyticsData.dataSource === 'orders'
                      ? 'text-orange-700'
                      : 'text-blue-700'
                  }`}>
                    {analyticsData.isEmpty || analyticsData.errorMessage ? (
                      <div>
                        <p>⚠️ نظام التحليلات الجديد غير متاح على السيرفر الحالي</p>
                        {analyticsData.errorMessage && (
                          <p className="mt-1 text-xs">{analyticsData.errorMessage}</p>
                        )}
                        {analyticsData.message && (
                          <p className="mt-1 text-xs bg-yellow-200 p-1 rounded">{analyticsData.message}</p>
                        )}
                        <p className="mt-2 text-xs">
                          يرجى رفع التحديثات الجديدة للسيرفر لتفعيل نظام التحليلات المتقدم
                        </p>
                      </div>
                    ) : analyticsData.dataSource === 'orders' ? (
                      <div>
                        <p>
                          البيانات محسوبة من الطلبات الحقيقية في قاعدة البيانات.
                          آخر تحديث: {new Date(analyticsData.generatedAt).toLocaleString('ar-SA')}
                        </p>
                        <p className="mt-1">
                          الفترة: من {analyticsData.period?.startDate} إلى {analyticsData.period?.endDate}
                        </p>
                        <p className="mt-2 text-xs bg-orange-100 p-2 rounded">
                          💡 يتم استخدام بيانات الطلبات مباشرة لحين تفعيل نظام التحليلات المتقدم
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p>
                          جميع البيانات المعروضة مأخوذة مباشرة من قاعدة البيانات الحقيقية.
                          آخر تحديث: {new Date(analyticsData.generatedAt).toLocaleString('ar-SA')}
                        </p>
                        <p className="mt-1">
                          الفترة: من {analyticsData.period?.startDate} إلى {analyticsData.period?.endDate}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Debug Info - للمطورين فقط */}
            {analyticsData?.debugInfo && (
              <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 معلومات التشخيص</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p><strong>عدد الطلبات الخام:</strong> {analyticsData.rawOrdersCount}</p>
                    <p><strong>مصدر البيانات:</strong> {analyticsData.dataSource}</p>
                    <p><strong>حالات الطلبات:</strong> {analyticsData.debugInfo.orderStatuses?.join(', ') || 'غير محدد'}</p>
                    <p><strong>حالات الدفع:</strong> {analyticsData.debugInfo.paymentStatuses?.join(', ') || 'غير محدد'}</p>
                  </div>
                  <div>
                    <p><strong>نموذج طلب:</strong></p>
                    <pre className="text-xs bg-white p-2 rounded border overflow-x-auto">
                      {JSON.stringify(analyticsData.debugInfo.sampleOrder, null, 2)}
                    </pre>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={() => {
                      console.log('🔍 بيانات التحليلات الكاملة:', analyticsData);
                      alert('تم طباعة البيانات في الكونسول');
                    }}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-xs hover:bg-gray-700"
                  >
                    طباعة البيانات في الكونسول
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default RealAnalyticsDashboard;