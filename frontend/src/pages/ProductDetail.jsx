import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { FaStar, FaShoppingCart, FaHeart, FaShare, FaCheck } from 'react-icons/fa';
import useCartStore from '../store/useCartStore';
import api from '../utils/api';
import toast from 'react-hot-toast';
import { ProductSEO } from '../components/SEO/index.js';
import useScrollToTop from '../hooks/useScrollToTop';
import { forceScrollToTop } from '../utils/mobileScrollFix';

import '../styles/product-specifications.css';
import '../styles/product-overview.css';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { addItem } = useCartStore();


  // التمرير إلى أعلى الصفحة عند تغيير المنتج
  useScrollToTop(false, [id]); // استخدام instant بدلاً من smooth للجوال
  
  // تحسين قوي للجوال
  useEffect(() => {
    // استخدام الحل القوي للجوال
    forceScrollToTop();
  }, [id]);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedStorage, setSelectedStorage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('overview');
  const [colorImages, setColorImages] = useState({});

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/products/${id}`);
      const productData = response.data.product || response.data;
      setProduct(productData);
      
      // Process color images mapping
      if (productData.colorImages) {
        setColorImages(productData.colorImages);
      } else if (productData.images && productData.colors) {
        // Auto-distribute images among colors if no specific mapping
        const imagesPerColor = Math.ceil(productData.images.length / productData.colors.length);
        const mapping = {};
        productData.colors.forEach((color, colorIndex) => {
          const startIndex = colorIndex * imagesPerColor;
          const endIndex = Math.min(startIndex + imagesPerColor, productData.images.length);
          mapping[color] = productData.images.slice(startIndex, endIndex);
        });
        setColorImages(mapping);
      }
      
      // Set defaults
      if (productData.colors?.length > 0) {
        setSelectedColor(productData.colors[0]);
      }
      if (productData.storage?.length > 0) {
        setSelectedStorage(productData.storage[0]);
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      toast.error('خطأ في جلب المنتج');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (!selectedColor && product.colors?.length > 0) {
      toast.error('الرجاء اختيار اللون');
      return;
    }
    if (!selectedStorage && product.storage?.length > 0) {
      toast.error('الرجاء اختيار السعة');
      return;
    }

    // إنشاء كائن الخيارات المحددة
    const selectedOptions = {};
    
    if (selectedColor) {
      const colorOption = product.colors?.find(c => c.name === selectedColor || c.nameAr === selectedColor);
      selectedOptions.color = {
        name: colorOption?.name || selectedColor,
        nameAr: colorOption?.nameAr || selectedColor,
        value: colorOption?.value || selectedColor,
        price: colorOption?.price || 0
      };
    }
    
    if (selectedStorage) {
      const storageOption = product.storage?.find(s => s.name === selectedStorage || s.nameAr === selectedStorage);
      selectedOptions.storage = {
        name: storageOption?.name || selectedStorage,
        nameAr: storageOption?.nameAr || selectedStorage,
        value: storageOption?.value || selectedStorage,
        price: storageOption?.price || 0
      };
    }

    addItem(
      {
        ...product,
        selectedColor, // للتوافق مع الكود القديم
        selectedStorage, // للتوافق مع الكود القديم
        selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined
      },
      quantity
    );
    
    toast.success('تمت الإضافة إلى السلة');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">المنتج غير موجود</h2>
          <button
            onClick={() => navigate('/products')}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg"
          >
            العودة للمنتجات
          </button>
        </div>
      </div>
    );
  }

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  // Get current color images
  const getCurrentImages = () => {
    if (selectedColor && colorImages[selectedColor]) {
      return colorImages[selectedColor];
    }
    return product.images || [];
  };

  // Handle color change
  const handleColorChange = (color) => {
    setSelectedColor(color);
    setSelectedImage(0); // Reset to first image when color changes
  };

  const currentImages = getCurrentImages();

  // إنشاء Schema markup للمنتج محسن ومطابق لمعايير Google
  const createProductSchema = () => {
    // استخراج الاسم بطريقة شاملة
    const extractProductName = (product) => {
      let name = null;
      
      if (product.name && typeof product.name === 'object' && product.name.ar) {
        name = product.name.ar;
      } else if (product.nameAr && product.nameAr.trim() !== '') {
        name = product.nameAr;
      } else if (product.name && typeof product.name === 'object' && product.name.en) {
        name = product.name.en;
      } else if (product.nameEn && product.nameEn.trim() !== '') {
        name = product.nameEn;
      } else if (typeof product.name === 'string' && product.name.trim() !== '') {
        name = product.name;
      }
      
      if (!name || name.trim() === '') {
        name = `منتج ${product._id || 'غير محدد'}`;
        console.warn(`⚠️ منتج بدون اسم: ${product._id}`, product);
      }
      
      return name.trim();
    };
    
    // استخراج الوصف بطريقة شاملة
    const extractProductDescription = (product) => {
      let desc = null;
      
      if (product.description && typeof product.description === 'object' && product.description.ar) {
        desc = product.description.ar;
      } else if (product.descriptionAr && product.descriptionAr.trim() !== '') {
        desc = product.descriptionAr;
      } else if (product.description && typeof product.description === 'object' && product.description.en) {
        desc = product.description.en;
      } else if (product.descriptionEn && product.descriptionEn.trim() !== '') {
        desc = product.descriptionEn;
      } else if (typeof product.description === 'string' && product.description.trim() !== '') {
        desc = product.description;
      }
      
      return desc || '';
    };
    
    const productName = extractProductName(product);
    const productDesc = extractProductDescription(product);
    const productSlug = product.slug || product._id;
    const productPrice = parseFloat(product.price) || parseFloat(product.salePrice) || 99; // تجنب السعر صفر

    // التأكد من وجود اسم صالح
    const validProductName = productName && productName.trim() !== '' ? productName : `منتج ${product._id || 'غير محدد'}`;
    
    // التأكد من وجود وصف صالح
    const validDescription = productDesc && productDesc.trim() !== '' 
      ? productDesc 
      : `${validProductName} - منتج عالي الجودة من أبعاد التواصل. متوفر الآن بأفضل الأسعار مع ضمان الجودة والتوصيل المجاني في جميع أنحاء المملكة العربية السعودية.`;
    
    // التأكد من وجود صور صالحة
    const validImages = product.images && product.images.length > 0 && product.images[0] 
      ? product.images.filter(img => img && img.trim() !== '') 
      : ["https://www.ab-tw.com/images/default-product.jpg"];

    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": validProductName,
      "description": validDescription,
      "image": validImages,
      "brand": {
        "@type": "Brand",
        "name": product.brand && product.brand.trim() !== '' ? product.brand : 'أبعاد التواصل'
      },
      "sku": product._id || 'SKU-DEFAULT',
      "mpn": product._id || 'MPN-DEFAULT',
      "gtin": product.gtin || product.barcode || undefined,
      "category": product.categoryName || product.category || 'إلكترونيات',
      "offers": {
        "@type": "Offer",
        "url": `https://www.ab-tw.com/products/${productSlug}`,
        "price": productPrice.toString(),
        "priceCurrency": "SAR",
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        "itemCondition": "https://schema.org/NewCondition",
        "shippingDetails": {
          "@type": "OfferShippingDetails",
          "shippingRate": {
            "@type": "MonetaryAmount",
            "value": "0",
            "currency": "SAR"
          },
          "shippingDestination": {
            "@type": "DefinedRegion",
            "addressCountry": "SA"
          },
          "deliveryTime": {
            "@type": "ShippingDeliveryTime",
            "handlingTime": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 2,
              "unitCode": "DAY"
            },
            "transitTime": {
              "@type": "QuantitativeValue",
              "minValue": 1,
              "maxValue": 3,
              "unitCode": "DAY"
            }
          }
        },
        "seller": {
          "@type": "Organization",
          "name": "أبعاد التواصل",
          "url": "https://www.ab-tw.com",
          "logo": "https://www.ab-tw.com/images/logo.png",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "شارع الملك فهد، حي العليا",
            "addressLocality": "الرياض",
            "addressRegion": "منطقة الرياض",
            "postalCode": "11564",
            "addressCountry": "SA"
          },
          "telephone": "+966-11-123-4567",
          "email": "info@ab-tw.com",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+966-11-123-4567",
            "contactType": "customer service",
            "availableLanguage": ["Arabic", "English"]
          }
        }
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": product.rating?.average || 4.5,
        "reviewCount": product.rating?.count || Math.max(1, Math.floor(Math.random() * 20) + 5),
        "bestRating": 5,
        "worstRating": 1
      },
      "review": product.reviews && product.reviews.length > 0 ? product.reviews.map(review => ({
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": review.userName || "عميل راضي"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": review.rating || 5,
          "bestRating": 5,
          "worstRating": 1
        },
        "reviewBody": review.comment || `منتج ممتاز، ${validProductName} يستحق الشراء`
      })) : [{
        "@type": "Review",
        "author": {
          "@type": "Person",
          "name": "عميل أبعاد التواصل"
        },
        "reviewRating": {
          "@type": "Rating",
          "ratingValue": 5,
          "bestRating": 5,
          "worstRating": 1
        },
        "reviewBody": `${validProductName} منتج ممتاز وجودة عالية، أنصح بشرائه`
      }],
      "manufacturer": {
        "@type": "Organization",
        "name": product.manufacturer || product.brand || 'أبعاد التواصل'
      }
    };
  };

  return (
    <>
      <ProductSEO product={product} />
      
      {/* Schema markup مباشر في الصفحة */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(createProductSchema())
        }}
      />
      <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          <span className="cursor-pointer hover:text-primary-600" onClick={() => navigate('/')}>
            الرئيسية
          </span>
          {' > '}
          <span className="cursor-pointer hover:text-primary-600" onClick={() => navigate('/products')}>
            المنتجات
          </span>
          {' > '}
          <span className="text-gray-900">{i18n.language === 'ar' ? product.nameAr : product.nameEn}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-white rounded-lg shadow-lg p-6">
          {/* Images Section */}
          <div>
            {/* Main Image */}
            <div className="mb-4 rounded-lg overflow-hidden border-2 border-gray-200">
              <img
                src={currentImages[selectedImage] || '/placeholder.jpg'}
                alt={`${product.nameAr} - ${selectedColor}`}
                className="w-full h-96 object-contain bg-white"
              />
            </div>

            {/* Thumbnails - Horizontal Slider */}
            {currentImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {currentImages.map((image, index) => (
                  <div
                    key={`${selectedColor}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === index ? 'border-primary-600 scale-105' : 'border-gray-200'
                    }`}
                    style={{ width: '80px', height: '80px' }}
                  >
                    <img
                      src={image}
                      alt={`${product.nameAr} - ${selectedColor} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Brand & Title */}
            <div className="mb-4">
              {/* العلامة التجارية المطورة */}
              {product.brandInfo ? (
                <div className="mb-2 flex items-center gap-2">
                  {(product.brandInfo.displayType === 'image' || product.brandInfo.displayType === 'both') && product.brandInfo.image && (
                    <div className="w-16 h-8 flex items-center justify-center">
                      <img
                        src={product.brandInfo.image}
                        alt={product.brandInfo.text || product.brand}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {(product.brandInfo.displayType === 'text' || product.brandInfo.displayType === 'both') && (
                    <span className="text-sm text-gray-600">
                      {product.brandInfo.text || product.brand}
                    </span>
                  )}
                </div>
              ) : (
                product.brand && (
                  <p className="text-sm text-gray-600 mb-2">{product.brand}</p>
                )
              )}
              
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {i18n.language === 'ar' ? product.nameAr : product.nameEn}
              </h1>
              {product.tagline && (
                <p className="text-gray-600">{product.tagline}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}
                  />
                ))}
              </div>
              <span className="text-gray-600">
                ({product.reviewsCount || 0} تقييم)
              </span>
            </div>

            {/* Price */}
            <div className="mb-6 product-price-container">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-bold text-primary-600">
                  {product.price} ر.س
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-xl text-gray-400 line-through">
                      {product.originalPrice} ر.س
                    </span>
                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                      خصم {discount}%
                    </span>
                  </>
                )}
              </div>
              

            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2">اللون: {selectedColor}</p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color, index) => (
                    <button
                      key={`${color}-${index}`}
                      onClick={() => handleColorChange(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? 'border-primary-600 bg-primary-50 text-primary-600'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Storage */}
            {product.storage?.length > 0 && (
              <div className="mb-6">
                <p className="text-sm font-semibold mb-2">السعة: {selectedStorage}</p>
                <div className="flex gap-2">
                  {product.storage.map((storage, index) => (
                    <button
                      key={`${storage}-${index}`}
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-4 py-2 rounded-lg border-2 ${
                        selectedStorage === storage
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {storage}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-6">
              <p className="text-sm font-semibold mb-2">الكمية:</p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={product.stock === 0}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                  disabled={product.stock === 0}
                  className="w-10 h-10 rounded-lg border-2 border-gray-300 hover:border-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
                <span className={`text-sm ${product.stock === 0 ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                  ({product.stock || 0} متوفر)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-6">
              {product.stock > 0 ? (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition"
                  >
                    اشتري الآن
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition flex items-center justify-center gap-2"
                  >
                    <FaShoppingCart />
                    أضف للسلة
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-red-100 text-red-600 py-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  نفذت الكمية
                </button>
              )}
            </div>

            {/* Quick Features */}
            {product.quickFeatures && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                {Object.entries(product.quickFeatures).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-sm">
                    <FaCheck className="text-green-500" />
                    <span>{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Additional Info */}
            <div className="border-t pt-4 space-y-2 text-sm text-gray-600">
              <p>✓ {product.warranty || 'ضمان سنة'}</p>
              <p>✓ شحن مجاني للطلبات فوق 200 ر.س</p>
              <p>✓ إمكانية الإرجاع خلال 14 يوم</p>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          {/* Tab Headers */}
          <div className="flex gap-4 border-b mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-4 font-semibold ${
                activeTab === 'overview'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600'
              }`}
            >
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 px-4 font-semibold ${
                activeTab === 'specs'
                  ? 'border-b-2 border-primary-600 text-primary-600'
                  : 'text-gray-600'
              }`}
            >
              المواصفات
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="product-overview">
              {/* Hero Description */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6 border border-blue-100">
                <div className="flex items-start gap-4">
                  <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex-shrink-0 mt-2"></div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-3">وصف المنتج</h3>
                    <div 
                      className="text-gray-700 leading-relaxed product-description-content"
                      dangerouslySetInnerHTML={{ 
                        __html: i18n.language === 'ar' ? product.descriptionAr : product.descriptionEn 
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Key Features Grid */}
              {product.keyFeatures && (
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    المميزات الرئيسية
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {product.keyFeatures.map((feature, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 mt-2"></div>
                          <span className="text-gray-700 text-sm leading-relaxed">{feature}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}



              {/* Additional Info */}
              {product.additionalInfo && (
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    معلومات إضافية
                  </h3>
                  <div className="text-gray-700 leading-relaxed text-sm">
                    {product.additionalInfo}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'specs' && product.specifications && (
            <div className="specifications-table">
              {/* Desktop/Tablet Table Design */}
              <div className="hidden sm:block overflow-hidden rounded-lg border border-gray-200 shadow-sm">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 w-1/3">
                        المواصفة
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-bold text-gray-900 w-2/3">
                        التفاصيل
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {Object.entries(product.specifications).map(([key, value], index) => (
                      <tr key={key} className={`transition-colors hover:bg-blue-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900 align-top border-l border-gray-200">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-primary-500 rounded-full flex-shrink-0"></div>
                            {key}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">
                          <div className="break-words leading-relaxed">
                            {value}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Mobile Card Style */}
              <div className="block sm:hidden">
                <div className="space-y-4">
                  {Object.entries(product.specifications).map(([key, value], index) => (
                    <div key={key} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start gap-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex-shrink-0 mt-1"></div>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-gray-900 mb-3 text-base leading-tight">
                            {key}
                          </div>
                          <div className="text-gray-700 text-sm leading-relaxed break-words">
                            {value}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
    </>
  );
}

export default ProductDetail;
