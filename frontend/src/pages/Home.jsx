import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import HeroSlider from '../components/home/HeroSlider';
import ProductSlider from '../components/home/ProductSlider';
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
      <main className="bg-white">
      {/* جميع الأقسام ديناميكية - لا توجد أقسام ثابتة */}
      {sections.map((section) => renderSection(section))}
      
      {sections.length === 0 && (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">🏗️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">الصفحة قيد الإنشاء</h2>
            <p className="text-gray-600">لم يتم إضافة أي أقسام بعد</p>
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
      <section className="py-4 md:py-8 bg-white" dir="rtl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 md:py-8 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-4 md:mb-6 text-center">
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 mb-1">{section.title}</h2>
          {section.subtitle && <p className="text-gray-600 text-xs md:text-sm">{section.subtitle}</p>}
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-8 gap-2 md:gap-3">
          {categories.map((category, index) => (
            <Link
              key={index}
              to={category.link || `/products?category=${category._id || category.slug || category.name}`}
              className="group bg-white rounded-xl p-3 md:p-5 text-center hover:shadow-lg transition-all duration-300 border-2 border-gray-200 hover:border-primary-500 flex flex-col items-center"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 mb-1 md:mb-2 group-hover:scale-110 transition-transform flex items-center justify-center overflow-hidden mx-auto">
                {category.image && category.image.trim() !== '' ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      console.log('❌ Image failed to load:', category.image);
                      console.log('🔄 Falling back to icon:', category.icon);
                      e.target.style.display = 'none';
                      const iconDiv = e.target.nextElementSibling;
                      if (iconDiv) iconDiv.style.display = 'flex';
                    }}
                    onLoad={() => {
                      console.log('✅ Image loaded successfully:', category.image);
                    }}
                  />
                ) : null}
                <div 
                  className={`text-3xl md:text-4xl flex items-center justify-center w-full h-full ${category.image && category.image.trim() !== '' ? 'hidden' : 'flex'}`}
                >
                  {category.icon || '📱'}
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 text-[10px] md:text-xs leading-tight text-center">
                {category.name}
              </h3>
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

  if (selectedProducts.length === 0) return null;

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
    <section className="py-8 md:py-12 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link
          to={buttonLink || '#'}
          className="block relative rounded-xl overflow-hidden hover:shadow-xl transition-all"
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
              <div className="p-6 md:p-12 text-white w-full">
                {section.title && (
                  <h2 className="text-2xl md:text-4xl font-bold mb-2 md:mb-3">{section.title}</h2>
                )}
                {section.subtitle && (
                  <p className="text-base md:text-lg mb-4 md:mb-6">{section.subtitle}</p>
                )}
                {buttonText && (
                  <span className="inline-block bg-white text-primary-600 px-5 py-2 md:px-6 md:py-2.5 rounded-full font-bold text-xs md:text-sm hover:bg-gray-100 transition-all">
                    {buttonText}
                  </span>
                )}
              </div>
            </div>
          )}
        </Link>
      </div>
    </section>
  );
}

// Text Section Component
function TextSection({ section }) {
  const { text } = section.content || {};

  return (
    <section className="py-8 md:py-12 bg-gray-50" dir="rtl">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-3">{section.title}</h2>
          {section.subtitle && <p className="text-gray-600 text-sm md:text-base mb-6">{section.subtitle}</p>}
          {text && (
            <div className="text-gray-700 text-sm md:text-base leading-relaxed whitespace-pre-line">{text}</div>
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
    <section className="py-8 md:py-12 bg-white" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 md:mb-8 text-center">
          <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">{section.title}</h2>
          {section.subtitle && <p className="text-gray-600 text-xs md:text-sm">{section.subtitle}</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-3 md:gap-4">
          {images.map((img, index) => (
            <Link
              key={index}
              to={img.link || '/products'}
              className="group relative overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[4/5] relative">
                <img
                  src={img.image}
                  alt={`Image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Home;
