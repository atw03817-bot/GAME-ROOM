import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import api from '../utils/api';
import useCartStore from '../store/useCartStore';

function TamaraCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();
  const [status, setStatus] = useState('processing'); // processing, success, failed, cancelled
  const [message, setMessage] = useState('جاري التحقق من حالة الدفع...');
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    handleTamaraCallback();
  }, []);

  const handleTamaraCallback = async () => {
    try {
      // Get parameters from URL
      const orderId = searchParams.get('orderId') || searchParams.get('order_id');
      const checkoutId = searchParams.get('checkout_id') || searchParams.get('checkoutId');
      const paymentStatus = searchParams.get('payment_status') || searchParams.get('status');
      const orderStatus = searchParams.get('order_status');
      
      // Get from localStorage if not in URL
      const pendingOrderId = localStorage.getItem('pendingOrderId');
      const tamaraCheckoutId = localStorage.getItem('tamaraCheckoutId');
      
      const finalOrderId = orderId || pendingOrderId;
      const finalCheckoutId = checkoutId || tamaraCheckoutId;

      console.log('🔍 Tamara callback parameters:', {
        orderId: finalOrderId,
        checkoutId: finalCheckoutId,
        paymentStatus,
        orderStatus,
        allParams: Object.fromEntries(searchParams.entries())
      });

      if (!finalOrderId) {
        console.error('❌ No order ID found');
        setStatus('failed');
        setMessage('لم يتم العثور على معرف الطلب');
        setTimeout(() => navigate('/cart'), 3000);
        return;
      }

      // Check payment status from URL parameters
      if (paymentStatus === 'approved' || paymentStatus === 'success' || orderStatus === 'approved') {
        // Payment successful
        console.log('✅ Payment approved by Tamara');
        setStatus('success');
        setMessage('تم الدفع بنجاح! جاري تحديث الطلب...');
        
        // Clear cart and localStorage
        clearCart();
        localStorage.removeItem('pendingOrderId');
        localStorage.removeItem('pendingCart');
        localStorage.removeItem('tamaraCheckoutId');
        
        // Get order details
        try {
          const orderResponse = await api.get(`/orders/${finalOrderId}`);
          setOrderDetails(orderResponse.data.order || orderResponse.data);
        } catch (error) {
          console.error('Error fetching order:', error);
        }
        
        // Redirect to success page after 2 seconds
        setTimeout(() => {
          navigate(`/order-success?orderId=${finalOrderId}&provider=tamara&verified=true`);
        }, 2000);
        
      } else if (paymentStatus === 'declined' || paymentStatus === 'failed' || orderStatus === 'declined') {
        // Payment failed
        console.log('❌ Payment declined/failed');
        setStatus('failed');
        setMessage('فشل في عملية الدفع');
        
        // Redirect to failed page
        setTimeout(() => {
          navigate(`/order-failed?orderId=${finalOrderId}&provider=tamara&reason=payment_failed`);
        }, 2000);
        
      } else if (paymentStatus === 'cancelled' || orderStatus === 'cancelled') {
        // Payment cancelled
        console.log('🚫 Payment cancelled');
        setStatus('cancelled');
        setMessage('تم إلغاء عملية الدفع');
        
        // Redirect to cancelled page
        setTimeout(() => {
          navigate(`/order-cancelled?orderId=${finalOrderId}&provider=tamara&reason=user_cancelled`);
        }, 2000);
        
      } else {
        // Unknown status - try to verify with backend
        console.log('❓ Unknown status, verifying with backend...');
        setMessage('جاري التحقق من حالة الدفع مع الخادم...');
        
        try {
          // Try to get order status from backend
          const orderResponse = await api.get(`/orders/${finalOrderId}`);
          const order = orderResponse.data.order || orderResponse.data;
          
          console.log('📋 Order status from backend:', {
            paymentStatus: order.paymentStatus,
            orderStatus: order.orderStatus
          });
          
          if (order.paymentStatus === 'approved' || order.paymentStatus === 'paid') {
            setStatus('success');
            setMessage('تم تأكيد الدفع بنجاح!');
            clearCart();
            localStorage.removeItem('pendingOrderId');
            localStorage.removeItem('pendingCart');
            localStorage.removeItem('tamaraCheckoutId');
            
            setTimeout(() => {
              navigate(`/order-success?orderId=${finalOrderId}&provider=tamara&verified=true`);
            }, 2000);
            
          } else if (order.paymentStatus === 'declined' || order.paymentStatus === 'failed') {
            setStatus('failed');
            setMessage('فشل في عملية الدفع');
            
            setTimeout(() => {
              navigate(`/order-failed?orderId=${finalOrderId}&provider=tamara&reason=payment_failed`);
            }, 2000);
            
          } else {
            // Still pending - wait a bit more
            setMessage('الدفع قيد المعالجة، جاري الانتظار...');
            
            // Wait and check again
            setTimeout(() => {
              handleTamaraCallback();
            }, 3000);
          }
          
        } catch (error) {
          console.error('❌ Error verifying with backend:', error);
          setStatus('failed');
          setMessage('خطأ في التحقق من حالة الدفع');
          
          setTimeout(() => {
            navigate(`/order-failed?orderId=${finalOrderId}&provider=tamara&reason=verification_error`);
          }, 3000);
        }
      }
      
    } catch (error) {
      console.error('❌ Error in Tamara callback:', error);
      setStatus('failed');
      setMessage('حدث خطأ أثناء معالجة النتيجة');
      
      setTimeout(() => navigate('/cart'), 3000);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success':
        return <FaCheckCircle className="text-6xl text-green-500" />;
      case 'failed':
      case 'cancelled':
        return <FaExclamationTriangle className="text-6xl text-red-500" />;
      default:
        return <FaSpinner className="animate-spin text-6xl text-blue-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600';
      case 'failed':
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md mx-auto text-center px-4">
        {/* Status Icon */}
        <div className="mb-6">
          {getStatusIcon()}
        </div>

        {/* Status Message */}
        <h1 className={`text-2xl font-bold mb-4 ${getStatusColor()}`}>
          {status === 'processing' && 'جاري المعالجة...'}
          {status === 'success' && 'تم بنجاح!'}
          {status === 'failed' && 'فشلت العملية'}
          {status === 'cancelled' && 'تم الإلغاء'}
        </h1>

        <p className="text-gray-600 mb-6">
          {message}
        </p>

        {/* Order Details (if available) */}
        {orderDetails && (
          <div className="bg-white rounded-lg p-4 mb-6 text-right">
            <h3 className="font-semibold mb-2">تفاصيل الطلب:</h3>
            <div className="text-sm text-gray-600">
              <p>رقم الطلب: #{orderDetails._id?.slice(-8)}</p>
              <p>المبلغ: {orderDetails.total?.toFixed(2)} ر.س</p>
            </div>
          </div>
        )}

        {/* Loading indicator */}
        {status === 'processing' && (
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <FaSpinner className="animate-spin" />
            <span>الرجاء عدم إغلاق هذه الصفحة...</span>
          </div>
        )}

        {/* Manual navigation (if something goes wrong) */}
        {status !== 'processing' && (
          <div className="mt-6">
            <button
              onClick={() => navigate('/')}
              className="text-primary-600 hover:text-primary-700 text-sm underline"
            >
              العودة للرئيسية
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default TamaraCallback;