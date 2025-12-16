import { useState, useEffect } from 'react';
import { FiPercent, FiDollarSign, FiTrash2, FiEdit2, FiPlus, FiTag } from 'react-icons/fi';
import api from '../../utils/api';

function AdminDeals() {
  const [products, setProducts] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [discountType, setDiscountType] = useState('percentage'); // percentage or amount
  const [discountValue, setDiscountValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [productsRes, dealsRes] = await Promise.all([
        api.get('/products', { params: { limit: 1000 } }),
        api.get('/deals')
      ]);
      
      setProducts(productsRes.data.products || productsRes.data || []);
      setDeals(dealsRes.data.deals || dealsRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      alert('حدث خطأ أثناء جلب البيانات');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDeal = (product) => {
    setSelectedProduct(product);
    setDiscountType('percentage');
    setDiscountValue('');
    setShowModal(true);
  };

  const handleEditDeal = (deal) => {
    setSelectedProduct(deal);
    setDiscountValue(deal.discountPercentage || '');
    setDiscountType('percentage');
    setShowModal(true);
  };

  const handleSaveDeal = async () => {
    if (!discountValue || discountValue <= 0) {
      alert('يرجى إدخال قيمة الخصم');
      return;
    }

    try {
      setSaving(true);
      const payload = discountType === 'percentage' 
        ? { discountPercentage: parseFloat(discountValue) }
        : { discountAmount: parseFloat(discountValue) };

      if (selectedProduct.originalPrice) {
        // Update existing deal
        await api.put(`/deals/${selectedProduct._id}`, payload);
      } else {
        // Add new deal
        await api.post(`/deals/${selectedProduct._id}`, payload);
      }

      alert('تم حفظ العرض بنجاح');
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error('Error saving deal:', error);
      alert('حدث خطأ أثناء حفظ العرض');
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveDeal = async (productId) => {
    if (!confirm('هل أنت متأكد من إزالة العرض؟')) return;

    try {
      await api.delete(`/deals/${productId}`);
      alert('تم إزالة العرض بنجاح');
      fetchData();
    } catch (error) {
      console.error('Error removing deal:', error);
      alert('حدث خطأ أثناء إزالة العرض');
    }
  };

  const productsWithoutDeals = products.filter(
    p => !deals.find(d => d._id === p._id)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">إدارة العروض</h1>
        <p className="text-gray-600">إضافة وإدارة العروض والخصومات على المنتجات</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-primary-100 text-sm mb-1">إجمالي المنتجات</p>
              <p className="text-3xl font-bold">{products.length}</p>
            </div>
            <FiTag size={40} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">المنتجات بعروض</p>
              <p className="text-3xl font-bold">{deals.length}</p>
            </div>
            <FiPercent size={40} className="opacity-50" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">بدون عروض</p>
              <p className="text-3xl font-bold">{productsWithoutDeals.length}</p>
            </div>
            <FiPlus size={40} className="opacity-50" />
          </div>
        </div>
      </div>

      {/* Active Deals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-8">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">العروض النشطة ({deals.length})</h2>
        </div>
        <div className="p-6">
          {deals.length === 0 ? (
            <div className="text-center py-12">
              <FiPercent size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">لا توجد عروض نشطة</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {deals.map((deal) => (
                <div
                  key={deal._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 transition"
                >
                  <div className="flex gap-3">
                    <img
                      src={deal.images?.[0] || '/placeholder.png'}
                      alt={deal.nameAr}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">
                        {deal.nameAr || deal.name}
                      </h3>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg font-bold text-green-600">
                          {deal.price} ريال
                        </span>
                        <span className="text-sm text-gray-400 line-through">
                          {deal.originalPrice} ريال
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-red-100 text-red-600 text-xs font-bold rounded">
                          خصم {deal.discountPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleEditDeal(deal)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-50 text-primary-600 rounded-lg hover:bg-primary-100 transition text-sm font-medium"
                    >
                      <FiEdit2 size={14} />
                      تعديل
                    </button>
                    <button
                      onClick={() => handleRemoveDeal(deal._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition text-sm font-medium"
                    >
                      <FiTrash2 size={14} />
                      إزالة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Products Without Deals */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">
            المنتجات بدون عروض ({productsWithoutDeals.length})
          </h2>
        </div>
        <div className="p-6">
          {productsWithoutDeals.length === 0 ? (
            <div className="text-center py-12">
              <FiTag size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">جميع المنتجات عليها عروض</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {productsWithoutDeals.map((product) => (
                <div
                  key={product._id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                >
                  <div className="flex gap-3 mb-3">
                    <img
                      src={product.images?.[0] || '/placeholder.png'}
                      alt={product.nameAr}
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = '/placeholder.png';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800 text-sm mb-1 line-clamp-2">
                        {product.nameAr || product.name}
                      </h3>
                      <p className="text-lg font-bold text-gray-800">
                        {product.price} ريال
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddDeal(product)}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition font-medium"
                  >
                    <FiPlus size={16} />
                    إضافة عرض
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Deal Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 flex-shrink-0">
              <h2 className="text-2xl font-bold text-gray-800">
                {selectedProduct?.originalPrice ? 'تعديل العرض' : 'إضافة عرض'}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {selectedProduct?.nameAr || selectedProduct?.name}
              </p>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Product Info */}
              <div className="flex gap-3 p-4 bg-gray-50 rounded-lg">
                <img
                  src={selectedProduct?.images?.[0] || '/placeholder.png'}
                  alt={selectedProduct?.nameAr}
                  className="w-16 h-16 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.src = '/placeholder.png';
                  }}
                />
                <div>
                  <p className="text-sm text-gray-600">السعر الحالي</p>
                  <p className="text-xl font-bold text-gray-800">
                    {selectedProduct?.originalPrice || selectedProduct?.price} ريال
                  </p>
                </div>
              </div>

              {/* Discount Type */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  نوع الخصم
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDiscountType('percentage')}
                    className={`p-3 rounded-lg border-2 transition ${
                      discountType === 'percentage'
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FiPercent className="mx-auto mb-1" size={24} />
                    <p className="text-sm font-medium">نسبة مئوية</p>
                  </button>
                  <button
                    onClick={() => setDiscountType('amount')}
                    className={`p-3 rounded-lg border-2 transition ${
                      discountType === 'amount'
                        ? 'border-primary-600 bg-primary-50 text-primary-600'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <FiDollarSign className="mx-auto mb-1" size={24} />
                    <p className="text-sm font-medium">مبلغ ثابت</p>
                  </button>
                </div>
              </div>

              {/* Discount Value */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  {discountType === 'percentage' ? 'نسبة الخصم (%)' : 'مبلغ الخصم (ريال)'}
                </label>
                <input
                  type="number"
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder={discountType === 'percentage' ? 'مثال: 20' : 'مثال: 100'}
                  min="0"
                  max={discountType === 'percentage' ? '100' : undefined}
                />
              </div>

              {/* Preview */}
              {discountValue > 0 && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-700 mb-2 font-medium">معاينة السعر الجديد:</p>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-600">
                      {discountType === 'percentage'
                        ? Math.round(
                            (selectedProduct?.originalPrice || selectedProduct?.price) *
                              (1 - discountValue / 100) *
                              100
                          ) / 100
                        : (selectedProduct?.originalPrice || selectedProduct?.price) - discountValue}{' '}
                      ريال
                    </span>
                    <span className="text-sm text-gray-500 line-through">
                      {selectedProduct?.originalPrice || selectedProduct?.price} ريال
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-200 flex gap-3 flex-shrink-0">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                إلغاء
              </button>
              <button
                onClick={handleSaveDeal}
                disabled={saving || !discountValue || discountValue <= 0}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-lg hover:from-primary-700 hover:to-primary-800 transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'جاري الحفظ...' : 'حفظ العرض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDeals;
