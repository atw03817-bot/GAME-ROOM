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
  const [isHeaderLoading, setIsHeaderLoading] = useState(true);
  const [headerData, setHeaderData] = useState({
    storeName: '',
    tagline: '',
    logo: '', // إزالة الشعار الافتراضي
    showStoreNameMobile: false,
    showTaglineMobile: false
  });

  useEffect(() => {
    loadHeaderFromAPI();
    
    // الاستماع لتغييرات إعدادات الـ header
    const handleHeaderSettingsChange = (event) => {
      console.log('Navbar: Header settings changed:', event.detail);
      setHeaderData(prev => ({
        ...prev,
        ...event.detail
      }));
    };

    window.addEventListener('headerSettingsChanged', handleHeaderSettingsChange);
    
    return () => {
      window.removeEventListener('headerSettingsChanged', handleHeaderSettingsChange);
    };
  }, []);

  const loadHeaderFromAPI = async () => {
    try {
      setIsHeaderLoading(true);
      const response = await api.get('/theme');
      if (response.data.success && response.data.data.header) {
        console.log('Navbar: Loaded header data from API:', response.data.data.header);
        setHeaderData(response.data.data.header);
      }
    } catch (error) {
      console.error('Error loading header:', error);
    } finally {
      setIsHeaderLoading(false);
    }
  };

  return (
    <>
      <nav className="bg-[#111111] border-b border-[#C72C15] sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo والاسم */}
            <Link to="/" className="flex items-center gap-3">
              {isHeaderLoading ? (
                // Skeleton loading للشعار
                <div className="w-12 h-12 bg-[#333333] rounded-lg animate-pulse"></div>
              ) : headerData.logo ? (
                <img 
                  src={headerData.logo} 
                  alt="Logo" 
                  className="w-12 h-12 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {!isHeaderLoading && (
                <div className={`w-12 h-12 bg-gradient-to-r from-[#E08713] to-[#C72C15] rounded-lg items-center justify-center text-white font-bold text-xl ${headerData.logo ? 'hidden' : 'flex'}`}>
                  أ
                </div>
              )}
              
              {/* اسم المتجر - ديسكتوب */}
              {isHeaderLoading ? (
                <div className="hidden md:block space-y-1">
                  <div className="h-5 w-32 bg-[#333333] rounded animate-pulse"></div>
                  <div className="h-3 w-24 bg-[#333333] rounded animate-pulse"></div>
                </div>
              ) : headerData.storeName ? (
                <div className="hidden md:block">
                  <div className="text-lg font-bold bg-gradient-to-r from-[#E08713] to-[#C72C15] bg-clip-text text-transparent">{headerData.storeName}</div>
                  {headerData.tagline && (
                    <div className="text-xs text-gray-300">{headerData.tagline}</div>
                  )}
                </div>
              ) : null}
              
              {/* اسم المتجر - جوال */}
              {!isHeaderLoading && headerData.storeName && headerData.showStoreNameMobile && (
                <div className="block md:hidden">
                  <div className="text-sm font-bold bg-gradient-to-r from-[#E08713] to-[#C72C15] bg-clip-text text-transparent">{headerData.storeName}</div>
                  {headerData.tagline && headerData.showTaglineMobile && (
                    <div className="text-xs text-gray-300">{headerData.tagline}</div>
                  )}
                </div>
              )}
            </Link>

            {/* الأيقونات */}
            <div className="flex items-center gap-2">
              {/* البحث */}
              <button 
                onClick={() => setIsSearchOpen(true)}
                className="p-2 hover:bg-[#C72C15]/20 rounded-full transition text-white"
                title="البحث في الألعاب"
              >
                <FiSearch className="w-5 h-5" />
              </button>

              {/* المستخدم */}
              <Link
                to={isAuthenticated ? "/account" : "/login"}
                className="p-2 hover:bg-[#C72C15]/20 rounded-full transition text-white"
              >
                <FiUser className="w-5 h-5" />
              </Link>

              {/* السلة */}
              <Link
                to="/cart"
                className="relative p-2 hover:bg-[#C72C15]/20 rounded-full transition text-white"
              >
                <FiShoppingCart className="w-5 h-5" />
                {itemsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {itemsCount}
                  </span>
                )}
              </Link>

              {/* قائمة الجوال */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 hover:bg-[#C72C15]/20 rounded-full transition text-white"
              >
                {isMenuOpen ? <FiX className="w-5 h-5" /> : <FiMenu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* قائمة الجوال */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-[#C72C15] bg-[#111111]">
            <nav className="container mx-auto px-4 flex flex-col py-4 gap-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)} className="py-2 text-white hover:text-[#E08713] transition">
                الرئيسية
              </Link>
              <Link to="/products" onClick={() => setIsMenuOpen(false)} className="py-2 text-white hover:text-[#E08713] transition">
                جميع المنتجات
              </Link>
              <Link to="/blog" onClick={() => setIsMenuOpen(false)} className="py-2 text-white hover:text-[#E08713] transition">
                المدونة
              </Link>
              <Link to="/deals" onClick={() => setIsMenuOpen(false)} className="py-2 text-[#C72C15] hover:text-[#E08713] transition">
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