import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaExclamationTriangle, FaHome, FaShoppingCart, FaSpinner } from 'react-icons/fa';
import useCartStore from '../store/useCartStore';

function OrderFailed() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [errorDetails, setErrorDetails] = useState({});

  useEffect(() => {
    // Get error details from URL parameters
    const orderId = searchParams.get('orderId');
    const provider = searchParams.get('provider');
    const reason = searchParams.get('reason');
    const message = searchParams.get('message');

    setErrorDetails({
      orderId,
      provider,
      reason,
      message
    });

    // Simulate loading for better UX
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [searchParams]);

  const restoreCart = () => {
    const pendingCart = localStorage.getItem('pendingCart');
    if (pendingCart) {
      try {
        const items = JSON.parse(pendingCart);
        // Clear current cart first
        clearCart();
        // Restore items to cart
        items.forEach(item => {
          useCartStore.getState().addItem(item);
        });
        console.log('✅ Cart restored successfully');
      } catch (error) {
        console.error('❌ Error restoring cart:', error);
      }
    }
    
    // Clean up localStorage
    localStorage.removeItem('pendingCart');
    localStorage.removeItem('pendingOrderId');
    
    navigate('/cart');
  };

  const getProviderName = (provider) => {
    switch (provider) {
      case 'tamara':
        return 'تمارا';
      case 'tap':
        return 'Tap Payments';
      case 'cod':
        return 'الدفع عند الاستلام';
      default:
        return provider || 'غير محدد';
    }
  };

  const getErrorMessage = () => {
    if (errorDetails.message) {
      return decodeURIComponent(errorDetails.message);
    }
    
    switch (errorDetails.reason) {
      case 'payment_failed':
        return 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.';
      case 'insufficient_funds':
        return 'الرصيد غير كافي. يرجى التحقق من رصيدك والمحاولة مرة أخرى.';
      case 'card_declined':
        return 'تم رفض البطاقة. يرجى التحقق من بيانات البطاقة أو استخدام بطاقة أخرى.';
      case 'expired_session':
        return 'انتهت صلاحية جلسة الدفع. يرجى المحاولة مرة أخرى.';
      case 'cancelled_by_user':
        return 'تم إلغاء عملية الدفع من قبل المستخدم.';
      case 'network_error':
        return 'خطأ في الاتصال. يرجى التحقق من الإنترنت والمحاولة مرة أخرى.';
      default:
        return 'حدث خطأ أثناء عملية الدفع. يرجى المحاولة مرة أخرى.';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <FaSpinner className="animate-spin text-5xl text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">جاري التحميل...</h2>
          <p className="text-gray-600">الرجاء الانتظار</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Error Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <FaExclamationTriangle className="text-5xl text-red-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            فشلت عملية الدفع
          </h1>
          <p className="text-gray-600">
            لم تتم عملية الدفع بنجاح. لا تقلق، لم يتم خصم أي مبلغ من حسابك.
          </p>
        </div>

        {/* Error Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-red-800">تفاصيل الخطأ</h2>
          
          <div className="space-y-3">
            {errorDetails.provider && (
              <div className="flex justify-between">
                <span className="text-gray-600">طريقة الدفع:</span>
                <span className="font-semibold">{getProviderName(errorDetails.provider)}</span>
              </div>
            )}
            
            {errorDetails.orderId && (
              <div className="flex justify-between">
                <span className="text-gray-600">رقم الطلب:</span>
                <span className="font-mono font-semibold">#{errorDetails.orderId.slice(-8)}</span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <p className="text-gray-700 text-sm leading-relaxed">
                <strong>السبب:</strong> {getErrorMessage()}
              </p>
            </div>
          </div>
        </div>

        {/* Help Card */}
        <div className="bg-[#1a1a1a] border border-[#333333] rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3 text-[#E08713]">💡 نصائح لحل المشكلة:</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>• تأكد من صحة بيانات البطاقة (رقم البطاقة، تاريخ الانتهاء، CVV)</li>
            <li>• تحقق من وجود رصيد كافي في حسابك</li>
            <li>• تأكد من أن البطاقة مفعلة للمدفوعات الإلكترونية</li>
            <li>• جرب استخدام بطاقة أخرى أو طريقة دفع مختلفة</li>
            <li>• تحقق من اتصالك بالإنترنت</li>
          </ul>
        </div>

        {/* Cart Restoration Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaShoppingCart className="text-green-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900 mb-1">تم الاحتفاظ بمنتجاتك</p>
              <p className="text-sm text-green-800">
                لا تقلق! تم الاحتفاظ بجميع المنتجات في سلتك. يمكنك المحاولة مرة أخرى.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={restoreCart}
            className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaShoppingCart />
            العودة للسلة والمحاولة مرة أخرى
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <FaHome />
            العودة للرئيسية
          </button>
        </div>

        {/* Contact Support */}
        <div className="bg-gray-100 rounded-lg p-4 text-center">
          <p className="text-sm text-gray-600 mb-2">
            هل تواجه مشكلة مستمرة؟ تواصل مع فريق الدعم
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
            <a 
              href="mailto:support@example.com" 
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              📧 support@example.com
            </a>
            <span className="hidden sm:inline text-gray-400">|</span>
            <a 
              href="tel:+966500000000" 
              className="text-primary-600 hover:text-primary-700 font-semibold"
            >
              📞 +966 50 000 0000
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderFailed;