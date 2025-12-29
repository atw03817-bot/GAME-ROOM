import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import useCartStore from '../store/useCartStore';
import api from '../utils/api';
import useScrollToTop from '../hooks/useScrollToTop';

function Cart() {
  const { t } = useTranslation();
  const { items, removeItem, updateQuantity, getTotal } = useCartStore();

  // التمرير إلى أعلى الصفحة عند تحميل السلة
  useScrollToTop();
  const [settings, setSettings] = useState({
    freeShippingEnabled: false,
    freeShippingThreshold: 0
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/settings');
      if (response.data) {
        setSettings({
          freeShippingEnabled: response.data.freeShippingEnabled || false,
          freeShippingThreshold: response.data.freeShippingThreshold || 0
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const subtotal = getTotal();
  const isFreeShippingEligible = settings.freeShippingEnabled && subtotal >= settings.freeShippingThreshold;

  if (items.length === 0) {
    return (
      <div className="bg-[#111111] min-h-screen flex items-center justify-center text-center" style={{ padding: 'var(--space-4)' }}>
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
          <div style={{ 
            width: '80px', 
            height: '80px', 
            margin: '0 auto var(--space-4)' 
          }} className="bg-[#1a1a1a] rounded-full flex items-center justify-center">
            <span style={{ fontSize: '3rem' }}>🛒</span>
          </div>
          <h1 style={{ 
            fontSize: 'var(--text-3xl)', 
            fontWeight: 'var(--font-bold)', 
            marginBottom: 'var(--space-2)' 
          }} className="text-white">السلة فارغة</h1>
          <p style={{ 
            fontSize: 'var(--text-base)', 
            marginBottom: 'var(--space-6)' 
          }} className="text-gray-300">لم تقم بإضافة أي منتجات بعد</p>
          <Link to="/products" className="btn btn-lg btn-primary" style={{ gap: 'var(--space-2)' }}>
            <FiShoppingBag size={18} />
            تصفح المنتجات
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#111111] min-h-screen pb-24" dir="rtl">
      <div className="container mx-auto px-4 py-4 max-w-2xl">
        {/* Cart Items */}
        <div className="space-y-4 mb-4">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-[#1a1a1a] border border-[#C72C15] rounded-2xl shadow-sm p-4"
            >
              <div className="flex gap-3 items-center">
                {/* Right Section - Image (البداية في RTL) */}
                <div className="w-16 h-16 bg-[#2a2a2a] rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img 
                    src={item.images?.[0] || '/placeholder.png'} 
                    alt={item.nameAr || item.name?.ar || item.name}
                    className="w-full h-full object-contain"
                  />
                </div>

                {/* Center Section - Product Info */}
                <div className="flex-1 text-right">
                  <h3 className="text-sm font-bold text-white mb-0.5 leading-tight">
                    {item.nameAr || item.name?.ar || item.name}
                  </h3>
                  {(item.selectedColor || item.selectedStorage) && (
                    <p className="text-xs text-gray-400 mb-1">
                      {item.selectedColor && `اللون: ${item.selectedColor}`}
                      {item.selectedColor && item.selectedStorage && ' • '}
                      {item.selectedStorage && `السعة: ${item.selectedStorage}`}
                    </p>
                  )}
                  
                  {/* Custom Options Display */}
                  {item.selectedOptions && Object.keys(item.selectedOptions).some(key => key.startsWith('custom_')) && (
                    <div className="text-xs text-gray-400 mb-1">
                      {Object.entries(item.selectedOptions)
                        .filter(([key]) => key.startsWith('custom_'))
                        .map(([key, option]) => (
                          <div key={key} className="mb-0.5">
                            <span className="font-medium">{option.nameAr}:</span>{' '}
                            <span>{option.displayValue}</span>
                            {option.price > 0 && (
                              <span className="text-[#E08713]"> (+{option.price.toFixed(2)} ر.س)</span>
                            )}
                          </div>
                        ))
                      }
                    </div>
                  )}
                  
                  <p className="text-lg font-bold text-[#E08713]">
                    {(item.price || 0).toLocaleString('en-US')} ر.س
                  </p>
                </div>

                {/* Left Section - Delete & Quantity (النهاية في RTL) */}
                <div className="flex flex-col justify-between items-end gap-2">
                  {/* Delete Button */}
                  <button
                    onClick={() => removeItem(item._id)}
                    className="text-red-400 hover:bg-red-900/20 p-1 rounded-lg transition-colors"
                    title="حذف"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  {/* Quantity Controls */}
                  <div className="flex items-center bg-[#2a2a2a] rounded-full p-0.5">
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-[#3a3a3a] rounded-full transition-colors text-gray-300 font-bold text-base"
                    >
                      −
                    </button>
                    <span className="px-2 font-bold text-sm text-white min-w-[20px] text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                      className="w-7 h-7 flex items-center justify-center hover:bg-[#3a3a3a] rounded-full transition-colors text-gray-300 font-bold text-base"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div className="bg-[#1a1a1a] border border-[#C72C15] rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-white mb-4 text-center">ملخص الطلب</h2>
          
          {/* Free Shipping Status */}
          {settings.freeShippingEnabled && !isFreeShippingEligible && (
            <div className="bg-[#E08713]/20 border border-[#E08713]/30 rounded-xl p-3 mb-4">
              <p className="text-sm font-bold text-[#E08713] mb-1">💡 اقترب من الشحن المجاني!</p>
              <p className="text-xs text-gray-300 mb-2">
                أضف {(settings.freeShippingThreshold - subtotal).toFixed(2)} ر.س للحصول على شحن مجاني
              </p>
              <div className="bg-[#2a2a2a] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#E08713] to-[#C72C15] h-full transition-all duration-300"
                  style={{ width: `${Math.min((subtotal / settings.freeShippingThreshold) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}

          {settings.freeShippingEnabled && isFreeShippingEligible && (
            <div className="bg-green-900/20 border border-green-600/30 rounded-xl p-3 mb-4">
              <p className="text-sm font-bold text-green-400 flex items-center gap-2">
                <span>🎉</span>
                <span>مؤهل للشحن المجاني!</span>
              </p>
              <p className="text-xs text-green-300 mt-1">
                طلبك تجاوز {settings.freeShippingThreshold.toFixed(2)} ر.س
              </p>
            </div>
          )}

          {/* Price Details */}
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-300">المجموع الفرعي</span>
              <span className="font-bold text-white">{subtotal.toFixed(2)} ر.س</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-gray-300">الشحن</span>
              {isFreeShippingEligible ? (
                <span className="text-sm text-green-400 font-semibold">مجاني</span>
              ) : (
                <span className="text-sm text-gray-400">حسب المدينة</span>
              )}
            </div>
            
            <div className="border-t border-[#C72C15]/30 pt-3 flex justify-between items-center">
              <span className="text-lg font-bold text-white">المجموع</span>
              <span className="text-2xl font-bold text-[#E08713]">{subtotal.toFixed(2)} ر.س</span>
            </div>
          </div>

          {/* Checkout Button */}
          <Link 
            to="/checkout" 
            className="block w-full bg-gradient-to-r from-[#E08713] to-[#C72C15] hover:from-[#C72C15] hover:to-[#991b1b] text-white text-center py-4 rounded-2xl font-bold text-lg transition-colors shadow-lg mb-3"
          >
            إتمام الطلب
          </Link>

          {/* Continue Shopping Button */}
          <Link 
            to="/products" 
            className="block w-full bg-[#111111] border-2 border-[#C72C15] hover:border-[#E08713] text-white text-center py-4 rounded-2xl font-bold transition-colors"
          >
            متابعة التسوق
          </Link>

          {/* Features */}
          <div className="mt-5 pt-5 border-t border-[#C72C15]/30 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-green-400">✓</span>
              <span>دفع آمن ومشفر</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-green-400">✓</span>
              <span>إرجاع مجاني خلال 14 يوم</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <span className="text-green-400">✓</span>
              <span>ضمان شامل لمدة سنتين</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Cart;
