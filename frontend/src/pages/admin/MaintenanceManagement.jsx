import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiTool, FiPlus, FiSearch, FiFilter, FiEye, FiEdit, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function MaintenanceManagement() {
  const navigate = useNavigate()
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [stats, setStats] = useState({})

  const statusOptions = [
    { value: 'received', label: 'تم الاستلام', color: 'bg-blue-100 text-blue-800' },
    { value: 'diagnosed', label: 'تم الفحص', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'waiting_approval', label: 'في انتظار الموافقة', color: 'bg-orange-100 text-orange-800' },
    { value: 'approved', label: 'تمت الموافقة', color: 'bg-green-100 text-green-800' },
    { value: 'in_progress', label: 'قيد الإصلاح', color: 'bg-purple-100 text-purple-800' },
    { value: 'testing', label: 'قيد الاختبار', color: 'bg-indigo-100 text-indigo-800' },
    { value: 'ready', label: 'جاهز للاستلام', color: 'bg-green-100 text-green-800' },
    { value: 'completed', label: 'مكتمل', color: 'bg-gray-100 text-gray-800' },
    { value: 'cancelled', label: 'ملغي', color: 'bg-red-100 text-red-800' }
  ]

  const priorityOptions = [
    { value: 'normal', label: 'عادي', color: 'bg-gray-100 text-gray-800' },
    { value: 'urgent', label: 'عاجل', color: 'bg-orange-100 text-orange-800' },
    { value: 'emergency', label: 'طارئ', color: 'bg-red-100 text-red-800' }
  ]

  useEffect(() => {
    fetchRequests()
    fetchStats()
  }, [currentPage, statusFilter, priorityFilter, searchTerm])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        ...(statusFilter && { status: statusFilter }),
        ...(priorityFilter && { priority: priorityFilter }),
        ...(searchTerm && { search: searchTerm })
      })

      const response = await api.get(`/maintenance?${params}`)
      if (response.data.success) {
        setRequests(response.data.data.requests)
        setTotalPages(response.data.data.pagination.pages)
      }
    } catch (error) {
      console.error('Error fetching maintenance requests:', error)
      toast.error('خطأ في جلب طلبات الصيانة')
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const response = await api.get('/maintenance/stats')
      if (response.data.success) {
        setStats(response.data.data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const printQuickLabel = (request) => {
    // إنشاء نافذة جديدة للطباعة
    const printWindow = window.open('', '_blank', 'width=400,height=300')
    
    const labelHTML = `
      <!DOCTYPE html>
      <html dir="rtl">
      <head>
        <meta charset="UTF-8">
        <title>ملصق طلب صيانة</title>
        <style>
          @page {
            size: 50mm 25mm;
            margin: 0;
          }
          
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          html, body {
            width: 50mm;
            height: 25mm;
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            font-size: 8px;
            line-height: 1.1;
            overflow: hidden;
          }
          
          .label-container {
            width: 50mm;
            height: 25mm;
            border: 1px solid #000;
            padding: 2mm;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            text-align: center;
            position: relative;
          }
          
          .header {
            font-weight: bold;
            font-size: 7px;
            margin-bottom: 1mm;
          }
          
          .request-number {
            font-size: 12px;
            font-weight: bold;
            margin: 1mm 0;
            padding: 1mm;
            background: #f0f0f0;
            border: 1px solid #333;
          }
          
          .serial-number {
            font-size: 6px;
            font-family: monospace;
            margin: 0.5mm 0;
            font-weight: bold;
          }
          
          .date {
            font-size: 5px;
            color: #666;
            margin-top: 0.5mm;
          }
          
          @media print {
            html, body {
              width: 50mm !important;
              height: 25mm !important;
              margin: 0 !important;
              padding: 0 !important;
            }
            
            .label-container {
              width: 50mm !important;
              height: 25mm !important;
              page-break-inside: avoid;
              page-break-after: avoid;
            }
            
            @page {
              size: 50mm 25mm;
              margin: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="label-container">
          <div class="header">
            🔧 صيانة HOTWAV
          </div>
          
          <div class="request-number">
            ${request.requestNumber}
          </div>
          
          <div class="serial-number">
            ${request.device.serialNumber}
          </div>
          
          <div class="date">
            ${new Date(request.createdAt).toLocaleDateString('ar-SA')}
          </div>
        </div>
      </body>
      </html>
    `
    
    printWindow.document.write(labelHTML)
    printWindow.document.close()
    
    // انتظار تحميل المحتوى ثم الطباعة
    printWindow.onload = () => {
      setTimeout(() => {
        // إضافة تعليمات الطباعة
        printWindow.focus()
        printWindow.print()
        
        // إغلاق النافذة بعد الطباعة
        setTimeout(() => {
          printWindow.close()
        }, 1000)
      }, 500)
    }
    
    // تحديث حالة طباعة الملصق في قاعدة البيانات
    updateLabelPrintStatus(request._id)
  }

  const updateLabelPrintStatus = async (requestId) => {
    try {
      await api.patch(`/maintenance/${requestId}`, {
        labelPrinted: true
      })
      // إعادة تحميل البيانات لتحديث المؤشر
      fetchRequests()
    } catch (error) {
      console.error('Error updating label print status:', error)
    }
  }

  const getStatusBadge = (status) => {
    const statusOption = statusOptions.find(opt => opt.value === status)
    return statusOption ? (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusOption.color}`}>
        {statusOption.label}
      </span>
    ) : status
  }

  const getPriorityBadge = (priority) => {
    const priorityOption = priorityOptions.find(opt => opt.value === priority)
    return priorityOption ? (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityOption.color}`}>
        {priorityOption.label}
      </span>
    ) : priority
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 lg:p-6" dir="rtl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <FiTool className="w-8 h-8 text-primary-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">إدارة الصيانة</h1>
            <p className="text-gray-600">إدارة جميع طلبات الصيانة والمتابعة</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/admin/maintenance/create')}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          طلب صيانة جديد
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">إجمالي الطلبات</p>
              <p className="text-2xl font-bold text-gray-900">{stats.overview?.total || 0}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiTool className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">قيد الإصلاح</p>
              <p className="text-2xl font-bold text-orange-600">{stats.statusBreakdown?.in_progress || 0}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FiClock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">جاهز للاستلام</p>
              <p className="text-2xl font-bold text-green-600">{stats.statusBreakdown?.ready || 0}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">متوسط وقت الإصلاح</p>
              <p className="text-2xl font-bold text-purple-600">{Math.round(stats.overview?.avgRepairDays || 0)} يوم</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiAlertCircle className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative">
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="البحث برقم الطلب، اسم العميل..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">جميع الحالات</option>
            {statusOptions.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">جميع الأولويات</option>
            {priorityOptions.map(priority => (
              <option key={priority.value} value={priority.value}>{priority.label}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('')
              setStatusFilter('')
              setPriorityFilter('')
              setCurrentPage(1)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
          >
            <FiFilter className="w-4 h-4" />
            إعادة تعيين
          </button>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            <span className="mr-3 text-lg">جاري التحميل...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-12">
            <FiTool className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد طلبات صيانة</h3>
            <p className="text-gray-500 mb-6">لم يتم إنشاء أي طلبات صيانة بعد</p>
            <button
              onClick={() => navigate('/admin/maintenance/create')}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              إنشاء طلب صيانة جديد
            </button>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">رقم الطلب</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">العميل</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الجهاز</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الحالة</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الأولوية</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">التاريخ</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {requests.map((request) => (
                    <tr key={request._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{request.requestNumber}</span>
                          {request.createdBy === 'admin' && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              إدارة
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.customerInfo?.name}</div>
                        <div className="text-sm text-gray-500">{request.customerInfo?.phone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{request.device?.model}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(request.status?.current)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(request.issue?.priority)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/admin/maintenance/${request._id}`)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="عرض التفاصيل"
                          >
                            <FiEye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => printQuickLabel(request)}
                            className={`transition-colors ${
                              request.labelPrinted 
                                ? 'text-green-600 hover:text-green-900' 
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                            title={request.labelPrinted ? 'إعادة طباعة الملصق' : 'طباعة ملصق الطلب'}
                          >
                            {request.labelPrinted ? '🏷️✅' : '🏷️'}
                          </button>
                          <button
                            onClick={() => navigate(`/admin/maintenance/${request._id}/edit`)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="تعديل"
                          >
                            <FiEdit className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-gray-200">
              {requests.map((request) => (
                <div key={request._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 className="font-medium text-gray-900 flex items-center gap-2">
                        <FiTool className="w-4 h-4 text-primary-600" />
                        {request.requestNumber}
                        {request.createdBy === 'admin' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            إدارة
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(request.createdAt).toLocaleDateString('ar-SA')}
                      </p>
                    </div>
                    {getStatusBadge(request.status?.current)}
                  </div>
                  
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">العميل:</span>
                      <span className="text-sm font-medium text-gray-900">{request.customerInfo?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">الجهاز:</span>
                      <span className="text-sm font-medium text-gray-900">{request.device?.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">الأولوية:</span>
                      {getPriorityBadge(request.issue?.priority)}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/admin/maintenance/${request._id}`)}
                      className="flex-1 bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors"
                    >
                      عرض التفاصيل
                    </button>
                    <button
                      onClick={() => printQuickLabel(request)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        request.labelPrinted 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-700 border border-gray-300'
                      }`}
                      title={request.labelPrinted ? 'إعادة طباعة الملصق' : 'طباعة ملصق الطلب'}
                    >
                      {request.labelPrinted ? '🏷️✅' : '🏷️'}
                    </button>
                    <button
                      onClick={() => navigate(`/admin/maintenance/${request._id}/edit`)}
                      className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      تعديل
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              السابق
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="mr-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              التالي
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                عرض صفحة <span className="font-medium">{currentPage}</span> من{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors ${
                      page === currentPage
                        ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MaintenanceManagement