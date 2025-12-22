import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiRefreshCw,
  FiUsers,
} from 'react-icons/fi'
import api from '../../utils/api'

function Customers() {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [customers, setCustomers] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 15

  const fetchCustomers = async () => {
    try {
      setLoading(true)
      setError('')
      
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const params = new URLSearchParams()
      if (searchQuery) params.append('search', searchQuery)
      if (statusFilter !== 'all') params.append('status', statusFilter)

      const response = await api.get(`/customers?${params}`)
      const customersData = response.data.customers || response.data.data || []
      
      // Transform data to match expected format
      const transformedCustomers = customersData.map(customer => ({
        id: customer._id || customer.id,
        _id: customer._id || customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        status: customer.status || 'active',
        joinDate: customer.createdAt,
        createdAt: customer.createdAt,
        orders: customer.stats?.totalOrders || 0,
        completedOrders: customer.stats?.completedOrders || 0,
        totalSpent: customer.stats?.totalSpent || 0,
        lastOrderDate: customer.stats?.lastOrderDate || null
      }))
      
      setCustomers(transformedCustomers)
    } catch (err) {
      setError(err.message || 'فشل في جلب بيانات العملاء')
      console.error('Error fetching customers:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/customers/stats/overview')
      setStats(response.data)
    } catch (err) {
      console.error('Error fetching stats:', err)
    }
  }

  useEffect(() => {
    fetchCustomers()
    fetchStats()
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers()
    }, 500)
    return () => clearTimeout(timer)
  }, [searchQuery, statusFilter])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // Pagination
  const totalPages = Math.ceil(customers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentCustomers = customers.slice(startIndex, endIndex)

  // Reset to page 1 when search/filter changes
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
          <h1 className="text-3xl font-bold text-gray-800 mb-2">👥 إدارة العملاء</h1>
          <p className="text-gray-600">{customers.length} عميل</p>
        </div>
        <button
          onClick={() => {
            fetchCustomers()
            fetchStats()
          }}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition"
        >
          <FiRefreshCw size={18} />
          <span className="hidden md:inline">تحديث</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-6">
          <p>{error}</p>
        </div>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <span className="text-sm text-gray-600 block mb-2">إجمالي العملاء</span>
            <span className="text-2xl font-bold text-gray-800">{stats.totalCustomers}</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <span className="text-sm text-gray-600 block mb-2">نشطين</span>
            <span className="text-2xl font-bold text-green-600">{stats.activeCustomers}</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <span className="text-sm text-gray-600 block mb-2">إجمالي الطلبات</span>
            <span className="text-2xl font-bold text-gray-800">{stats.totalOrders}</span>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <span className="text-sm text-gray-600 block mb-2">إجمالي الإيرادات</span>
            <span className="text-2xl font-bold text-primary-600">
              {stats.totalRevenue.toLocaleString()} ر.س
            </span>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="ابحث عن عميل (الاسم، رقم الجوال، البريد)..."
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
            <option value="all">جميع العملاء</option>
            <option value="active">نشطين</option>
            <option value="inactive">غير نشطين</option>
          </select>
        </div>
      </div>

      {/* Empty State */}
      {customers.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">لا يوجد عملاء</h3>
          <p className="text-gray-600">
            {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'لم يتم تسجيل أي عملاء بعد'}
          </p>
        </div>
      )}

      {/* Customers Grid */}
      {customers.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCustomers.map((customer) => (
              <div key={customer.id || customer._id} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-2xl">
                      👤
                    </div>
                    <div>
                      <h3 className="font-bold">{customer.name}</h3>
                      <p className="text-sm text-gray-600">
                        انضم {formatDate(customer.joinDate || customer.createdAt)}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      customer.status === 'active'
                        ? 'bg-green-100 text-green-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {customer.status === 'active' ? 'نشط' : 'غير نشط'}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600" dir="ltr">
                      <FiPhone size={16} />
                      <span className="font-medium">{customer.phone}</span>
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <FiMail size={16} />
                      <span className="truncate">{customer.email}</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4 pt-4 border-t">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">الطلبات</p>
                    <p className="text-lg font-bold">{customer.orders || 0}</p>
                    <p className="text-sm text-gray-600">
                      {customer.completedOrders || 0} مكتمل
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">إجمالي الإنفاق</p>
                    <p className="text-lg font-bold text-primary-600">
                      {(customer.totalSpent || 0).toLocaleString()} ر.س
                    </p>
                  </div>
                </div>

                {customer.lastOrderDate && (
                  <p className="text-sm text-gray-600 mb-4">
                    آخر طلب: {formatDate(customer.lastOrderDate)}
                  </p>
                )}

                <div className="flex gap-2">
                  {customer.phone && (
                    <a
                      href={`tel:${customer.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 border border-primary-200 rounded-lg hover:bg-primary-100 transition text-sm font-medium"
                    >
                      <FiPhone size={16} />
                      اتصال
                    </a>
                  )}
                  {customer.email && (
                    <a
                      href={`mailto:${customer.email}`}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition text-sm"
                    >
                      <FiMail size={16} />
                      بريد
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 p-4 bg-white rounded-lg border border-gray-100">
              <div className="text-sm text-gray-600">
                عرض {startIndex + 1} - {Math.min(endIndex, customers.length)} من {customers.length}
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

export default Customers
