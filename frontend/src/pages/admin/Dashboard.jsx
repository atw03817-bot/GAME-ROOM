import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiTrendingUp,
  FiDollarSign,
  FiShoppingCart,
  FiPackage,
  FiUsers,
} from 'react-icons/fi'
import api from '../../utils/api'

function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    totalCustomers: 0,
  })
  const [recentOrders, setRecentOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      // Fetch user profile
      const profileRes = await api.get('/auth/profile')
      setUser(profileRes.data.user)

      // Fetch orders
      const ordersRes = await api.get('/orders')
      const orders = ordersRes.data.orders || []
      setRecentOrders(orders.slice(0, 5))

      // Fetch products
      const productsRes = await api.get('/products', { params: { limit: 1000 } })
      const products = productsRes.data.products || []

      // Calculate stats
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)
      
      setStats({
        totalOrders: orders.length,
        totalProducts: products.length,
        totalRevenue: totalRevenue,
        totalCustomers: 1234, // TODO: Get from API
      })

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
      case 'delivered':
        return 'bg-green-100 text-green-600'
      case 'processing':
      case 'pending':
        return 'bg-orange-100 text-orange-600'
      case 'shipping':
      case 'shipped':
        return 'bg-primary-100 text-primary-600'
      case 'cancelled':
        return 'bg-red-100 text-red-600'
      default:
        return 'bg-gray-100 text-gray-600'
    }
  }

  const getStatusText = (status) => {
    const statusMap = {
      pending: 'قيد الانتظار',
      processing: 'قيد المعالجة',
      shipped: 'قيد الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
      completed: 'مكتمل',
    }
    return statusMap[status] || status
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">📊 لوحة التحكم</h1>
        <p className="text-gray-600">مرحباً بك، {user?.name || 'المدير'}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Revenue */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">إجمالي المبيعات</span>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white">
              <FiDollarSign size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {stats.totalRevenue.toLocaleString()} ر.س
          </div>
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-green-600" size={14} />
            <span className="text-xs text-green-600 font-bold">+12.5%</span>
            <span className="text-xs text-gray-500">من الشهر الماضي</span>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">الطلبات</span>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-500 flex items-center justify-center text-white">
              <FiShoppingCart size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {stats.totalOrders}
          </div>
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-green-600" size={14} />
            <span className="text-xs text-green-600 font-bold">+8.2%</span>
            <span className="text-xs text-gray-500">من الشهر الماضي</span>
          </div>
        </div>

        {/* Total Products */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">المنتجات</span>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
              <FiPackage size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {stats.totalProducts}
          </div>
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-green-600" size={14} />
            <span className="text-xs text-green-600 font-bold">+3</span>
            <span className="text-xs text-gray-500">منتجات جديدة</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">العملاء</span>
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center text-white">
              <FiUsers size={20} />
            </div>
          </div>
          <div className="text-2xl font-bold text-gray-800 mb-2">
            {stats.totalCustomers}
          </div>
          <div className="flex items-center gap-2">
            <FiTrendingUp className="text-green-600" size={14} />
            <span className="text-xs text-green-600 font-bold">+15.3%</span>
            <span className="text-xs text-gray-500">من الشهر الماضي</span>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">أحدث الطلبات</h2>
          <button
            onClick={() => navigate('/admin/orders')}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
          >
            عرض الكل ←
          </button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            لا توجد طلبات حالياً
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    رقم الطلب
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    العميل
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    المبلغ
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    الحالة
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">
                    التاريخ
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-primary-600">
                        #{order._id?.slice(-6)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-700">
                      {order.customer?.name || order.shippingAddress?.fullName || 'غير محدد'}
                    </td>
                    <td className="py-3 px-4 font-semibold text-gray-800">
                      {order.total?.toLocaleString()} ر.س
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
