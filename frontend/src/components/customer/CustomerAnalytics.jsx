import React, { useState, useEffect } from 'react';
import { 
  FiShoppingBag, 
  FiDollarSign, 
  FiTrendingUp,
  FiEye,
  FiHeart,
  FiClock,
  FiPackage,
  FiStar
} from 'react-icons/fi';

const CustomerAnalytics = () => {
  const [customerData, setCustomerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCustomerAnalytics();
  }, []);

  const fetchCustomerAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/analytics/customer/stats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setCustomerData(data);
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات العميل:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
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

  // بيانات وهمية للعرض (ستستبدل بالبيانات الحقيقية)
  const mockData = customerData || {
    totalOrders: 12,
    totalSpent: 4580,
    averageOrderValue: 382,
    favoriteCategory: 'الهواتف الذكية',
    lastOrderDate: '2024-01-15',
    loyaltyPoints: 458,
    savedItems: 8,
    reviewsCount: 5,
    averageRating: 4.2,
    recentOrders: [
      { id: 'ORD-001', date: '2024-01-15', total: 1299, status: 'تم التسليم' },
      { id: 'ORD-002', date: '2024-01-10', total: 899, status: 'قيد الشحن' },
      { id: 'ORD-003', date: '2024-01-05', total: 599, status: 'تم التسليم' }
    ],
    monthlySpending: [
      { month: 'يناير', amount: 1299 },
      { month: 'ديسمبر', amount: 899 },
      { month: 'نوفمبر', amount: 1599 },
      { month: 'أكتوبر', amount: 799 }
    ]
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إحصائياتي الشخصية</h1>
        <p className="text-gray-600">تتبع مشترياتك وأنشطتك في المتجر</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="إجمالي الطلبات"
          value={mockData.totalOrders}
          icon={FiShoppingBag}
          color="blue"
          subtitle="منذ التسجيل"
        />
        <StatCard
          title="إجمالي المشتريات"
          value={`${mockData.totalSpent.toLocaleString()} ر.س`}
          icon={FiDollarSign}
          color="green"
          subtitle="القيمة الإجمالية"
        />
        <StatCard
          title="متوسط قيمة الطلب"
          value={`${mockData.averageOrderValue} ر.س`}
          icon={FiTrendingUp}
          color="purple"
          subtitle="لكل طلب"
        />
        <StatCard
          title="نقاط الولاء"
          value={mockData.loyaltyPoints}
          icon={FiStar}
          color="yellow"
          subtitle="نقطة متاحة"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">الطلبات الأخيرة</h3>
          <div className="space-y-4">
            {mockData.recentOrders.map((order, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <p className="text-sm text-gray-500">{order.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{order.total.toLocaleString()} ر.س</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'تم التسليم' ? 'bg-green-100 text-green-800' :
                    order.status === 'قيد الشحن' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Favorite Category & Stats */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">إحصائيات إضافية</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiPackage className="h-5 w-5 text-gray-500 ml-3" />
                <span className="text-sm text-gray-600">الفئة المفضلة</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{mockData.favoriteCategory}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiHeart className="h-5 w-5 text-gray-500 ml-3" />
                <span className="text-sm text-gray-600">العناصر المحفوظة</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{mockData.savedItems}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiStar className="h-5 w-5 text-gray-500 ml-3" />
                <span className="text-sm text-gray-600">التقييمات المكتوبة</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{mockData.reviewsCount}</span>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FiClock className="h-5 w-5 text-gray-500 ml-3" />
                <span className="text-sm text-gray-600">آخر طلب</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{mockData.lastOrderDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Monthly Spending Chart */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">الإنفاق الشهري</h3>
        <div className="space-y-4">
          {mockData.monthlySpending.map((month, index) => (
            <div key={index} className="flex items-center">
              <div className="w-20 text-sm text-gray-600">{month.month}</div>
              <div className="flex-1 mx-4">
                <div className="bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-blue-500 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${(month.amount / Math.max(...mockData.monthlySpending.map(m => m.amount))) * 100}%` }}
                  ></div>
                </div>
              </div>
              <div className="w-24 text-right text-sm font-medium text-gray-900">
                {month.amount.toLocaleString()} ر.س
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips Section */}
      <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">💡 نصائح لتوفير المال</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div className="flex items-start">
            <span className="text-blue-500 ml-2">•</span>
            <span>تابع العروض الأسبوعية لتوفير حتى 30%</span>
          </div>
          <div className="flex items-start">
            <span className="text-blue-500 ml-2">•</span>
            <span>استخدم نقاط الولاء للحصول على خصومات</span>
          </div>
          <div className="flex items-start">
            <span className="text-blue-500 ml-2">•</span>
            <span>اشترك في النشرة البريدية للعروض الحصرية</span>
          </div>
          <div className="flex items-start">
            <span className="text-blue-500 ml-2">•</span>
            <span>قارن الأسعار قبل الشراء</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerAnalytics;