import React from 'react';
import SEOHead from './SEOHead';

const HomeSEO = ({ featuredProducts = [], categories = [] }) => {
  // تحميل إعدادات SEO من localStorage
  const getSEOSettings = () => {
    const savedSettings = localStorage.getItem('seoSettings');
    if (savedSettings) {
      try {
        return JSON.parse(savedSettings);
      } catch (error) {
        return {};
      }
    }
    return {};
  };

  const seoSettings = getSEOSettings();
  const title = seoSettings.title ? `${seoSettings.title} - ${seoSettings.description}` : 'متجر إلكتروني';
  const description = seoSettings.description || 'متجر إلكتروني للأجهزة والإكسسوارات';
  
  const keywords = [
    seoSettings.title || 'متجر إلكتروني',
    'متجر إلكتروني',
    'هواتف ذكية',
    'أجهزة إلكترونية',
    'السعودية',
    'الرياض',
    'جدة',
    'الدمام',
    'توصيل مجاني',
    'ضمان أصلي',
    'أسعار منافسة',
    'آيفون',
    'سامسونج',
    'هواوي',
    'شاومي'
  ];

  const image = '/og-home.jpg';
  const url = '/';

  // Schema.org Organization + WebSite markup
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": seoSettings.title || "متجر إلكتروني",
      "url": "https://ab-tw.com",
      "logo": "https://ab-tw.com/logo.png",
      "description": description,
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "SA",
        "addressLocality": "الرياض"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "telephone": "+966-920000000",
        "contactType": "customer service",
        "availableLanguage": ["Arabic", "English"]
      },
      "sameAs": [
        "https://twitter.com/gameroomstore",
        "https://instagram.com/gameroomstore",
        "https://facebook.com/gameroomstore"
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": seoSettings.title || "متجر إلكتروني",
      "url": "https://ab-tw.com",
      "description": description,
      "inLanguage": "ar",
      "potentialAction": {
        "@type": "SearchAction",
        "target": "https://ab-tw.com/products?search={search_term_string}",
        "query-input": "required name=search_term_string"
      }
    }
  ];

  // إضافة منتجات مميزة إلى Schema
  if (featuredProducts.length > 0) {
    schema.push({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "المنتجات المميزة",
      "description": "أفضل المنتجات المختارة من جيم روم",
      "numberOfItems": featuredProducts.length,
      "itemListElement": featuredProducts.map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name,
          "url": `https://ab-tw.com/products/${product.slug}`,
          "image": product.images?.[0],
          "description": product.description,
          "brand": {
            "@type": "Brand",
            "name": product.brand || 'جيم روم'
          },
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "SAR",
            "availability": product.stock > 0 
              ? "https://schema.org/InStock" 
              : "https://schema.org/OutOfStock"
          }
        }
      }))
    });
  }

  // إضافة FAQ Schema إذا كان متوفراً
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "هل التوصيل مجاني؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "نعم، نوفر توصيل مجاني لجميع الطلبات داخل المملكة العربية السعودية."
        }
      },
      {
        "@type": "Question",
        "name": "ما هي طرق الدفع المتاحة؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "نقبل الدفع عند الاستلام، البطاقات الائتمانية، Apple Pay، والتقسيط عبر Tabby."
        }
      },
      {
        "@type": "Question",
        "name": "هل المنتجات أصلية؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "جميع منتجاتنا أصلية 100% ومضمونة من الشركة المصنعة مع ضمان رسمي."
        }
      },
      {
        "@type": "Question",
        "name": "كم يستغرق التوصيل؟",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "التوصيل يستغرق من 1-3 أيام عمل داخل المدن الرئيسية، و3-5 أيام للمناطق الأخرى."
        }
      }
    ]
  };

  schema.push(faqSchema);

  return (
    <SEOHead
      title={title}
      description={description}
      keywords={keywords}
      image={image}
      url={url}
      type="website"
      schema={schema}
    />
  );
};

export default HomeSEO;