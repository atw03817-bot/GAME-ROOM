import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaCheck } from 'react-icons/fa';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { saudiCitiesSorted } from '../../data/saudiCities';

function AddressManager({ onSelectAddress, selectedAddressId }) {
  const [addresses, setAddresses] = useState([]);
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    city: '',
    district: '',
    street: '',
    building: '',
    postalCode: '',
    isDefault: false
  });

  useEffect(() => {
    fetchAddresses();
    fetchCities();
  }, []);

  const fetchAddresses = async () => {
    try {
      setLoading(true);
      const response = await api.get('/addresses');
      setAddresses(response.data.data || []);
      
      // Auto-select default address
      const defaultAddress = response.data.data?.find(addr => addr.isDefault);
      if (defaultAddress && onSelectAddress) {
        onSelectAddress(defaultAddress);
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('خطأ في جلب العناوين');
    } finally {
      setLoading(false);
    }
  };

  const fetchCities = async () => {
    try {
      // استخدام المدن من الملف المحلي
      const cityNames = saudiCitiesSorted.map(city => city.nameAr);
      setCities(cityNames);
      
      // يمكن أيضاً جلب المدن من API إذا كان متوفر
      try {
        const response = await api.get('/shipping/cities');
        if (response.data.data && response.data.data.length > 0) {
          setCities(response.data.data);
        }
      } catch (apiError) {
        // استخدام المدن المحلية في حالة فشل API
        console.log('Using local cities list');
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      // قائمة احتياطية
      setCities(['الرياض', 'جدة', 'مكة المكرمة', 'المدينة المنورة', 'الدمام']);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingAddress) {
        // Update
        await api.put(`/addresses/${editingAddress._id}`, formData);
        toast.success('تم تحديث العنوان بنجاح');
      } else {
        // Create
        await api.post('/addresses', formData);
        toast.success('تم إضافة العنوان بنجاح');
      }
      
      fetchAddresses();
      setShowForm(false);
      setEditingAddress(null);
      resetForm();
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error(error.response?.data?.message || 'خطأ في حفظ العنوان');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا العنوان؟')) return;
    
    try {
      await api.delete(`/addresses/${id}`);
      toast.success('تم حذف العنوان بنجاح');
      fetchAddresses();
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('خطأ في حذف العنوان');
    }
  };

  const handleSetDefault = async (id) => {
    try {
      await api.put(`/addresses/${id}/default`);
      toast.success('تم تعيين العنوان الافتراضي');
      fetchAddresses();
    } catch (error) {
      console.error('Error setting default:', error);
      toast.error('خطأ في تعيين العنوان الافتراضي');
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData({
      fullName: address.fullName,
      phone: address.phone,
      city: address.city,
      district: address.district,
      street: address.street,
      building: address.building,
      postalCode: address.postalCode || '',
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setFormData({
      fullName: '',
      phone: '',
      city: '',
      district: '',
      street: '',
      building: '',
      postalCode: '',
      isDefault: false
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAddress(null);
    resetForm();
  };

  if (loading) {
    return <div className="text-center py-8">جاري التحميل...</div>;
  }

  return (
    <div>
      {/* Address List */}
      {!showForm && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">عناوينك المحفوظة</h3>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700"
            >
              <FaPlus /> إضافة عنوان جديد
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>لا توجد عناوين محفوظة</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-primary-600 hover:underline"
              >
                أضف عنوانك الأول
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map((address) => (
                <div
                  key={address._id}
                  onClick={() => onSelectAddress && onSelectAddress(address)}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                    selectedAddressId === address._id
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{address.fullName}</h4>
                        {address.isDefault && (
                          <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                            افتراضي
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{address.phone}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {address.city} - {address.district}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.street} - {address.building}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      {!address.isDefault && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetDefault(address._id);
                          }}
                          className="text-green-600 hover:text-green-700 p-2"
                          title="تعيين كافتراضي"
                        >
                          <FaCheck />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(address);
                        }}
                        className="text-primary-600 hover:text-primary-700 p-2"
                        title="تعديل"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(address._id);
                        }}
                        className="text-red-600 hover:text-red-700 p-2"
                        title="حذف"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Address Form */}
      {showForm && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {editingAddress ? 'تعديل العنوان' : 'إضافة عنوان جديد'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">الاسم الكامل *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">رقم الجوال *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">المدينة *</label>
                <select
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 bg-white"
                >
                  <option value="">اختر المدينة</option>
                  {cities.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الحي *</label>
                <input
                  type="text"
                  required
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الشارع *</label>
                <input
                  type="text"
                  required
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">رقم المبنى *</label>
                <input
                  type="text"
                  required
                  value={formData.building}
                  onChange={(e) => setFormData({ ...formData, building: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">الرمز البريدي</label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                className="w-4 h-4"
              />
              <label htmlFor="isDefault" className="text-sm">
                تعيين كعنوان افتراضي
              </label>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg hover:bg-primary-700"
              >
                {editingAddress ? 'تحديث' : 'إضافة'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
              >
                إلغاء
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default AddressManager;
