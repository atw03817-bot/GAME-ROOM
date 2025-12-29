import { useState, useEffect } from 'react';
import { FaTruck, FaCheck } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function ShippingSelector({ city, onSelectShipping, selectedShippingId }) {
  const [providers, setProviders] = useState([]);
  const [rates, setRates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (city) {
      fetchShippingRates();
    }
  }, [city]);

  const fetchShippingRates = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/shipping/rates/${city}`);
      setRates(response.data.data || []);
      
      // Auto-select first option
      if (response.data.data?.length > 0 && onSelectShipping) {
        const firstRate = response.data.data[0];
        onSelectShipping({
          providerId: firstRate.providerId._id,
          providerName: firstRate.providerId.displayName,
          cost: firstRate.price,
          estimatedDays: firstRate.estimatedDays
        });
      }
    } catch (error) {
      console.error('Error fetching shipping rates:', error);
      toast.error('خطأ في جلب أسعار الشحن');
    } finally {
      setLoading(false);
    }
  };

  if (!city) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FaTruck className="mx-auto text-4xl mb-2" />
        <p>الرجاء اختيار العنوان أولاً</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-center py-8 text-gray-300">جاري التحميل...</div>;
  }

  if (rates.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <FaTruck className="mx-auto text-4xl mb-2" />
        <p>عذراً، لا يوجد شحن متاح لمدينة {city}</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-white">اختر شركة الشحن</h3>

      <div className="space-y-3">
        {rates.map((rate) => (
          <div
            key={rate._id}
            onClick={() => onSelectShipping({
              providerId: rate.providerId._id,
              providerName: rate.providerId.displayName,
              cost: rate.price,
              estimatedDays: rate.estimatedDays
            })}
            className={`border-2 rounded-lg p-4 cursor-pointer transition ${
              selectedShippingId === rate.providerId._id
                ? 'border-[#E08713] bg-[#E08713]/10'
                : 'border-[#C72C15]/30 hover:border-[#C72C15]'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  selectedShippingId === rate.providerId._id
                    ? 'border-[#E08713] bg-[#E08713]'
                    : 'border-gray-400'
                }`}>
                  {selectedShippingId === rate.providerId._id && (
                    <FaCheck className="text-white text-xs" />
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-white">{rate.providerId.displayName}</h4>
                  <p className="text-sm text-gray-300">
                    التوصيل خلال {rate.estimatedDays} {rate.estimatedDays === 1 ? 'يوم' : 'أيام'}
                  </p>
                </div>
              </div>

              <div className="text-left">
                <p className="text-xl font-bold text-[#E08713]">{rate.price} ر.س</p>
              </div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

export default ShippingSelector;
