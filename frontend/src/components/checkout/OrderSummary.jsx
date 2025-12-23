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

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    // حساب عمولة تمارا عند تغيير طريقة الدفع أو المجموع
    if (selectedPayment === 'tamara') {
      calculateTamaraCommission();
    } else {
      setTamaraCommission({
        amount: 0,
        rate: 0,
        displayName: 'عمولة الأقساط - تمارا'
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
      const response = await api.post('/tamara-settings/calculate-commission', {
        subtotal
      });
      
      if (response.data.success) {
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

  const subtotal = getTotal();
  
  // Check if free shipping applies
  const isFreeShipping = settings.freeShippingEnabled && 
                         shippingCost > 0 && 
                         subtotal >= settings.freeShippingThreshold;
  
  const actualShipping = isFreeShipping ? 0 : shippingCost;
  
  // Add Tamara commission to calculation
  const subtotalWithCommission = subtotal + tamaraCommission.amount;
  
  // Calculate tax on subtotal + commission + shipping
  const tax = (subtotalWithCommission + actualShipping) * taxRate;
  const finalTotal = subtotalWithCommission + actualShipping + tax;

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">ملخص الطلب</h3>

      {/* Items */}
      <div className="space-y-3 mb-4">
        {items.map((item) => (
          <div key={item._id} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="font-medium">{item.nameAr}</p>
              <p className="text-gray-600 text-xs">
                الكمية: {item.quantity}
                {item.selectedColor && ` • ${item.selectedColor}`}
                {item.selectedStorage && ` • ${item.selectedStorage}`}
              </p>
            </div>
            <p className="font-semibold">{(item.price * item.quantity).toFixed(2)} ر.س</p>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2">
        {/* Subtotal */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">المجموع الفرعي</span>
          <span className="font-semibold">{subtotal.toFixed(2)} ر.س</span>
        </div>

        {/* Tamara Commission */}
        {selectedPayment === 'tamara' && tamaraCommission.amount > 0 && (
          <div className="flex justify-between text-sm">
            <div className="flex items-center gap-1">
              <span className="text-gray-600">{tamaraCommission.displayName}</span>
              <span className="text-xs text-gray-400">({tamaraCommission.rate}%)</span>
            </div>
            <span className="font-semibold text-orange-600">{tamaraCommission.amount.toFixed(2)} ر.س</span>
          </div>
        )}

        {/* Shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">الشحن</span>
          {shippingCost === 0 ? (
            <span className="text-gray-400 text-xs">يحدد لاحقاً</span>
          ) : isFreeShipping ? (
            <div className="flex items-center gap-1">
              <span className="font-semibold text-green-600">مجاني 🎉</span>
              <span className="text-xs text-gray-400 line-through">{shippingCost.toFixed(2)} ر.س</span>
            </div>
          ) : (
            <span className="font-semibold">{actualShipping.toFixed(2)} ر.س</span>
          )}
        </div>

        {/* Free Shipping Success Message */}
        {isFreeShipping && (
          <div className="text-xs bg-green-50 border border-green-200 text-green-700 p-3 rounded-lg flex items-start gap-2">
            <span className="text-base">🎉</span>
            <div>
              <p className="font-semibold mb-1">تهانينا! حصلت على شحن مجاني</p>
              <p className="text-green-600">
                طلبك تجاوز {settings.freeShippingThreshold.toFixed(2)} ر.س وحصلت على شحن مجاني بقيمة {shippingCost.toFixed(2)} ر.س
              </p>
            </div>
          </div>
        )}

        {/* Free Shipping Progress */}
        {settings.freeShippingEnabled && shippingCost > 0 && !isFreeShipping && subtotal < settings.freeShippingThreshold && (
          <div className="text-xs bg-primary-50 border border-primary-200 text-primary-700 p-3 rounded-lg">
            <p className="font-semibold mb-1">💡 اقترب من الشحن المجاني!</p>
            <p>أضف {(settings.freeShippingThreshold - subtotal).toFixed(2)} ر.س للحصول على شحن مجاني</p>
          </div>
        )}

        {/* Tax */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">الضريبة ({(taxRate * 100).toFixed(0)}%)</span>
          <span className="font-semibold">{tax.toFixed(2)} ر.س</span>
        </div>

        {/* Total */}
        <div className="border-t pt-2 mt-2">
          <div className="flex justify-between">
            <span className="text-lg font-bold">المجموع الكلي</span>
            <span className="text-xl font-bold text-primary-600">{finalTotal.toFixed(2)} ر.س</span>
          </div>
        </div>
      </div>

      {/* Additional Info */}
      <div className="mt-4 pt-4 border-t text-xs text-gray-600 space-y-1">
        <p>✓ جميع الأسعار شاملة الضريبة</p>
        <p>✓ إمكانية الإرجاع خلال 14 يوم</p>
        <p>✓ ضمان على جميع المنتجات</p>
      </div>
    </div>
  );
}

export default OrderSummary;
