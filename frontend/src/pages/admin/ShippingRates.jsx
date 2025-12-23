import { useState, useEffect } from 'react';
import { FaTruck, FaEdit, FaPlus, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function ShippingRates() {
  const [rates, setRates] = useState([]);
  const [providers, setProviders] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingRate, setEditingRate] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRate, setNewRate] = useState({
    providerId: '',
    city: '',
    price: '',
    estimatedDays: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // جلب جميع الأسعار
      const ratesResponse = await api.get('/shipping/rates/all');
      setRates(ratesResponse.data.data || []);
      
      // جلب شركات الشحن
      const providersResponse = await api.get('/shipping/providers/all');
      setProviders(providersResponse.data.data || []);
      
      // جلب المدن
      const citiesResponse = await api.get('/shipping/cities');
      setCities(citiesResponse.data.data || []);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('خطأ في جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRate = (rate) => {
    setEditingRate({
      ...rate,
      price: rate.price.toString(),
      estimatedDays: rate.estimatedDays.toString()
    });
  };

  const handleSaveEdit = async () => {
    try {
      const response = await api.put(`/shipping/rates/${editingRate._id}`, {
        price: parseFloat(editingRate.price),
        estimatedDays: parseInt(editingRate.estimatedDays)
      });
      
      if (response.data.success) {
        setRates(prev => prev.map(rate => 
          rate._id === editingRate._id 
            ? { ...rate, price: parseFloat(editingRate.price), estimatedDays: parseInt(editingRate.estimatedDays) }
            : rate
        ));
        setEditingRate(null);
        toast.success('تم تحديث السعر بنجاح');
      }
    } catch (error) {
      console.error('Error updating rate:', error);
      toast.error('خطأ في تحديث السعر');
    }
  };

  const handleAddRate = async () => {
    try {
      if (!newRate.providerId || !newRate.city || !newRate.price || !newRate.estimatedDays) {
        toast.error('جميع الحقول مطلوبة');
        return;
      }

      const response = await api.post('/shipping/rates', {
        providerId: newRate.providerId,
        city: newRate.city,
        price: parseFloat(newRate.price),
        estimatedDays: parseInt(newRate.estimatedDays)
      });
      
      if (response.data.success) {
        await fetchData(); // إعادة جلب البيانات
        setNewRate({ providerId: '', city: '', price: '', estimatedDays: '' });
        setShowAddForm(false);
        toast.success('تم إضافة السعر بنجاح');
      }
    } catch (error) {
      console.error('Error adding rate:', error);
      toast.error(error.response?.data?.message || 'خطأ في إضافة السعر');
    }
  };

  const handleDeleteRate = async (rateId) => {
    if (!confirm('هل أنت متأكد من حذف هذا السعر؟')) return;
    
    try {
      const response = await api.delete(`/shipping/rates/${rateId}`);
      
      if (response.data.success) {
        setRates(prev => prev.filter(rate => rate._id !== rateId));
        toast.success('تم حذف السعر بنجاح');
      }
    } catch (error) {
      console.error('Error deleting rate:', error);
      toast.error('خطأ في حذف السعر');
    }
  };

  const getProviderName = (providerId) => {
    const provider = providers.find(p => p._id === providerId);
    return provider?.displayName || 'غير محدد';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل أسعار الشحن...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FaTruck className="text-2xl text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold">أسعار الشحن</h1>
              <p className="text-gray-600">إدارة أسعار الشحن لجميع المدن وشركات الشحن</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
          >
            <FaPlus />
            إضافة سعر جديد
          </button>
        </div>
      </div>

      {/* Add New Rate Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-lg font-semibold mb-4">إضافة سعر شحن جديد</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                شركة الشحن
              </label>
              <select
                value={newRate.providerId}
                onChange={(e) => setNewRate(prev => ({ ...prev, providerId: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">اختر شركة الشحن</option>
                {providers.filter(p => p.enabled).map(provider => (
                  <option key={provider._id} value={provider._id}>
                    {provider.displayName}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                المدينة
              </label>
              <input
                type="text"
                value={newRate.city}
                onChange={(e) => setNewRate(prev => ({ ...prev, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="اسم المدينة"
                list="cities-list"
              />
              <datalist id="cities-list">
                {cities.map(city => (
                  <option key={city} value={city} />
                ))}
              </datalist>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                السعر (ر.س)
              </label>
              <input
                type="number"
                value={newRate.price}
                onChange={(e) => setNewRate(prev => ({ ...prev, price: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="0"
                min="0"
                step="0.01"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                أيام التوصيل
              </label>
              <input
                type="number"
                value={newRate.estimatedDays}
                onChange={(e) => setNewRate(prev => ({ ...prev, estimatedDays: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="1"
                min="1"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleAddRate}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <FaSave />
              حفظ
            </button>
            <button
              onClick={() => {
                setShowAddForm(false);
                setNewRate({ providerId: '', city: '', price: '', estimatedDays: '' });
              }}
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              <FaTimes />
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Rates Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  شركة الشحن
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  المدينة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  السعر (ر.س)
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  أيام التوصيل
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rates.map((rate) => (
                <tr key={rate._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {getProviderName(rate.providerId)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{rate.city}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingRate && editingRate._id === rate._id ? (
                      <input
                        type="number"
                        value={editingRate.price}
                        onChange={(e) => setEditingRate(prev => ({ ...prev, price: e.target.value }))}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="0"
                        step="0.01"
                      />
                    ) : (
                      <div className="text-sm font-semibold text-green-600">
                        {rate.price} ر.س
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingRate && editingRate._id === rate._id ? (
                      <input
                        type="number"
                        value={editingRate.estimatedDays}
                        onChange={(e) => setEditingRate(prev => ({ ...prev, estimatedDays: e.target.value }))}
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-sm"
                        min="1"
                      />
                    ) : (
                      <div className="text-sm text-gray-900">
                        {rate.estimatedDays} {rate.estimatedDays === 1 ? 'يوم' : 'أيام'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {editingRate && editingRate._id === rate._id ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-900"
                        >
                          <FaSave />
                        </button>
                        <button
                          onClick={() => setEditingRate(null)}
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <FaTimes />
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditRate(rate)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteRate(rate._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {rates.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <FaTruck className="mx-auto text-4xl mb-2" />
              <p>لا توجد أسعار شحن محددة</p>
              <p className="text-sm">ابدأ بإضافة أسعار الشحن للمدن المختلفة</p>
            </div>
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FaTruck className="text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">إجمالي الأسعار</p>
              <p className="text-2xl font-bold text-gray-900">{rates.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FaTruck className="text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">عدد المدن</p>
              <p className="text-2xl font-bold text-gray-900">{cities.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <FaTruck className="text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">شركات الشحن النشطة</p>
              <p className="text-2xl font-bold text-gray-900">
                {providers.filter(p => p.enabled).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ShippingRates;