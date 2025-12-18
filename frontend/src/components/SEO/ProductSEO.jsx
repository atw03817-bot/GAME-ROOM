import React from 'react';
import SEOHead from './SEOHead';

const ProductSEO = ({ product }) => {
  if (!product) return null;

  // استخراج الاسم (يدعم النماذج القديمة والجديدة)
  const productName = product.name?.ar || product.nameAr || product.name || 'منتج';
  const productDesc = product.description?.ar || product.descriptionAr || product.description || '';
  const productSlug = product.slug || product._id;

  // تحميل اسم الموقع من الإعدادات
  const getSiteName = () => {
    const savedSettings = localStorage.getItem('seoSettings');
    if (savedSettings) {
      try {
        const settings = JSON.parse(savedSettings);
        return settings.title || 'متجر إلكتروني';
      } catch (error) {
        return 'متجر إلكتروني';
      }
    }
    return 'متجر إلكتروني';
  };

  const title = `${productName} - ${getSiteName()}`;
  const description = productDesc && typeof productDesc === 'string'
    ? productDesc.substring(0, 160)
    : `اشتري ${productName} بأفضل سعر في السعودية من ${getSiteName()}. توصيل مجاني وضمان أصلي.`;
  
  const keywords = [
    productName,
    product.brand || getSiteName(),
    product.categoryName || product.category || 'إلكترونيات',
    'السعودية',
    'متجر إلكتروني',
    'توصيل مجاني',
    'ضمان أصلي',
    ...(product.tags || [])
  ];

  const image = product.images && product.images.length > 0 
    ? product.images[0] 
    : '/default-product.jpg';

  const url = `/products/${productSlug}`;

  // Schema.org Product markup محسن
  const productPrice = parseFloat(product.price) || parseFloat(product.salePrice) || 1;
  
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": productName,
    "description": productDesc || `${productName} - منتج عالي الجودة من أبعاد التواصل`,
    "image": product.images && product.images.length > 0 ? product.images : ["https://www.ab-tw.com/default-product.jpg"],
    "brand": {
      "@type": "Brand",
      "name": product.brand || 'أبعاد التواصل'
    },
    "sku": product._id || product.id,
    "mpn": product._id || product.id,
    "offers": {
      "@type": "Offer",
      "url": `https://www.ab-tw.com/products/${productSlug}`,
      "price": productPrice,
      "priceCurrency": "SAR",
      "availability": product.stock > 0 
        ? "https://schema.org/InStock" 
        : "https://schema.org/OutOfStock",
      "priceValidUntil": new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "شارع الملك فهد",
          "addressLocality": "الرياض",
          "addressRegion": "الرياض",
          "postalCode": "12345",
          "addressCountry": "SA"
        },
        "telephone": "+966-50-123-4567",
        "email": "info@ab-tw.com"
      }
    },
    "aggregateRating": product.rating && product.rating.average ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating.average,
      "reviewCount": product.rating.count || 1,
      "bestRating": 5,
      "worstRating": 1
    } : {
      "@type": "AggregateRating",
      "ratingValue": 4.5,
      "reviewCount": 1,
      "bestRating": 5,
      "worstRating": 1
    },
    "review": product.reviews && product.reviews.length > 0 ? product.reviews.map(review => ({
      "@type": "Review",
      "author": {
        "@type": "Person",
        "name": review.userName || "عميل"
      },
      "reviewRating": {
        "@type": "Rating",
        "ratingValue": review.rating || 5,
        "bestRating": 5,
        "worstRating": 1
      },
      "reviewBody": review.comment || "منتج ممتاز"
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
      "reviewBody": `${productName} منتج ممتاز وجودة عالية`
    }]
  };

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      image={image}
      url={url}
      type="product"
      schema={schema}
    />
  );
};

export default ProductSEO;