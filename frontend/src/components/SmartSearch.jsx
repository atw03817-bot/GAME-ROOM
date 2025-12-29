import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiX, FiTrendingUp, FiPackage, FiTag } from 'react-icons/fi';
import api from '../utils/api';

function SmartSearch({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus على الـ input عند فتح البحث
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // البحث عن الاقتراحات
  useEffect(() => {
    const searchTimeout = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchSuggestions();
      } else {
        setSuggestions([]);
        setProducts([]);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const fetchSuggestions = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/search/suggestions?q=${encodeURIComponent(query)}&limit=6`);
      
      if (response.data.success) {
        setSuggestions(response.data.data.suggestions || []);
        setProducts(response.data.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      // في حالة الخطأ، نظهر اقتراحات فارغة بدلاً من كسر التطبيق
      setSuggestions([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery = query) => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onClose();
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleProductClick = (product) => {
    navigate(`/products/${product._id}`);
    onClose();
    setQuery('');
  };

  const handleKeyDown = (e) => {
    const totalItems = suggestions.length + products.length;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < totalItems - 1 ? prev + 1 : -1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : totalItems - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0) {
        if (selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        } else {
          handleProductClick(products[selectedIndex - suggestions.length]);
        }
      } else {
        handleSearch();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'product':
        return <FiPackage className="w-4 h-4 text-blue-500" />;
      case 'brand':
        return <FiTag className="w-4 h-4 text-green-500" />;
      default:
        return <FiTrendingUp className="w-4 h-4 text-gray-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Search Modal */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-[#111111] shadow-lg">
        <div className="container mx-auto px-4 py-4">
          {/* Search Input */}
          <div className="relative">
            <div className="flex items-center gap-3 bg-[#1a1a1a] rounded-xl px-4 py-3 border-2 border-[#C72C15] focus-within:border-[#E08713] transition">
              <FiSearch className="w-5 h-5 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="ابحث عن ألعاب البلايستيشن، يدات معدلة، PS5، PS4..."
                className="flex-1 bg-transparent outline-none text-lg placeholder-gray-400 text-white"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="p-1 hover:bg-[#2a2a2a] rounded-full transition"
                >
                  <FiX className="w-4 h-4 text-gray-400" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#2a2a2a] rounded-full transition"
              >
                <FiX className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>

          {/* Results */}
          {query.length >= 2 && (
            <div className="mt-4 bg-[#1a1a1a] rounded-xl border border-[#C72C15] shadow-lg max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin w-8 h-8 border-2 border-[#E08713] border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-gray-300">جاري البحث...</p>
                </div>
              ) : (
                <>
                  {/* Suggestions */}
                  {suggestions.length > 0 && (
                    <div className="border-b border-[#C72C15]/30">
                      <div className="px-4 py-2 bg-[#2a2a2a] text-sm font-semibold text-gray-300">
                        اقتراحات البحث
                      </div>
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className={`w-full px-4 py-3 text-right hover:bg-[#2a2a2a] transition flex items-center gap-3 ${
                            selectedIndex === index ? 'bg-[#E08713]/20 border-r-2 border-[#E08713]' : ''
                          }`}
                        >
                          {getSuggestionIcon(suggestion.type)}
                          <div className="flex-1">
                            <div className="font-medium text-white">{suggestion.text}</div>
                            <div className="text-xs text-gray-400">{suggestion.category}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Products */}
                  {products.length > 0 && (
                    <div>
                      <div className="px-4 py-2 bg-[#2a2a2a] text-sm font-semibold text-gray-300">
                        المنتجات
                      </div>
                      {products.map((product, index) => (
                        <button
                          key={product._id}
                          onClick={() => handleProductClick(product)}
                          className={`w-full px-4 py-3 text-right hover:bg-[#2a2a2a] transition flex items-center gap-3 ${
                            selectedIndex === suggestions.length + index ? 'bg-[#E08713]/20 border-r-2 border-[#E08713]' : ''
                          }`}
                        >
                          <div className="w-12 h-12 bg-[#2a2a2a] rounded-lg overflow-hidden flex-shrink-0">
                            <img
                              src={product.image}
                              alt={product.nameAr}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.target.src = '/placeholder.jpg';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-white">{product.nameAr}</div>
                            <div className="text-sm text-gray-400 truncate">{product.brand}</div>
                            <div className="text-sm font-bold text-[#E08713]">{product.price} ر.س</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* No Results */}
                  {!loading && suggestions.length === 0 && products.length === 0 && query.length >= 2 && (
                    <div className="p-8 text-center">
                      <div className="w-16 h-16 bg-[#2a2a2a] rounded-full flex items-center justify-center mx-auto mb-4">
                        <FiSearch className="w-8 h-8 text-gray-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">لا توجد نتائج</h3>
                      <p className="text-gray-300 mb-4">لم نجد أي ألعاب تطابق بحثك "{query}"</p>
                      <button
                        onClick={() => handleSearch()}
                        className="px-6 py-2 bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white rounded-lg hover:from-[#C72C15] hover:to-[#991b1b] transition"
                      >
                        البحث في جميع الألعاب
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}


        </div>
      </div>
    </>
  );
}

export default SmartSearch;