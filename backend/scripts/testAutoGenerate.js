import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SEO from '../models/SEO.js';

dotenv.config();

const testAutoGenerate = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    console.log('🔄 بدء الإنشاء التلقائي لـ SEO المنتجات...');
    
    // استيراد Product model ديناميكياً
    const { default: Product } = await import('../models/Product.js');
    
    const products = await Product.find({});
    console.log(`📦 تم العثور على ${products.length} منتج`);
    
    if (products.length === 0) {
      console.log('❌ لا توجد منتجات في قاعدة البيانات');
      return;
    }

    // عرض أول منتج للتحقق من البنية
    console.log('📋 بنية أول منتج:');
    console.log(JSON.stringify(products[0], null, 2));
    
    let created = 0;
    let updated = 0;
    
    for (const product of products) { // جميع المنتجات
      const existingSEO = await SEO.findOne({ pageId: product._id.toString() });
      
      // استخراج الاسم (يدعم النماذج القديمة والجديدة)
      const productName = product.name?.ar || product.nameAr || product.name || 'منتج';
      const productDesc = product.description?.ar || product.descriptionAr || product.description || '';
      const productSlug = product.slug || product._id.toString();
      
      console.log(`📝 معالجة منتج: ${productName}`);
      
      const seoData = {
        pageId: product._id.toString(),
        pageType: 'product',
        title: `${productName} - أبعاد التواصل`,
        description: productDesc ? 
          productDesc.substring(0, 160) : 
          `اشتري ${productName} بأفضل سعر في السعودية من أبعاد التواصل`,
        keywords: [
          productName,
          product.brand || 'أبعاد التواصل',
          product.categoryName || 'إلكترونيات',
          'السعودية',
          'متجر إلكتروني',
          'توصيل مجاني',
          'ضمان أصلي'
        ],
        slug: `products/${productSlug}`,
        h1: productName,
        featuredImage: product.images && product.images.length > 0 ? {
          url: product.images[0],
          alt: productName,
          width: 800,
          height: 600
        } : null,
        openGraph: {
          title: `${productName} - أبعاد التواصل`,
          description: productDesc ? 
            productDesc.substring(0, 160) : 
            `اشتري ${productName} بأفضل سعر في السعودية`,
          image: product.images && product.images.length > 0 ? {
            url: product.images[0],
            alt: productName,
            width: 1200,
            height: 630
          } : null,
          type: 'product'
        },
        schemaMarkup: {
          type: 'Product',
          data: {
            name: productName,
            description: productDesc,
            image: product.images,
            brand: {
              "@type": "Brand",
              name: product.brand || 'أبعاد التواصل'
            },
            offers: {
              "@type": "Offer",
              price: product.price,
              priceCurrency: "SAR",
              availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
              seller: {
                "@type": "Organization",
                name: "أبعاد التواصل"
              }
            }
          }
        },
        indexing: {
          index: true,
          follow: true,
          sitemap: true,
          priority: 0.8,
          changeFreq: 'weekly'
        },
        status: 'active'
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
    
    console.log(`\n📊 النتائج:`);
    console.log(`🆕 تم إنشاء: ${created}`);
    console.log(`✅ تم تحديث: ${updated}`);

  } catch (error) {
    console.error('❌ خطأ في الاختبار:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
};

testAutoGenerate();