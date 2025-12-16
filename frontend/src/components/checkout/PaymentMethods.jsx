import { useState, useEffect } from 'react';
import { FaMoneyBillWave, FaCreditCard, FaCheck } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function PaymentMethods({ onSelectPayment, selectedPaymentMethod, totalAmount = 0 }) {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tamaraConfig, setTamaraConfig] = useState({ instalments: 3, minAmount: 100, maxAmount: 10000 });


  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payments/methods');
      const methodsData = response.data.data || [];
      setMethods(methodsData);
      
      // Get Tamara config if available
      const tamaraMethod = methodsData.find(m => m.provider === 'tamara');
      if (tamaraMethod && tamaraMethod.config) {
        setTamaraConfig({
          instalments: tamaraMethod.config.defaultInstalments || 3,
          minAmount: tamaraMethod.config.minAmount || 100,
          maxAmount: tamaraMethod.config.maxAmount || 10000
        });
      }
      
      // Auto-select COD if available
      const codMethod = methodsData.find(m => m.provider === 'cod');
      if (codMethod && onSelectPayment) {
        onSelectPayment('cod');
      }
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      toast.error('خطأ في جلب طرق الدفع');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentIcon = (provider) => {
    switch (provider) {
      case 'cod':
        return <FaMoneyBillWave className="text-2xl text-green-600" />;
      case 'tap':
      case 'myfatoorah':
        return <FaCreditCard className="text-2xl text-primary-600" />;
      case 'tamara':
        return (
          <div className="w-12 h-8 flex items-center justify-center">
            <img 
              src="https://f.nooncdn.com/s/app/com/noon/design-system/payment-methods-v2/tamara-ar.svg" 
              alt="Tamara"
              className="h-6 w-auto"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            <span className="text-xs font-bold text-green-600 hidden">تمارا</span>
          </div>
        );
      case 'tabby':
        return (
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="text-xs font-bold text-orange-600">Tabby</span>
          </div>
        );
      default:
        return <FaCreditCard className="text-2xl text-gray-600" />;
    }
  };

  const getPaymentName = (provider) => {
    switch (provider) {
      case 'cod':
        return 'الدفع عند الاستلام';
      case 'tap':
        return 'Tap Payment - بطاقة ائتمان';
      case 'myfatoorah':
        return 'MyFatoorah - طرق دفع متعددة';
      case 'tamara':
        return 'تمارا - قسّط مشترياتك';
      case 'tabby':
        return 'Tabby - اشتري الآن وادفع لاحقاً';
      default:
        return provider;
    }
  };

  const getPaymentDescription = (provider) => {
    switch (provider) {
      case 'cod':
        return 'ادفع نقداً عند استلام الطلب';
      case 'tap':
        return 'ادفع بأمان باستخدام بطاقتك الائتمانية';
      case 'myfatoorah':
        return 'ادفع عبر بطاقة ائتمان، مدى، أو محفظة إلكترونية';
      case 'tamara':
        // Calculate installment for Tamara with highlighted price using admin settings
        if (totalAmount >= tamaraConfig.minAmount && totalAmount <= tamaraConfig.maxAmount) {
          const installmentAmount = Math.ceil(totalAmount / tamaraConfig.instalments);
          return (
            <div>
              <div>
                {tamaraConfig.instalments} أقساط بقيمة <span className="font-bold text-primary-600">{installmentAmount} ر.س</span> كل شهر
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(
                    'https://cdn.tamara.co/widget-v2/tamara-widget.html?lang=ar&public_key=&country=SA&amount=350&inline_type=',
                    'tamaraInfo',
                    'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
                  );
                }}
                className="text-green-600 hover:text-green-700 underline text-xs mt-1 inline-block"
              >
                اعرف المزيد
              </button>
            </div>
          );
        }
        return 'قسّط مشترياتك بدون فوائد';
      case 'tabby':
        return 'اشتري الآن وادفع على 4 دفعات بدون فوائد';
      default:
        return '';
    }
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  if (methods.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>لا توجد طرق دفع متاحة حالياً</p>
      </div>
    );
  }

  return (
    <>
      <div>
        <h3 className="text-lg font-semibold mb-4">اختر طريقة الدفع</h3>

        <div className="space-y-3">
          {methods.map((method) => (
            <div
              key={method.provider}
              onClick={() => onSelectPayment(method.provider)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                selectedPaymentMethod === method.provider
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedPaymentMethod === method.provider
                    ? 'border-primary-600 bg-primary-600'
                    : 'border-gray-300'
                }`}>
                  {selectedPaymentMethod === method.provider && (
                    <FaCheck className="text-white text-xs" />
                  )}
                </div>

                <div className="flex-shrink-0">
                  {getPaymentIcon(method.provider)}
                </div>

                <div className="flex-1">
                  <h4 className="font-semibold">{getPaymentName(method.provider)}</h4>
                  <div className="text-sm text-gray-600">{getPaymentDescription(method.provider)}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Security Note */}
        <div className="mt-4 p-4 bg-green-50 rounded-lg">
          <p className="text-sm text-green-800">
            🔒 جميع المعاملات آمنة ومشفرة
          </p>
        </div>
      </div>


    </>
  );
}

export default PaymentMethods;
