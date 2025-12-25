import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSave, FiAlertCircle, FiTool, FiDollarSign, FiClock, FiSend } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import '../../styles/mobile-select-fix.css'

function MaintenanceDiagnosis() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [request, setRequest] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [diagnosisData, setDiagnosisData] = useState({
    initialCheck: '',
    problemFound: '',
    rootCause: '',
    recommendedSolution: '',
    requiredParts: [],
    repairability: 'repairable',
    estimatedTime: 24, // بالساعات
    technicianNotes: '',
    // التكاليف
    diagnosticFee: 25,
    partsCost: 0,
    laborCost: 0,
    priorityFee: 0,
    shippingFee: 0,
    totalEstimated: 25
  })

  const [newPart, setNewPart] = useState({
    partName: '',
    partNumber: '',
    price: 0,
    availability: 'available'
  })

  useEffect(() => {
    fetchRequest()
  }, [id])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/maintenance/${id}`)
      if (response.data.success) {
        const requestData = response.data.data
        setRequest(requestData)
        
        // تحديث البيانات الموجودة إذا كانت متوفرة
        if (requestData.diagnosis) {
          setDiagnosisData({
            ...diagnosisData,
            ...requestData.diagnosis,
            diagnosticFee: requestData.cost.diagnosticFee || 25,
            partsCost: requestData.cost.partsCost || 0,
            laborCost: requestData.cost.laborCost || 0,
            priorityFee: requestData.cost.priorityFee || 0,
            shippingFee: requestData.cost.shippingFee || 0,
            totalEstimated: requestData.cost.totalEstimated || 25
          })
        } else {
          // حساب رسوم الأولوية والشحن
          let priorityFee = 0
          if (requestData.issue.priority === 'urgent') {
            priorityFee = 50
          } else if (requestData.issue.priority === 'emergency') {
            priorityFee = 100
          }
          
          // حساب رسوم الشحن
          const shippingFee = requestData.shipping?.isRequired ? (requestData.shipping.cost || 0) : 0
          
          setDiagnosisData(prev => ({
            ...prev,
            priorityFee,
            shippingFee,
            totalEstimated: 25 + priorityFee + shippingFee
          }))
        }
      }
    } catch (error) {
      console.error('Error fetching maintenance request:', error)
      toast.error('خطأ في جلب تفاصيل الطلب')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setDiagnosisData(prev => {
      const updated = { ...prev, [field]: value }
      
      // إعادة حساب التكلفة الإجمالية
      if (['diagnosticFee', 'partsCost', 'laborCost', 'priorityFee', 'shippingFee'].includes(field)) {
        updated.totalEstimated = 
          (updated.diagnosticFee || 0) + 
          (updated.partsCost || 0) + 
          (updated.laborCost || 0) + 
          (updated.priorityFee || 0) + 
          (updated.shippingFee || 0)
      }
      
      return updated
    })
  }

  const addPart = () => {
    if (!newPart.partName.trim()) {
      toast.error('اسم القطعة مطلوب')
      return
    }

    const updatedParts = [...diagnosisData.requiredParts, { ...newPart }]
    const newPartsCost = updatedParts.reduce((total, part) => total + (part.price || 0), 0)
    
    setDiagnosisData(prev => ({
      ...prev,
      requiredParts: updatedParts,
      partsCost: newPartsCost,
      totalEstimated: (prev.diagnosticFee || 0) + newPartsCost + (prev.laborCost || 0) + (prev.priorityFee || 0) + (prev.shippingFee || 0)
    }))
    
    setNewPart({
      partName: '',
      partNumber: '',
      price: 0,
      availability: 'available'
    })
  }

  const removePart = (index) => {
    const updatedParts = diagnosisData.requiredParts.filter((_, i) => i !== index)
    const newPartsCost = updatedParts.reduce((total, part) => total + (part.price || 0), 0)
    
    setDiagnosisData(prev => ({
      ...prev,
      requiredParts: updatedParts,
      partsCost: newPartsCost,
      totalEstimated: (prev.diagnosticFee || 0) + newPartsCost + (prev.laborCost || 0) + (prev.priorityFee || 0) + (prev.shippingFee || 0)
    }))
  }

  const saveDiagnosis = async () => {
    try {
      setSaving(true)
      
      const response = await api.post(`/maintenance/${id}/diagnosis`, {
        ...diagnosisData,
        cost: {
          diagnosticFee: diagnosisData.diagnosticFee,
          partsCost: diagnosisData.partsCost,
          laborCost: diagnosisData.laborCost,
          priorityFee: diagnosisData.priorityFee,
          shippingFee: diagnosisData.shippingFee,
          totalEstimated: diagnosisData.totalEstimated
        }
      })
      
      if (response.data.success) {
        toast.success('تم حفظ التشخيص بنجاح')
        setRequest(response.data.data)
      }
    } catch (error) {
      console.error('Error saving diagnosis:', error)
      toast.error('خطأ في حفظ التشخيص')
    } finally {
      setSaving(false)
    }
  }

  const sendForApproval = async () => {
    try {
      setSaving(true)
      
      // حفظ التشخيص أولاً
      await api.post(`/maintenance/${id}/diagnosis`, {
        ...diagnosisData,
        cost: {
          diagnosticFee: diagnosisData.diagnosticFee,
          partsCost: diagnosisData.partsCost,
          laborCost: diagnosisData.laborCost,
          priorityFee: diagnosisData.priorityFee,
          shippingFee: diagnosisData.shippingFee,
          totalEstimated: diagnosisData.totalEstimated
        }
      })
      
      // تحديث الحالة إلى "في انتظار الموافقة"
      await api.patch(`/maintenance/${id}/status`, {
        status: 'waiting_approval',
        note: 'تم إرسال تقرير الصيانة للعميل للموافقة'
      })
      
      toast.success('تم إرسال التقرير للعميل للموافقة')
      navigate(`/admin/maintenance/${id}`)
    } catch (error) {
      console.error('Error sending for approval:', error)
      toast.error('خطأ في إرسال التقرير للموافقة')
    } finally {
      setSaving(false)
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
    <div className="min-h-screen bg-gray-50 py-6 maintenance-form" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/admin/maintenance/${id}`)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                تقرير صيانة #{request.requestNumber}
              </h1>
              <p className="text-gray-600">
                {request.device.model} - {request.customerInfo.name}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={saveDiagnosis}
              disabled={saving}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <FiSave className="w-4 h-4" />
              حفظ مسودة
            </button>
            <button
              onClick={sendForApproval}
              disabled={saving || !diagnosisData.initialCheck.trim() || !diagnosisData.problemFound.trim()}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
            >
              <FiSend className="w-4 h-4" />
              إرسال للعميل
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Device Summary */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">ملخص الجهاز والمشكلة</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">نوع الجهاز:</span>
                  <p className="font-medium">{request.device.model}</p>
                </div>
                <div>
                  <span className="text-gray-600">السيريال:</span>
                  <p className="font-medium font-mono">{request.device.serialNumber}</p>
                </div>
                <div>
                  <span className="text-gray-600">المشكلة المبلغة:</span>
                  <p className="font-medium">{request.issue.category}</p>
                </div>
                <div>
                  <span className="text-gray-600">الأولوية:</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                    request.issue.priority === 'emergency' ? 'bg-red-100 text-red-800' :
                    request.issue.priority === 'urgent' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {request.issue.priority === 'emergency' ? 'طارئ' :
                     request.issue.priority === 'urgent' ? 'عاجل' : 'عادي'}
                  </span>
                </div>
              </div>
              <div className="mt-4">
                <span className="text-gray-600 text-sm">وصف المشكلة:</span>
                <p className="text-gray-900 mt-1">{request.issue.description}</p>
              </div>
            </div>

            {/* Diagnosis Form */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-6">
                <FiTool className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">تقرير الفحص والتشخيص</h2>
              </div>

              <div className="space-y-6">
                {/* Initial Check */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الفحص الأولي <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={diagnosisData.initialCheck}
                    onChange={(e) => handleInputChange('initialCheck', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="اشرح ما تم فحصه في الجهاز والحالة العامة..."
                    required
                  />
                </div>

                {/* Problem Found */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المشكلة المكتشفة <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={diagnosisData.problemFound}
                    onChange={(e) => handleInputChange('problemFound', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="اشرح المشكلة الفعلية التي تم اكتشافها..."
                    required
                  />
                </div>

                {/* Root Cause */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">السبب الجذري</label>
                  <textarea
                    value={diagnosisData.rootCause}
                    onChange={(e) => handleInputChange('rootCause', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="ما هو السبب الذي أدى لهذه المشكلة؟"
                  />
                </div>

                {/* Recommended Solution */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحل المقترح <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={diagnosisData.recommendedSolution}
                    onChange={(e) => handleInputChange('recommendedSolution', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="اشرح الحل المقترح والخطوات المطلوبة للإصلاح..."
                    required
                  />
                </div>

                {/* Repairability */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">إمكانية الإصلاح</label>
                  <select
                    value={diagnosisData.repairability}
                    onChange={(e) => handleInputChange('repairability', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mobile-select"
                    style={{
                      fontSize: '16px',
                      WebkitAppearance: 'none',
                      MozAppearance: 'none',
                      appearance: 'none'
                    }}
                  >
                    <option value="repairable">قابل للإصلاح</option>
                    <option value="needs_parts">يحتاج قطع غيار</option>
                    <option value="unrepairable">غير قابل للإصلاح</option>
                  </select>
                </div>

                {/* Estimated Time */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الوقت المقدر للإصلاح (بالساعات)</label>
                  <input
                    type="number"
                    value={diagnosisData.estimatedTime}
                    onChange={(e) => handleInputChange('estimatedTime', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="1"
                    max="720"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {diagnosisData.estimatedTime > 24 ? 
                      `حوالي ${Math.ceil(diagnosisData.estimatedTime / 24)} أيام` : 
                      `${diagnosisData.estimatedTime} ساعة`
                    }
                  </p>
                </div>

                {/* Technician Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ملاحظات فنية إضافية</label>
                  <textarea
                    value={diagnosisData.technicianNotes}
                    onChange={(e) => handleInputChange('technicianNotes', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="أي ملاحظات إضافية للفريق الفني..."
                  />
                </div>
              </div>
            </div>

            {/* Required Parts */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">القطع المطلوبة</h2>
              
              {/* Add New Part */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اسم القطعة</label>
                  <input
                    type="text"
                    value={newPart.partName}
                    onChange={(e) => setNewPart({...newPart, partName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="مثال: شاشة LCD"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رقم القطعة</label>
                  <input
                    type="text"
                    value={newPart.partNumber}
                    onChange={(e) => setNewPart({...newPart, partNumber: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    placeholder="اختياري"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">السعر (ريال)</label>
                  <input
                    type="number"
                    value={newPart.price}
                    onChange={(e) => setNewPart({...newPart, price: parseFloat(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    onClick={addPart}
                    className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition text-sm"
                  >
                    إضافة
                  </button>
                </div>
              </div>

              {/* Parts List */}
              {diagnosisData.requiredParts.length > 0 && (
                <div className="space-y-2">
                  {diagnosisData.requiredParts.map((part, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-4">
                          <span className="font-medium">{part.partName}</span>
                          {part.partNumber && (
                            <span className="text-sm text-gray-500">#{part.partNumber}</span>
                          )}
                          <span className="text-primary-600 font-bold">{part.price} ريال</span>
                        </div>
                      </div>
                      <button
                        onClick={() => removePart(index)}
                        className="text-red-600 hover:text-red-700 px-2 py-1 rounded"
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Cost Breakdown */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiDollarSign className="w-5 h-5 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">تفصيل التكلفة</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رسوم الفحص</label>
                  <input
                    type="number"
                    value={diagnosisData.diagnosticFee}
                    onChange={(e) => handleInputChange('diagnosticFee', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تكلفة القطع</label>
                  <input
                    type="number"
                    value={diagnosisData.partsCost}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">محسوبة تلقائياً من القطع المضافة</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">تكلفة العمالة</label>
                  <input
                    type="number"
                    value={diagnosisData.laborCost}
                    onChange={(e) => handleInputChange('laborCost', parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">رسوم الأولوية</label>
                  <input
                    type="number"
                    value={diagnosisData.priorityFee}
                    readOnly
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {request?.issue?.priority === 'emergency' ? 'طارئ: +100 ريال' :
                     request?.issue?.priority === 'urgent' ? 'عاجل: +50 ريال' : 'عادي: مجاني'}
                  </p>
                </div>

                {/* رسوم الشحن */}
                {request?.shipping?.isRequired && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رسوم الشحن</label>
                    <input
                      type="number"
                      value={diagnosisData.shippingFee}
                      readOnly
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-blue-50"
                    />
                    <p className="text-xs text-blue-600 mt-1">
                      شحن عبر {request.shipping.providerName} - {diagnosisData.shippingFee} ريال
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      سيتم إرسال بوليصة الشحن للعميل
                    </p>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">الإجمالي</span>
                    <span className="text-2xl font-bold text-primary-600">
                      {diagnosisData.totalEstimated} ريال
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Time Estimate */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-3 mb-4">
                <FiClock className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">التوقيت المقدر</h2>
              </div>
              
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {diagnosisData.estimatedTime > 24 ? 
                    `${Math.ceil(diagnosisData.estimatedTime / 24)} أيام` : 
                    `${diagnosisData.estimatedTime} ساعة`
                  }
                </div>
                <p className="text-sm text-gray-600">
                  الوقت المقدر للإصلاح
                </p>
              </div>
            </div>

            {/* Warning */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <FiAlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-yellow-800 mb-1">تنبيه مهم</h3>
                  <p className="text-sm text-yellow-700 mb-2">
                    سيتم إرسال هذا التقرير للعميل للموافقة على الإصلاح والتكلفة. 
                    تأكد من دقة جميع المعلومات قبل الإرسال.
                  </p>
                  {request?.shipping?.isRequired && (
                    <div className="bg-blue-100 border border-blue-300 rounded p-2 mt-2">
                      <p className="text-xs text-blue-800 font-medium">
                        📦 ملاحظة الشحن: العميل طلب خدمة الشحن عبر {request.shipping.providerName}
                      </p>
                      <p className="text-xs text-blue-700 mt-1">
                        • رسوم الشحن: {diagnosisData.shippingFee} ريال مضافة للتكلفة الإجمالية<br/>
                        • سيتم إرسال بوليصة الشحن للعميل بعد الموافقة<br/>
                        • الشركة ستتواصل مع العميل لاستلام الجهاز
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MaintenanceDiagnosis