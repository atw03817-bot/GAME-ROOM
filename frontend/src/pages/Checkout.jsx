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
    // Redirect if cart is empty
    if (items.length === 0) {
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

      // If payment method is Tap, create order with pending payment status
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
        
        console.log('💳 Sending charge request:', chargeData);
        
        const chargeResponse = await api.post('/payments/tap/charge', chargeData);

        console.log('✅ Charge response:', chargeResponse.data);

        if (chargeResponse.data.success && chargeResponse.data.data?.paymentUrl) {
          // Save order ID and cart to localStorage for later verification
          localStorage.setItem('pendingOrderId', orderId);
          localStorage.setItem('pendingCart', JSON.stringify(items));
          
          // Clear checkout state only (keep cart until payment success)
          localStorage.removeItem('checkoutState');
          
          console.log('🔄 Redirecting to:', chargeResponse.data.data.paymentUrl);
          
          // Redirect to Tap payment page
          window.location.href = chargeResponse.data.data.paymentUrl;
          return;
        } else {
          console.error('❌ No payment URL in response:', chargeResponse.data);
          toast.error('لم يتم الحصول على رابط الدفع');
          setLoading(false);
          return;
        }
      }

      // If payment method is Tamara, create order with pending payment status
      if (selectedPayment === 'tamara') {
        // Create order first with pending payment
        const response = await api.post('/orders', orderData);
        const orderId = response.data.order._id;
        const total = response.data.order.total;

        console.log('📦 Order created for Tamara:', orderId, 'Amount:', total);

        // Create Tamara checkout
        const checkoutData = {
          orderId: orderId,
          paymentType: 'PAY_BY_INSTALMENTS', // Default, can be changed in component
          instalments: 3 // Default, can be changed in component
        };
        
        console.log('🛒 Sending Tamara checkout request:', checkoutData);
        
        const checkoutResponse = await api.post('/payments/tamara/checkout', checkoutData);

        console.log('✅ Tamara checkout response:', checkoutResponse.data);

        if (checkoutResponse.data.success && checkoutResponse.data.data?.checkoutUrl) {
          // Save order ID and cart to localStorage for later verification
          localStorage.setItem('pendingOrderId', orderId);
          localStorage.setItem('pendingCart', JSON.stringify(items));
          
          // Clear checkout state only (keep cart until payment success)
          localStorage.removeItem('checkoutState');
          
          console.log('🔄 Redirecting to Tamara:', checkoutResponse.data.data.checkoutUrl);
          
          // Redirect to Tamara checkout page
          window.location.href = checkoutResponse.data.data.checkoutUrl;
          return;
        } else {
          console.error('❌ No checkout URL in Tamara response:', checkoutResponse.data);
          toast.error('لم يتم الحصول على رابط الدفع من تمارا');
          setLoading(false);
          return;
        }
      }
      
      // For COD or other payment methods
      const response = await api.post('/orders', orderData);
      const orderId = response.data.order._id;
      
      localStorage.removeItem('checkoutState');
      toast.success('تم إنشاء الطلب بنجاح!');
      clearCart();
      navigate(`/order-success/${orderId}`);
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">إتمام الطلب</h1>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      currentStep >= step.number
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }`}
                  >
                    {currentStep > step.number ? <FaCheck /> : step.number}
                  </div>
                  <span className="text-sm mt-2 text-center">{step.title}</span>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`h-1 flex-1 mx-2 ${
                      currentStep > step.number ? 'bg-primary-600' : 'bg-gray-300'
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
            <div className="bg-white rounded-lg shadow-lg p-6">
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
                  <h3 className="text-lg font-semibold mb-4">مراجعة الطلب</h3>

                  {/* Address */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">عنوان التوصيل</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedAddress.fullName}</p>
                      <p className="text-sm text-gray-600">{selectedAddress.phone}</p>
                      <p className="text-sm text-gray-600">
                        {selectedAddress.city} - {selectedAddress.district}
                      </p>
                      <p className="text-sm text-gray-600">
                        {selectedAddress.street} - {selectedAddress.building}
                      </p>
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">الشحن</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">{selectedShipping.providerName}</p>
                      <p className="text-sm text-gray-600">
                        التوصيل خلال {selectedShipping.estimatedDays} أيام
                      </p>
                      <p className="text-sm text-gray-600">
                        التكلفة: {selectedShipping.cost} ر.س
                      </p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2">طريقة الدفع</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="font-medium">
                        {selectedPayment === 'cod' ? 'الدفع عند الاستلام' : selectedPayment}
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
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300"
                  >
                    السابق
                  </button>
                )}
                
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700"
                  >
                    التالي
                  </button>
                ) : (
                  <button
                    onClick={handlePlaceOrder}
                    disabled={loading}
                    className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
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
              <OrderSummary shippingCost={selectedShipping?.cost || 0} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Checkout;
