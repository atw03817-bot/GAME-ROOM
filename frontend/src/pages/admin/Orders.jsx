import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiSearch,
  FiEye,
  FiDownload,
  FiShoppingBag,
} from 'react-icons/fi'
import api from '../../utils/api'

function Orders() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [statusFilter, setStatusFilter] = useState('all')
  const itemsPerPage = 15

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await api.get('/orders/admin/all')
      const ordersArray = Array.isArray(response.data) ? response.data : (response.data.orders || response.data.data || [])
      
      // Transform orders to ensure consistent format
      const transformedOrders = ordersArray.map(order => ({
        ...order,
        _id: order._id || order.id,
        status: order.status || order.orderStatus || 'pending',
        createdAt: order.createdAt || new Date()
      }))
      
      setOrders(transformedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      if (error.response?.status === 401) {
        navigate('/login')
      }
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const badges = {
      'PENDING': 'bg-yellow-100 text-yellow-600',
      'PROCESSING': 'bg-primary-100 text-primary-600',
      'SHIPPED': 'bg-purple-100 text-purple-600',
      'DELIVERED': 'bg-green-100 text-green-600',
      'CANCELLED': 'bg-red-100 text-red-600',
      'pending': 'bg-yellow-100 text-yellow-600',
      'processing': 'bg-primary-100 text-primary-600',
      'shipped': 'bg-purple-100 text-purple-600',
      'delivered': 'bg-green-100 text-green-600',
      'cancelled': 'bg-red-100 text-red-600',
      'confirmed': 'bg-primary-100 text-primary-600',
    }
    return badges[status] || 'bg-gray-100 text-gray-600'
  }

  const getStatusText = (status) => {
    const texts = {
      'PENDING': 'قيد الانتظار',
      'PROCESSING': 'قيد المعالجة',
      'SHIPPED': 'قيد الشحن',
      'DELIVERED': 'مكتمل',
      'CANCELLED': 'ملغي',
      'pending': 'قيد الانتظار',
      'processing': 'قيد المعالجة',
      'shipped': 'قيد الشحن',
      'delivered': 'مكتمل',
      'cancelled': 'ملغي',
      'confirmed': 'مؤكد',
    }
    return texts[status] || texts[status?.toUpperCase()] || status
  }

  const getCustomerName = (order) => {
    if (order.user?.name) return order.user.name
    if (order.shippingAddress) {
      const addr = order.shippingAddress
      if (typeof addr === 'object') {
        return addr.fullName || addr.name || addr.firstName || addr.customerName || addr.recipientName || 'عميل'
      } else if (typeof addr === 'string') {
        try {
          const parsed = JSON.parse(addr)
          return parsed.fullName || parsed.name || parsed.firstName || parsed.customerName || parsed.recipientName || 'عميل'
        } catch {
          const nameMatch = addr.match(/"(?:fullName|name|firstName)"\s*:\s*"([^"]+)"/)
          return nameMatch ? nameMatch[1] : 'عميل'
        }
      }
    }
    if (order.customerName) return order.customerName
    if (order.customer?.name) return order.customer.name
    return 'عميل'
  }

  const getCustomerPhone = (order) => {
    if (order.user?.phone) return order.user.phone
    if (order.shippingAddress) {
      const addr = order.shippingAddress
      if (typeof addr === 'object') {
        return addr.phone || addr.mobile || addr.phoneNumber || '-'
      } else if (typeof addr === 'string') {
        try {
          const parsed = JSON.parse(addr)
          return parsed.phone || parsed.mobile || parsed.phoneNumber || '-'
        } catch {
          const phoneMatch = addr.match(/"(?:phone|mobile|phoneNumber)"\s*:\s*"([^"]+)"/)
          return phoneMatch ? phoneMatch[1] : '-'
        }
      }
    }
    if (order.customerPhone || order.phone) return order.customerPhone || order.phone
    if (order.customer?.phone) return order.customer.phone
    return '-'
  }

  let filteredOrders = orders.filter(o => {
    const matchesSearch = o._id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getCustomerName(o).toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      o.status?.toLowerCase() === statusFilter.toLowerCase()
    
    return matchesSearch && matchesStatus
  })

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentOrders = filteredOrders.slice(startIndex, endIndex)

  // Reset to page 1 when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter])

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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🛒 إدارة الطلبات</h1>
          <p className="text-gray-600">{orders.length} طلب</p>
        </div>
        <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition">
          <FiDownload size={18} />
          <span className="hidden md:inline">تصدير</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">إجمالي الطلبات</span>
          <span className="text-2xl font-bold text-gray-800">{orders.length}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">قيد المعالجة</span>
          <span className="text-2xl font-bold text-primary-600">
            {orders.filter(o => o.status?.toLowerCase() === 'processing').length}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">مكتملة</span>
          <span className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status?.toLowerCase() === 'delivered').length}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">ملغية</span>
          <span className="text-2xl font-bold text-red-600">
            {orders.filter(o => o.status?.toLowerCase() === 'cancelled').length}
          </span>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="ابحث برقم الطلب أو اسم العميل..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <FiSearch className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="pending">قيد الانتظار</option>
            <option value="processing">قيد المعالجة</option>
            <option value="shipped">قيد الشحن</option>
            <option value="delivered">مكتمل</option>
            <option value="cancelled">ملغي</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {filteredOrders.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">🛒</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد طلبات</h3>
          <p className="text-gray-600">
            {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'لم يتم إنشاء أي طلبات بعد'}
          </p>
        </div>
      )}

      {/* Orders Grid (Mobile) */}
      {filteredOrders.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 md:hidden">
            {currentOrders.map((order) => {
              const orderId = order._id || order.id
              const orderNumber = order.orderNumber || `#${orderId?.slice(-6)}` || '#000000'
              
              return (
                <div key={orderId} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">رقم الطلب</p>
                      <p className="font-bold text-primary-600">{orderNumber}</p>
                    </div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">العميل</p>
                    <p className="font-bold">{getCustomerName(order)}</p>
                  </div>

                  <div className="flex justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-600">المنتجات</p>
                      <p className="font-bold">{order.items?.length || 0}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">المبلغ</p>
                      <p className="font-bold text-primary-600">
                        {order.total?.toLocaleString()} ر.س
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>

                  <button
                    onClick={() => navigate(`/admin/orders/${orderId}`)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <FiEye size={16} />
                    عرض التفاصيل
                  </button>
                </div>
              )
            })}
          </div>

          {/* Desktop Table */}
          <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">رقم الطلب</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">العميل</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المنتجات</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">المبلغ</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الحالة</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">التاريخ</th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-gray-700">الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {currentOrders.map((order) => {
                  const orderId = order._id || order.id
                  const orderNumber = order.orderNumber || `#${orderId?.slice(-6)}` || '#000000'
                  
                  return (
                    <tr key={orderId} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <span className="font-bold text-primary-600">{orderNumber}</span>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-bold">{getCustomerName(order)}</p>
                          <p className="text-sm text-gray-600">{getCustomerPhone(order)}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{order.items?.length || 0} منتج</td>
                      <td className="py-4 px-6 font-bold">{order.total?.toLocaleString()} ر.س</td>
                      <td className="py-4 px-6">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}>
                          {getStatusText(order.status)}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="py-4 px-6">
                        <button
                          onClick={() => navigate(`/admin/orders/${orderId}`)}
                          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                        >
                          <FiEye size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg border border-gray-100">
              <div className="text-sm text-gray-600">
                عرض {startIndex + 1} - {Math.min(endIndex, filteredOrders.length)} من {filteredOrders.length}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  السابق
                </button>
                
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-10 h-10 rounded-lg font-bold transition ${
                            currentPage === page
                              ? 'bg-primary-600 text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {page}
                        </button>
                      )
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="flex items-center px-2">...</span>
                    }
                    return null
                  })}
                </div>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Orders
