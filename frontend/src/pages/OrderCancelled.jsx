import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaTimesCircle, FaHome, FaShoppingCart, FaSpinner } from 'react-icons/fa';
import useCartStore from '../store/useCartStore';
import api from '../utils/api';

function OrderCancelled() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { clearCart } = useCartStore();
  const [loading, setLoading] = useState(true);
  const [cancelDetails, setCancelDetails] = useState({});
  const [storeSettings, setStoreSettings] = useState(null);

  useEffect(() => {
    // Get cancellation details from URL parameters
    const orderId = searchParams.get('orderId');
    const provider = searchParams.get('provider');
    const reason = searchParams.get('reason');
    const cancelled = searchParams.get('cancelled');

    setCancelDetails({
      orderId,
      provider,
      reason,
      cancelled
    });

    // Fetch store settings for contact info
    const fetchStoreSettings = async () => {
      try {
        const response = await api.get('/settings');
        if (response.data.success) {
          setStoreSettings(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching store settings:', error);
      }
    };

    fetchStoreSettings();

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
        return 'تمارا - اشتري الآن وادفع لاحقاً';
      case 'tap':
        return 'Tap Payments - بطاقة ائتمانية';
      case 'cod':
        return 'الدفع عند الاستلام';
      default:
        return provider || 'غير محدد';
    }
  };

  const getCancelMessage = () => {
    switch (cancelDetails.reason) {
      case 'user_cancelled':
        return 'قمت بإلغاء عملية الدفع بنفسك.';
      case 'session_timeout':
        return 'انتهت صلاحية جلسة الدفع بسبب عدم الاستكمال في الوقت المحدد.';
      case 'back_button':
        return 'تم إلغاء العملية عند الضغط على زر الرجوع.';
      case 'browser_closed':
        return 'تم إغلاق المتصفح أثناء عملية الدفع.';
      default:
        return 'تم إلغاء عملية الدفع.';
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
        {/* Cancel Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-4">
            <FaTimesCircle className="text-5xl text-yellow-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            تم إلغاء عملية الدفع
          </h1>
          <p className="text-gray-600">
            لم تكتمل عملية الدفع. لم يتم خصم أي مبلغ من حسابك.
          </p>
        </div>

        {/* Cancel Details Card */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-800">تفاصيل الإلغاء</h2>
          
          <div className="space-y-3">
            {cancelDetails.provider && (
              <div className="flex justify-between">
                <span className="text-gray-600">طريقة الدفع:</span>
                <span className="font-semibold">{getProviderName(cancelDetails.provider)}</span>
              </div>
            )}
            
            {cancelDetails.orderId && (
              <div className="flex justify-between">
                <span className="text-gray-600">رقم الطلب:</span>
                <span className="font-mono font-semibold">#{cancelDetails.orderId.slice(-8)}</span>
              </div>
            )}
            
            <div className="border-t pt-3">
              <p className="text-gray-700 text-sm leading-relaxed">
                <strong>السبب:</strong> {getCancelMessage()}
              </p>
            </div>
          </div>
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold mb-3 text-blue-900">ℹ️ معلومات مهمة:</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• لم يتم خصم أي مبلغ من حسابك أو بطاقتك</li>
            <li>• تم الاحتفاظ بجميع المنتجات في سلة التسوق</li>
            <li>• يمكنك إكمال عملية الشراء في أي وقت</li>
            <li>• جميع العروض والخصومات المطبقة ما زالت سارية</li>
          </ul>
        </div>

        {/* Cart Restoration Notice */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <FaShoppingCart className="text-green-600 mt-1 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900 mb-1">منتجاتك محفوظة</p>
              <p className="text-sm text-green-800">
                تم الاحتفاظ بجميع المنتجات في سلتك. يمكنك إكمال عملية الشراء متى شئت.
              </p>
            </div>
          </div>
        </div>

        {/* Alternative Payment Methods */}
        {cancelDetails.provider && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold mb-3 text-purple-900">💳 طرق دفع أخرى متاحة:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              {cancelDetails.provider !== 'tamara' && (
                <div className="flex items-center gap-2 text-purple-800">
                  <span>✓</span>
                  <span>تمارا - اشتري الآن وادفع لاحقاً</span>
                </div>
              )}
              {cancelDetails.provider !== 'tap' && (
                <div className="flex items-center gap-2 text-purple-800">
                  <span>✓</span>
                  <span>Tap Payments - بطاقة ائتمانية</span>
                </div>
              )}
              {cancelDetails.provider !== 'cod' && (
                <div className="flex items-center gap-2 text-purple-800">
                  <span>✓</span>
                  <span>الدفع عند الاستلام</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <button
            onClick={restoreCart}
            className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
          >
            <FaShoppingCart />
            العودة للسلة وإكمال الشراء
          </button>
          <button
            onClick={() => navigate('/')}
            className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors flex items-center justify-center gap-2"
          >
            <FaHome />
            العودة للرئيسية
          </button>
        </div>

        {/* Continue Shopping */}
        <div className="text-center">
          <button
            onClick={() => navigate('/products')}
            className="text-primary-600 hover:text-primary-700 font-semibold text-sm underline"
          >
            أو تصفح المزيد من المنتجات
          </button>
        </div>

        {/* Contact Support */}
        <div className="bg-gray-100 rounded-lg p-4 text-center mt-6">
          <p className="text-sm text-gray-600 mb-2">
            هل تحتاج مساعدة؟ تواصل معنا
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center text-sm">
            {storeSettings?.contactEmail && (
              <a 
                href={`mailto:${storeSettings.contactEmail}`} 
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                📧 {storeSettings.contactEmail}
              </a>
            )}
            {storeSettings?.contactEmail && storeSettings?.contactPhone && (
              <span className="hidden sm:inline text-gray-400">|</span>
            )}
            {storeSettings?.contactPhone && (
              <a 
                href={`tel:${storeSettings.contactPhone}`} 
                className="text-primary-600 hover:text-primary-700 font-semibold"
              >
                📞 {storeSettings.contactPhone}
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderCancelled;