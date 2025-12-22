// Hook لتحديث الفافيكون والأيقونات تلقائياً
import { useEffect } from 'react';

export const useFaviconUpdater = (favicon, appleTouchIcon) => {
  useEffect(() => {
    if (!favicon && !appleTouchIcon) return;

    console.log('🎨 Updating favicon and icons:', { favicon, appleTouchIcon });

    // تحديث الفافيكون
    if (favicon) {
      // البحث عن جميع أنواع الفافيكون وتحديثها
      const faviconSelectors = [
        'link[rel="icon"]',
        'link[rel="shortcut icon"]',
        'link[rel="apple-touch-icon"]'
      ];

      faviconSelectors.forEach(selector => {
        const existingLink = document.querySelector(selector);
        if (existingLink && selector !== 'link[rel="apple-touch-icon"]') {
          existingLink.href = favicon;
          console.log(`✅ Updated ${selector} to:`, favicon);
        }
      });

      // إنشاء فافيكون جديد إذا لم يكن موجود
      if (!document.querySelector('link[rel="icon"]')) {
        const faviconLink = document.createElement('link');
        faviconLink.rel = 'icon';
        faviconLink.type = 'image/x-icon';
        faviconLink.href = favicon;
        document.head.appendChild(faviconLink);
        console.log('✅ Created new favicon link:', favicon);
      }

      // إضافة فافيكون PNG للمتصفحات الحديثة
      if (!document.querySelector('link[rel="icon"][type="image/png"]')) {
        const pngFavicon = document.createElement('link');
        pngFavicon.rel = 'icon';
        pngFavicon.type = 'image/png';
        pngFavicon.href = favicon;
        document.head.appendChild(pngFavicon);
        console.log('✅ Created PNG favicon link:', favicon);
      }
    }

    // تحديث Apple Touch Icon
    if (appleTouchIcon) {
      let appleTouchLink = document.querySelector('link[rel="apple-touch-icon"]');
      
      if (appleTouchLink) {
        appleTouchLink.href = appleTouchIcon;
        console.log('✅ Updated apple-touch-icon to:', appleTouchIcon);
      } else {
        appleTouchLink = document.createElement('link');
        appleTouchLink.rel = 'apple-touch-icon';
        appleTouchLink.sizes = '180x180';
        appleTouchLink.href = appleTouchIcon;
        document.head.appendChild(appleTouchLink);
        console.log('✅ Created new apple-touch-icon:', appleTouchIcon);
      }
    }

    // إجبار المتصفح على إعادة تحميل الفافيكون
    if (favicon) {
      const timestamp = new Date().getTime();
      const faviconWithTimestamp = `${favicon}?v=${timestamp}`;
      
      // تحديث جميع روابط الفافيكون مع timestamp
      document.querySelectorAll('link[rel*="icon"]').forEach(link => {
        if (!link.rel.includes('apple')) {
          link.href = faviconWithTimestamp;
        }
      });
    }

  }, [favicon, appleTouchIcon]);
};

export default useFaviconUpdater;