import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiShoppingCart, FiUser, FiMenu, FiX, FiSearch } from 'react-icons/fi';
import useCartStore from '../../store/useCartStore';
import useAuthStore from '../../store/useAuthStore';
import api from '../../utils/api';
import SmartSearch from '../SmartSearch';

function Navbar() {
  const itemsCount = useCartStore((state) => state.getItemsCount());
  const { isAuthenticated } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [headerData, setHeaderData] = useState({
    storeName: '',
    tagline: '',
    showStoreNameMobile: false,
    showTaglineMobile: false
  });

  useEffect(() => {
    loadHeaderFromAPI();
  }, []);

  const loadHeaderFromAPI = async () => {
    try {
      const response = await api.get('/theme');
      if (response.data.success && response.data.data.header) {
        setHeaderData(response.data.data.header);
      }
    } catch (error) {
      console.error('Error loading header:', error);
    }
  };

  return (
    <>
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo والاسم */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src="/logo.png" 
                alt="Logo" 
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-10 h-10 bg-primary-600 rounded-lg items-center justify-center text-white font-bold text-xl hidden">
                أ
              </div>
              
              {/* اسم المتجر - ديسكتوب */}
              {headerData.storeName && (
                <div className="hidden md:block">
                  <div className="text-lg font-bold text-primary-600">{headerData.storeName}</div>
                  {headerData.tagline && (
                    <div className="text-xs text-gray-500">{headerData.tagline}</div>
                  )}
                </div>
              )}
              
              {/* اسم المتجر - جوال */}
              {headerData.storeName && headerData.showStoreNameMobile && (
                <div className="block md:hidden">
                  <div className="text-sm font-bold text-primary-600">{headerData.storeName}</div>
                  {headerData.tagline && headerData.showTaglineMobile && (
                    <div className="text-xs text-gray-500">{headerData.tagline}</div>
                  )}
                </div>
              )}
            </Link>

            {/* الأيقونات */}
            <div className="flex items-center gap-2">
              {/* البحث */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
                title="البحث الذكي"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {/* المستخدم */}
              <Link
                to={isAuthenticated ? "/account" : "/login"}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <FiUser className="w-5 h-5" />
              </Link>

              {/* السلة */}
              <Link
                to="/cart"
                className="relative p-2 hover:bg-gray-100 rounded-full transition"
              >
                <FiShoppingCart className="w-5 h-5" />
                {itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemsCount}
                  </span>
                )}
              </Link>

              {/* قائمة الجوال */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:bg-gray-100 rounded-full transition"
              >
                {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* قائمة الجوال */}
        {isMenuOpen && (
          <div className="lg:hidden border-t bg-white">
            <nav className="container mx-auto px-4 flex flex-col py-4 gap-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-2 hover:text-primary-600 transition">
                الرئيسية
              </Link>
              <Link to="/products" onClick={() => setIsMenuOpen(false)} className="py-2 hover:text-primary-600 transition">
                جميع المنتجات
              </Link>
              <Link to="/deals" onClick={() => setIsMenuOpen(false)} className="py-2 text-red-600 hover:text-red-700 transition">
                العروض
              </Link>
            </nav>
          </div>
        )}
      </nav>

      {/* خلفية القائمة */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* البحث الذكي */}
      <SmartSearch 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
      />
    </>
  );
}

export default Navbar;