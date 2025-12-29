import { useState, useEffect } from 'react';
import useCartStore from '../../store/useCartStore';
import api from '../../utils/api';

function OrderSummary({ shippingCost = 0, taxRate = 0.15, selectedPayment = 'cod' }) {
  const { items, getTotal } = useCartStore();
  const [settings, setSettings] = useState({
    freeShippingEnabled: false,
    freeShippingThreshold: 0
  });
  const [tamaraCommission, setTamaraCommission] = useState({
    amount: 0,
    rate: 0,
    displayName: 'عمولة الأقساط - تمارا'
  });
  
  const [tabbyCommission, setTabbyCommission] = useState({
    amount: 0,
    rate: 0,
    displayName: 'عمولة التقسيط - تابي'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    console.log('🔍 Payment method changed:', selectedPayment);
    
    // حساب عمولة تمارا عند تغيير طريقة الدفع أو المجموع
    if (selectedPayment === 'tamara') {
      console.log('💰 Calculating Tamara commission...');
      calculateTamaraCommission();
      // إعادة تعيين عمولة تابي
      setTabbyCommission({
        amount: 0,
        rate: 0,
        displayName: 'عمولة التقسيط - تابي'
      });
    } else if (selectedPayment === 'tabby') {
      console.log('💰 Calculating Tabby commission...');
      calculateTabbyCommission();
      // إعادة تعيين عمولة تمارا
      setTamaraCommission({
        amount: 0,
        rate: 0,
        displayName: 'عمولة الأقساط - تمارا'
      });
    } else {
      console.log('💰 No commission for payment method:', selectedPayment);
      // إعادة تعيين كلا العمولتين
      setTamaraCommission({
        amount: 0,
        rate: 0,
        displayName: 'عمولة الأقساط - تمارا'
      });
      setTabbyCommission({
        amount: 0,
        rate: 0,
        displayName: 'عمولة التقسيط - تابي'
      });
    }
  }, [selectedPayment, items]);

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

  const calculateTamaraCommission = async () => {
    try {
      const subtotal = getTotal();
      console.log('💰 Calculating Tamara commission for subtotal:', subtotal);
      
      const response = await api.post('/tamara-settings/calculate-commission', {
        subtotal
      });
      
      if (response.data.success) {
        console.log('✅ Tamara commission calculated:', response.data.data.commission);
        setTamaraCommission(response.data.data.commission);
      }
    } catch (error) {
      console.error('Error calculating Tamara commission:', error);
      setTamaraCommission({
        amount: 0,
        rate: 0,
        displayName: 'عمولة الأقساط - تمارا'
      });
    }
  };

  const calculateTabbyCommission = async () => {
    try {
      const subtotal = getTotal();
      console.log('💰 Calculating Tabby commission for subtotal:', subtotal);
      
      // استخدام نفس endpoint تمارا لحساب عمولة تابي
      const response = await api.post('/tamara-settings/calculate-commission', {
        subtotal
      });
      
      if (response.data.success) {
        const commission = response.data.data.commission;
        console.log('✅ Tabby commission calculated:', commission);
        setTabbyCommission({
          amount: commission.amount,
          rate: commission.rate,
          displayName: 'عمولة التقسيط - تابي'
        });
      }
    } catch (error) {
      console.error('Error calculating Tabby commission:', error);
      setTabbyCommission({
        amount: 0,
        rate: 0,
        displayName: 'عمولة التقسيط - تابي'
      });
    }
  };

  const subtotal = getTotal();
  
  // Check if free shipping applies
  const isFreeShipping = settings.freeShippingEnabled && 
                         shippingCost > 0 && 
                         subtotal >= settings.freeShippingThreshold;
  
  const actualShipping = isFreeShipping ? 0 : shippingCost;
  
  // Add Tamara/Tabby commission to calculation
  const totalCommission = tamaraCommission.amount + tabbyCommission.amount;
  const subtotalWithCommission = subtotal + totalCommission;
  
  console.log('💰 Order calculation:', {
    subtotal,
    tamaraCommission: tamaraCommission.amount,
    tabbyCommission: tabbyCommission.amount,
    totalCommission,
    subtotalWithCommission,
    selectedPayment
  });
  
  // Calculate tax on subtotal + commission + shipping
  const tax = (subtotalWithCommission + actualShipping) * taxRate;
  const finalTotal = subtotalWithCommission + actualShipping + tax;

  return (
    <div className="bg-[#1a1a1a] border border-[#C72C15] rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-white">ملخص الطلب</h3>

      {/* Items */}
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="font-medium text-white">{item.nameAr}</p>
              <p className="text-gray-300 text-xs">
                الكمية: {item.quantity}
                {item.selectedColor && ` • ${item.selectedColor}`}
                {item.selectedStorage && ` • ${item.selectedStorage}`}
              </p>
            </div>
            <p className="font-semibold text-[#E08713]">{(item.price * item.quantity).toFixed(2)} ر.س</p>
          </div>
        ))}
      </div>

      <div className="border-t border-[#C72C15]/30 pt-4 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">المجموع الفرعي</span>
          <span className="font-semibold text-white">{subtotal.toFixed(2)} ر.س</span>
        </div>

        {/* Tamara Commission */}
        {selectedPayment === 'tamara' && tamaraCommission.amount > 0 && (
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-300">{tamaraCommission.displayName}</span>
            </div>
            <span className="font-semibold text-[#E08713]">{tamaraCommission.amount.toFixed(2)} ر.س</span>
          </div>
        )}

        {/* Tabby Commission */}
        {selectedPayment === 'tabby' && tabbyCommission.amount > 0 && (
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-300">{tabbyCommission.displayName}</span>
            </div>
            <span className="font-semibold text-[#E08713]">{tabbyCommission.amount.toFixed(2)} ر.س</span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">الشحن</span>
          {shippingCost === 0 ? (
            <span className="text-gray-400 text-xs">يحدد لاحقاً</span>
          ) : isFreeShipping ? (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-green-400">مجاني 🎉</span>
              <span className="text-xs text-gray-400 line-through">{shippingCost.toFixed(2)} ر.س</span>
            </div>
          ) : (
            <span className="font-semibold text-white">{actualShipping.toFixed(2)} ر.س</span>
          )}
        </div>

        {/* Free Shipping Success Message */}
        {isFreeShipping && (
          <div className="text-xs bg-green-900/20 border border-green-600/30 text-green-300 p-3 rounded-lg flex items-start gap-2">
            <span className="text-base">🎉</span>
            <div>
              <p className="font-semibold mb-1">تهانينا! حصلت على شحن مجاني</p>
              <p className="text-green-400">
                طلبك تجاوز {settings.freeShippingThreshold.toFixed(2)} ر.س وحصلت على شحن مجاني بقيمة {shippingCost.toFixed(2)} ر.س
              </p>
            </div>
          </div>
        )}

        {/* Free Shipping Progress */}
        {settings.freeShippingEnabled && shippingCost > 0 && !isFreeShipping && subtotal < settings.freeShippingThreshold && (
          <div className="text-xs bg-[#E08713]/20 border border-[#E08713]/30 text-[#E08713] p-3 rounded-lg">
            <p className="font-semibold mb-1">💡 اقترب من الشحن المجاني!</p>
            <p>أضف {(settings.freeShippingThreshold - subtotal).toFixed(2)} ر.س للحصول على شحن مجاني</p>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-300">الضريبة ({(taxRate * 100).toFixed(0)}%)</span>
          <span className="font-semibold text-white">{tax.toFixed(2)} ر.س</span>
        </div>

        {/* Total */}
        <div className="border-t border-[#C72C15]/30 pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-lg font-bold text-white">المجموع الكلي</span>
            <span className="text-xl font-bold text-[#E08713]">{finalTotal.toFixed(2)} ر.س</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t border-[#C72C15]/30 text-xs text-gray-300 space-y-1">
        <p>✓ الضريبة تُضاف عند الدفع (15%)</p>
        <p>✓ إمكانية الإرجاع خلال 14 يوم</p>
        <p>✓ ضمان على جميع المنتجات</p>
      </div>
    </div>
  );
}

export default OrderSummary;
