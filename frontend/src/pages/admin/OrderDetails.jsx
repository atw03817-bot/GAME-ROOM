import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { 
  FiArrowRight, 
  FiPackage, 
  FiUser, 
  FiMapPin, 
  FiCreditCard, 
  FiTruck, 
  FiPhone, 
  FiMail, 
  FiPrinter, 
  FiDownload,
  FiCalendar,
  FiHash,
  FiDollarSign,
  FiShoppingBag,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiAlertCircle
} from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'

function OrderDetailsNew() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchOrder()
  }, [id])

  const fetchOrder = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/orders/${id}`)
      console.log('Order data:', response.data)
      setOrder(response.data.order || response.data)
    } catch (error) {
      console.error('Error fetching order:', error)
      toast.error('حدث خطأ أثناء جلب الطلب')
    } finally {
      setLoading(false)
    }
  }

  const updateOrderStatus = async (newStatus) => {
    if (!confirm(`هل أنت متأكد من تغيير الحالة إلى "${getStatusLabel(newStatus)}"؟`)) return

    try {
      setUpdating(true)
      await api.patch(`/orders/${id}/status`, { status: newStatus })
      toast.success('تم تحديث حالة الطلب بنجاح')
      fetchOrder()
    } catch (error) {
      console.error('Error updating status:', error)
      toast.error('حدث خطأ أثناء تحديث الحالة')
    } finally {
      setUpdating(false)
    }
  }

  const updatePaymentStatus = async (newPaymentStatus) => {
    if (!confirm(`هل أنت متأكد من تغيير حالة الدفع إلى "${newPaymentStatus === 'paid' ? 'مدفوع' : 'غير مدفوع'}"؟`)) return

    try {
      setUpdating(true)
      await api.patch(`/orders/${id}/payment-status`, { paymentStatus: newPaymentStatus })
      toast.success('تم تحديث حالة الدفع بنجاح')
      fetchOrder()
    } catch (error) {
      console.error('Error updating payment status:', error)
      toast.error('حدث خطأ أثناء تحديث حالة الدفع')
    } finally {
      setUpdating(false)
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      processing: 'قيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    }
    return labels[status] || status
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    }
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getStatusIcon = (status) => {
    const icons = {
      pending: FiClock,
      confirmed: FiCheckCircle,
      processing: FiPackage,
      shipped: FiTruck,
      delivered: FiCheckCircle,
      cancelled: FiXCircle,
    }
    const Icon = icons[status] || FiAlertCircle
    return <Icon size={16} />
  }

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cod: 'الدفع عند الاستلام',
      tap: 'Tap Payment - بطاقة ائتمانية',

      tap: 'بطاقة ائتمانية (Tap)',
      myfatoorah: 'MyFatoorah',

      tabby: 'تابي',
    }
    return labels[method] || method
  }

  const formatPrice = (price) => {
    return (price || 0).toFixed(2)
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const handlePrint = () => {
    window.print()
  }

  const handleExport = () => {
    const orderData = {
      orderNumber: order.orderNumber,
      status: getStatusLabel(order.orderStatus || order.status),
      customer: {
        name: order.user?.name || order.user?.nameAr || order.shippingAddress?.name || order.shippingAddress?.fullName,
        phone: order.shippingAddress?.phone,
        email: order.user?.email,
      },
      items: order.items?.map(item => ({
        name: item.product?.nameAr || item.product?.name || item.name,
        quantity: item.quantity,
        price: item.price,
        total: (item.price || 0) * (item.quantity || 0),
        options: item.selectedOptions
      })),
      subtotal: order.subtotal,
      shipping: order.shippingCost,
      tax: order.tax,
      total: order.total,
      paymentMethod: getPaymentMethodLabel(order.paymentMethod),
      date: formatDate(order.createdAt),
    }

    const dataStr = JSON.stringify(orderData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `order-${order.orderNumber}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <FiPackage size={64} className="mx-auto text-gray-400 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-4">الطلب غير موجود</h2>
        <p className="text-gray-600 mb-6">لم يتم العثور على الطلب المطلوب</p>
        <button
          onClick={() => navigate('/admin/orders')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition"
        >
          العودة للطلبات
        </button>
      </div>
    )
  }

  return (
    <div className="print:p-8 print:bg-white">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/admin/orders')}
              className="p-2 hover:bg-gray-100 rounded-lg transition print:hidden"
            >
              <FiArrowRight size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">تفاصيل الطلب</h1>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-2 text-gray-600">
                  <FiHash size={16} />
                  <span className="font-mono">{order.orderNumber}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <FiCalendar size={16} />
                  <span>{formatDate(order.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition print:hidden"
            >
              <FiPrinter />
              طباعة
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg transition print:hidden"
            >
              <FiDownload />
              تصدير
            </button>
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold border ${getStatusColor(order.orderStatus || order.status)}`}>
              {getStatusIcon(order.orderStatus || order.status)}
              {getStatusLabel(order.orderStatus || order.status)}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-6">
          {/* المنتجات */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FiShoppingBag />
                المنتجات ({order.items?.length || 0})
              </h2>
              <div className="text-sm text-gray-500">
                إجمالي الكمية: {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0)}
              </div>
            </div>
            
            <div className="space-y-4">
              {order.items?.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition">
                  <div className="flex gap-4">
                    {/* صورة المنتج */}
                    <div className="flex-shrink-0">
                      <img
                        src={item.product?.images?.[0] || item.image || '/placeholder.png'}
                        alt={item.product?.nameAr || item.product?.name || item.name}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-200"
                        onError={(e) => {
                          e.target.src = '/placeholder.png'
                        }}
                      />
                    </div>
                    
                    {/* تفاصيل المنتج */}
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-800 text-lg">
                            {item.product?.nameAr || item.product?.name || item.name || 'منتج محذوف'}
                          </h3>
                          {(item.product?.brand || item.product?.brandAr) && (
                            <p className="text-sm text-gray-600 mt-1">
                              العلامة التجارية: {item.product.brandAr || item.product.brand}
                            </p>
                          )}
                          {item.product?.sku && (
                            <p className="text-xs text-gray-500 mt-1">
                              كود المنتج: {item.product.sku}
                            </p>
                          )}
                        </div>
                        
                        {/* الأسعار */}
                        <div className="text-left">
                          <div className="bg-gray-50 rounded-lg p-3 min-w-[120px]">
                            <p className="text-sm text-gray-600">سعر الوحدة</p>
                            <p className="font-bold text-gray-800">{formatPrice(item.price)} ريال</p>
                            <p className="text-sm text-gray-600 mt-2">الكمية: {item.quantity || 0}</p>
                            <div className="border-t pt-2 mt-2">
                              <p className="text-sm text-gray-600">المجموع</p>
                              <p className="text-lg font-bold text-primary-600">
                                {formatPrice((item.price || 0) * (item.quantity || 0))} ريال
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* خيارات المنتج */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        {item.selectedOptions?.color && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full">
                            <div 
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: item.selectedOptions.color.value || '#ccc' }}
                            ></div>
                            <span className="text-sm text-blue-800">
                              {item.selectedOptions.color.nameAr || item.selectedOptions.color.name || item.selectedOptions.color.value}
                            </span>
                            {(item.selectedOptions.color.price || 0) > 0 && (
                              <span className="text-xs text-blue-600">+{formatPrice(item.selectedOptions.color.price)} ريال</span>
                            )}
                          </div>
                        )}
                        
                        {item.selectedOptions?.storage && (
                          <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                            <FiPackage size={14} className="text-green-600" />
                            <span className="text-sm text-green-800">
                              {item.selectedOptions.storage.nameAr || item.selectedOptions.storage.name || item.selectedOptions.storage.value}
                            </span>
                            {(item.selectedOptions.storage.price || 0) > 0 && (
                              <span className="text-xs text-green-600">+{formatPrice(item.selectedOptions.storage.price)} ريال</span>
                            )}
                          </div>
                        )}
                        
                        {item.selectedOptions?.other?.map((option, idx) => (
                          <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full">
                            <span className="text-sm text-purple-800">
                              {option.nameAr || option.name}: {option.value}
                            </span>
                            {(option.price || 0) > 0 && (
                              <span className="text-xs text-purple-600">+{formatPrice(option.price)} ريال</span>
                            )}
                          </div>
                        ))}
                        
                        {/* للتوافق مع البيانات القديمة */}
                        {!item.selectedOptions && item.selectedColor && (
                          <div className="px-3 py-1 bg-gray-100 rounded-full">
                            <span className="text-sm text-gray-700">اللون: {item.selectedColor}</span>
                          </div>
                        )}
                        
                        {!item.selectedOptions && item.selectedStorage && (
                          <div className="px-3 py-1 bg-gray-100 rounded-full">
                            <span className="text-sm text-gray-700">السعة: {item.selectedStorage}</span>
                          </div>
                        )}
                        
                        {!item.selectedOptions && !item.selectedColor && !item.selectedStorage && (
                          <div className="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full">
                            <span className="text-xs text-gray-500">لا توجد خيارات محددة</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* معلومات العميل */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiUser />
              معلومات العميل
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                    <FiUser className="text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">الاسم الكامل</p>
                    <p className="font-bold text-gray-800">
                      {order.user?.name || order.user?.nameAr || order.shippingAddress?.name || order.shippingAddress?.fullName || 'غير محدد'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <FiPhone className="text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">رقم الجوال</p>
                    <p className="font-bold text-gray-800" dir="ltr" style={{textAlign: 'right'}}>
                      {order.shippingAddress?.phone || order.user?.phone || 'غير محدد'}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                {order.user?.email && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiMail className="text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                      <p className="font-bold text-gray-800">{order.user.email}</p>
                    </div>
                  </div>
                )}
                
                {order.user?._id && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <FiHash className="text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">معرف العميل</p>
                      <p className="font-mono text-xs text-gray-600">{order.user._id}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* عنوان الشحن */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiMapPin />
              عنوان الشحن
            </h2>
            {order.shippingAddress ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    {order.shippingAddress.city && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600">المدينة</p>
                        <p className="text-gray-800">{order.shippingAddress.city}</p>
                      </div>
                    )}
                    {order.shippingAddress.district && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600">الحي</p>
                        <p className="text-gray-800">{order.shippingAddress.district}</p>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {order.shippingAddress.street && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600">الشارع</p>
                        <p className="text-gray-800">{order.shippingAddress.street}</p>
                      </div>
                    )}
                    {order.shippingAddress.building && (
                      <div>
                        <p className="text-sm font-semibold text-gray-600">رقم المبنى</p>
                        <p className="text-gray-800">{order.shippingAddress.building}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* العنوان الكامل */}
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm font-semibold text-blue-800 mb-2">العنوان الكامل</p>
                  <p className="text-blue-900">
                    {[
                      order.shippingAddress.street,
                      order.shippingAddress.district,
                      order.shippingAddress.city,
                      order.shippingAddress.building && `مبنى ${order.shippingAddress.building}`,
                      order.shippingAddress.postalCode && `ص.ب ${order.shippingAddress.postalCode}`
                    ].filter(Boolean).join('، ')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FiMapPin size={48} className="mx-auto mb-2 opacity-50" />
                <p>لا يوجد عنوان شحن</p>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          {/* ملخص الطلب */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiDollarSign />
              ملخص الطلب
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">المجموع الفرعي:</span>
                <span className="font-bold text-gray-800">{formatPrice(order.subtotal)} ريال</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-600">الشحن:</span>
                <span className={`font-bold ${(order.shippingCost || 0) === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                  {(order.shippingCost || 0) === 0 ? 'مجاني' : `${formatPrice(order.shippingCost)} ريال`}
                </span>
              </div>
              
              {(order.tax || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الضريبة ({order.taxRate || 15}%):</span>
                  <span className="font-bold text-gray-800">{formatPrice(order.tax)} ريال</span>
                </div>
              )}
              
              {(order.discount || 0) > 0 && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الخصم:</span>
                  <span className="font-bold text-red-600">-{formatPrice(order.discount)} ريال</span>
                </div>
              )}
              
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold text-gray-800">المجموع الكلي:</span>
                <span className="font-bold text-primary-600 text-xl">{formatPrice(order.total)} ريال</span>
              </div>
            </div>
          </div>

          {/* تغيير حالة الطلب */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">تغيير حالة الطلب</h2>
            <div className="space-y-2">
              {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
                <button
                  key={status}
                  onClick={() => updateOrderStatus(status)}
                  disabled={updating || (order.orderStatus || order.status) === status}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition text-right flex items-center gap-2 ${
                    (order.orderStatus || order.status) === status
                      ? 'bg-primary-600 text-white cursor-default'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                  } disabled:opacity-50`}
                >
                  {getStatusIcon(status)}
                  {getStatusLabel(status)}
                  {(order.orderStatus || order.status) === status && ' ✓'}
                </button>
              ))}
            </div>
            
            {updating && (
              <div className="mt-3 text-center">
                <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                  جاري التحديث...
                </div>
              </div>
            )}
          </div>

          {/* طريقة الدفع */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <FiCreditCard />
              طريقة الدفع
            </h2>
            <div className="space-y-3">
              <p className="text-gray-700">{getPaymentMethodLabel(order.paymentMethod)}</p>
              
              <div className={`px-3 py-2 rounded-lg text-sm font-medium border ${
                order.paymentStatus === 'paid'
                  ? 'bg-green-100 text-green-800 border-green-200'
                  : 'bg-yellow-100 text-yellow-800 border-yellow-200'
              }`}>
                {order.paymentStatus === 'paid' ? (
                  <div className="flex items-center gap-2">
                    <FiCheckCircle />
                    تم الدفع
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <FiClock />
                    في انتظار الدفع
                  </div>
                )}
              </div>

              {/* تغيير حالة الدفع للدفع عند الاستلام */}
              {order.paymentMethod === 'cod' && (
                <div className="space-y-2 pt-2 border-t">
                  <p className="text-xs text-gray-600 mb-2">تغيير حالة الدفع:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => updatePaymentStatus('paid')}
                      disabled={updating || order.paymentStatus === 'paid'}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        order.paymentStatus === 'paid'
                          ? 'bg-green-600 text-white cursor-default'
                          : 'bg-green-100 hover:bg-green-200 text-green-800'
                      } disabled:opacity-50`}
                    >
                      {order.paymentStatus === 'paid' ? '✓ مدفوع' : 'تأكيد الدفع'}
                    </button>
                    <button
                      onClick={() => updatePaymentStatus('pending')}
                      disabled={updating || order.paymentStatus === 'pending'}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                        order.paymentStatus === 'pending'
                          ? 'bg-yellow-600 text-white cursor-default'
                          : 'bg-yellow-100 hover:bg-yellow-200 text-yellow-800'
                      } disabled:opacity-50`}
                    >
                      {order.paymentStatus === 'pending' ? '✓ في الانتظار' : 'في الانتظار'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* شركة الشحن */}
          {(order.shippingCompany || order.trackingNumber) && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FiTruck />
                شركة الشحن
              </h2>
              <div className="space-y-3">
                {order.shippingCompany && (
                  <p className="text-gray-700">{order.shippingCompany}</p>
                )}
                {order.trackingNumber && (
                  <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                    <p className="text-xs text-primary-600 mb-1">رقم التتبع</p>
                    <p className="font-mono font-bold text-primary-800">{order.trackingNumber}</p>
                  </div>
                )}
                {!order.shippingCompany && !order.trackingNumber && (
                  <p className="text-gray-500">لم يتم تحديد شركة الشحن بعد</p>
                )}
              </div>
            </div>
          )}

          {/* تاريخ الحالات */}
          {order.statusHistory && order.statusHistory.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">تاريخ الحالات</h2>
              <div className="space-y-3">
                {order.statusHistory.slice().reverse().map((history, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className={`w-3 h-3 rounded-full mt-1 ${getStatusColor(history.status).split(' ')[0]}`}></div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{getStatusLabel(history.status)}</p>
                      {history.note && (
                        <p className="text-sm text-gray-600 mt-1">{history.note}</p>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(history.date)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* معلومات إضافية */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">معلومات إضافية</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">تاريخ الطلب:</span>
                <span className="font-medium">{formatDate(order.createdAt)}</span>
              </div>
              {order.updatedAt && order.updatedAt !== order.createdAt && (
                <div className="flex justify-between">
                  <span className="text-gray-600">آخر تحديث:</span>
                  <span className="font-medium">{formatDate(order.updatedAt)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">معرف الطلب:</span>
                <span className="font-mono text-xs">{order._id}</span>
              </div>
            </div>
          </div>

          {/* ملاحظات */}
          {order.notes && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">ملاحظات</h2>
              <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-3 rounded-lg">
                {order.notes}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default OrderDetailsNew