import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { FaCheckCircle, FaBox, FaTruck, FaHome, FaSpinner } from 'react-icons/fa';
import api from '../utils/api';
import useCartStore from '../store/useCartStore';

function OrderSuccess() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart } = useCartStore();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    // Check if coming from Tap payment
    const tapId = searchParams.get('tap_id');
    const orderIdFromQuery = searchParams.get('orderId');
    const provider = searchParams.get('provider');
    
    if (tapId && orderIdFromQuery) {
      verifyTapPayment(tapId, orderIdFromQuery);
    } else if (provider === 'tamara' && orderIdFromQuery) {
      // For Tamara, we assume success if we reach this page
      // Tamara handles verification through webhooks
      setPaymentStatus('success');
      clearCart();
      localStorage.removeItem('pendingOrderId');
      localStorage.removeItem('pendingCart');
      fetchOrder(orderIdFromQuery);
    } else if (orderId) {
      fetchOrder();
    }
  }, [orderId, searchParams]);

  const verifyTapPayment = async (tapId, orderIdFromQuery) => {
    try {
      setVerifyingPayment(true);
      setLoading(true);
      
      console.log('🔍 Verifying Tap payment:', tapId);
      
      // Verify payment with backend
      const response = await api.get(`/payments/tap/verify/${tapId}`);
      
      console.log('✅ Verification response:', response.data);
      
      if (response.data.success && response.data.data.paid) {
        setPaymentStatus('success');
        
        // Clear cart now that payment is successful
        clearCart();
        localStorage.removeItem('pendingOrderId');
        localStorage.removeItem('pendingCart');
        
        // Fetch order details
        await fetchOrder(orderIdFromQuery);
      } else {
        // Payment failed or not completed
        console.log('❌ Payment not successful:', response.data);
        setPaymentStatus('failed');
        setVerifyingPayment(false);
        setLoading(false);
      }
    } catch (error) {
      console.error('❌ Error verifying payment:', error);
      setPaymentStatus('error');
      setVerifyingPayment(false);
      setLoading(false);
    }
  };

  const fetchOrder = async (orderIdParam) => {
    try {
      setLoading(true);
      const id = orderIdParam || orderId;
      const response = await api.get(`/orders/${id}`);
      setOrder(response.data.order || response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
      setVerifyingPayment(false);
    }
  };

  console.log('🔍 Current state:', { verifyingPayment, paymentStatus, loading, hasOrder: !!order });

  if (verifyingPayment && !paymentStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-primary-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">جاري التحقق من الدفع...</h2>
          <p className="text-gray-600">الرجاء الانتظار</p>
        </div>
      </div>
    );
  }

  if (paymentStatus === 'failed' || paymentStatus === 'error') {
    // Restore cart from localStorage
    const restoreCart = () => {
      const pendingCart = localStorage.getItem('pendingCart');
      if (pendingCart) {
        try {
          const items = JSON.parse(pendingCart);
          // Restore items to cart
          items.forEach(item => {
            useCartStore.getState().addItem(item);
          });
        } catch (error) {
          console.error('Error restoring cart:', error);
        }
      }
      localStorage.removeItem('pendingCart');
      localStorage.removeItem('pendingOrderId');
      navigate('/cart');
    };

    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">فشلت عملية الدفع</h2>
          <p className="text-gray-600 mb-2">لم تتم عملية الدفع بنجاح.</p>
          <p className="text-sm text-gray-500 mb-6">لا تقلق، لم يتم خصم أي مبلغ من حسابك.</p>
          
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6 text-right">
            <p className="text-sm text-primary-800">
              💡 <strong>ملاحظة:</strong> تم الاحتفاظ بمنتجاتك في السلة. يمكنك المحاولة مرة أخرى.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={restoreCart}
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
            >
              العودة للسلة والمحاولة مرة أخرى
            </button>
            <button
              onClick={() => navigate('/')}
              className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading && !paymentStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // If no order and no payment status, something went wrong
  if (!order && !paymentStatus && !loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <svg className="w-12 h-12 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-gray-600 mb-6">لم نتمكن من العثور على معلومات الطلب</p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
            <FaCheckCircle className="text-5xl text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            تم إنشاء طلبك بنجاح!
          </h1>
          <p className="text-gray-600">
            شكراً لك! سنبدأ بتجهيز طلبك فوراً
          </p>
        </div>

        {/* Order Details Card */}
        {order && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="border-b pb-4 mb-4">
              <h2 className="text-xl font-semibold mb-2">تفاصيل الطلب</h2>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">رقم الطلب:</span>
                <span className="font-mono font-semibold">#{order._id?.slice(-8)}</span>
              </div>
            </div>

            {/* Order Items */}
            <div className="mb-4">
              <h3 className="font-semibold mb-3">المنتجات:</h3>
              <div className="space-y-2">
                {order.items?.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-700">
                      {item.product?.nameAr || 'منتج'} × {item.quantity}
                    </span>
                    <span className="font-semibold">
                      {(item.price * item.quantity).toFixed(2)} ر.س
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">المجموع الكلي:</span>
                <span className="text-2xl font-bold text-primary-600">
                  {order.total?.toFixed(2)} ر.س
                </span>
              </div>
            </div>

            {/* Payment Method */}
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">طريقة الدفع:</span>
                <span className="font-semibold">
                  {order.paymentMethod === 'cod' && 'الدفع عند الاستلام'}
                  {order.paymentMethod === 'tap' && 'Tap Payments - بطاقة ائتمانية'}
                  {order.paymentMethod === 'tamara' && 'تمارا - اشتري الآن وادفع لاحقاً'}
                  {!['cod', 'tap', 'tamara'].includes(order.paymentMethod) && order.paymentMethod}
                </span>
              </div>
              {order.paymentStatus && (
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">حالة الدفع:</span>
                  <span className={`font-semibold ${
                    order.paymentStatus === 'PAID' ? 'text-green-600' : 
                    order.paymentStatus === 'PENDING' ? 'text-yellow-600' : 
                    'text-gray-600'
                  }`}>
                    {order.paymentStatus === 'PAID' && '✅ مدفوع'}
                    {order.paymentStatus === 'PENDING' && '⏳ قيد الانتظار'}
                    {order.paymentStatus === 'FAILED' && '❌ فشل'}
                    {!['PAID', 'PENDING', 'FAILED'].includes(order.paymentStatus) && order.paymentStatus}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Next Steps */}
        <div className="bg-primary-50 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-4 text-primary-900">الخطوات القادمة:</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <FaBox className="text-primary-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-primary-900">تجهيز الطلب</p>
                <p className="text-sm text-primary-700">سنبدأ بتجهيز طلبك خلال 24 ساعة</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaTruck className="text-primary-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-primary-900">الشحن</p>
                <p className="text-sm text-primary-700">سيتم شحن طلبك خلال 2-3 أيام عمل</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <FaCheckCircle className="text-primary-600 mt-1 flex-shrink-0" />
              <div>
                <p className="font-medium text-primary-900">التسليم</p>
                <p className="text-sm text-primary-700">سيصلك الطلب في الموعد المحدد</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => navigate('/orders')}
            className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
          >
            عرض طلباتي
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition flex items-center justify-center gap-2"
          >
            <FaHome />
            العودة للرئيسية
          </button>
        </div>

        {/* Contact Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>هل لديك أسئلة؟ تواصل معنا على</p>
          <p className="font-semibold text-primary-600 mt-1">support@example.com</p>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
