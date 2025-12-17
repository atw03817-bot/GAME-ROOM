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
      
      const response = await fetch(
        `/api/real-analytics/dashboard?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('البيانات الحقيقية المستلمة:', data);
      setAnalyticsData(data);
      
    } catch (error) {
      console.error('خطأ في جلب البيانات الحقيقية:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <FiTrendingUp className="h-8 w-8 text-blue-400" />
                </div>
                <div className="mr-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    بيانات حقيقية 100%
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      جميع البيانات المعروضة مأخوذة مباشرة من قاعدة البيانات الحقيقية.
                      آخر تحديث: {new Date(analyticsData.generatedAt).toLocaleString('ar-SA')}
                    </p>
                    <p className="mt-1">
                      الفترة: من {analyticsData.period?.startDate} إلى {analyticsData.period?.endDate}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default RealAnalyticsDashboard;