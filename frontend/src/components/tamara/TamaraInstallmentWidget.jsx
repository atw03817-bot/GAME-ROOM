import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../../styles/tamara.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TamaraInstallmentWidget({ 
  price, 
  showLogo = true, 
  size = 'medium', // small, medium, large
  style = 'card' // card, inline, minimal
}) {
  const [installmentAmount, setInstallmentAmount] = useState(null);
  const [instalments, setInstalments] = useState(3);
  const [eligible, setEligible] = useState(false);
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    if (price && price > 0) {
      fetchTamaraSettings();
    }
  }, [price]);

  const fetchTamaraSettings = async () => {
    try {
      setLoading(true);
      
      // Check if Tamara is enabled and get settings
      const settingsResponse = await axios.get(`${API_URL}/payments/methods`);
      const tamaraMethod = settingsResponse.data.data?.find(method => method.provider === 'tamara');
      
      if (!tamaraMethod) {
        setEligible(false);
        setLoading(false);
        return;
      }

      // Get installments from admin settings
      const adminInstalments = tamaraMethod.config?.defaultInstalments || 3;
      const minAmount = tamaraMethod.config?.minAmount || 100;
      const maxAmount = tamaraMethod.config?.maxAmount || 10000;
      
      setInstalments(adminInstalments);

      // Check eligibility based on admin settings
      if (price >= minAmount && price <= maxAmount) {
        setEligible(true);
        setInstallmentAmount(Math.ceil(price / adminInstalments));
      } else {
        setEligible(false);
      }
    } catch (error) {
      console.error('Error fetching Tamara settings:', error);
      setEligible(false);
    } finally {
      setLoading(false);
    }
  };



  if (loading) {
    return (
      <div className={`tamara-widget tamara-widget-${size} tamara-widget-${style} tamara-loading`}>
        <div className="animate-pulse flex items-center gap-2">
          <div className="w-16 h-4 bg-gray-200 rounded"></div>
          <div className="w-20 h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!eligible || !installmentAmount) {
    return null;
  }

  const formatPrice = (amount) => {
    return new Intl.NumberFormat('ar-SA', {
      style: 'currency',
      currency: 'SAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const renderMinimalStyle = () => (
    <div className={`tamara-widget tamara-widget-${size} tamara-widget-minimal`}>
      <div className="flex items-center gap-2 text-sm">
        {showLogo && (
          <img 
            src="https://f.nooncdn.com/s/app/com/noon/design-system/payment-methods-v2/tamara-ar.svg" 
            alt="Tamara"
            className="h-4 w-auto"
          />
        )}
        <span className="text-gray-600">أو قسمها على</span>
        <span className="font-semibold text-green-600">
          {instalments} دفعات
        </span>
        <span className="text-gray-600">بقيمة</span>
        <span className="font-bold text-primary-600">
          {formatPrice(installmentAmount)}
        </span>
        <span className="text-xs text-gray-500">بدون فوائد</span>
      </div>
    </div>
  );

  const renderInlineStyle = () => (
    <div className={`tamara-widget tamara-widget-${size} tamara-widget-inline`}>
      <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
        {showLogo && (
          <img 
            src="https://f.nooncdn.com/s/app/com/noon/design-system/payment-methods-v2/tamara-ar.svg" 
            alt="Tamara"
            className="h-5 w-auto flex-shrink-0"
          />
        )}
        <div className="flex-1">
          <div className="text-sm font-medium text-green-800">
            قسمها على {instalments} دفعات بقيمة <span className="text-primary-600 font-bold">{formatPrice(installmentAmount)}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-green-600">
            <span>بدون فوائد أو رسوم إضافية</span>
            <button
              onClick={() => window.open(
                'https://cdn.tamara.co/widget-v2/tamara-widget.html?lang=ar&public_key=&country=SA&amount=350&inline_type=',
                'tamaraInfo',
                'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
              )}
              className="text-green-700 hover:text-green-800 underline font-medium"
            >
              اعرف المزيد
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCardStyle = () => (
    <div className={`tamara-widget tamara-widget-${size} tamara-widget-card`}>
      <div className="tamara-installment-card p-4 border border-gray-200 rounded-lg bg-white hover:border-green-300 transition-colors">
        <div className="flex items-center gap-3 mb-3">
          {showLogo && (
            <img 
              src="https://f.nooncdn.com/s/app/com/noon/design-system/payment-methods-v2/tamara-ar.svg" 
              alt="Tamara"
              className="h-6 w-auto"
            />
          )}
          <div className="flex-1">
            <div className="text-sm font-semibold text-gray-900">
              اشتري الآن وادفع لاحقاً
            </div>
            <div className="text-xs text-gray-600">
              بدون فوائد أو رسوم إضافية
            </div>
          </div>
        </div>
        
        <div className="text-center py-3">
          <div className="text-lg font-bold text-green-600">
            {instalments} أقساط بقيمة <span className="text-primary-600">{formatPrice(installmentAmount)}</span>
          </div>
          <div className="text-sm text-gray-600 mt-1">
            كل شهر بدون فوائد
          </div>
        </div>
        
        <div className="mt-3 pt-3 border-t border-gray-100">
          <button 
            onClick={() => window.open(
              'https://cdn.tamara.co/widget-v2/tamara-widget.html?lang=ar&public_key=&country=SA&amount=350&inline_type=',
              'tamaraInfo',
              'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
            )}
            className="text-xs text-green-600 hover:text-green-700 font-medium"
          >
            اعرف المزيد ←
          </button>
        </div>
      </div>
    </div>
  );

  const renderWidget = () => {
    switch (style) {
      case 'minimal':
        return renderMinimalStyle();
      case 'inline':
        return renderInlineStyle();
      case 'card':
      default:
        return renderCardStyle();
    }
  };

  return renderWidget();
}

// Hook for easy integration
export const useTamaraInstallments = (price) => {
  const [installmentData, setInstallmentData] = useState({
    eligible: false,
    options: [],
    loading: true
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!price || price <= 0) {
        setInstallmentData({ eligible: false, options: [], loading: false });
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/payments/tamara/installments/${price}`);
        
        if (response.data.success) {
          setInstallmentData({
            eligible: response.data.data.eligible,
            options: response.data.data.options,
            loading: false
          });
        }
      } catch (error) {
        console.error('Error fetching Tamara data:', error);
        setInstallmentData({ eligible: false, options: [], loading: false });
      }
    };

    fetchData();
  }, [price]);

  return installmentData;
};