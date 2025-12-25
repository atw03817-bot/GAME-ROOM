import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { FiArrowLeft, FiSmartphone, FiTool, FiUser, FiClock, FiDollarSign, FiFileText, FiPhone, FiMail, FiMapPin } from 'react-icons/fi'
import { FaTools, FaWrench, FaCheckCircle, FaTimes, FaBox } from 'react-icons/fa'
import api from '../utils/api'
import toast from 'react-hot-toast'
import PatternDisplay from '../components/PatternDisplay'

function MaintenanceRequestDetails() {
  const { requestNumber } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequest()
  }, [requestNumber])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      // البحث بالرقم التسلسلي للطلب
      const response = await api.get(`/maintenance/search/${requestNumber}`)
      if (response.data.success && response.data.data.length > 0) {
        setRequest(response.data.data[0])
      } else {
        toast.error('طلب الصيانة غير موجود')
        navigate('/account')
      }
    } catch (error) {
      console.error('Error fetching maintenance request:', error)
      toast.error('خطأ في جلب تفاصيل الطلب')
      navigate('/account')
    } finally {
      setLoading(false)
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
            onClick={() => navigate('/account')}
            className="text-primary-600 hover:text-primary-700"
          >
            العودة للحساب
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
            onClick={() => navigate('/account')}
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
            {/* Status Card */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">حالة الطلب</h2>
                <span className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getStatusColor(request.status.current)}`}>
                  {getStatusIcon(request.status.current)}
                  {getStatusText(request.status.current)}
                </span>
              </div>
              
              {request.status.current === 'ready' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-green-800 mb-2">
                    <FaCheckCircle />
                    <span className="font-bold">جهازك جاهز للاستلام!</span>
                  </div>
                  <p className="text-green-700 text-sm">
                    يمكنك زيارة المحل لاستلام جهازك. لا تنس إحضار هويتك الشخصية.
                  </p>
                </div>
              )}

              {request.status.current === 'waiting_approval' && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-orange-800 mb-2">
                    <FiClock />
                    <span className="font-bold">تقرير الصيانة جاهز - يحتاج موافقتك</span>
                  </div>
                  <p className="text-orange-700 text-sm mb-3">
                    تم فحص جهازك وإعداد تقرير مفصل بالمشكلة والحل المقترح والتكلفة. 
                    يرجى مراجعة التقرير واتخاذ قرارك.
                  </p>
                  <Link
                    to={`/maintenance/approval/${request.requestNumber}`}
                    className="inline-block bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition font-bold"
                  >
                    مراجعة التقرير والموافقة
                  </Link>
                </div>
              )}

              {request.status.current === 'in_progress' && (
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
                  <div className="flex items-center gap-2 text-purple-800 mb-2">
                    <FaTools />
                    <span className="font-bold">جهازك قيد الإصلاح</span>
                  </div>
                  <p className="text-purple-700 text-sm">
                    يعمل فريقنا الفني على إصلاح جهازك. سنبلغك فور الانتهاء.
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
                <div className="flex items-center gap-3 mb-4">
                  <FiTool className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-semibold text-gray-900">تقرير الفحص والتشخيص</h2>
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
                  <h2 className="text-lg font-semibold text-gray-900">قرارك بشأن الإصلاح</h2>
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
                        {request.customerApproval.status === 'approved' ? 'وافقت على الإصلاح' : 'رفضت الإصلاح'}
                      </span>
                    </div>
                    <p className={`text-sm ${
                      request.customerApproval.status === 'approved' ? 'text-green-700' : 'text-red-700'
                    }`}>
                      تاريخ القرار: {new Date(request.customerApproval.approvalDate).toLocaleDateString('ar-SA')} - 
                      {new Date(request.customerApproval.approvalDate).toLocaleTimeString('ar-SA')}
                    </p>
                  </div>
                  
                  {request.customerApproval.customerNotes && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظاتك</label>
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
                <h2 className="text-lg font-semibold text-gray-900">معلومات التواصل</h2>
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
              <div className="flex items-center gap-3 mb-4">
                <FiDollarSign className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">ملخص التكلفة</h2>
              </div>
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
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-5 h-5 text-blue-600">🚚</div>
                  <h2 className="text-lg font-semibold text-gray-900">معلومات الشحن</h2>
                </div>
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
                  {request.shipping.status === 'pending' && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        سنرسل لك بوليصة الشحن قريباً وستتواصل شركة الشحن معك لتحديد موعد الاستلام
                      </p>
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceRequestDetails