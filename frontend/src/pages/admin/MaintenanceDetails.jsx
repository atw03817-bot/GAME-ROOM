import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiSmartphone, FiTool, FiUser, FiClock, FiDollarSign, FiFileText, FiPhone, FiMail, FiMapPin, FiEdit, FiSave, FiX } from 'react-icons/fi'
import { FaTools, FaWrench, FaCheckCircle, FaTimes, FaBox } from 'react-icons/fa'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import PatternDisplay from '../../components/PatternDisplay'

function MaintenanceDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [editingStatus, setEditingStatus] = useState(false)
  const [newStatus, setNewStatus] = useState('')
  const [statusNote, setStatusNote] = useState('')
  
  // حالة تحديث الشحن
  const [editingShipping, setEditingShipping] = useState(false)
  const [shippingData, setShippingData] = useState({
    status: '',
    trackingNumber: '',
    notes: ''
  })
  
  // حالة تحديث الدفع
  const [editingPayment, setEditingPayment] = useState(false)
  const [paymentStatus, setPaymentStatus] = useState('')

  const statusOptions = [
    { value: 'received', label: 'تم الاستلام' },
    { value: 'diagnosed', label: 'تم الفحص' },
    { value: 'waiting_approval', label: 'في انتظار الموافقة' },
    { value: 'approved', label: 'تمت الموافقة' },
    { value: 'in_progress', label: 'قيد الإصلاح' },
    { value: 'testing', label: 'قيد الاختبار' },
    { value: 'ready', label: 'جاهز للاستلام' },
    { value: 'completed', label: 'مكتمل' },
    { value: 'cancelled', label: 'ملغي' },
    { value: 'on_hold', label: 'معلق' }
  ]

  useEffect(() => {
    fetchRequest()
  }, [id])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/maintenance/${id}`)
      if (response.data.success) {
        setRequest(response.data.data)
        setNewStatus(response.data.data.status?.current || '')
      } else {
        toast.error('طلب الصيانة غير موجود')
        navigate('/admin/maintenance')
      }
    } catch (error) {
      console.error('Error fetching maintenance request:', error)
      toast.error('خطأ في جلب تفاصيل الطلب')
      navigate('/admin/maintenance')
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async () => {
    if (!newStatus) return

    try {
      setUpdating(true)
      const response = await api.patch(`/maintenance/${id}/status`, {
        status: newStatus,
        note: statusNote
      })
      
      if (response.data.success) {
        toast.success('تم تحديث حالة الطلب بنجاح')
        setEditingStatus(false)
        setStatusNote('')
        fetchRequest()
      }
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('خطأ في تحديث الحالة')
    } finally {
      setUpdating(false)
    }
  }

  const handleDeleteRequest = async () => {
    try {
      setUpdating(true)
      const response = await api.delete(`/maintenance/${id}`)
      
      if (response.data.success) {
        toast.success('تم حذف الطلب بنجاح')
        navigate('/admin/maintenance')
      }
    } catch (error) {
      console.error('Error deleting request:', error)
      if (error.response?.status === 403) {
        toast.error('لا يمكن حذف الطلبات المنشأة من العملاء')
      } else {
        toast.error('خطأ في حذف الطلب')
      }
    } finally {
      setUpdating(false)
    }
  }

  const updateShippingStatus = async () => {
    try {
      setUpdating(true)
      const response = await api.patch(`/maintenance/${id}/shipping-status`, shippingData)
      
      if (response.data.success) {
        toast.success('تم تحديث حالة الشحن بنجاح')
        setEditingShipping(false)
        setShippingData({ status: '', trackingNumber: '', notes: '' })
        fetchRequest()
      }
    } catch (error) {
      console.error('Error updating shipping status:', error)
      toast.error('خطأ في تحديث حالة الشحن')
    } finally {
      setUpdating(false)
    }
  }

  const updatePaymentStatus = async () => {
    try {
      setUpdating(true)
      const response = await api.patch(`/maintenance/${id}/payment-status`, {
        paymentStatus: paymentStatus
      })
      
      if (response.data.success) {
        toast.success('تم تحديث حالة الدفع بنجاح')
        setEditingPayment(false)
        setPaymentStatus('')
        fetchRequest()
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('خطأ في تحديث حالة الدفع')
    } finally {
      setUpdating(false)
    }
  }

  const printLabel = () => {
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
    updateLabelPrintStatus()
  }

  const updateLabelPrintStatus = async () => {
    try {
      await api.patch(`/maintenance/${id}`, {
        labelPrinted: true
      })
    } catch (error) {
      console.error('Error updating label print status:', error)
    }
  }
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'received':
        return 'bg-blue-100 text-blue-700'
      case 'diagnosed':
        return 'bg-yellow-100 text-yellow-700'
      case 'waiting_approval':
        return 'bg-orange-100 text-orange-700'
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'in_progress':
        return 'bg-purple-100 text-purple-700'
      case 'testing':
        return 'bg-indigo-100 text-indigo-700'
      case 'ready':
        return 'bg-green-200 text-green-800'
      case 'completed':
        return 'bg-gray-100 text-gray-800'
      case 'cancelled':
        return 'bg-red-100 text-red-700'
      case 'on_hold':
        return 'bg-gray-200 text-gray-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'received':
        return 'تم الاستلام'
      case 'diagnosed':
        return 'تم الفحص'
      case 'waiting_approval':
        return 'في انتظار الموافقة'
      case 'approved':
        return 'تمت الموافقة'
      case 'in_progress':
        return 'قيد الإصلاح'
      case 'testing':
        return 'قيد الاختبار'
      case 'ready':
        return 'جاهز للاستلام'
      case 'completed':
        return 'مكتمل'
      case 'cancelled':
        return 'ملغي'
      case 'on_hold':
        return 'معلق'
      default:
        return status
    }
  }

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'received':
        return <FaBox />
      case 'diagnosed':
        return <FaWrench />
      case 'waiting_approval':
        return <FiClock />
      case 'approved':
        return <FaCheckCircle />
      case 'in_progress':
        return <FaTools />
      case 'testing':
        return <FiClock />
      case 'ready':
        return <FaCheckCircle />
      case 'completed':
        return <FaCheckCircle />
      case 'cancelled':
        return <FaTimes />
      case 'on_hold':
        return <FiClock />
      default:
        return <FiClock />
    }
  }

  const getIssueCategoryText = (category) => {
    switch (category?.toLowerCase()) {
      case 'hardware':
        return 'عتاد/هاردوير';
      case 'software':
        return 'برمجيات/سوفتوير';
      case 'screen':
        return 'الشاشة';
      case 'battery':
        return 'البطارية';
      case 'charging':
        return 'الشحن';
      case 'camera':
        return 'الكاميرا';
      case 'audio':
        return 'الصوت';
      case 'network':
        return 'الشبكة';
      case 'performance':
        return 'الأداء';
      case 'other':
        return 'أخرى';
      default:
        return category;
    }
  }
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">طلب الصيانة غير موجود</h2>
          <button
            onClick={() => navigate('/admin/maintenance')}
            className="text-primary-600 hover:text-primary-700"
          >
            العودة لقائمة الطلبات
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate('/admin/maintenance')}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              طلب صيانة #{request.requestNumber}
            </h1>
            <p className="text-gray-600">
              تم الإنشاء في {new Date(request.createdAt).toLocaleDateString('ar-SA')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status Card with Admin Controls */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">حالة الطلب</h2>
                <div className="flex items-center gap-3">
                  <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(request.status.current)}`}>
                    {getStatusIcon(request.status.current)}
                    {getStatusText(request.status.current)}
                  </span>
                  {!editingStatus && (
                    <button
                      onClick={() => setEditingStatus(true)}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                      title="تعديل الحالة"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Admin Status Update */}
              {editingStatus && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-blue-900 mb-3">تحديث حالة الطلب</h3>
                  <div className="space-y-3">
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {statusOptions.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                    
                    <textarea
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      placeholder="ملاحظة (اختيارية)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows="3"
                    />
                    
                    <div className="flex gap-2">
                      <button
                        onClick={updateStatus}
                        disabled={updating}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {updating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <FiSave className="w-4 h-4" />
                        )}
                        حفظ التحديث
                      </button>
                      <button
                        onClick={() => {
                          setEditingStatus(false)
                          setNewStatus(request.status?.current || '')
                          setStatusNote('')
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {request.status.current === 'ready' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <FaCheckCircle />
                    <span className="font-bold">الجهاز جاهز للاستلام!</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    يمكن للعميل زيارة المحل لاستلام جهازه. تأكد من إحضار الهوية الشخصية.
                  </p>
                </div>
              )}

              {request.status.current === 'waiting_approval' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-orange-800 mb-2">
                    <FiClock />
                    <span className="font-bold">في انتظار موافقة العميل</span>
                  </div>
                  <p className="text-orange-700 text-sm mb-3">
                    تم إرسال تقرير الصيانة للعميل وننتظر موافقته على الإصلاح والتكلفة.
                  </p>
                  <div className="flex gap-2">
                    <Link
                      to={`/admin/maintenance/${id}/diagnosis`}
                      className="inline-block bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-medium text-sm"
                    >
                      مراجعة التقرير
                    </Link>
                    <Link
                      to={`/maintenance/approval/${request.requestNumber}`}
                      className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm"
                      target="_blank"
                    >
                      رابط الموافقة للعميل
                    </Link>
                  </div>
                </div>
              )}

              {request.status.current === 'in_progress' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-purple-800 mb-2">
                    <FaTools />
                    <span className="font-bold">الجهاز قيد الإصلاح</span>
                  </div>
                  <p className="text-purple-700 text-sm">
                    يعمل الفريق الفني على إصلاح الجهاز حالياً.
                  </p>
                </div>
              )}
            </div>
            {/* Device Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiSmartphone className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">معلومات الجهاز</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الجهاز</label>
                  <p className="text-gray-900">{request.device.model}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اللون</label>
                  <p className="text-gray-900">{request.device.color || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعة</label>
                  <p className="text-gray-900">{request.device.storage || 'غير محدد'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السيريال نمبر</label>
                  <p className="text-gray-900 font-mono">{request.device.serialNumber}</p>
                </div>
                {request.device.purchaseDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">تاريخ الشراء</label>
                    <p className="text-gray-900">
                      {new Date(request.device.purchaseDate).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                )}
                
                {/* معلومات كلمة السر */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">🔐 حماية الجهاز</label>
                  {request.device.hasPassword ? (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-blue-800 font-medium">
                          الجهاز محمي بـ {
                            request.device.passwordType === 'text' ? 'كلمة سر نصية' :
                            request.device.passwordType === 'pattern' ? 'نمط الفتح' : 'غير محدد'
                          }
                        </span>
                      </div>
                      
                      {request.device.passwordType === 'text' && request.device.passwordValue && (
                        <div className="mt-2 p-3 bg-white border border-blue-300 rounded-lg">
                          <p className="text-sm text-blue-800 font-medium mb-1">كلمة السر:</p>
                          <p className="text-lg font-mono text-blue-900 bg-blue-50 px-3 py-2 rounded border">
                            {request.device.passwordValue}
                          </p>
                        </div>
                      )}
                      
                      {request.device.passwordType === 'pattern' && request.device.patternValue && (
                        <div className="mt-2">
                          <p className="text-sm text-blue-800 font-medium mb-3 text-center">نمط الفتح:</p>
                          <div className="flex justify-center">
                            <PatternDisplay 
                              patternValue={request.device.patternValue} 
                              size={120}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                      <p className="text-gray-700 flex items-center gap-2">
                        🔓 <span>الجهاز غير محمي</span>
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Diagnosis Report */}
            {request.diagnosis && (request.diagnosis.initialCheck || request.diagnosis.problemFound) && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <FiTool className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-semibold text-gray-900">تقرير الفحص والتشخيص</h2>
                  </div>
                  <Link
                    to={`/admin/maintenance/${id}/diagnosis`}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition font-medium text-sm flex items-center gap-2"
                  >
                    <FiEdit className="w-4 h-4" />
                    تعديل التقرير
                  </Link>
                </div>
                <div className="space-y-4">
                  {request.diagnosis.initialCheck && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">نتائج الفحص الأولي</label>
                      <p className="text-gray-900 bg-gray-50 p-3 rounded-lg">{request.diagnosis.initialCheck}</p>
                    </div>
                  )}
                  {request.diagnosis.problemFound && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">المشكلة المكتشفة</label>
                      <p className="text-gray-900 bg-red-50 p-3 rounded-lg border border-red-200">{request.diagnosis.problemFound}</p>
                    </div>
                  )}
                  {request.diagnosis.rootCause && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">السبب الجذري</label>
                      <p className="text-gray-900 bg-yellow-50 p-3 rounded-lg border border-yellow-200">{request.diagnosis.rootCause}</p>
                    </div>
                  )}
                  {request.diagnosis.recommendedSolution && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الحل المقترح</label>
                      <p className="text-gray-900 bg-green-50 p-3 rounded-lg border border-green-200">{request.diagnosis.recommendedSolution}</p>
                    </div>
                  )}
                  {request.diagnosis.requiredParts && request.diagnosis.requiredParts.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">القطع المطلوبة</label>
                      <div className="space-y-2">
                        {request.diagnosis.requiredParts.map((part, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div>
                              <span className="font-medium">{part.partName}</span>
                              {part.partNumber && (
                                <span className="text-sm text-gray-500 mr-2">#{part.partNumber}</span>
                              )}
                            </div>
                            <span className="font-bold text-primary-600">{part.price} ريال</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {request.diagnosis.estimatedTime && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">الوقت المقدر للإصلاح</label>
                      <p className="text-gray-900">
                        {request.diagnosis.estimatedTime > 24 ? 
                          `${Math.ceil(request.diagnosis.estimatedTime / 24)} أيام` : 
                          `${request.diagnosis.estimatedTime} ساعة`
                        }
                      </p>
                    </div>
                  )}
                  {request.diagnosis.technicianNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات فنية إضافية</label>
                      <p className="text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-200">{request.diagnosis.technicianNotes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
            {/* Customer Approval Status */}
            {request.customerApproval && request.customerApproval.status !== 'pending' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FaCheckCircle className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">قرار العميل بشأن الإصلاح</h2>
                </div>
                <div className="space-y-4">
                  <div className={`p-4 rounded-lg border-2 ${
                    request.customerApproval.status === 'approved' 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}>
                    <div className="flex items-center gap-3 mb-2">
                      {request.customerApproval.status === 'approved' ? (
                        <FaCheckCircle className="w-6 h-6 text-green-600" />
                      ) : (
                        <FaTimes className="w-6 h-6 text-red-600" />
                      )}
                      <span className={`text-lg font-bold ${
                        request.customerApproval.status === 'approved' ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {request.customerApproval.status === 'approved' ? 'العميل وافق على الإصلاح' : 'العميل رفض الإصلاح'}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      request.customerApproval.status === 'approved' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      تاريخ القرار: {new Date(request.customerApproval.approvalDate).toLocaleDateString('ar-SA')} - 
                      {new Date(request.customerApproval.approvalDate).toLocaleTimeString('ar-SA')}
                    </p>
                    <p className={`text-xs mt-1 ${
                      request.customerApproval.status === 'approved' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      طريقة الموافقة: {request.customerApproval.approvalMethod === 'online' ? 'عبر الإنترنت' : 'في المحل'}
                    </p>
                  </div>
                  
                  {request.customerApproval.customerNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات العميل</label>
                      <p className="text-gray-900 bg-blue-50 p-3 rounded-lg border border-blue-200">
                        {request.customerApproval.customerNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Issue Details */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiTool className="w-5 h-5 text-red-600" />
                <h2 className="text-lg font-semibold text-gray-900">تفاصيل المشكلة</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع المشكلة</label>
                  <p className="text-gray-900">{getIssueCategoryText(request.issue.category)}</p>
                </div>
                {request.issue.subCategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">المشكلة التفصيلية</label>
                    <p className="text-gray-900">{request.issue.subCategory}</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">وصف المشكلة</label>
                  <p className="text-gray-900 whitespace-pre-wrap">{request.issue.description}</p>
                </div>
                {request.issue.symptoms && request.issue.symptoms.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الأعراض</label>
                    <div className="flex flex-wrap gap-2">
                      {request.issue.symptoms.map((symptom, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-sm"
                        >
                          {symptom}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الأولوية</label>
                  <span className={`px-2 py-1 rounded-full text-sm font-medium ${
                    request.issue.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                    request.issue.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.issue.priority === 'emergency' ? 'طارئ' :
                     request.issue.priority === 'urgent' ? 'عاجل' : 'عادي'}
                  </span>
                </div>
              </div>
            </div>

            {/* Images */}
            {request.issue.images && request.issue.images.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">صور الجهاز</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {request.issue.images.map((image, index) => (
                    <img
                      key={index}
                      src={image}
                      alt={`صورة ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-75"
                      onClick={() => window.open(image, '_blank')}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiUser className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">معلومات العميل</h2>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FiUser className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{request.customerInfo.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiPhone className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900" dir="ltr">{request.customerInfo.phone}</span>
                </div>
                {request.customerInfo.email && (
                  <div className="flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-gray-500" />
                    <span className="text-gray-900">{request.customerInfo.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <FiMapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-900">{request.customerInfo.address}</span>
                </div>
              </div>
            </div>

            {/* Cost Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FiDollarSign className="w-5 h-5 text-green-600" />
                  <h2 className="text-lg font-semibold text-gray-900">ملخص التكلفة</h2>
                </div>
                {!editingPayment && (
                  <button
                    onClick={() => {
                      setEditingPayment(true)
                      setPaymentStatus(request.cost.paymentStatus || 'pending')
                    }}
                    className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                    title="تحديث حالة الدفع"
                  >
                    <FiEdit className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* نموذج تحديث حالة الدفع */}
              {editingPayment && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="font-medium text-green-900 mb-3">تحديث حالة الدفع</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">حالة الدفع</label>
                      <select
                        value={paymentStatus}
                        onChange={(e) => setPaymentStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      >
                        <option value="pending">غير مدفوع</option>
                        <option value="partial">مدفوع جزئياً</option>
                        <option value="paid">مدفوع كاملاً</option>
                      </select>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={updatePaymentStatus}
                        disabled={updating}
                        className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {updating ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <FiSave className="w-4 h-4" />
                        )}
                        حفظ التحديث
                      </button>
                      <button
                        onClick={() => {
                          setEditingPayment(false)
                          setPaymentStatus('')
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">رسوم الفحص</span>
                  <span className="font-medium">{request.cost.diagnosticFee || 25} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تكلفة القطع</span>
                  <span className="font-medium">{request.cost.partsCost || 0} ريال</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">تكلفة العمالة</span>
                  <span className="font-medium">{request.cost.laborCost || 0} ريال</span>
                </div>
                {(request.cost.priorityFee > 0) && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">رسوم الأولوية</span>
                    <span className="font-medium">{request.cost.priorityFee} ريال</span>
                  </div>
                )}
                {request.shipping?.isRequired && request.cost.shippingFee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">رسوم الشحن ({request.shipping.providerName})</span>
                    <span className="font-medium">{request.cost.shippingFee} ريال</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span className="text-primary-600">{request.cost.totalEstimated || request.cost.totalFinal || 25} ريال</span>
                  </div>
                </div>
                <div className="text-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    request.cost.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                    request.cost.paymentStatus === 'partial' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.cost.paymentStatus === 'paid' ? 'مدفوع' :
                     request.cost.paymentStatus === 'partial' ? 'مدفوع جزئياً' : 'غير مدفوع'}
                  </span>
                </div>
              </div>
            </div>

            {/* Shipping Info */}
            {request.shipping?.isRequired && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 text-blue-600">🚚</div>
                    <h2 className="text-lg font-semibold text-gray-900">معلومات الشحن</h2>
                  </div>
                  {!editingShipping && (
                    <button
                      onClick={() => {
                        setEditingShipping(true)
                        setShippingData({
                          status: request.shipping.status || 'pending',
                          trackingNumber: request.shipping.trackingNumber || '',
                          notes: request.shipping.notes || ''
                        })
                      }}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50"
                      title="تحديث حالة الشحن"
                    >
                      <FiEdit className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* نموذج تحديث الشحن */}
                {editingShipping && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <h3 className="font-medium text-blue-900 mb-3">تحديث حالة الشحن</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">حالة الشحن</label>
                        <select
                          value={shippingData.status}
                          onChange={(e) => setShippingData(prev => ({ ...prev, status: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        >
                          <option value="pending">في الانتظار</option>
                          <option value="picked_up">تم الاستلام</option>
                          <option value="in_transit">في الطريق</option>
                          <option value="delivered">تم التسليم</option>
                          <option value="cancelled">ملغي</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">رقم التتبع</label>
                        <input
                          type="text"
                          value={shippingData.trackingNumber}
                          onChange={(e) => setShippingData(prev => ({ ...prev, trackingNumber: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="رقم التتبع (اختياري)"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات</label>
                        <textarea
                          value={shippingData.notes}
                          onChange={(e) => setShippingData(prev => ({ ...prev, notes: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="ملاحظات إضافية (اختياري)"
                          rows="2"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={updateShippingStatus}
                          disabled={updating}
                          className="flex-1 bg-green-600 text-white px-3 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {updating ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <FiSave className="w-4 h-4" />
                          )}
                          حفظ التحديث
                        </button>
                        <button
                          onClick={() => {
                            setEditingShipping(false)
                            setShippingData({ status: '', trackingNumber: '', notes: '' })
                          }}
                          className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <FiX className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">شركة الشحن</span>
                    <span className="font-medium">{request.shipping.providerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">تكلفة الشحن</span>
                    <span className="font-medium">{request.shipping.cost} ريال</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">حالة الشحن</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      request.shipping.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      request.shipping.status === 'in_transit' ? 'bg-blue-100 text-blue-800' :
                      request.shipping.status === 'picked_up' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {request.shipping.status === 'pending' ? 'في الانتظار' :
                       request.shipping.status === 'picked_up' ? 'تم الاستلام' :
                       request.shipping.status === 'in_transit' ? 'في الطريق' :
                       request.shipping.status === 'delivered' ? 'تم التسليم' : 'ملغي'}
                    </span>
                  </div>
                  {request.shipping.trackingNumber && (
                    <div>
                      <span className="text-gray-600 text-sm">رقم التتبع:</span>
                      <p className="font-mono text-sm bg-gray-50 p-2 rounded mt-1">{request.shipping.trackingNumber}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600 text-sm">عنوان الاستلام:</span>
                    <p className="text-sm mt-1">{request.shipping.pickupAddress}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 text-sm">عنوان التسليم:</span>
                    <p className="text-sm mt-1">{request.shipping.deliveryAddress}</p>
                  </div>
                  {request.shipping.notes && (
                    <div>
                      <span className="text-gray-600 text-sm">ملاحظات:</span>
                      <p className="text-sm mt-1">{request.shipping.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Status History */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiFileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">تاريخ الحالات</h2>
              </div>
              <div className="space-y-3">
                {request.status.history.map((history, index) => (
                  <div key={index} className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
                    <div className="w-2 h-2 bg-primary-600 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(history.status)}`}>
                          {getStatusText(history.status)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(history.date).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                      {history.note && (
                        <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                      )}
                      {history.updatedBy && (
                        <p className="text-xs text-gray-500 mt-1">بواسطة: {history.updatedBy}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">إجراءات الإدارة</h2>
              <div className="space-y-3">
                <Link
                  to={`/admin/maintenance/${id}/diagnosis`}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition font-medium text-center block"
                >
                  إضافة/تعديل تقرير الفحص
                </Link>
                
                {request.status.current === 'waiting_approval' && (
                  <Link
                    to={`/maintenance/approval/${request.requestNumber}`}
                    className="w-full bg-orange-600 text-white px-4 py-3 rounded-lg hover:bg-orange-700 transition font-medium text-center block"
                    target="_blank"
                  >
                    رابط الموافقة للعميل
                  </Link>
                )}

                {/* أزرار التعديل والحذف للطلبات المنشأة من الإدارة */}
                {request.createdBy === 'admin' && (
                  <>
                    <Link
                      to={`/admin/maintenance/${id}/edit`}
                      className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 transition font-medium text-center block"
                    >
                      تعديل الطلب
                    </Link>
                    
                    <button
                      onClick={() => {
                        if (window.confirm('هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.')) {
                          handleDeleteRequest()
                        }
                      }}
                      className="w-full bg-red-600 text-white px-4 py-3 rounded-lg hover:bg-red-700 transition font-medium"
                    >
                      حذف الطلب
                    </button>
                  </>
                )}
                
                <button
                  onClick={() => printLabel()}
                  className={`w-full px-4 py-3 rounded-lg transition font-medium flex items-center justify-center gap-2 ${
                    request.labelPrinted 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-600 hover:bg-gray-700 text-white'
                  }`}
                >
                  {request.labelPrinted ? (
                    <>
                      <span>✅</span>
                      إعادة طباعة الملصق
                    </>
                  ) : (
                    <>
                      <span>🏷️</span>
                      طباعة ملصق الطلب
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceDetails