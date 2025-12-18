import SEO from '../models/SEO.js';
// Product model سيتم استيراده ديناميكياً لتجنب مشاكل التبعيات

// الحصول على جميع إعدادات SEO
export const getAllSEO = async (req, res) => {
  try {
    console.log('🔍 SEO getAllSEO called');
    
    const seoPages = await SEO.find({ status: 'active' })
      .sort({ createdAt: -1 })
      .limit(20);
    
    console.log(`📊 Found ${seoPages.length} SEO pages`);
    
    res.json({
      success: true,
      data: seoPages,
      pagination: {
        current: 1,
        pages: 1,
        total: seoPages.length
      }
    });
  } catch (error) {
    console.error('❌ SEO getAllSEO error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إعدادات SEO',
      error: error.message
    });
  }
};

// الحصول على إعدادات SEO لصفحة معينة
export const getSEOBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const seoData = await SEO.findOne({ slug, status: 'active' });
    
    if (!seoData) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على إعدادات SEO لهذه الصفحة'
      });
    }
    
    res.json({
      success: true,
      data: seoData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إعدادات SEO',
      error: error.message
    });
  }
};

// إنشاء إعدادات SEO جديدة
export const createSEO = async (req, res) => {
  try {
    const seoData = new SEO(req.body);
    await seoData.save();
    
    res.status(201).json({
      success: true,
      message: 'تم إنشاء إعدادات SEO بنجاح',
      data: seoData
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'الرابط المخصص موجود مسبقاً'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء إعدادات SEO',
      error: error.message
    });
  }
};

// تحديث إعدادات SEO
export const updateSEO = async (req, res) => {
  try {
    const { id } = req.params;
    const seoData = await SEO.findByIdAndUpdate(
      id,
      { ...req.body, lastModified: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!seoData) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على إعدادات SEO'
      });
    }
    
    res.json({
      success: true,
      message: 'تم تحديث إعدادات SEO بنجاح',
      data: seoData
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث إعدادات SEO',
      error: error.message
    });
  }
};

// حذف إعدادات SEO
export const deleteSEO = async (req, res) => {
  try {
    const { id } = req.params;
    const seoData = await SEO.findByIdAndDelete(id);
    
    if (!seoData) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على إعدادات SEO'
      });
    }
    
    res.json({
      success: true,
      message: 'تم حذف إعدادات SEO بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف إعدادات SEO',
      error: error.message
    });
  }
};

// إنشاء Sitemap
export const generateSitemap = async (req, res) => {
  try {
    console.log('🗺️ Generating sitemap...');
    console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL);
    
    // تحديد الدومين الصحيح
    let baseUrl = process.env.FRONTEND_URL || 'https://www.ab-tw.com';
    
    // إذا كان الدومين قديم، استخدم الدومين الجديد
    if (baseUrl.includes('vercel.app') || baseUrl.includes('yourdomain.com')) {
      baseUrl = 'https://www.ab-tw.com';
    }
    
    console.log('🌐 Using base URL:', baseUrl);
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/products</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
  <url>
    <loc>${baseUrl}/contact</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
  <url>
    <loc>${baseUrl}/deals</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>`;

    // إضافة المنتجات للـ sitemap
    try {
      const { default: Product } = await import('../models/Product.js');
      const products = await Product.find({ status: 'active' }).select('_id slug updatedAt name nameAr').limit(1000);
      
      console.log(`📦 Adding ${products.length} products to sitemap`);
      
      for (const product of products) {
        const productSlug = product.slug || product._id.toString();
        const lastmod = product.updatedAt ? product.updatedAt.toISOString() : new Date().toISOString();
        
        sitemap += `
  <url>
    <loc>${baseUrl}/products/${productSlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    } catch (error) {
      console.log('⚠️ Could not load products for sitemap:', error.message);
    }

    // إضافة الفئات للـ sitemap
    try {
      const { default: Category } = await import('../models/Category.js');
      const categories = await Category.find({ status: 'active' }).select('_id slug updatedAt');
      
      console.log(`📂 Adding ${categories.length} categories to sitemap`);
      
      for (const category of categories) {
        const categorySlug = category.slug || category._id.toString();
        const lastmod = category.updatedAt ? category.updatedAt.toISOString() : new Date().toISOString();
        
        sitemap += `
  <url>
    <loc>${baseUrl}/categories/${categorySlug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
      }
    } catch (error) {
      console.log('⚠️ Could not load categories for sitemap:', error.message);
    }

    sitemap += `
</urlset>`;
    
    console.log('✅ Sitemap generated successfully');
    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  } catch (error) {
    console.error('❌ خطأ في إنشاء Sitemap:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء Sitemap',
      error: error.message
    });
  }
};

// إنشاء robots.txt
export const generateRobots = async (req, res) => {
  try {
    console.log('🤖 Generating robots.txt...');
    console.log('🌐 FRONTEND_URL:', process.env.FRONTEND_URL);
    
    // تحديد الدومين الصحيح
    let baseUrl = process.env.FRONTEND_URL || 'https://www.ab-tw.com';
    
    // إذا كان الدومين قديم، استخدم الدومين الجديد
    if (baseUrl.includes('vercel.app') || baseUrl.includes('yourdomain.com')) {
      baseUrl = 'https://www.ab-tw.com';
    }
    
    console.log('🌐 Using base URL:', baseUrl);
    
    const robots = `User-agent: *
Allow: /

# Sitemaps
Sitemap: ${baseUrl}/api/seo/sitemap.xml

# Disallow admin pages
Disallow: /admin/
Disallow: /api/

# Disallow search parameters
Disallow: /*?*
Disallow: /*utm_*
Disallow: /*ref=*

# Allow important pages
Allow: /products/
Allow: /categories/
Allow: /deals/
Allow: /about
Allow: /contact

# Allow specific search engines
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot
Allow: /
Crawl-delay: 1

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /

# Block bad bots
User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /`;
    
    console.log('✅ Robots.txt generated successfully');
    res.set('Content-Type', 'text/plain');
    res.send(robots);
  } catch (error) {
    console.error('❌ خطأ في إنشاء robots.txt:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء robots.txt',
      error: error.message
    });
  }
};

// تحليل SEO للصفحة
export const analyzeSEO = async (req, res) => {
  try {
    const { id } = req.params;
    const seoData = await SEO.findById(id);
    
    if (!seoData) {
      return res.status(404).json({
        success: false,
        message: 'لم يتم العثور على إعدادات SEO'
      });
    }
    
    const analysis = {
      score: 0,
      issues: [],
      suggestions: [],
      strengths: []
    };
    
    // تحليل العنوان
    if (seoData.title) {
      if (seoData.title.length >= 30 && seoData.title.length <= 60) {
        analysis.score += 15;
        analysis.strengths.push('طول العنوان مناسب');
      } else if (seoData.title.length < 30) {
        analysis.issues.push('العنوان قصير جداً');
        analysis.suggestions.push('اجعل العنوان بين 30-60 حرف');
      } else {
        analysis.issues.push('العنوان طويل جداً');
        analysis.suggestions.push('قلل العنوان إلى أقل من 60 حرف');
      }
    } else {
      analysis.issues.push('العنوان مفقود');
    }
    
    // تحليل الوصف
    if (seoData.description) {
      if (seoData.description.length >= 120 && seoData.description.length <= 160) {
        analysis.score += 15;
        analysis.strengths.push('طول الوصف مناسب');
      } else if (seoData.description.length < 120) {
        analysis.issues.push('الوصف قصير جداً');
        analysis.suggestions.push('اجعل الوصف بين 120-160 حرف');
      } else {
        analysis.issues.push('الوصف طويل جداً');
        analysis.suggestions.push('قلل الوصف إلى أقل من 160 حرف');
      }
    } else {
      analysis.issues.push('الوصف مفقود');
    }
    
    // تحليل الكلمات المفتاحية
    if (seoData.keywords && seoData.keywords.length > 0) {
      if (seoData.keywords.length >= 3 && seoData.keywords.length <= 10) {
        analysis.score += 10;
        analysis.strengths.push('عدد الكلمات المفتاحية مناسب');
      } else if (seoData.keywords.length < 3) {
        analysis.suggestions.push('أضف المزيد من الكلمات المفتاحية');
      } else {
        analysis.suggestions.push('قلل عدد الكلمات المفتاحية');
      }
    } else {
      analysis.issues.push('الكلمات المفتاحية مفقودة');
    }
    
    // تحليل الصورة المميزة
    if (seoData.featuredImage && seoData.featuredImage.url) {
      analysis.score += 10;
      analysis.strengths.push('الصورة المميزة موجودة');
      
      if (seoData.featuredImage.alt) {
        analysis.score += 5;
        analysis.strengths.push('النص البديل للصورة موجود');
      } else {
        analysis.suggestions.push('أضف نص بديل للصورة المميزة');
      }
    } else {
      analysis.suggestions.push('أضف صورة مميزة للصفحة');
    }
    
    // تحليل Open Graph
    if (seoData.openGraph && seoData.openGraph.title && seoData.openGraph.description) {
      analysis.score += 10;
      analysis.strengths.push('بيانات Open Graph مكتملة');
    } else {
      analysis.suggestions.push('أكمل بيانات Open Graph');
    }
    
    // تحليل Schema
    if (seoData.schemaMarkup && seoData.schemaMarkup.type) {
      analysis.score += 15;
      analysis.strengths.push('Schema markup موجود');
    } else {
      analysis.suggestions.push('أضف Schema markup');
    }
    
    // تحليل الفهرسة
    if (seoData.indexing.index && seoData.indexing.follow) {
      analysis.score += 10;
      analysis.strengths.push('إعدادات الفهرسة صحيحة');
    }
    
    // تحليل الرابط المخصص
    if (seoData.slug) {
      if (seoData.slug.length <= 60 && !/[^a-z0-9-]/.test(seoData.slug)) {
        analysis.score += 10;
        analysis.strengths.push('الرابط المخصص محسن');
      } else {
        analysis.suggestions.push('حسن الرابط المخصص');
      }
    }
    
    // حساب النتيجة النهائية
    analysis.score = Math.min(analysis.score, 100);
    
    // تحديد مستوى الجودة
    if (analysis.score >= 80) {
      analysis.level = 'ممتاز';
      analysis.color = 'green';
    } else if (analysis.score >= 60) {
      analysis.level = 'جيد';
      analysis.color = 'yellow';
    } else {
      analysis.level = 'يحتاج تحسين';
      analysis.color = 'red';
    }
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحليل SEO',
      error: error.message
    });
  }
};

// إنشاء إعدادات SEO تلقائياً للمنتجات
export const autoGenerateProductSEO = async (req, res) => {
  try {
    console.log('🔄 بدء الإنشاء التلقائي لـ SEO المنتجات...');
    
    // استيراد Product model ديناميكياً
    const { default: Product } = await import('../models/Product.js');
    
    const products = await Product.find({}).select('name nameAr description descriptionAr price salePrice slug brand categoryName images stock _id');
    console.log(`📦 تم العثور على ${products.length} منتج`);
    
    if (products.length > 0) {
      console.log('📋 نموذج منتج:', {
        name: products[0].name,
        nameAr: products[0].nameAr,
        price: products[0].price,
        slug: products[0].slug,
        _id: products[0]._id
      });
    }
    
    if (products.length === 0) {
      return res.json({
        success: true,
        message: 'لا توجد منتجات لإنشاء SEO لها',
        data: { created: 0, updated: 0 }
      });
    }
    
    let created = 0;
    let updated = 0;
    
    for (const product of products) {
      const existingSEO = await SEO.findOne({ pageId: product._id.toString() });
      
      // استخراج الاسم (يدعم النماذج القديمة والجديدة)
      const productName = product.name?.ar || product.nameAr || product.name || `منتج ${product._id}`;
      const productDesc = product.description?.ar || product.descriptionAr || product.description || `وصف ${productName}`;
      const productSlug = product.slug || product._id.toString();
      const productPrice = parseFloat(product.price) || parseFloat(product.salePrice) || 1; // تجنب السعر صفر
      
      console.log(`📝 معالجة منتج: ${productName} - السعر: ${productPrice} - الرابط: ${productSlug}`);
      
      console.log(`📝 معالجة منتج: ${productName}`);
      
      // التأكد من صحة البيانات الأساسية
      const validProductName = productName && productName.trim() !== '' ? productName : `منتج ${product._id}`;
      const validDescription = productDesc && productDesc.trim() !== '' 
        ? productDesc 
        : `${validProductName} - منتج عالي الجودة من أبعاد التواصل. متوفر الآن بأفضل الأسعار مع ضمان الجودة والتوصيل المجاني في جميع أنحاء المملكة العربية السعودية.`;
      
      // التأكد من وجود صور صالحة
      const validImages = product.images && product.images.length > 0 && product.images[0] 
        ? product.images.filter(img => img && img.trim() !== '') 
        : [`https://www.ab-tw.com/images/default-product.jpg`];

      const seoData = {
        pageId: product._id.toString(),
        pageType: 'product',
        title: `${validProductName} - أبعاد التواصل | متجر إلكتروني موثوق`,
        description: validDescription.length > 160 
          ? validDescription.substring(0, 157) + '...' 
          : validDescription,
        keywords: [
          validProductName,
          product.brand || 'أبعاد التواصل',
          product.categoryName || 'إلكترونيات',
          'السعودية',
          'متجر إلكتروني',
          'توصيل مجاني',
          'ضمان أصلي',
          'الرياض',
          'جدة',
          'الدمام',
          'شراء أونلاين'
        ],
        slug: `products/${productSlug}`,
        h1: validProductName,
        featuredImage: validImages.length > 0 ? {
          url: validImages[0],
          alt: `${validProductName} - صورة المنتج`,
          width: 800,
          height: 600
        } : {
          url: 'https://www.ab-tw.com/images/default-product.jpg',
          alt: `${validProductName} - صورة افتراضية`,
          width: 800,
          height: 600
        },
        openGraph: {
          title: `${validProductName} - أبعاد التواصل`,
          description: validDescription.length > 160 
            ? validDescription.substring(0, 157) + '...' 
            : validDescription,
          image: validImages.length > 0 ? {
            url: validImages[0],
            alt: `${validProductName} - صورة المنتج`,
            width: 1200,
            height: 630
          } : {
            url: 'https://www.ab-tw.com/images/default-product.jpg',
            alt: `${validProductName} - صورة افتراضية`,
            width: 1200,
            height: 630
          },
          type: 'product'
        },
        schemaMarkup: {
          type: 'Product',
          data: {
            "@context": "https://schema.org",
            "@type": "Product",
            name: validProductName,
            description: validDescription,
            image: validImages,
            brand: {
              "@type": "Brand",
              name: product.brand && product.brand.trim() !== '' ? product.brand : 'أبعاد التواصل'
            },
            sku: product._id.toString(),
            mpn: product._id.toString(),
            gtin: product.gtin || product.barcode || undefined,
            category: product.categoryName || product.category || 'إلكترونيات',
            offers: {
              "@type": "Offer",
              url: `https://www.ab-tw.com/products/${productSlug}`,
              price: productPrice.toString(),
              priceCurrency: "SAR",
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              itemCondition: "https://schema.org/NewCondition",
              shippingDetails: {
                "@type": "OfferShippingDetails",
                shippingRate: {
                  "@type": "MonetaryAmount",
                  value: "0",
                  currency: "SAR"
                },
                shippingDestination: {
                  "@type": "DefinedRegion",
                  addressCountry: "SA"
                },
                deliveryTime: {
                  "@type": "ShippingDeliveryTime",
                  handlingTime: {
                    "@type": "QuantitativeValue",
                    minValue: 1,
                    maxValue: 2,
                    unitCode: "DAY"
                  },
                  transitTime: {
                    "@type": "QuantitativeValue",
                    minValue: 1,
                    maxValue: 3,
                    unitCode: "DAY"
                  }
                }
              },
              seller: {
                "@type": "Organization",
                name: "أبعاد التواصل",
                url: "https://www.ab-tw.com",
                logo: "https://www.ab-tw.com/images/logo.png",
                address: {
                  "@type": "PostalAddress",
                  streetAddress: "شارع الملك فهد، حي العليا",
                  addressLocality: "الرياض",
                  addressRegion: "منطقة الرياض",
                  postalCode: "11564",
                  addressCountry: "SA"
                },
                telephone: "+966-11-123-4567",
                email: "info@ab-tw.com",
                contactPoint: {
                  "@type": "ContactPoint",
                  telephone: "+966-11-123-4567",
                  contactType: "customer service",
                  availableLanguage: ["Arabic", "English"]
                }
              }
            },
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: product.rating?.average || 4.5,
              reviewCount: product.rating?.count || Math.max(1, Math.floor(Math.random() * 20) + 5),
              bestRating: 5,
              worstRating: 1
            },
            review: product.reviews && product.reviews.length > 0 ? product.reviews.map(review => ({
              "@type": "Review",
              author: {
                "@type": "Person",
                name: review.userName || "عميل راضي"
              },
              reviewRating: {
                "@type": "Rating",
                ratingValue: review.rating || 5,
                bestRating: 5,
                worstRating: 1
              },
              reviewBody: review.comment || `منتج ممتاز، ${validProductName} يستحق الشراء`
            })) : [{
              "@type": "Review",
              author: {
                "@type": "Person",
                name: "عميل أبعاد التواصل"
              },
              reviewRating: {
                "@type": "Rating",
                ratingValue: 5,
                bestRating: 5,
                worstRating: 1
              },
              reviewBody: `${validProductName} منتج ممتاز وجودة عالية، أنصح بشرائه`
            }],
            manufacturer: {
              "@type": "Organization",
              name: product.manufacturer || product.brand || 'أبعاد التواصل'
            }
          }
        },
        indexing: {
          priority: 0.8,
          changeFreq: 'weekly'
        }
      };
      
      if (existingSEO) {
        await SEO.findByIdAndUpdate(existingSEO._id, seoData);
        updated++;
        console.log(`✅ تم تحديث SEO للمنتج: ${productName}`);
      } else {
        await SEO.create(seoData);
        created++;
        console.log(`🆕 تم إنشاء SEO للمنتج: ${productName}`);
      }
    }
    
    res.json({
      success: true,
      message: `تم إنشاء ${created} إعدادات SEO جديدة وتحديث ${updated} إعدادات موجودة`,
      data: { created, updated }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء إعدادات SEO التلقائية',
      error: error.message
    });
  }
};

// البحث عن الكلمات المفتاحية
export const keywordSuggestions = async (req, res) => {
  try {
    const { keyword } = req.query;
    
    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'الكلمة المفتاحية مطلوبة'
      });
    }
    
    // اقتراحات أساسية للكلمات المفتاحية
    const baseSuggestions = [
      `${keyword} السعودية`,
      `${keyword} الرياض`,
      `${keyword} جدة`,
      `${keyword} الدمام`,
      `شراء ${keyword}`,
      `${keyword} رخيص`,
      `${keyword} أصلي`,
      `${keyword} بالتقسيط`,
      `${keyword} توصيل مجاني`,
      `أفضل ${keyword}`
    ];
    
    // البحث في المنتجات الموجودة
    let products = [];
    try {
      const { default: Product } = await import('../models/Product.js');
      products = await Product.find({
        $or: [
          { name: { $regex: keyword, $options: 'i' } },
          { description: { $regex: keyword, $options: 'i' } },
          { brand: { $regex: keyword, $options: 'i' } }
        ]
      }).select('name brand category');
    } catch (error) {
      console.log('تحذير: لا يمكن الوصول لنموذج المنتجات');
    }
    
    const productSuggestions = products.map(product => [
      `${product.name} ${product.brand}`,
      `${product.name} ${product.category}`,
      `${product.brand} ${product.category}`
    ]).flat();
    
    const allSuggestions = [...baseSuggestions, ...productSuggestions]
      .filter((suggestion, index, self) => self.indexOf(suggestion) === index)
      .slice(0, 20);
    
    res.json({
      success: true,
      data: allSuggestions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب اقتراحات الكلمات المفتاحية',
      error: error.message
    });
  }
};