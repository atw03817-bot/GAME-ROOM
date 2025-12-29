// إنشاء sitemap محسن لمحركات البحث
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';

dotenv.config();

const generateSEOSitemap = async () => {
  try {
    console.log('🗺️ GENERATING SEO SITEMAP');
    console.log('='.repeat(40));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // الحصول على جميع صفحات SEO
    const SEO = mongoose.model('SEO', new mongoose.Schema({}, { strict: false }));
    const seoPages = await SEO.find({ status: 'active' });

    console.log(`📄 Found ${seoPages.length} SEO pages`);

    // إنشاء XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
`;

    // إضافة الصفحة الرئيسية
    sitemap += `  <url>
    <loc>https://gameroom-store.com/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

    // إضافة باقي الصفحات
    seoPages.forEach(page => {
      if (page.slug !== '') {
        const priority = page.pageType === 'product' ? '0.8' : '0.7';
        const changefreq = page.pageType === 'product' ? 'weekly' : 'monthly';
        
        sitemap += `  <url>
    <loc>https://gameroom-store.com/${page.slug}</loc>
    <lastmod>${page.updatedAt ? page.updatedAt.toISOString() : new Date().toISOString()}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>
`;
      }
    });

    sitemap += `</urlset>`;

    // حفظ sitemap
    fs.writeFileSync('sitemap.xml', sitemap);
    console.log('✅ Sitemap generated: sitemap.xml');

    // إنشاء robots.txt محسن
    const robots = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://gameroom-store.com/sitemap.xml

# متجر جيم روم - أفضل متجر هواتف في السعودية
# Game Room Store - Best Mobile Store in Saudi Arabia

# Allow important pages
Allow: /products/
Allow: /categories/
Allow: /deals/
Allow: /about
Allow: /contact

# Disallow admin and private areas
Disallow: /admin/
Disallow: /api/
Disallow: /login
Disallow: /register
Disallow: /checkout/
Disallow: /account/

# Crawl delay
Crawl-delay: 1
`;

    fs.writeFileSync('robots.txt', robots);
    console.log('✅ Robots.txt generated: robots.txt');

    // إنشاء JSON-LD structured data للموقع
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Store",
      "name": "متجر جيم روم",
      "alternateName": "جيم روم",
      "description": "أفضل متجر هواتف ذكية وإلكترونيات في السعودية. آيفون، سامسونج، هواوي بأفضل الأسعار مع ضمان أصلي وتوصيل مجاني.",
      "url": "https://gameroom-store.com",
      "logo": "https://gameroom-store.com/logo.png",
      "image": "https://gameroom-store.com/og-home.jpg",
      "telephone": "+966500000000",
      "email": "info@gameroom-store.com",
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "SA",
        "addressRegion": "الرياض",
        "addressLocality": "الرياض",
        "streetAddress": "شارع الملك فهد"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "24.7136",
        "longitude": "46.6753"
      },
      "openingHours": "Mo-Su 09:00-23:00",
      "priceRange": "$$",
      "acceptedPaymentMethod": [
        "http://purl.org/goodrelations/v1#ByBankTransferInAdvance",
        "http://purl.org/goodrelations/v1#Cash",
        "http://purl.org/goodrelations/v1#PayPal"
      ],
      "currenciesAccepted": "SAR",
      "paymentAccepted": "نقداً، فيزا، ماستركارد، مدى، تحويل بنكي",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "منتجات متجر جيم روم",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "هواتف ذكية",
              "category": "Electronics"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "إكسسوارات الجوالات",
              "category": "Electronics"
            }
          }
        ]
      },
      "sameAs": [
        "https://twitter.com/gameroomstore",
        "https://instagram.com/gameroomstore",
        "https://facebook.com/gameroomstore"
      ],
      "keywords": "متجر جيم روم، جيم روم، هواتف ذكية، آيفون، سامسونج، جوالات السعودية، متجر إلكتروني، إكسسوارات"
    };

    fs.writeFileSync('structured-data.json', JSON.stringify(structuredData, null, 2));
    console.log('✅ Structured data generated: structured-data.json');

    console.log('\n📋 SEO Files Generated:');
    console.log('   1. sitemap.xml - خريطة الموقع');
    console.log('   2. robots.txt - تعليمات محركات البحث');
    console.log('   3. structured-data.json - البيانات المنظمة');

    console.log('\n🎯 Next Steps:');
    console.log('   1. Upload these files to your website root');
    console.log('   2. Submit sitemap to Google Search Console');
    console.log('   3. Test structured data with Google Rich Results Test');
    console.log('   4. Monitor rankings for "متجر جيم روم"');

  } catch (error) {
    console.error('❌ Sitemap generation failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

generateSEOSitemap();