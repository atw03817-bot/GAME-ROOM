import { useEffect } from 'react';

function SEOHead({ 
  title, 
  description, 
  keywords, 
  ogImage, 
  favicon,
  appleTouchIcon 
}) {
  useEffect(() => {
    // تحديث عنوان الصفحة
    if (title) {
      document.title = title;
    }

    // تحديث الوصف
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription && description) {
      metaDescription.setAttribute('content', description);
    } else if (description) {
      const newMeta = document.createElement('meta');
      newMeta.name = 'description';
      newMeta.content = description;
      document.head.appendChild(newMeta);
    }

    // تحديث الكلمات المفتاحية
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords && keywords) {
      metaKeywords.setAttribute('content', keywords);
    } else if (keywords) {
      const newMeta = document.createElement('meta');
      newMeta.name = 'keywords';
      newMeta.content = keywords;
      document.head.appendChild(newMeta);
    }

    // تحديث Open Graph tags
    const updateOrCreateOGTag = (property, content) => {
      if (!content) return;
      
      let ogTag = document.querySelector(`meta[property="${property}"]`);
      if (ogTag) {
        ogTag.setAttribute('content', content);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.setAttribute('property', property);
        newMeta.setAttribute('content', content);
        document.head.appendChild(newMeta);
      }
    };

    updateOrCreateOGTag('og:title', title);
    updateOrCreateOGTag('og:description', description);
    updateOrCreateOGTag('og:image', ogImage);
    updateOrCreateOGTag('og:type', 'website');
    updateOrCreateOGTag('og:url', window.location.href);

    // تحديث Twitter Card tags
    const updateOrCreateTwitterTag = (name, content) => {
      if (!content) return;
      
      let twitterTag = document.querySelector(`meta[name="${name}"]`);
      if (twitterTag) {
        twitterTag.setAttribute('content', content);
      } else {
        const newMeta = document.createElement('meta');
        newMeta.setAttribute('name', name);
        newMeta.setAttribute('content', content);
        document.head.appendChild(newMeta);
      }
    };

    updateOrCreateTwitterTag('twitter:card', 'summary_large_image');
    updateOrCreateTwitterTag('twitter:title', title);
    updateOrCreateTwitterTag('twitter:description', description);
    updateOrCreateTwitterTag('twitter:image', ogImage);

    // تحديث الفافيكون
    if (favicon) {
      let faviconLink = document.querySelector('link[rel="icon"]');
      if (faviconLink) {
        faviconLink.setAttribute('href', favicon);
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'icon';
        newLink.href = favicon;
        document.head.appendChild(newLink);
      }
    }

    // تحديث Apple Touch Icon
    if (appleTouchIcon) {
      let appleLink = document.querySelector('link[rel="apple-touch-icon"]');
      if (appleLink) {
        appleLink.setAttribute('href', appleTouchIcon);
      } else {
        const newLink = document.createElement('link');
        newLink.rel = 'apple-touch-icon';
        newLink.href = appleTouchIcon;
        document.head.appendChild(newLink);
      }
    }

    // إضافة structured data للمتجر
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": title,
      "description": description,
      "url": window.location.origin,
      "image": ogImage,
      "priceRange": "$$",
      "paymentAccepted": ["Cash", "Credit Card", "Debit Card"],
      "currenciesAccepted": "SAR"
    };

    // إزالة structured data القديم
    const oldScript = document.querySelector('script[type="application/ld+json"]');
    if (oldScript) {
      oldScript.remove();
    }

    // إضافة structured data جديد
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

  }, [title, description, keywords, ogImage, favicon, appleTouchIcon]);

  return null; // هذا المكون لا يعرض شيء
}

export default SEOHead;