import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FiSearch, FiGrid, FiList } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/products/ProductCard';

function SearchResults() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  
  const query = searchParams.get('q') || '';
  const page = parseInt(searchParams.get('page')) || 1;
  
  const [searchData, setSearchData] = useState({
    total: 0,
    totalPages: 0,
    currentPage: 1
  });

  useEffect(() => {
    if (query) {
      fetchSearchResults();
    }
  }, [searchParams]);

  const fetchSearchResults = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (query) params.append('q', query);
      if (page) params.append('page', page);
      
      const response = await api.get(`/search?${params.toString()}`);
      
      if (response.data.success) {
        setProducts(response.data.data.products);
        setSearchData({
          total: response.data.data.total,
          totalPages: response.data.data.totalPages,
          currentPage: response.data.data.page
        });
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };



  const changePage = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage);
    setSearchParams(newParams);
  };

  if (!query) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FiSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">ابحث عن المنتجات</h2>
          <p className="text-gray-600 mb-6">استخدم شريط البحث للعثور على المنتجات التي تريدها</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            العودة للرئيسية
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                نتائج البحث عن "{query}"
              </h1>
              <p className="text-gray-600">
                {loading ? 'جاري البحث...' : `${searchData.total} منتج`}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {/* View Mode */}
              <div className="hidden md:flex bg-white rounded-lg border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded ${viewMode === 'grid' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
                >
                  <FiGrid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded ${viewMode === 'list' ? 'bg-primary-100 text-primary-600' : 'text-gray-500'}`}
                >
                  <FiList className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>


        </div>

        {/* Results */}
        <div>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
                    <div className="w-full h-48 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded w-1/3"></div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                <div className={`grid gap-4 ${
                  viewMode === 'grid' 
                    ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                    : 'grid-cols-1'
                }`}>
                  {products.map((product) => (
                    <ProductCard 
                      key={product._id} 
                      product={product} 
                      viewMode={viewMode}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {searchData.totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => changePage(searchData.currentPage - 1)}
                        disabled={searchData.currentPage === 1}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        السابق
                      </button>
                      
                      {[...Array(Math.min(5, searchData.totalPages))].map((_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => changePage(pageNum)}
                            className={`px-4 py-2 border rounded-lg ${
                              searchData.currentPage === pageNum
                                ? 'bg-primary-600 text-white border-primary-600'
                                : 'border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => changePage(searchData.currentPage + 1)}
                        disabled={searchData.currentPage === searchData.totalPages}
                        className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        التالي
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <FiSearch className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-600 mb-6">
                  لم نجد أي منتجات تطابق معايير البحث الخاصة بك
                </p>
                <div className="space-y-2">
                  <p className="text-sm text-gray-500">جرب:</p>
                  <ul className="text-sm text-gray-500 space-y-1">
                    <li>• تغيير كلمات البحث</li>
                    <li>• إزالة بعض الفلاتر</li>
                    <li>• التحقق من الإملاء</li>
                  </ul>
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}

export default SearchResults;