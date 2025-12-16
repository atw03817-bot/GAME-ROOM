import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/tamara.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TamaraPayment({ 
  amount, 
  orderId, 
  onPaymentStart, 
  onPaymentSuccess, 
  onPaymentError,
  disabled = false 
}) {
  const [loading, setLoading] = useState(false);
  const [installmentOptions, setInstallmentOptions] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [eligible, setEligible] = useState(false);

  useEffect(() => {
    if (amount) {
      fetchInstallmentOptions();
    }
  }, [amount]);

  const fetchInstallmentOptions = async () => {
    try {
      const response = await axios.get(`${API_URL}/payments/tamara/installments/${amount}`);
      
      if (response.data.success) {
        setEligible(response.data.data.eligible);
        setInstallmentOptions(response.data.data.options);
        
        // Select first option by default
        if (response.data.data.options.length > 0) {
          setSelectedOption(response.data.data.options[0]);
        }
      }
    } catch (error) {
      console.error('Error fetching installment options:', error);
      setEligible(false);
      setInstallmentOptions([]);
    }
  };

  const handlePayment = async () => {
    if (!selectedOption || !orderId) {
      onPaymentError?.('يرجى اختيار خيار الدفع');
      return;
    }

    setLoading(true);
    onPaymentStart?.();

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.post(
        `${API_URL}/payments/tamara/checkout`,
        {
          orderId: orderId,
          paymentType: selectedOption.instalments === 1 ? 'PAY_BY_LATER' : 'PAY_BY_INSTALMENTS',
          instalments: selectedOption.instalments
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        // Redirect to Tamara checkout
        window.location.href = response.data.data.checkoutUrl;
        onPaymentSuccess?.(response.data.data);
      } else {
        onPaymentError?.(response.data.message || 'فشل في إنشاء جلسة الدفع');
      }
    } catch (error) {
      console.error('Error creating Tamara checkout:', error);
      onPaymentError?.(
        error.response?.data?.message || 'خطأ في الاتصال بخدمة الدفع'
      );
    } finally {
      setLoading(false);
    }
  };

  if (!eligible) {
    return (
      <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-20 h-8 flex items-center justify-center">
            <img 
              src="https://f.nooncdn.com/s/app/com/noon/design-system/payment-methods-v2/tamara-ar.svg" 
              alt="Tamara"
              className="h-6 w-auto opacity-50 grayscale"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-12 h-8 bg-gray-300 rounded items-center justify-center hidden">
              <span className="text-xs font-bold text-gray-600">تمارا</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">تمارا غير متاح</p>
            <p className="text-xs text-gray-500">
              المبلغ يجب أن يكون بين 100 و 10,000 ريال
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Tamara Header */}
      <div className="tamara-container flex items-center gap-3 p-4 rounded-lg">
        <div className="w-20 h-8 flex items-center justify-center">
          <img 
            src="https://f.nooncdn.com/s/app/com/noon/design-system/payment-methods-v2/tamara-ar.svg" 
            alt="Tamara"
            className="tamara-logo h-6 w-auto"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <div className="w-12 h-8 bg-green-600 rounded items-center justify-center hidden">
            <span className="text-xs font-bold text-white">تمارا</span>
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-green-800">
            اشتري الآن وادفع لاحقاً
          </h3>
          <p className="text-xs text-green-600">
            بدون فوائد أو رسوم إضافية
          </p>
        </div>
      </div>

      {/* Installment Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-gray-900">اختر طريقة الدفع:</h4>
        
        {installmentOptions.map((option, index) => (
          <label
            key={index}
            className={`tamara-installment-option flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
              selectedOption === option
                ? 'tamara-installment-selected'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="tamara-option"
                checked={selectedOption === option}
                onChange={() => setSelectedOption(option)}
                className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {option.description}
                </p>
                {option.instalments > 1 && (
                  <p className="text-xs text-gray-500">
                    {option.instalments} أقساط شهرية بدون فوائد
                  </p>
                )}
              </div>
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-900">
                {option.installmentAmount} ريال
              </p>
              {option.instalments > 1 && (
                <p className="text-xs text-gray-500">لكل قسط</p>
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={disabled || loading || !selectedOption}
        className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            جاري التحويل لتمارا...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            ادفع عبر تمارا
          </>
        )}
      </button>

      {/* Info */}
      <div className="tamara-info-box p-3 rounded-lg">
        <div className="flex items-start gap-2">
          <svg className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          <div className="text-xs text-blue-800">
            <p className="font-medium mb-1">كيف يعمل تمارا؟</p>
            <ul className="space-y-1">
              <li>• اشتري الآن وادفع على أقساط بدون فوائد</li>
              <li>• موافقة فورية في ثوانٍ</li>
              <li>• لا توجد رسوم إضافية أو فوائد</li>
              <li>• آمن ومضمون 100%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}