import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiTag, FiTrendingUp, FiZap } from 'react-icons/fi';
import api from '../utils/api';

function Deals() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, high, medium, low

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const response = await api.get('/deals');
      console.log('Deals response:', response.data);
      setDeals(response.data.deals || response.data || []);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDeals = () => {
    if (filter === 'all') return deals;
    if (filter === 'high') return deals.filter(d => d.discountPercentage >= 30);
    if (filter === 'medium') return deals.filter(d => d.discountPercentage >= 15 && d.discountPercentage < 30);
    if (filter === 'low') return deals.filter(d => d.discountPercentage < 15);
    return deals;
  };

  const filteredDeals = getFilteredDeals();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-red-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل العروض...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-red-600 via-red-700 to-orange-600 text-white">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Icon */}
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full mb-6 animate-bounce">
              <FiZap size={40} className="text-yellow-300" />
            </div>

            {/* Title */}
            <h1 className="text-4xl md:text-6xl font-black mb-4 animate-fade-in">
              🔥 العروض الحصرية
            </h1>
            <p className="text-xl md:text-2xl text-red-100 mb-6">
              خصومات تصل إلى <span className="text-yellow-300 font-bold text-3xl">50%</span> على منتجات مختارة
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <div className="text-3xl font-bold">{deals.length}</div>
                <div className="text-sm text-red-100">عرض متاح</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <div className="text-3xl font-bold">
                  {deals.length > 0 ? Math.max(...deals.map(d => d.discountPercentage)) : 0}%
                </div>
                <div className="text-sm text-red-100">أعلى خصم</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-6 py-3 border border-white/20">
                <div className="flex items-center gap-2">
                  <FiClock size={20} />
                  <span className="text-lg font-bold">محدودة</span>
                </div>
                <div className="text-sm text-red-100">الكمية</div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="currentColor" className="text-red-50"/>
          </svg>
        </div>
      </div>

      {/* Filters */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl p-4 border border-gray-100">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <FiTag className="text-red-600" size={20} />
              <span className="font-bold text-gray-800">تصفية حسب الخصم:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'all'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                الكل ({deals.length})
              </button>
              <button
                onClick={() => setFilter('high')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'high'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                +30% ({deals.filter(d => d.discountPercentage >= 30).length})
              </button>
              <button
                onClick={() => setFilter('medium')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'medium'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                15-30% ({deals.filter(d => d.discountPercentage >= 15 && d.discountPercentage < 30).length})
              </button>
              <button
                onClick={() => setFilter('low')}
                className={`px-4 py-2 rounded-lg font-medium transition ${
                  filter === 'low'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                أقل من 15% ({deals.filter(d => d.discountPercentage < 15).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Deals Grid */}
      <div className="container mx-auto px-4 py-12">
        {filteredDeals.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-red-100 to-orange-100 rounded-full mb-6">
              <FiTag size={64} className="text-red-400" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-3">
              {filter === 'all' ? 'لا توجد عروض حالياً' : 'لا توجد عروض في هذه الفئة'}
            </h2>
            <p className="text-gray-600 mb-8 text-lg">تابعنا للحصول على أحدث العروض والخصومات</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-8 py-4 rounded-xl font-bold hover:from-red-700 hover:to-orange-700 transition shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <FiTrendingUp size={20} />
              تصفح جميع المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDeals.map((deal) => (
              <Link
                key={deal._id}
                to={`/products/${deal._id}`}
                className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-red-200 transform hover:-translate-y-2"
              >
                {/* Image Container */}
                <div className="relative overflow-hidden bg-white aspect-square">
                  {/* Discount Badge */}
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-4 py-2 rounded-full shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform">
                      <div className="flex items-center gap-1">
                        <FiZap size={16} />
                        <span className="font-black text-lg">{deal.discountPercentage}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Hot Deal Badge */}
                  {deal.discountPercentage >= 30 && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="bg-yellow-400 text-gray-900 px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                        🔥 عرض ساخن
                      </div>
                    </div>
                  )}

                  {/* Product Image */}
                  <img
                    src={deal.images?.[0] || '/placeholder.png'}
                    alt={deal.nameAr || deal.name}
                    className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.target.src = '/placeholder.png';
                    }}
                  />

                  {/* Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                    <span className="text-white font-bold text-sm bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
                      عرض التفاصيل
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  {/* Brand */}
                  {deal.brand && (
                    <div className="text-xs text-gray-500 mb-1 font-medium">{deal.brand}</div>
                  )}

                  {/* Product Name */}
                  <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors min-h-[3rem]">
                    {deal.nameAr || deal.name}
                  </h3>

                  {/* Prices */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex flex-col">
                      <span className="text-2xl font-black text-red-600">
                        {deal.price.toLocaleString()} ريال
                      </span>
                      <span className="text-sm text-gray-400 line-through">
                        {deal.originalPrice.toLocaleString()} ريال
                      </span>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg px-3 py-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-green-700 font-medium">وفر</span>
                      <span className="text-sm font-bold text-green-700">
                        {(deal.originalPrice - deal.price).toLocaleString()} ريال
                      </span>
                    </div>
                  </div>

                  {/* Stock Status */}
                  {deal.stock > 0 ? (
                    <div className="mt-3 flex items-center gap-2 text-xs text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="font-medium">متوفر في المخزون</span>
                    </div>
                  ) : (
                    <div className="mt-3 flex items-center gap-2 text-xs text-red-600">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="font-medium">غير متوفر</span>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      {deals.length > 0 && (
        <div className="container mx-auto px-4 pb-16">
          <div className="bg-gradient-to-r from-red-600 via-red-700 to-orange-600 rounded-3xl p-8 md:p-12 text-white text-center shadow-2xl">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                لا تفوت هذه الفرصة! ⚡
              </h2>
              <p className="text-lg text-red-100 mb-8">
                العروض محدودة والكميات محدودة. اطلب الآن قبل نفاد الكمية!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  to="/products"
                  className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-4 rounded-xl font-bold hover:bg-gray-100 transition shadow-lg"
                >
                  <FiTrendingUp size={20} />
                  تصفح المزيد
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Deals;
