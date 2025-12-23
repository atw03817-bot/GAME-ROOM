import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  FaArrowRight, 
  FaBox, 
  FaUser, 
  FaMapMarkerAlt, 
  FaCreditCard, 
  FaTruck, 
  FaPhone, 
  FaCalendar,
  FaHashtag,
  FaDollarSign,
  FaShoppingBag,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationCircle,
  FaPrint,
  FaWhatsapp
} from 'react-icons/fa';
import api from '../utils/api';
import toast from 'react-hot-toast';
import useAuthStore from '../store/useAuthStore';

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchOrder();
  }, [id, user, navigate]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.order || response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
      if (error.response?.status === 403) {
        toast.error('غير مصرح لك بعرض هذا الطلب');
        navigate('/account');
      } else if (error.response?.status === 404) {
        toast.error('الطلب غير موجود');
        navigate('/account');
      } else {
        toast.error('حدث خطأ أثناء جلب تفاصيل الطلب');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'قيد الانتظار',
      confirmed: 'مؤكد',
      processing: 'قيد التجهيز',
      shipped: 'تم الشحن',
      delivered: 'تم التوصيل',
      cancelled: 'ملغي',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-200',
      processing: 'bg-purple-100 text-purple-800 border-purple-200',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      delivered: 'bg-green-100 text-green-800 border-green-200',
      cancelled: 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: FaClock,
      confirmed: FaCheckCircle,
      processing: FaBox,
      shipped: FaTruck,
      delivered: FaCheckCircle,
      cancelled: FaTimesCircle,
    };
    const Icon = icons[status] || FaExclamationCircle;
    return <Icon />;
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cod: 'الدفع عند الاستلام',
      tap: 'Tap Payments',
      tamara: 'تمارا - اشتري الآن وادفع لاحقاً',
      tabby: 'تابي',
    };
    return labels[method] || method;
  };

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('en-US');
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrint = () => {
    // فتح الفاتورة في تبويب جديد
    window.open(`/invoice/${order.orderNumber}`, '_blank');
  };

  const handleWhatsAppSupport = () => {
    const message = `مرحباً، أحتاج مساعدة بخصوص الطلب رقم: ${order.orderNumber}`;
    const whatsappUrl = `https://wa.me/966500909030?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل تفاصيل الطلب...</p>
        </div>
      </div>
    );
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center py-12">
          <FaBox size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-4">الطلب غير موجود</h2>
          <p className="text-gray-600 mb-6">لم يتم العثور على الطلب المطلوب</p>
          <Link
            to="/account"
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-primary-700 transition"
          >
            العودة لحسابي
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 print:p-8 print:bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link
                to="/account"
                className="p-2 hover:bg-gray-100 rounded-lg transition print:hidden"
              >
                <FaArrowRight size={24} />
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">تفاصيل الطلب</h1>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaHashtag size={16} />
                    <span className="font-mono">{order.orderNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <FaCalendar size={16} />
                    <span>{formatDate(order.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition print:hidden"
              >
                <FaPrint />
                طباعة الفاتورة
              </button>
              <button
                onClick={handleWhatsAppSupport}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition print:hidden"
              >
                <FaWhatsapp />
                دعم فني
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
                  <FaShoppingBag />
                  المنتجات ({order.items?.length || 0})
                </h2>
                <div className="text-sm text-gray-500">
                  إجمالي الكمية: {order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0)}
                </div>
              </div>
              
              <div className="space-y-4">
                {order.items?.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex gap-4">
                      {/* صورة المنتج */}
                      <div className="flex-shrink-0">
                        <img
                          src={item.product?.images?.[0] || item.image || '/placeholder.png'}
                          alt={item.product?.nameAr || item.product?.name || item.name}
                          className="w-24 h-24 object-contain rounded-lg border border-gray-200 bg-white"
                          onError={(e) => {
                            e.target.src = '/placeholder.png';
                          }}
                        />
                      </div>
                      
                      {/* تفاصيل المنتج */}
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">
                              {item.product?.nameAr || item.product?.name || item.name || 'منتج'}
                            </h3>
                            {(item.product?.brand || item.product?.brandAr) && (
                              <p className="text-sm text-gray-600 mt-1">
                                العلامة التجارية: {item.product.brandAr || item.product.brand}
                              </p>
                            )}
                          </div>
                          
                          {/* الأسعار */}
                          <div className="text-left">
                            <div className="bg-gray-50 rounded-lg p-3 min-w-[120px]">
                              <p className="text-sm text-gray-600">سعر الوحدة</p>
                              <p className="font-bold text-gray-800">{formatPrice(item.price)} ر.س</p>
                              <p className="text-sm text-gray-600 mt-2">الكمية: {item.quantity || 0}</p>
                              <div className="border-t pt-2 mt-2">
                                <p className="text-sm text-gray-600">المجموع</p>
                                <p className="text-lg font-bold text-primary-600">
                                  {formatPrice((item.price || 0) * (item.quantity || 0))} ر.س
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
                            </div>
                          )}
                          
                          {item.selectedOptions?.storage && (
                            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
                              <FaBox size={14} className="text-green-600" />
                              <span className="text-sm text-green-800">
                                {item.selectedOptions.storage.nameAr || item.selectedOptions.storage.name || item.selectedOptions.storage.value}
                              </span>
                            </div>
                          )}
                          
                          {item.selectedOptions?.other?.map((option, idx) => (
                            <div key={idx} className="flex items-center gap-2 px-3 py-1 bg-purple-50 border border-purple-200 rounded-full">
                              <span className="text-sm text-purple-800">
                                {option.nameAr || option.name}: {option.value}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* عنوان الشحن */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaMapMarkerAlt />
                عنوان الشحن
              </h2>
              {order.shippingAddress ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-600">الاسم</p>
                        <p className="text-gray-800">{order.shippingAddress.name}</p>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-600">رقم الجوال</p>
                        <p className="text-gray-800" dir="ltr" style={{textAlign: 'right'}}>
                          {order.shippingAddress.phone}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-semibold text-gray-600">المدينة</p>
                        <p className="text-gray-800">{order.shippingAddress.city}</p>
                      </div>
                      {order.shippingAddress.district && (
                        <div>
                          <p className="text-sm font-semibold text-gray-600">الحي</p>
                          <p className="text-gray-800">{order.shippingAddress.district}</p>
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
                        order.shippingAddress.building && `مبنى ${order.shippingAddress.building}`
                      ].filter(Boolean).join('، ')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FaMapMarkerAlt size={48} className="mx-auto mb-2 opacity-50" />
                  <p>لا يوجد عنوان شحن</p>
                </div>
              )}
            </div>

            {/* ملاحظات */}
            {order.notes && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">ملاحظات</h2>
                <p className="text-gray-700 whitespace-pre-line bg-gray-50 p-4 rounded-lg">
                  {order.notes}
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* ملخص الطلب */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaDollarSign />
                ملخص الطلب
              </h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">المجموع الفرعي:</span>
                  <span className="font-bold text-gray-800">{formatPrice(order.subtotal)} ر.س</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">الشحن:</span>
                  <span className={`font-bold ${(order.shippingCost || 0) === 0 ? 'text-green-600' : 'text-gray-800'}`}>
                    {(order.shippingCost || 0) === 0 ? 'مجاني' : `${formatPrice(order.shippingCost)} ر.س`}
                  </span>
                </div>
                
                {/* عمولة تمارا */}
                {order.paymentMethod === 'tamara' && order.tamaraCommission && order.tamaraCommission.amount > 0 && (
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-1">
                      <span className="text-gray-600">{order.tamaraCommission.displayName}:</span>
                      <span className="text-xs text-gray-400">({order.tamaraCommission.rate}%)</span>
                    </div>
                    <span className="font-bold text-orange-600">{formatPrice(order.tamaraCommission.amount)} ر.س</span>
                  </div>
                )}
                
                {(order.tax || 0) > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">الضريبة (15%):</span>
                    <span className="font-bold text-gray-800">{formatPrice(order.tax)} ر.س</span>
                  </div>
                )}
                
                <div className="border-t pt-3 flex justify-between items-center">
                  <span className="font-bold text-gray-800">المجموع الكلي:</span>
                  <span className="font-bold text-primary-600 text-xl">{formatPrice(order.total)} ر.س</span>
                </div>
              </div>
            </div>

            {/* طريقة الدفع */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <FaCreditCard />
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
                      <FaCheckCircle />
                      تم الدفع
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <FaClock />
                      في انتظار الدفع
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* شركة الشحن */}
            {(order.shippingCompany || order.trackingNumber) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FaTruck />
                  شركة الشحن
                </h2>
                <div className="space-y-3">
                  {order.shippingCompany && (
                    <p className="text-gray-700 capitalize">{order.shippingCompany}</p>
                  )}
                  {order.trackingNumber && (
                    <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
                      <p className="text-xs text-primary-600 mb-1">رقم التتبع</p>
                      <p className="font-mono font-bold text-primary-800 select-all">
                        {order.trackingNumber}
                      </p>
                      <Link
                        to={`/track/${order.trackingNumber}`}
                        className="inline-block mt-2 text-xs text-primary-600 hover:text-primary-800 underline"
                      >
                        تتبع الشحنة
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* تاريخ الحالات */}
            {order.statusHistory && order.statusHistory.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">تاريخ الطلب</h2>
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
              <h2 className="text-lg font-bold text-gray-800 mb-4">معلومات الطلب</h2>
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
                  <span className="text-gray-600">رقم الطلب:</span>
                  <span className="font-mono text-xs select-all">{order.orderNumber}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;