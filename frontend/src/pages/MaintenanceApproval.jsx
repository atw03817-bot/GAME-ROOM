import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiCheckCircle, FiX, FiTool, FiDollarSign, FiClock, FiAlertCircle, FiPhone, FiMail } from 'react-icons/fi'
import { FaTools, FaWrench } from 'react-icons/fa'
import api from '../utils/api'
import toast from 'react-hot-toast'

function MaintenanceApproval() {
  const { requestNumber } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [decision, setDecision] = useState('') // 'approve' or 'reject'
  const [customerNotes, setCustomerNotes] = useState('')

  useEffect(() => {
    fetchRequest()
  }, [requestNumber])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      // البحث بالرقم التسلسلي للطلب
      const response = await api.get(`/maintenance/search/${requestNumber}`)
      if (response.data.success && response.data.data.length > 0) {
        const requestData = response.data.data[0]
        
        // التحقق من أن الطلب في حالة انتظار الموافقة
        if (requestData.status.current !== 'waiting_approval') {
          toast.error('هذا الطلب لا يحتاج موافقة أو تم التعامل معه بالفعل')
          navigate('/account')
          return
        }
        
        setRequest(requestData)
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

  const submitDecision = async () => {
    if (!decision) {
      toast.error('يرجى اختيار قرارك')
      return
    }

    try {
      setSubmitting(true)
      
      const newStatus = decision === 'approve' ? 'approved' : 'cancelled'
      const note = decision === 'approve' 
        ? `العميل وافق على الإصلاح والتكلفة${customerNotes ? ` - ملاحظات: ${customerNotes}` : ''}`
        : `العميل رفض الإصلاح${customerNotes ? ` - السبب: ${customerNotes}` : ''}`
      
      // إرسال معلومات الموافقة مع تحديث الحالة
      const response = await api.patch(`/maintenance/${request._id}/customer-approval`, {
        status: newStatus,
        note: note,
        decision: decision,
        customerNotes: customerNotes,
        approvalDate: new Date(),
        approvalMethod: 'online'
      })
      
      if (response.data.success) {
        if (decision === 'approve') {
          toast.success('تم قبول الإصلاح بنجاح! سنبدأ العمل على جهازك قريباً')
        } else {
          toast.success('تم رفض الإصلاح. يمكنك استلام جهازك من المحل')
        }
        
        // الانتقال لصفحة تفاصيل الطلب
        navigate(`/maintenance/${requestNumber}`)
      }
    } catch (error) {
      console.error('Error submitting decision:', error)
      toast.error('خطأ في إرسال القرار')
    } finally {
      setSubmitting(false)
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
              موافقة على تقرير الصيانة
            </h1>
            <p className="text-gray-600">
              طلب #{request.requestNumber} - {request.device.model}
            </p>
          </div>
        </div>

        {/* Alert */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-800 mb-1">تقرير الصيانة جاهز</h3>
              <p className="text-sm text-blue-700">
                تم فحص جهازك وإعداد تقرير مفصل بالمشكلة والحل المقترح والتكلفة. 
                يرجى مراجعة التفاصيل أدناه واتخاذ قرارك.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">معلومات الجهاز</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">نوع الجهاز:</span>
                  <p className="font-medium">{request.device.model}</p>
                </div>
                <div>
                  <span className="text-gray-600">اللون:</span>
                  <p className="font-medium">{request.device.color || 'غير محدد'}</p>
                </div>
                <div>
                  <span className="text-gray-600">السيريال:</span>
                  <p className="font-medium font-mono">{request.device.serialNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">المشكلة المبلغة:</span>
                  <p className="font-medium">{request.issue.category}</p>
                </div>
              </div>
            </div>

            {/* Diagnosis Report */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiTool className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">تقرير الفحص والتشخيص</h2>
              </div>

              <div className="space-y-4">
                {request.diagnosis?.initialCheck && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">نتائج الفحص الأولي:</h3>
                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                      {request.diagnosis.initialCheck}
                    </p>
                  </div>
                )}

                {request.diagnosis?.problemFound && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">المشكلة المكتشفة:</h3>
                    <p className="text-gray-700 bg-red-50 p-3 rounded-lg border border-red-200">
                      {request.diagnosis.problemFound}
                    </p>
                  </div>
                )}

                {request.diagnosis?.rootCause && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">السبب الجذري:</h3>
                    <p className="text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                      {request.diagnosis.rootCause}
                    </p>
                  </div>
                )}

                {request.diagnosis?.recommendedSolution && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">الحل المقترح:</h3>
                    <p className="text-gray-700 bg-green-50 p-3 rounded-lg border border-green-200">
                      {request.diagnosis.recommendedSolution}
                    </p>
                  </div>
                )}

                {/* Required Parts */}
                {request.diagnosis?.requiredParts && request.diagnosis.requiredParts.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">القطع المطلوبة:</h3>
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

                {/* Repairability */}
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">إمكانية الإصلاح:</h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    request.diagnosis?.repairability === 'repairable' ? 'bg-green-100 text-green-800' :
                    request.diagnosis?.repairability === 'needs_parts' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {request.diagnosis?.repairability === 'repairable' ? 'قابل للإصلاح' :
                     request.diagnosis?.repairability === 'needs_parts' ? 'يحتاج قطع غيار' :
                     'غير قابل للإصلاح'}
                  </span>
                </div>

                {/* Technician Notes */}
                {request.diagnosis?.technicianNotes && (
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">ملاحظات فنية إضافية:</h3>
                    <p className="text-gray-700 bg-blue-50 p-3 rounded-lg border border-blue-200">
                      {request.diagnosis.technicianNotes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Decision Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">قرارك</h2>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg cursor-pointer hover:bg-green-50 transition">
                    <input
                      type="radio"
                      name="decision"
                      value="approve"
                      checked={decision === 'approve'}
                      onChange={(e) => setDecision(e.target.value)}
                      className="text-green-600 focus:ring-green-500"
                    />
                    <div className="flex items-center gap-2">
                      <FiCheckCircle className="w-5 h-5 text-green-600" />
                      <div>
                        <div className="font-medium text-green-800">موافق على الإصلاح</div>
                        <div className="text-sm text-green-700">أوافق على إصلاح الجهاز بالتكلفة المذكورة</div>
                      </div>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 p-4 border-2 border-red-200 rounded-lg cursor-pointer hover:bg-red-50 transition">
                    <input
                      type="radio"
                      name="decision"
                      value="reject"
                      checked={decision === 'reject'}
                      onChange={(e) => setDecision(e.target.value)}
                      className="text-red-600 focus:ring-red-500"
                    />
                    <div className="flex items-center gap-2">
                      <FiX className="w-5 h-5 text-red-600" />
                      <div>
                        <div className="font-medium text-red-800">رفض الإصلاح</div>
                        <div className="text-sm text-red-700">لا أرغب في إصلاح الجهاز وسأستلمه كما هو</div>
                      </div>
                    </div>
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder={decision === 'reject' ? 'سبب رفض الإصلاح...' : 'أي ملاحظات أو طلبات خاصة...'}
                  />
                </div>

                <button
                  onClick={submitDecision}
                  disabled={!decision || submitting}
                  className={`w-full py-3 px-4 rounded-lg font-bold transition flex items-center justify-center gap-2 ${
                    decision === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : decision === 'reject'
                      ? 'bg-red-600 hover:bg-red-700 text-white'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  } disabled:opacity-50`}
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      {decision === 'approve' ? <FiCheckCircle /> : <FiX />}
                      {decision === 'approve' ? 'تأكيد الموافقة على الإصلاح' : 
                       decision === 'reject' ? 'تأكيد رفض الإصلاح' : 'اختر قرارك أولاً'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
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
                    <span className="font-medium text-blue-600">{request.cost.shippingFee} ريال</span>
                  </div>
                )}
                <div className="border-t pt-3">
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span className="text-primary-600">{request.cost.totalEstimated || request.cost.totalFinal || 25} ريال</span>
                  </div>
                </div>
                
                {/* توضيح رسوم الشحن */}
                {request.shipping?.isRequired && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                    <div className="flex items-start gap-2">
                      <div className="text-blue-600 text-sm">🚚</div>
                      <div>
                        <p className="text-xs font-medium text-blue-800 mb-1">معلومات الشحن:</p>
                        <p className="text-xs text-blue-700">
                          • سيتم إرسال بوليصة الشحن عبر الواتساب<br/>
                          • شركة {request.shipping.providerName} ستتواصل معك لاستلام الجهاز<br/>
                          • رسوم الشحن {request.cost.shippingFee} ريال مضافة للتكلفة الإجمالية
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Time Estimate */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiClock className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">الوقت المقدر</h2>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-2">
                  {request.diagnosis?.estimatedTime > 24 ? 
                    `${Math.ceil(request.diagnosis.estimatedTime / 24)} أيام` : 
                    `${request.diagnosis?.estimatedTime || 24} ساعة`
                  }
                </div>
                <p className="text-sm text-gray-600">
                  الوقت المقدر للإصلاح
                </p>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">تحتاج مساعدة؟</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <FiPhone className="w-4 h-4 text-gray-500" />
                  <span>اتصل بنا: 0500909030</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FiMail className="w-4 h-4 text-gray-500" />
                  <span>abadaltwasl390@gmail.com</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-3">
                يمكنك التواصل معنا في أي وقت لمناقشة تفاصيل الإصلاح
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceApproval