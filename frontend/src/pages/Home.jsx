import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/home/HeroSlider';
import ProductSlider from '../components/home/ProductSlider';
import ProductCard from '../components/products/ProductCard';
import DealsSection from '../components/home/DealsSection';
import ExclusiveOffers from '../components/home/ExclusiveOffers';
import { HomeSEO } from '../components/SEO/index.js';
import api from '../utils/api';

function Home() {
  const [sections, setSections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchHomepageConfig();
    fetchProducts();
  }, []);

  const fetchHomepageConfig = async () => {
    try {
      const { data } = await api.get('/homepage');
      const activeSections = (data.sections || [])
        .filter((s) => s.active)
        .sort((a, b) => a.order - b.order);
      setSections(activeSections);
    } catch (error) {
      console.error('Error fetching homepage config:', error);
      setSections([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products', { params: { limit: 1000 } });
      const productsList = Array.isArray(data) ? data : (data.products || []);
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    }
  };

  const renderSection = (section) => {
    switch (section.type) {
      case 'hero':
        return <HeroSection key={section.id} section={section} />;
      case 'categories':
        return <CategoriesSection key={section.id} section={section} />;
      case 'products':
        return <ProductsSection key={section.id} section={section} products={products} />;
      case 'banner':
        return <BannerSection key={section.id} section={section} />;
      case 'text':
        return <TextSection key={section.id} section={section} />;
      case 'imageGrid':
        return <ImageGridSection key={section.id} section={section} />;
      case 'exclusiveOffers':
        return <ExclusiveOffers key={section.id} />;
      case 'deals':
        return <DealsSection key={section.id} />;
      default:
        return null;
    }
  };

  if (!mounted) {
    return <div className="min-h-screen bg-white"></div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HomeSEO featuredProducts={products} />
      <main className="bg-[#111111] min-h-screen">
      {/* جميع الأقسام ديناميكية - لا توجد أقسام ثابتة */}
      {sections.map((section) => renderSection(section))}
      
      {sections.length === 0 && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <h2 className="text-2xl font-bold text-white mb-2">الصفحة قيد الإنشاء</h2>
            <p className="text-gray-300">لم يتم إضافة أي أقسام بعد</p>
          </div>
        </div>
      )}
    </main>
    </>
  );
}

// Hero Section Component
function HeroSection({ section }) {
  const slides = section.content?.slides || [];
  const formattedSlides = slides.map((slide, index) => ({
    id: `${section.id}-${index}`,
    title: slide.title,
    subtitle: slide.subtitle,
    description: slide.description,
    image: slide.image,
    mobileImage: slide.mobileImage,
    link: slide.link || slide.buttonLink || '/products',
    buttonText: slide.buttonText || 'تسوق الآن',
    buttonStyle: 'primary',
  }));

  return <HeroSlider slides={formattedSlides} autoplay={true} interval={5000} />;
}

