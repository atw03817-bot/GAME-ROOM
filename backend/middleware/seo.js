import SEO from '../models/SEO.js';

// Middleware لإضافة بيانات SEO إلى الاستجابة
export const addSEOData = async (req, res, next) => {
  try {
    // استخراج slug من URL
    const path = req.path;
    let slug = path === '/' ? '' : path.substring(1);
    
    // البحث عن بيانات SEO
    const seoData = await SEO.findOne({ 
      slug: slug, 
      status: 'active' 
    });

    if (seoData) {
      // إضافة بيانات SEO إلى الاستجابة
      res.locals.seo = {
        title: seoData.title,
        description: seoData.description,
        keywords: seoData.keywords,
        image: seoData.featuredImage?.url,
        url: req.originalUrl,
        type: seoData.openGraph?.type || 'website',
        schema: seoData.schema,
        robots: {
          index: seoData.indexing.index,
          follow: seoData.indexing.follow
        }
      };
    }

    next();
  } catch (error) {
    console.error('خطأ في middleware SEO:', error);
    next();
  }
};

// دالة لإنشاء meta tags HTML
export const generateMetaTags = (seoData) => {
  if (!seoData) return '';

  const baseUrl = process.env.FRONTEND_URL || 'https://ab-tw.com';
  const fullUrl = seoData.url ? `${baseUrl}${seoData.url}` : baseUrl;
  const fullImage = seoData.image ? 
    (seoData.image.startsWith('http') ? seoData.image : `${baseUrl}${seoData.image}`) : 
    `${baseUrl}/logo.png`;

  const robots = [];
  if (seoData.robots?.index) robots.push('index');
  else robots.push('noindex');
  if (seoData.robots?.follow) robots.push('follow');
  else robots.push('nofollow');

  let metaTags = `
    <title>${seoData.title}</title>
    <meta name="description" content="${seoData.description}">
    <meta name="robots" content="${robots.join(', ')}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta charset="utf-8">
    
    <!-- Open Graph -->
    <meta property="og:type" content="${seoData.type}">
    <meta property="og:title" content="${seoData.title}">
    <meta property="og:description" content="${seoData.description}">
    <meta property="og:image" content="${fullImage}">
    <meta property="og:url" content="${fullUrl}">
    <meta property="og:site_name" content="أبعاد التواصل">
    <meta property="og:locale" content="ar_SA">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${seoData.title}">
    <meta name="twitter:description" content="${seoData.description}">
    <meta name="twitter:image" content="${fullImage}">
    
    <!-- Additional -->
    <meta name="author" content="أبعاد التواصل">
    <link rel="canonical" href="${fullUrl}">
  `;

  if (seoData.keywords && seoData.keywords.length > 0) {
    metaTags += `\n    <meta name="keywords" content="${seoData.keywords.join(', ')}">`;
  }

  if (seoData.schema) {
    const schemaData = {
      "@context": "https://schema.org",
      "@type": seoData.schema.type,
      ...seoData.schema.data
    };
    metaTags += `\n    <script type="application/ld+json">${JSON.stringify(schemaData, null, 2)}</script>`;
  }

  return metaTags;
};

// دالة لتحديث إحصائيات SEO
export const updateSEOAnalytics = async (slug, data) => {
  try {
    await SEO.findOneAndUpdate(
      { slug, status: 'active' },
      {
        $set: {
          'analytics.clicks': data.clicks || 0,
          'analytics.impressions': data.impressions || 0,
          'analytics.ctr': data.ctr || 0,
          'analytics.position': data.position || 0,
          'analytics.lastUpdated': new Date()
        }
      }
    );
  } catch (error) {
    console.error('خطأ في تحديث إحصائيات SEO:', error);
  }
};