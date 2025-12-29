import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaBox, FaTruck, FaHome, FaWhatsapp, FaPhone } from 'react-icons/fa';
import api from '../utils/api';

function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      fetchOrder();
      // مسح معرف الطلب المكتمل من localStorage
      localStorage.removeItem('completedOrderId');
    }
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/orders/${orderId}`);
      setOrder(response.data.order || response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return (price || 0).toLocaleString('en-US');
  };

  const handleWhatsAppSupport = () => {
    const message = `مرحباً، تم إنشاء طلب جديد برقم: ${order?.orderNumber || orderId}`;
    const whatsappUrl = `https://wa.me/966507303172?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#C72C15] mx-auto mb-4"></div>
          <p className="text-gray-300">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#111111] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-900/20 rounded-full mb-4">
            <svg className="w-12 h-12 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">حدث خطأ</h2>
          <p className="text-gray-300 mb-6">لم نتمكن من العثور على معلومات الطلب</p>
          <button
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white px-6 py-3 rounded-lg font-semibold hover:opacity-90"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-900/20 rounded-full mb-6">
            <FaCheckCircle className="text-6xl text-green-400" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-3">
            تم تأكيد طلبك بنجاح! 🎉
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            شكراً لك على ثقتك بنا
          </p>
          <p className="text-gray-400">
            سنبدأ بتجهيز طلبك فوراً وسيصلك في أقرب وقت
          </p>
        </div>

        {/* Order Details Card */}
        <div className="bg-[#1a1a1a] border border-[#C72C15] rounded-xl shadow-lg p-6 mb-6">
          <div className="border-b border-[#C72C15]/30 pb-4 mb-6">
            <h2 className="text-2xl font-semibold mb-3 text-white">تفاصيل طلبك</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-between">
                <span className="text-gray-300">رقم الطلب:</span>
                <span className="font-mono font-bold text-[#C72C15]">#{order.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">تاريخ الطلب:</span>
                <span className="font-semibold text-white">
                  {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                </span>
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4 text-white flex items-center gap-2">
              <FaBox className="text-[#C72C15]" />
              المنتجات ({order.items?.length || 0})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-[#111111] border border-[#333] rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-white">
                      {item.product?.nameAr || item.product?.name || 'منتج'}
                    </p>
                    <p className="text-sm text-gray-400">
                      الكمية: {item.quantity} × {formatPrice(item.price)} ر.س
                    </p>
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-[#C72C15]">
                      {formatPrice(item.price * item.quantity)} ر.س
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t border-[#C72C15]/30 pt-4 space-y-2">
            <div className="flex justify-between text-gray-300">
              <span>المجموع الفرعي:</span>
              <span>{formatPrice(order.subtotal)} ر.س</span>
            </div>
            <div className="flex justify-between text-gray-300">
              <span>الشحن:</span>
              <span className={order.shippingCost === 0 ? 'text-green-400' : ''}>
                {order.shippingCost === 0 ? 'مجاني' : `${formatPrice(order.shippingCost)} ر.س`}
              </span>
            </div>
            {order.tax > 0 && (
              <div className="flex justify-between text-gray-300">
                <span>الضريبة:</span>
                <span>{formatPrice(order.tax)} ر.س</span>
              </div>
            )}
            <div className="border-t border-[#333] pt-2 flex justify-between items-center">
              <span className="text-xl font-bold text-white">المجموع الكلي:</span>
              <span className="text-2xl font-bold text-[#C72C15]">
                {formatPrice(order.total)} ر.س
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mt-6 p-4 bg-[#C72C15]/10 border border-[#C72C15]/30 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">طريقة الدفع:</span>
              <span className="font-bold text-[#C72C15]">
                💰 الدفع عند الاستلام
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              ستدفع المبلغ عند استلام الطلب من المندوب
            </p>
          </div>
        </div>

        {/* Next Steps */}
        <div className="bg-gradient-to-r from-[#E08713]/20 to-[#C72C15]/20 border border-[#C72C15]/30 rounded-xl p-6 mb-6">
          <h3 className="text-xl font-bold mb-4 text-white">ماذا يحدث الآن؟</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#C72C15] rounded-full flex items-center justify-center text-white font-bold text-sm">
                1
              </div>
              <div>
                <p className="font-semibold text-white">تأكيد الطلب</p>
                <p className="text-sm text-gray-300">سنراجع طلبك ونؤكده خلال ساعة واحدة</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-[#E08713] rounded-full flex items-center justify-center text-white font-bold text-sm">
                2
              </div>
              <div>
                <p className="font-semibold text-white">تجهيز الطلب</p>
                <p className="text-sm text-gray-300">سنبدأ بتجهيز وتغليف منتجاتك بعناية</p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                3
              </div>
              <div>
                <p className="font-semibold text-white">الشحن والتوصيل</p>
                <p className="text-sm text-gray-300">سيتم شحن طلبك وتوصيله خلال 2-3 أيام عمل</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Support */}
        <div className="bg-[#1a1a1a] border border-[#C72C15] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-white">تحتاج مساعدة؟</h3>
          <p className="text-gray-300 mb-4">فريق الدعم الفني متاح لمساعدتك في أي وقت</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleWhatsAppSupport}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition flex-1"
            >
              <FaWhatsapp />
              واتساب
            </button>
            <button
              onClick={() => window.open('tel:+966507303172')}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-[#E08713] hover:bg-[#C72C15] text-white rounded-lg transition flex-1"
            >
              <FaPhone />
              اتصال مباشر
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => navigate('/account')}
            className="flex-1 bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white py-4 rounded-lg font-bold hover:opacity-90 transition"
          >
            عرض طلباتي
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-[#2a2a2a] text-gray-300 py-4 rounded-lg font-bold hover:bg-[#3a3a3a] transition flex items-center justify-center gap-2"
          >
            <FaHome />
            متابعة التسوق
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            سيتم إرسال رسالة تأكيد على رقم جوالك المسجل
          </p>
          <p className="text-xs text-gray-500 mt-2">
            رقم الطلب: {order.orderNumber} | تاريخ الإنشاء: {new Date(order.createdAt).toLocaleString('ar-SA')}
          </p>
        </div>
      </div>
    </div>
  );
}

export default OrderConfirmation;