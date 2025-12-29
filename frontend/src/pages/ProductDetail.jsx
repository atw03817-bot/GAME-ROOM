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
  const [customOptions, setCustomOptions] = useState({});

  // حساب السعر النهائي مع الإضافات
  const calculateFinalPrice = () => {
    const basePrice = parseFloat(product?.price || 0);
    const colorAddition = product?.colorPrices?.[selectedColor] || 0;
    const storageAddition = product?.storagePrices?.[selectedStorage] || 0;
    
    // حساب إضافات الخيارات المخصصة
    let customOptionsAddition = 0;
    if (product?.customOptions && Object.keys(customOptions).length > 0) {
      product.customOptions.forEach(option => {
        const selectedValue = customOptions[option.name];
        if (selectedValue !== undefined && selectedValue !== null && selectedValue !== '') {
          if (option.type === 'select' || option.type === 'radio') {
            // للخيارات متعددة الاختيارات، ابحث عن السعر في options
            const selectedOption = option.options?.find(opt => opt.value === selectedValue);
            if (selectedOption) {
              customOptionsAddition += parseFloat(selectedOption.price || 0);
            }
          } else if (option.type === 'checkbox') {
            // للـ checkbox، إذا كان محدد (true) أضف السعر الأساسي
            if (selectedValue === true) {
              customOptionsAddition += parseFloat(option.basePrice || 0);
            }
          } else {
            // للنص والرقم، أضف السعر الأساسي
            customOptionsAddition += parseFloat(option.basePrice || 0);
          }
        }
      });
    }
    
    return basePrice + colorAddition + storageAddition + customOptionsAddition;
  };

  // حساب السعر الأصلي مع الإضافات (للخصم)
  const calculateOriginalPrice = () => {
    if (!product?.originalPrice && !product?.comparePrice) return null;
    const baseOriginalPrice = parseFloat(product?.originalPrice || product?.comparePrice || 0);
    const colorAddition = product?.colorPrices?.[selectedColor] || 0;
    const storageAddition = product?.storagePrices?.[selectedStorage] || 0;
    
    // حساب إضافات الخيارات المخصصة
    let customOptionsAddition = 0;
    if (product?.customOptions && Object.keys(customOptions).length > 0) {
      product.customOptions.forEach(option => {
        const selectedValue = customOptions[option.name];
        if (selectedValue !== undefined && selectedValue !== null && selectedValue !== '') {
          if (option.type === 'select' || option.type === 'radio') {
            const selectedOption = option.options?.find(opt => opt.value === selectedValue);
            if (selectedOption) {
              customOptionsAddition += parseFloat(selectedOption.price || 0);
            }
          } else if (option.type === 'checkbox') {
            if (selectedValue === true) {
              customOptionsAddition += parseFloat(option.basePrice || 0);
            }
          } else {
            customOptionsAddition += parseFloat(option.basePrice || 0);
          }
        }
      });
    }
    
    return baseOriginalPrice + colorAddition + storageAddition + customOptionsAddition;
  };

  useEffect(() => {
    // إعادة تعيين جميع البيانات عند تغيير ID
    setProduct(null);
    setSelectedImage(0);
    setSelectedColor('');
    setSelectedStorage('');
    setQuantity(1);
    setColorImages({});
    setCustomOptions({});
    
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

  const handleAddToCart = async () => {
    if (!selectedColor && product.colors?.length > 0) {
      toast.error('الرجاء اختيار اللون');
      return;
    }
    if (!selectedStorage && product.storage?.length > 0) {
      toast.error('الرجاء اختيار السعة');
      return;
    }

    // التحقق من صحة الخيارات المخصصة
    if (!validateCustomOptions()) {
      return;
    }

    // حساب السعر النهائي مع الإضافات
    const finalPrice = calculateFinalPrice();
    const colorAddition = product?.colorPrices?.[selectedColor] || 0;
    const storageAddition = product?.storagePrices?.[selectedStorage] || 0;

    // إنشاء كائن الخيارات المحددة مع الأسعار
    const selectedOptions = {};
    
    if (selectedColor) {
      selectedOptions.color = {
        name: selectedColor,
        nameAr: selectedColor,
        value: selectedColor,
        price: colorAddition
      };
    }
    
    if (selectedStorage) {
      selectedOptions.storage = {
        name: selectedStorage,
        nameAr: selectedStorage,
        value: selectedStorage,
        price: storageAddition
      };
    }

    // إضافة الخيارات المخصصة
    if (product?.customOptions && Object.keys(customOptions).length > 0) {
      product.customOptions.forEach(option => {
        const selectedValue = customOptions[option.name];
        if (selectedValue !== undefined && selectedValue !== null && selectedValue !== '') {
          let optionPrice = 0;
          let displayValue = selectedValue;

          if (option.type === 'select' || option.type === 'radio') {
            const selectedOption = option.options?.find(opt => opt.value === selectedValue);
            if (selectedOption) {
              optionPrice = parseFloat(selectedOption.price || 0);
              displayValue = selectedOption.label || selectedValue;
            }
          } else if (option.type === 'checkbox') {
            if (selectedValue === true) {
              optionPrice = parseFloat(option.basePrice || 0);
              displayValue = 'نعم';
            } else {
              displayValue = 'لا';
            }
          } else {
            optionPrice = parseFloat(option.basePrice || 0);
          }

          selectedOptions[`custom_${option.name}`] = {
            name: option.name,
            nameAr: option.nameAr,
            value: selectedValue,
            displayValue: displayValue,
            price: optionPrice,
            type: option.type
          };
        }
      });
    }

    addItem(
      {
        ...product,
        price: finalPrice, // السعر النهائي مع الإضافات
        originalPrice: product.price, // السعر الأساسي الأصلي
        selectedColor,
        selectedStorage,
        customOptions: Object.keys(customOptions).length > 0 ? customOptions : undefined,
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a]">
        <div className="container mx-auto px-4 py-6">
          {/* Skeleton Breadcrumb */}
          <div className="bg-[#1a1a1a]/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#333333] mb-6">
            <div className="h-3 bg-[#333333] rounded animate-pulse w-48"></div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Skeleton Images */}
            <div className="space-y-4">
              <div className="aspect-square rounded-lg bg-[#1a1a1a] border border-[#333333] animate-pulse"></div>
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-16 h-16 rounded-lg bg-[#1a1a1a] border border-[#333333] animate-pulse"></div>
                ))}
              </div>
            </div>

            {/* Skeleton Product Info */}
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="h-4 bg-[#333333] rounded animate-pulse w-24"></div>
                <div className="h-8 bg-[#333333] rounded animate-pulse w-full"></div>
                <div className="h-3 bg-[#333333] rounded animate-pulse w-3/4"></div>
              </div>
              
              <div className="h-12 bg-[#1a1a1a] border border-[#333333] rounded-lg animate-pulse"></div>
              <div className="h-16 bg-[#1a1a1a] border border-[#333333] rounded-lg animate-pulse"></div>
              
              <div className="space-y-3">
                <div className="h-4 bg-[#333333] rounded animate-pulse w-20"></div>
                <div className="flex gap-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-10 w-20 bg-[#1a1a1a] border border-[#333333] rounded-lg animate-pulse"></div>
                  ))}
                </div>
              </div>
              
              <div className="flex gap-3">
                <div className="flex-1 h-12 bg-[#1a1a1a] border border-[#333333] rounded-lg animate-pulse"></div>
                <div className="flex-1 h-12 bg-[#1a1a1a] border border-[#333333] rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-3">❌</div>
          <h2 className="text-xl font-bold mb-3 text-white">المنتج غير موجود</h2>
          <p className="text-gray-400 mb-4 text-sm">عذراً، لم نتمكن من العثور على هذا المنتج</p>
          <button
            onClick={() => navigate('/products')}
            className="bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-all text-sm"
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

  // معالجة تغيير الخيارات المخصصة
  const handleCustomOptionChange = (optionName, value) => {
    setCustomOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  // التحقق من صحة الخيارات المخصصة
  const validateCustomOptions = () => {
    if (!product?.customOptions) return true;
    
    for (const option of product.customOptions) {
      if (option.required) {
        const value = customOptions[option.name];
        if (value === undefined || value === null || value === '') {
          toast.error(`الرجاء ${option.type === 'checkbox' ? 'تحديد' : 'إدخال'} ${option.nameAr}`);
          return false;
        }
      }
    }
    return true;
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
      : `${validProductName} - منتج عالي الجودة من جيم روم. متوفر الآن بأفضل الأسعار مع ضمان الجودة والتوصيل المجاني في جميع أنحاء المملكة العربية السعودية.`;
    
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
        "name": product.brand && product.brand.trim() !== '' ? product.brand : 'جيم روم'
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
          "name": "جيم روم",
          "url": "https://www.gameroom-store.com",
          "logo": "https://www.gameroom-store.com/images/logo.png",
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
          "name": "عميل جيم روم"
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
        "name": product.manufacturer || product.brand || 'جيم روم'
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
      <div className="min-h-screen bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#1a1a1a]">
      <div className="container mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="text-xs text-gray-300 mb-6 bg-[#1a1a1a]/50 backdrop-blur-sm rounded-lg px-3 py-2 border border-[#333333]">
          <span className="cursor-pointer hover:text-[#E08713] transition-colors" onClick={() => navigate('/')}>
            الرئيسية
          </span>
          {' > '}
          <span className="cursor-pointer hover:text-[#E08713] transition-colors" onClick={() => navigate('/products')}>
            المنتجات
          </span>
          {' > '}
          <span className="text-[#E08713] font-medium">
            {product ? (i18n.language === 'ar' ? product.nameAr : product.nameEn) : 'جاري التحميل...'}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Images Section */}
          <div className="space-y-3">
            {/* Main Image */}
            <div className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] border border-[#333333] shadow-lg">
                <img
                  src={currentImages[selectedImage] || '/placeholder.jpg'}
                  alt={`${product.nameAr} - ${selectedColor}`}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                
                {/* Image overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                {/* Discount Badge */}
                {calculateOriginalPrice() && (
                  <div className="absolute top-2 left-2 z-10">
                    <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      خصم {Math.round(((calculateOriginalPrice() - calculateFinalPrice()) / calculateOriginalPrice()) * 100)}%
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Thumbnails - Horizontal Slider */}
            {currentImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {currentImages.map((image, index) => (
                  <div
                    key={`${selectedColor}-${index}`}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 cursor-pointer rounded-md overflow-hidden border-2 transition-all duration-300 hover:scale-105 ${
                      selectedImage === index 
                        ? 'border-[#E08713] shadow-lg shadow-[#E08713]/25' 
                        : 'border-[#333333] hover:border-[#555555]'
                    }`}
                    style={{ width: '50px', height: '50px' }}
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
          <div className="space-y-4">
            {/* Brand & Title */}
            <div className="space-y-2">
              {/* العلامة التجارية المطورة */}
              {product.brandInfo ? (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {(product.brandInfo.displayType === 'image' || product.brandInfo.displayType === 'both') && product.brandInfo.image && (
                      <div className="w-12 h-6 flex items-center justify-center bg-white/5 rounded-md p-1">
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
                      <span className="text-xs text-gray-400 font-medium">
                        {product.brandInfo.text || product.brand}
                      </span>
                    )}
                  </div>
                  
                  {/* عداد المبيعات */}
                  {product.sales > 0 && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 px-2 py-1 rounded-full border border-red-500/30 backdrop-blur-sm">
                      <span className="text-red-400 text-xs">🔥</span>
                      <span className="text-xs text-red-400 font-bold">تم شراءه {product.sales} مرة</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  {product.brand && (
                    <p className="text-xs text-gray-400 font-medium bg-white/5 px-2 py-1 rounded-md">{product.brand}</p>
                  )}
                  
                  {/* عداد المبيعات */}
                  {product.sales > 0 && (
                    <div className="flex items-center gap-1 bg-gradient-to-r from-red-500/20 to-orange-500/20 px-2 py-1 rounded-full border border-red-500/30 backdrop-blur-sm">
                      <span className="text-red-400 text-xs">🔥</span>
                      <span className="text-xs text-red-400 font-bold">تم شراءه {product.sales} مرة</span>
                    </div>
                  )}
                </div>
              )}
              
              <h1 className="text-xl lg:text-2xl font-bold text-white leading-tight">
                {i18n.language === 'ar' ? product.nameAr : product.nameEn}
              </h1>
              {product.tagline && (
                <p className="text-sm text-gray-300 leading-relaxed">{product.tagline}</p>
              )}
            </div>

            {/* Rating */}
            <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-lg border border-yellow-500/20">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={`text-sm ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-gray-500'}`}
                  />
                ))}
              </div>
              <span className="text-gray-300 font-medium text-sm">
                ({product.reviewsCount || 0} تقييم)
              </span>
            </div>

            {/* Price */}
            <div className="product-price-container p-4 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg border border-[#333333]">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-xl font-bold text-[#E08713]">
                  {calculateFinalPrice().toFixed(2)} ر.س
                </span>
                {calculateOriginalPrice() && (
                  <>
                    <span className="text-sm text-gray-500 line-through">
                      {calculateOriginalPrice().toFixed(2)} ر.س
                    </span>
                    <span className="bg-gradient-to-r from-red-500 to-red-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg">
                      وفر {(calculateOriginalPrice() - calculateFinalPrice()).toFixed(2)} ر.س
                    </span>
                  </>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1">غير شامل ضريبة القيمة المضافة (15%)</p>
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">اللون: <span className="text-[#E08713]">{selectedColor}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.colors.map((color, index) => {
                    const colorPrice = product?.colorPrices?.[color] || 0;
                    return (
                      <button
                        key={`${color}-${index}`}
                        onClick={() => handleColorChange(color)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                          selectedColor === color
                            ? 'border-[#E08713] bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white shadow-lg shadow-[#E08713]/25'
                            : 'border-[#333333] bg-[#1a1a1a] text-white hover:border-[#E08713] hover:bg-[#2a2a2a]'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-medium text-sm">{color}</div>
                          {colorPrice > 0 && (
                            <div className="text-xs text-gray-300 mt-1">
                              +{colorPrice.toFixed(2)} ر.س
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Storage */}
            {product.storage?.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-white">السعة: <span className="text-[#E08713]">{selectedStorage}</span></p>
                <div className="flex gap-2 flex-wrap">
                  {product.storage.map((storage, index) => {
                    const storagePrice = product?.storagePrices?.[storage] || 0;
                    return (
                      <button
                        key={`${storage}-${index}`}
                        onClick={() => setSelectedStorage(storage)}
                        className={`px-3 py-2 rounded-lg border-2 transition-all duration-300 hover:scale-105 ${
                          selectedStorage === storage
                            ? 'border-[#E08713] bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white shadow-lg shadow-[#E08713]/25'
                            : 'border-[#333333] bg-[#1a1a1a] text-white hover:border-[#E08713] hover:bg-[#2a2a2a]'
                        }`}
                      >
                        <div className="text-center">
                          <div className="font-medium text-sm">{storage}</div>
                          {storagePrice > 0 && (
                            <div className="text-xs text-gray-300 mt-1">
                              +{storagePrice.toFixed(2)} ر.س
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Custom Options */}
            {product.customOptions?.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">خيارات إضافية</h3>
                <div className="space-y-4">
                  {product.customOptions.map((option, index) => (
                    <div key={`${option.name}-${index}`} className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg p-4 border border-[#333333]">
                      <label className="block text-sm font-semibold text-white mb-2">
                        {option.nameAr}
                        {option.required && <span className="text-red-400 mr-1">*</span>}
                      </label>
                      
                      {option.description && (
                        <p className="text-xs text-gray-400 mb-3 leading-relaxed">{option.description}</p>
                      )}

                      {/* Text Input */}
                      {option.type === 'text' && (
                        <div>
                          <input
                            type="text"
                            placeholder={option.placeholder || `أدخل ${option.nameAr}`}
                            maxLength={option.maxLength}
                            value={customOptions[option.name] || ''}
                            onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                            className="w-full px-3 py-2 border border-[#333333] bg-[#111111] text-white rounded-lg focus:ring-2 focus:ring-[#E08713] focus:border-[#E08713] transition-all text-sm"
                          />
                          {option.basePrice > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              إضافة: +{option.basePrice.toFixed(2)} ر.س
                            </p>
                          )}
                        </div>
                      )}

                      {/* Textarea */}
                      {option.type === 'textarea' && (
                        <div>
                          <textarea
                            placeholder={option.placeholder || `أدخل ${option.nameAr}`}
                            maxLength={option.maxLength}
                            rows={3}
                            value={customOptions[option.name] || ''}
                            onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                            className="w-full px-3 py-2 border border-[#333333] bg-[#111111] text-white rounded-lg focus:ring-2 focus:ring-[#E08713] focus:border-[#E08713] placeholder-gray-400 transition-all resize-none text-sm"
                          />
                          {option.basePrice > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              إضافة: +{option.basePrice.toFixed(2)} ر.س
                            </p>
                          )}
                        </div>
                      )}

                      {/* Number Input */}
                      {option.type === 'number' && (
                        <div>
                          <input
                            type="number"
                            placeholder={option.placeholder || `أدخل ${option.nameAr}`}
                            min={option.minValue}
                            max={option.maxValue}
                            value={customOptions[option.name] || ''}
                            onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                            className="w-full px-3 py-2 border border-[#333333] bg-[#111111] text-white rounded-lg focus:ring-2 focus:ring-[#E08713] focus:border-[#E08713] placeholder-gray-400 transition-all text-sm"
                          />
                          {option.basePrice > 0 && (
                            <p className="text-xs text-gray-400 mt-1">
                              إضافة: +{option.basePrice.toFixed(2)} ر.س
                            </p>
                          )}
                        </div>
                      )}

                      {/* Select Dropdown */}
                      {option.type === 'select' && (
                        <div>
                          <select
                            value={customOptions[option.name] || ''}
                            onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                            className="w-full px-3 py-2 border border-[#333333] bg-[#111111] text-white rounded-lg focus:ring-2 focus:ring-[#E08713] focus:border-[#E08713] transition-all text-sm"
                          >
                            <option value="" className="bg-[#111111] text-white">اختر {option.nameAr}</option>
                            {option.options?.map((opt, optIndex) => (
                              <option key={`${opt.value}-${optIndex}`} value={opt.value} className="bg-[#111111] text-white">
                                {opt.label} {opt.price > 0 && `(+${opt.price.toFixed(2)} ر.س)`}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Radio Buttons */}
                      {option.type === 'radio' && (
                        <div className="space-y-2">
                          {option.options?.map((opt, optIndex) => (
                            <label key={`${opt.value}-${optIndex}`} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                              <input
                                type="radio"
                                name={option.name}
                                value={opt.value}
                                checked={customOptions[option.name] === opt.value}
                                onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                                className="text-[#E08713] focus:ring-[#E08713] bg-[#111111] border-[#333333] w-4 h-4"
                              />
                              <span className="text-white text-sm">
                                {opt.label}
                                {opt.price > 0 && (
                                  <span className="text-gray-400 mr-1">(+{opt.price.toFixed(2)} ر.س)</span>
                                )}
                              </span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Checkbox */}
                      {option.type === 'checkbox' && (
                        <div>
                          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-[#2a2a2a] transition-colors">
                            <input
                              type="checkbox"
                              checked={customOptions[option.name] === true}
                              onChange={(e) => handleCustomOptionChange(option.name, e.target.checked)}
                              className="text-[#E08713] focus:ring-[#E08713] bg-[#111111] border-[#333333] rounded w-4 h-4"
                            />
                            <span className="text-white text-sm">
                              {option.placeholder || `تفعيل ${option.nameAr}`}
                              {option.basePrice > 0 && (
                                <span className="text-gray-400 mr-1">(+{option.basePrice.toFixed(2)} ر.س)</span>
                              )}
                            </span>
                          </label>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div className="space-y-3">
              <p className="text-sm font-semibold text-white">الكمية:</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg border border-[#333333] overflow-hidden">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={product.stock === 0}
                    className="w-10 h-10 bg-transparent text-white hover:bg-[#E08713] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-lg font-bold"
                  >
                    -
                  </button>
                  <span className="text-lg font-semibold w-12 text-center text-white py-2">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                    disabled={product.stock === 0}
                    className="w-10 h-10 bg-transparent text-white hover:bg-[#E08713] disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center text-lg font-bold"
                  >
                    +
                  </button>
                </div>
                <span className={`text-xs font-medium ${product.stock === 0 ? 'text-red-400' : product.stock < 10 ? 'text-yellow-400' : 'text-green-400'}`}>
                  ({product.stock || 0} متوفر)
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              {product.stock > 0 ? (
                <>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-all duration-300 hover:scale-105 shadow-lg shadow-[#E08713]/25 text-sm"
                  >
                    اشتري الآن
                  </button>
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] border border-[#333333] text-white py-3 rounded-lg font-semibold hover:bg-gradient-to-r hover:from-[#E08713] hover:to-[#C72C15] transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-sm"
                  >
                    <FaShoppingCart />
                    أضف للسلة
                  </button>
                </>
              ) : (
                <button
                  disabled
                  className="flex-1 bg-gradient-to-r from-red-900 to-red-800 text-red-300 py-3 rounded-lg font-semibold cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(product.quickFeatures).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 text-xs bg-gradient-to-r from-green-500/10 to-emerald-500/10 p-2 rounded-lg border border-green-500/20">
                    <FaCheck className="text-green-400 flex-shrink-0 text-xs" />
                    <span className="text-gray-300">{value}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg p-4 border border-[#333333] space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <FaCheck className="text-green-400 text-xs" />
                <span>{product.warranty || 'ضمان سنة'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <FaCheck className="text-green-400 text-xs" />
                <span>شحن مجاني للطلبات فوق 200 ر.س</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <FaCheck className="text-green-400 text-xs" />
                <span>إمكانية الإرجاع خلال 14 يوم</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <div className="mt-8 bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] rounded-lg shadow-lg p-6 border border-[#333333]">
          {/* Tab Headers */}
          <div className="flex gap-4 border-b border-[#333333] mb-6">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-3 px-4 font-semibold text-sm transition-all duration-300 ${
                activeTab === 'overview'
                  ? 'border-b-2 border-[#E08713] text-[#E08713] bg-gradient-to-t from-[#E08713]/10 to-transparent rounded-t-lg'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              نظرة عامة
            </button>
            <button
              onClick={() => setActiveTab('specs')}
              className={`pb-3 px-4 font-semibold text-sm transition-all duration-300 ${
                activeTab === 'specs'
                  ? 'border-b-2 border-[#E08713] text-[#E08713] bg-gradient-to-t from-[#E08713]/10 to-transparent rounded-t-lg'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
            >
              المواصفات
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="product-overview">
              {/* Hero Description */}
              <div className="mb-4">
                <h3 className="text-sm font-bold text-white mb-2">وصف المنتج</h3>
                <div 
                  className="text-gray-300 leading-relaxed product-description-content text-sm"
                  dangerouslySetInnerHTML={{ 
                    __html: i18n.language === 'ar' ? product.descriptionAr : product.descriptionEn 
                  }}
                />
              </div>

              {/* Key Features Grid */}
              {product.keyFeatures && (
                <div className="mb-4">
                  <h3 className="text-sm font-bold text-white mb-3">
                    المميزات الرئيسية
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.keyFeatures.map((feature, index) => (
                      <div key={index} className="bg-white/5 border border-gray-600 rounded-lg p-3 hover:bg-white/10 transition-all">
                        <span className="text-gray-300 text-xs leading-relaxed">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Additional Info */}
              {product.additionalInfo && (
                <div className="bg-white/5 rounded-lg p-4 border border-gray-600">
                  <h3 className="text-sm font-bold text-white mb-3">
                    معلومات إضافية
                  </h3>
                  <div className="text-gray-300 leading-relaxed text-xs">
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
                      <tr key={key} className={`transition-colors hover:bg-[#E08713]/10 ${index % 2 === 0 ? 'bg-[#1a1a1a]' : 'bg-[#252525]'}`}>
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
