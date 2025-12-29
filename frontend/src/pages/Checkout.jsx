import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheck } from 'react-icons/fa';
import useCartStore from '../store/useCartStore';
import AddressManager from '../components/checkout/AddressManager';
import ShippingSelector from '../components/checkout/ShippingSelector';
import PaymentMethods from '../components/checkout/PaymentMethods';
import OrderSummary from '../components/checkout/OrderSummary';
import api from '../utils/api';
import toast from 'react-hot-toast';
import useScrollToTop from '../hooks/useScrollToTop';

function Checkout() {
  const navigate = useNavigate();
  const { items, clearCart, getTotal } = useCartStore();

  // التمرير إلى أعلى الصفحة عند تحميل صفحة الدفع
  useScrollToTop();
  
  // Load saved checkout state from localStorage
  const loadCheckoutState = () => {
    try {
      const saved = localStorage.getItem('checkoutState');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading checkout state:', error);
    }
    return {
      currentStep: 1,
      selectedAddress: null,
      selectedShipping: null,
      selectedPayment: 'cod'
    };
  };

  const savedState = loadCheckoutState();
  
  const [currentStep, setCurrentStep] = useState(savedState.currentStep);
  const [selectedAddress, setSelectedAddress] = useState(savedState.selectedAddress);
  const [selectedShipping, setSelectedShipping] = useState(savedState.selectedShipping);
  const [selectedPayment, setSelectedPayment] = useState(savedState.selectedPayment);
  const [loading, setLoading] = useState(false);

  // Save checkout state to localStorage whenever it changes
  useEffect(() => {
    const state = {
      currentStep,
      selectedAddress,
      selectedShipping,
      selectedPayment
    };
    localStorage.setItem('checkoutState', JSON.stringify(state));
  }, [currentStep, selectedAddress, selectedShipping, selectedPayment]);

  useEffect(() => {
    // Redirect if cart is empty (unless there's a completed order)
    const completedOrderId = localStorage.getItem('completedOrderId');
    if (items.length === 0 && !completedOrderId) {
      toast.error('السلة فارغة');
      navigate('/cart');
    }
  }, [items, navigate]);

  const steps = [
    { number: 1, title: 'العنوان' },
    { number: 2, title: 'الشحن' },
    { number: 3, title: 'الدفع' },
    { number: 4, title: 'المراجعة' }
  ];

  const handleNext = () => {
    if (currentStep === 1 && !selectedAddress) {
      toast.error('الرجاء اختيار العنوان');
      return;
    }
    if (currentStep === 2 && !selectedShipping) {
      toast.error('الرجاء اختيار شركة الشحن');
      return;
    }
    if (currentStep === 3 && !selectedPayment) {
      toast.error('الرجاء اختيار طريقة الدفع');
      return;
    }
    
    setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handlePlaceOrder = async () => {
    try {
      setLoading(true);

      const orderData = {
        items: items.map(item => ({
          product: item._id,
          quantity: item.quantity,
          selectedColor: item.selectedColor, // للتوافق مع الكود القديم
          selectedStorage: item.selectedStorage, // للتوافق مع الكود القديم
          selectedOptions: item.selectedOptions // الطريقة الجديدة
        })),
        shippingAddress: selectedAddress,
        shippingCost: selectedShipping.cost,
        shippingProvider: selectedShipping.providerId,
        paymentMethod: selectedPayment,
        notes: ''
      };

      // Handle online payment methods (Tap, Tamara)
      if (selectedPayment === 'tap') {
        // Create order first with pending payment
        const response = await api.post('/orders', orderData);
        const orderId = response.data.order._id;
        const total = response.data.order.total;

        console.log('📦 Order created:', orderId, 'Amount:', total);

        // Create Tap charge
        const chargeData = {
          orderId: orderId,
          amount: total,
          customerInfo: {
            name: selectedAddress.fullName,
            email: selectedAddress.email || '',
            phone: selectedAddress.phone
          }
        };
        
        console.log('💳 Sending Tap charge request:', chargeData);
        
        const chargeResponse = await api.post('/payments/tap/charge', chargeData);

        console.log('✅ Tap charge response:', chargeResponse.data);

        if (chargeResponse.data.success && chargeResponse.data.data?.paymentUrl) {
          // Save order ID and cart to localStorage for later verification
          localStorage.setItem('pendingOrderId', orderId);
          localStorage.setItem('pendingCart', JSON.stringify(items));
          
          // Clear checkout state only (keep cart until payment success)
          localStorage.removeItem('checkoutState');
          
          console.log('🔄 Redirecting to Tap:', chargeResponse.data.data.paymentUrl);
          
          // Redirect to Tap payment page
          window.location.href = chargeResponse.data.data.paymentUrl;
          return;
        } else {
          console.error('❌ No payment URL in Tap response:', chargeResponse.data);
          toast.error('لم يتم الحصول على رابط الدفع');
          setLoading(false);
          return;
        }
      }

      // Handle Tamara payment
      if (selectedPayment === 'tamara') {
        // Create order first with pending payment
        const response = await api.post('/orders', orderData);
        const orderId = response.data.order._id;
        const total = response.data.order.total;

        console.log('📦 Order created for Tamara:', orderId, 'Amount:', total);

        // Create Tamara checkout session
        const tamaraData = {
          orderId: orderId,
          paymentType: 'PAY_BY_INSTALMENTS', // Default payment type
          instalments: null // Will be determined by Tamara based on amount
        };
        
        console.log('🛒 Creating Tamara checkout session:', tamaraData);
        
        const tamaraResponse = await api.post('/payments/tamara/checkout', tamaraData);

        console.log('✅ Tamara checkout response:', tamaraResponse.data);

        if (tamaraResponse.data.success && tamaraResponse.data.data?.checkoutUrl) {
          // Save order ID and cart to localStorage for later verification
          localStorage.setItem('pendingOrderId', orderId);
          localStorage.setItem('pendingCart', JSON.stringify(items));
          localStorage.setItem('tamaraCheckoutId', tamaraResponse.data.data.checkoutId);
          
          // Clear checkout state only (keep cart until payment success)
          localStorage.removeItem('checkoutState');
          
          console.log('🔄 Redirecting to Tamara:', tamaraResponse.data.data.checkoutUrl);
          
          // Redirect to Tamara payment page
          window.location.href = tamaraResponse.data.data.checkoutUrl;
          return;
        } else {
          console.error('❌ No checkout URL in Tamara response:', tamaraResponse.data);
          toast.error('لم يتم الحصول على رابط الدفع من Tamara');
          setLoading(false);
          return;
        }
      }

      // Handle Tabby payment
      if (selectedPayment === 'tabby') {
        // Create order first with pending payment
        const response = await api.post('/orders', orderData);
        const orderId = response.data.order._id;
        const total = response.data.order.total;

        console.log('📦 Order created for Tabby:', orderId, 'Amount:', total);

        // Create Tabby checkout session
        const tabbyData = {
          orderId: orderId
        };
        
        console.log('🛒 Creating Tabby checkout session:', tabbyData);
        
        const tabbyResponse = await api.post('/payments/tabby/checkout', tabbyData);

        console.log('✅ Tabby checkout response:', tabbyResponse.data);

        if (tabbyResponse.data.success && tabbyResponse.data.data?.sessionId) {
          // Check if installments are available
          if (tabbyResponse.data.data.hasInstallments === false) {
            console.warn('⚠️ No installment products available');
            toast.error('خدمة التقسيط غير متاحة لهذا المبلغ');
            setLoading(false);
            return;
          }

          // Save order ID and cart to localStorage for later verification
          localStorage.setItem('pendingOrderId', orderId);
          localStorage.setItem('pendingCart', JSON.stringify(items));
          localStorage.setItem('tabbySessionId', tabbyResponse.data.data.sessionId);
          
          // Clear checkout state only (keep cart until payment success)
          localStorage.removeItem('checkoutState');
          
          // Use the checkout URL from Tabby response if available, otherwise construct it
          let checkoutUrl = tabbyResponse.data.data.checkoutUrl;
          
          if (!checkoutUrl) {
            // Fallback: construct URL based on Tabby documentation
            checkoutUrl = `https://checkout.tabby.ai/checkout/${tabbyResponse.data.data.sessionId}`;
          }
          
          console.log('🔄 Redirecting to Tabby:', checkoutUrl);
          
          // Redirect to Tabby payment page
          window.location.href = checkoutUrl;
          return;
        } else {
          console.error('❌ Failed to create Tabby session:', tabbyResponse.data);
          toast.error('فشل في إنشاء جلسة الدفع مع Tabby');
          setLoading(false);
          return;
        }
      }

      
      // For COD or other payment methods
      console.log('📦 Creating COD order with data:', orderData);
      const response = await api.post('/orders', orderData);
      console.log('✅ Order created successfully:', response.data);
      
      const orderId = response.data.order?._id || response.data._id;
      console.log('🔍 Order ID:', orderId);
      
      if (!orderId) {
        console.error('❌ No order ID found in response:', response.data);
        toast.error('خطأ في الحصول على رقم الطلب');
        return;
      }
      
      localStorage.removeItem('checkoutState');
      
      // توجيه للصفحة المناسبة حسب طريقة الدفع
      if (selectedPayment === 'cod') {
        console.log('🔄 Navigating to order confirmation page:', `/order-confirmation/${orderId}`);
        // حفظ معرف الطلب قبل مسح السلة
        localStorage.setItem('completedOrderId', orderId);
        clearCart();
        toast.success('تم إنشاء الطلب بنجاح!');
        navigate(`/order-confirmation/${orderId}`, { replace: true });
      } else {
        console.log('🔄 Navigating to order success page:', `/order-success/${orderId}`);
        clearCart();
        toast.success('تم إنشاء الطلب بنجاح!');
        navigate(`/order-success/${orderId}`);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      toast.error(error.response?.data?.message || 'خطأ في إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#111111] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8 text-white">إتمام الطلب</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.number
                        ? 'bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white'
                        : 'bg-[#2a2a2a] text-gray-400'
                    }`}
                  >
                    {currentStep > step.number ? <FaCheck /> : step.number}
                  </div>
                  <span className="text-sm mt-2 text-center text-gray-300">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.number ? 'bg-gradient-to-r from-[#E08713] to-[#C72C15]' : 'bg-[#2a2a2a]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-[#1a1a1a] border border-[#C72C15] rounded-lg shadow-lg p-6">
              {/* Step 1: Address */}
              {currentStep === 1 && (
                <AddressManager
                  onSelectAddress={setSelectedAddress}
                  selectedAddressId={selectedAddress?._id}
                />
              )}

              {/* Step 2: Shipping */}
              {currentStep === 2 && (
                <ShippingSelector
                  city={selectedAddress?.city}
                  onSelectShipping={setSelectedShipping}
                  selectedShippingId={selectedShipping?.providerId}
                />
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <PaymentMethods
                  onSelectPayment={setSelectedPayment}
                  selectedPaymentMethod={selectedPayment}
                  totalAmount={getTotal() + (selectedShipping?.cost || 0)}
                />
              )}

              {/* Step 4: Review */}
              {currentStep === 4 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4 text-white">مراجعة الطلب</h3>

                  {/* Address */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-white">عنوان التوصيل</h4>
                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                      <p className="font-medium text-white">{selectedAddress.fullName}</p>
                      <p className="text-sm text-gray-300">{selectedAddress.phone}</p>
                      <p className="text-sm text-gray-300">
                        {selectedAddress.city} - {selectedAddress.district}
                      </p>
                      <p className="text-sm text-gray-300">
                        {selectedAddress.street} - {selectedAddress.building}
                      </p>
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-white">الشحن</h4>
                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                      <p className="font-medium text-white">{selectedShipping.providerName}</p>
                      <p className="text-sm text-gray-300">
                        التوصيل خلال {selectedShipping.estimatedDays} أيام
                      </p>
                      <p className="text-sm text-gray-300">
                        التكلفة: {selectedShipping.cost} ر.س
                      </p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-white">طريقة الدفع</h4>
                    <div className="bg-[#2a2a2a] p-4 rounded-lg">
                      <p className="font-medium text-white">
                        {selectedPayment === 'cod' ? 'الدفع عند الاستلام' : 
                         selectedPayment === 'tap' ? 'Tap Payments - بطاقة ائتمانية' :
                         selectedPayment === 'tamara' ? 'تمارا - اشتري الآن وادفع لاحقاً' :
                         selectedPayment === 'tabby' ? 'تابي - ادفع على 4 دفعات' :
                         selectedPayment}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                {currentStep > 1 && (
                  <button
                    onClick={handleBack}
                    className="flex-1 bg-[#2a2a2a] text-gray-300 py-3 rounded-lg font-semibold hover:bg-[#3a3a3a]"
                  >
                    السابق
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white py-3 rounded-lg font-semibold hover:from-[#C72C15] hover:to-[#991b1b]"
                  >
                    التالي
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white py-3 rounded-lg font-semibold hover:from-[#C72C15] hover:to-[#991b1b] disabled:bg-gray-600"
                  >
                    {loading ? 'جاري إنشاء الطلب...' : 'تأكيد الطلب'}
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <OrderSummary 
                shippingCost={selectedShipping?.cost || 0} 
                selectedPayment={selectedPayment}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