// Categories Section Component
function CategoriesSection({ section }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchCategoriesWithImages();
  }, [section.content?.categories]);

  const fetchCategoriesWithImages = async () => {
    try {
      setLoading(true);
      const savedCategories = section.content?.categories || [];
      
      if (savedCategories.length === 0) {
        setCategories([]);
        return;
      }

      // جلب الفئات الحديثة من قاعدة البيانات
      const response = await api.get('/categories');
      const allCategories = response.data.categories || [];
      
      // ربط الفئات المحفوظة مع البيانات الحديثة
      const updatedCategories = savedCategories.map(savedCat => {
        const freshCat = allCategories.find(cat => cat._id === savedCat._id);
        return freshCat ? {
          ...savedCat,
          image: freshCat.image, // استخدام الصورة الحديثة
          icon: freshCat.icon,   // استخدام الأيقونة الحديثة
        } : savedCat;
      });
      
      console.log('🔄 Updated categories with fresh data:', updatedCategories);
      console.log('📸 Categories with images:', updatedCategories.filter(c => c.image));
      
      setCategories(updatedCategories);
    } catch (error) {
      console.error('Error fetching fresh category data:', error);
      setCategories(section.content?.categories || []);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
  return (
    <section className="py-4 md:py-8 bg-[#111111]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C72C15] mx-auto"></div>
        </div>
      </div>
    </section>
  );
  }

  return (
    <section className="py-4 md:py-8 bg-[#111111]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 md:mb-6 text-center">
          <h2 className="text-lg md:text-2xl font-bold text-white mb-1">{section.title}</h2>
          {section.subtitle && <p className="text-gray-300 text-xs md:text-sm">{section.subtitle}</p>}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={category.link || `/products?category=${category._id || category.slug || category.name}`}
              className="group relative overflow-hidden rounded-xl aspect-square hover:shadow-lg transition-all duration-300"
            >
              {/* Background Image */}
              <div className="absolute inset-0">
                {category.image && category.image.trim() !== '' ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      console.log('❌ Image failed to load:', category.image);
                      e.target.style.display = 'none';
                      const fallbackDiv = e.target.nextElementSibling;
                      if (fallbackDiv) fallbackDiv.style.display = 'flex';
                    }}
                  />
                ) : null}
                
                {/* Fallback Background */}
                <div 
                  className={`w-full h-full bg-gradient-to-br from-[#E08713] to-[#C72C15] flex items-center justify-center ${category.image && category.image.trim() !== '' ? 'hidden' : 'flex'}`}
                >
                  <div className="text-6xl md:text-8xl opacity-20">
                    {category.icon || '📱'}
                  </div>
                </div>
              </div>

              {/* Overlay - Only if there's text */}
              {category.name && (
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
              )}

              {/* Content - Only text, no icon */}
              <div className="absolute inset-0 flex flex-col justify-end p-3 md:p-4">
                {/* Text - Optional */}
                {category.name && (
                  <div className="text-right">
                    <h3 className="font-bold text-white text-sm md:text-base leading-tight">
                      {category.name}
                    </h3>
                  </div>
                )}
              </div>

              {/* Hover Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#E08713]/20 to-[#C72C15]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

// Products Section Component
function ProductsSection({ section, products }) {
  const productIds = section.content?.productIds || [];
  const selectedProducts = products.filter((p) => productIds.includes(p._id));
  const displayType = section.content?.displayType || 'slider'; // 'slider' or 'grid'

  if (selectedProducts.length === 0) return null;

  // Grid Display
  if (displayType === 'grid') {
    return (
      <section className="py-8 md:py-12 bg-[#111111]" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 md:mb-8 text-center">
            <h2 className="text-xl md:text-3xl font-bold text-white mb-1">
              {section.title}
            </h2>
            {section.subtitle && (
              <p className="text-gray-300 text-xs md:text-sm">
                {section.subtitle}
              </p>
            )}
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {selectedProducts.map((product) => (
              <div key={product._id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Slider Display (Default)
  return (
    <ProductSlider
      title={section.title}
      subtitle={section.subtitle || ''}
      products={selectedProducts}
    />
  );
}

// Banner Section Component
function BannerSection({ section }) {
  const { image, mobileImage, buttonText, buttonLink } = section.content || {};

  return (
    <section className="bg-[#111111] pt-[14px] px-[6px]" dir="rtl">
      <Link
        to={buttonLink || '#'}
        className="block relative hover:shadow-xl transition-all w-full"
      >
        {/* صورة الكمبيوتر */}
        {image && (
          <img 
            src={image} 
            alt={section.title} 
            className="hidden md:block w-full h-auto object-cover" 
          />
        )}
        
        {/* صورة الجوال */}
        {(mobileImage || image) && (
          <img 
            src={mobileImage || image} 
            alt={section.title} 
            className="block md:hidden w-full h-auto object-cover" 
          />
        )}

        {(section.title || section.subtitle || buttonText) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
            <div className="p-6 md:p-12 text-white w-full">
              {section.title && (
                <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3 text-white">{section.title}</h2>
              )}
              {section.subtitle && (
                <p className="text-base md:text-lg mb-4 md:mb-6 text-gray-200">{section.subtitle}</p>
              )}
              {buttonText && (
                <span className="inline-block bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white px-5 py-2 md:px-6 md:py-2.5 rounded-full font-bold text-xs md:text-sm hover:opacity-90 transition-all">
                  {buttonText}
                </span>
              )}
            </div>
          </div>
        )}
      </Link>
    </section>
  );
}

// Text Section Component
function TextSection({ section }) {
  const { text } = section.content || {};

  return (
    <section className="py-8 md:py-12 bg-[#111111]" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-3">{section.title}</h2>
          {section.subtitle && <p className="text-gray-300 text-sm md:text-base mb-6">{section.subtitle}</p>}
          {text && (
            <div className="text-gray-200 text-sm md:text-base leading-relaxed whitespace-pre-line">{text}</div>
          )}
        </div>
      </div>
    </section>
  );
}

// Image Grid Section Component
function ImageGridSection({ section }) {
  const images = section.content?.images || [];

  return (
    <section className="py-8 md:py-12 bg-[#111111]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8 text-center">
          <h2 className="text-xl md:text-3xl font-bold text-white mb-1">{section.title}</h2>
          {section.subtitle && <p className="text-gray-300 text-xs md:text-sm">{section.subtitle}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
          {images.map((img, index) => (
            <Link
              key={index}
              to={img.link || '/products'}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-[#C72C15] hover:border-[#991b1b]"
            >
              <div className="aspect-[4/5] relative">
                <img
                  src={img.image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;
