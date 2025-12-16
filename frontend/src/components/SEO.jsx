import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function SEO({ 
  title, 
  description, 
  keywords, 
  image, 
  siteMetadata,
  type = 'website' 
}) {
  const location = useLocation();
  
  useEffect(() => {
    // Early return if we're in SSR or missing location
    if (typeof window === 'undefined' || !location) {
      return;
    }
    // Default metadata (empty - will be filled from settings)
    const defaultMeta = {
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      keywords: '',
      keywordsEn: '',
      favicon: '',
      appleTouchIcon: '/apple-touch-icon.png',
      ogImage: '/og-image.jpg'
    };

    // Get site metadata with fallbacks
    const siteMeta = {
      ...defaultMeta,
      ...(siteMetadata || {})
    };

    // Determine language based on content
    const isArabic = title ? /[\u0600-\u06FF]/.test(title) : true;
    
    // Build final title
    const pageTitle = title || (isArabic ? siteMeta.title : siteMeta.titleEn);
    const siteTitle = isArabic ? siteMeta.title : siteMeta.titleEn;
    const fullTitle = title ? `${pageTitle} | ${siteTitle}` : siteTitle;
    
    // Build description
    const pageDescription = description || (isArabic ? siteMeta.description : siteMeta.descriptionEn);
    
    // Build keywords
    const pageKeywords = keywords || (isArabic ? siteMeta.keywords : siteMeta.keywordsEn);
    
    // Build image URL (with safety checks)
    const pageImage = image || siteMeta?.ogImage || '/og-image.jpg';
    const fullImageUrl = pageImage?.startsWith('http') 
      ? pageImage 
      : `${window?.location?.origin || ''}${pageImage}`;
    
    // Build canonical URL (with safety checks)
    const canonicalUrl = `${window?.location?.origin || ''}${location?.pathname || ''}`;

    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name, content, property = false) => {
      if (!content) return;
      
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Update or create link tags
    const updateLinkTag = (rel, href, sizes = null) => {
      if (!href) return;
      
      let link = document.querySelector(`link[rel="${rel}"]`);
      
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', rel);
        document.head.appendChild(link);
      }
      
      link.setAttribute('href', href);
      if (sizes) {
        link.setAttribute('sizes', sizes);
      }
    };

    // Basic meta tags
    updateMetaTag('description', pageDescription);
    updateMetaTag('keywords', pageKeywords);
    updateMetaTag('author', siteTitle);
    updateMetaTag('robots', 'index, follow');
    
    // Language and direction
    document.documentElement.lang = isArabic ? 'ar' : 'en';
    document.documentElement.dir = isArabic ? 'rtl' : 'ltr';

    // Open Graph tags
    updateMetaTag('og:title', fullTitle, true);
    updateMetaTag('og:description', pageDescription, true);
    updateMetaTag('og:image', fullImageUrl, true);
    updateMetaTag('og:url', canonicalUrl, true);
    updateMetaTag('og:type', type, true);
    updateMetaTag('og:site_name', siteTitle, true);
    updateMetaTag('og:locale', isArabic ? 'ar_SA' : 'en_US', true);

    // Twitter Card tags
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:title', fullTitle);
    updateMetaTag('twitter:description', pageDescription);
    updateMetaTag('twitter:image', fullImageUrl);

    // Favicon and icons
    updateLinkTag('icon', siteMeta.favicon);
    updateLinkTag('apple-touch-icon', siteMeta.appleTouchIcon, '180x180');
    
    // Canonical URL
    updateLinkTag('canonical', canonicalUrl);

    // Viewport (if not already set)
    if (!document.querySelector('meta[name="viewport"]')) {
      const viewport = document.createElement('meta');
      viewport.setAttribute('name', 'viewport');
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
      document.head.appendChild(viewport);
    }

    // Charset (if not already set)
    if (!document.querySelector('meta[charset]')) {
      const charset = document.createElement('meta');
      charset.setAttribute('charset', 'UTF-8');
      document.head.insertBefore(charset, document.head.firstChild);
    }

  }, [title, description, keywords, image, siteMetadata, type, location.pathname]);

  return null; // This component doesn't render anything
}

export default SEO;