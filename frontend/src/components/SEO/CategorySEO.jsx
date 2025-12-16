import React from 'react';
import SEOHead from './SEOHead';

const CategorySEO = ({ category, products = [] }) => {
  if (!category) return null;

  // استخراج الاسم والوصف (يدعم النماذج القديمة والجديدة)
  const categoryName = category.name?.ar || category.nameAr || category.name || 'فئة';
  const categoryDesc = category.description?.ar || category.descriptionAr || category.description || '';
  const categorySlug = category.slug || category._id;

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

  const title = `${categoryName} - ${getSiteName()}`;
  const description = categoryDesc && typeof categoryDesc === 'string'
    ? categoryDesc.substring(0, 160)
    : `تسوق أفضل ${categoryName} في السعودية من ${getSiteName()}. أسعار منافسة وتوصيل مجاني.`;
  
  const keywords = [
    categoryName,
    getSiteName(),
    'السعودية',
    'متجر إلكتروني',
    'توصيل مجاني',
    'أسعار منافسة',
    ...(category.tags || [])
  ];

  const image = category.image || '/default-category.jpg';
  const url = `/products?category=${categorySlug}`;

  // Schema.org CollectionPage markup
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": categoryName,
    "description": categoryDesc,
    "url": `https://ab-tw.com${url}`,
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": products.length,
      "itemListElement": products.slice(0, 10).map((product, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "item": {
          "@type": "Product",
          "name": product.name?.ar || product.nameAr || product.name || 'منتج',
          "url": `https://ab-tw.com/products/${product.slug || product._id}`,
          "image": product.images?.[0],
          "offers": {
            "@type": "Offer",
            "price": product.price,
            "priceCurrency": "SAR"
          }
        }
      }))
    },
    "breadcrumb": {
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "الرئيسية",
          "item": "https://ab-tw.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "المنتجات",
          "item": "https://ab-tw.com/products"
        },
        {
          "@type": "ListItem",
          "position": 3,
          "name": categoryName,
          "item": `https://ab-tw.com${url}`
        }
      ]
    }
  };

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

export default CategorySEO;