import mongoose from 'mongoose';
import dotenv from 'dotenv';
import SEO from '../models/SEO.js';

dotenv.config();

const seedSEO = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ متصل بقاعدة البيانات');

    // حذف البيانات الموجودة
    await SEO.deleteMany({});
    console.log('🗑️ تم حذف بيانات SEO الموجودة');

    // بيانات SEO الأساسية
    const seoPages = [
      {
        pageId: 'home',
        pageType: 'page',
        title: 'جيم روم - متجر الألعاب والتقنية الأول في السعودية',
        description: 'تسوق أحدث الألعاب والأجهزة التقنية بأفضل الأسعار في السعودية. توصيل مجاني، ضمان أصلي، وخدمة عملاء متميزة.',
        keywords: [
          'جيم روم',
          'متجر إلكتروني',
          'هواتف ذكية',
          'أجهزة إلكترونية',
          'السعودية',
          'الرياض',
          'جدة',
          'الدمام',
          'توصيل مجاني',
          'ضمان أصلي',
          'آيفون',
          'سامسونج',
          'هواوي'
        ],
        slug: '',
        h1: 'جيم روم - متجر الألعاب والتقنية الأول في السعودية',
        featuredImage: {
          url: '/og-home.jpg',
          alt: 'جيم روم - متجر الإلكترونيات',
          width: 1200,
          height: 630
        },
        openGraph: {
          title: 'جيم روم - متجر الألعاب والتقنية الأول في السعودية',
          description: 'تسوق أحدث الألعاب والأجهزة التقنية بأفضل الأسعار في السعودية',
          image: {
            url: '/og-home.jpg',
            alt: 'جيم روم',
            width: 1200,
            height: 630
          },
          type: 'website'
        },
        twitter: {
          card: 'summary_large_image',
          title: 'جيم روم - متجر الألعاب والتقنية الأول في السعودية',
          description: 'تسوق أحدث الألعاب والأجهزة التقنية بأفضل الأسعار',
          image: '/og-home.jpg'
        },
        schemaMarkup: {
          type: 'Organization',
          data: {
            name: 'جيم روم',
            url: 'https://gameroom-store.com',
            logo: 'https://gameroom-store.com/logo.png',
            description: 'متجر إلكتروني متخصص في بيع الهواتف الذكية والأجهزة الإلكترونية في السعودية',
            address: {
              '@type': 'PostalAddress',
              addressCountry: 'SA',
              addressLocality: 'الرياض'
            },
            contactPoint: {
              '@type': 'ContactPoint',
              telephone: '+966-920000000',
              contactType: 'customer service',
              availableLanguage: ['Arabic', 'English']
            }
          }
        },
        indexing: {
          index: true,
          follow: true,
          sitemap: true,
          priority: 1.0,
          changeFreq: 'daily'
        },
        status: 'active'
      },
      {
        pageId: 'products',
        pageType: 'page',
        title: 'جميع المنتجات - جيم روم',
        description: 'تصفح جميع المنتجات المتاحة في جيم روم. هواتف ذكية، أجهزة لوحية، إكسسوارات وأكثر بأفضل الأسعار.',
        keywords: [
          'منتجات',
          'هواتف ذكية',
          'أجهزة لوحية',
          'إكسسوارات',
          'جيم روم',
          'السعودية',
          'تسوق إلكتروني'
        ],
        slug: 'products',
        h1: 'جميع المنتجات',
        openGraph: {
          title: 'جميع المنتجات - جيم روم',
          description: 'تصفح جميع المنتجات المتاحة في جيم روم',
          type: 'website'
        },
        indexing: {
          index: true,
          follow: true,
          sitemap: true,
          priority: 0.9,
          changeFreq: 'daily'
        },
        status: 'active'
      },
      {
        pageId: 'about',
        pageType: 'page',
        title: 'من نحن - جيم روم',
        description: 'تعرف على جيم روم، رؤيتنا، رسالتنا، وقيمنا. نحن متجر إلكتروني رائد في مجال الإلكترونيات في السعودية.',
        keywords: [
          'من نحن',
          'جيم روم',
          'رؤية',
          'رسالة',
          'قيم',
          'السعودية',
          'متجر إلكتروني'
        ],
        slug: 'about',
        h1: 'من نحن',
        indexing: {
          index: true,
          follow: true,
          sitemap: true,
          priority: 0.6,
          changeFreq: 'monthly'
        },
        status: 'active'
      },
      {
        pageId: 'contact',
        pageType: 'page',
        title: 'اتصل بنا - جيم روم',
        description: 'تواصل معنا في جيم روم. خدمة عملاء 24/7، دعم فني متخصص، وحلول سريعة لجميع استفساراتك.',
        keywords: [
          'اتصل بنا',
          'خدمة عملاء',
          'دعم فني',
          'جيم روم',
          'السعودية',
          'تواصل'
        ],
        slug: 'contact',
        h1: 'اتصل بنا',
        indexing: {
          index: true,
          follow: true,
          sitemap: true,
          priority: 0.7,
          changeFreq: 'monthly'
        },
        status: 'active'
      },
      {
        pageId: 'deals',
        pageType: 'page',
        title: 'العروض والخصومات - جيم روم',
        description: 'اكتشف أفضل العروض والخصومات على الهواتف الذكية والأجهزة الإلكترونية. وفر أكثر مع جيم روم.',
        keywords: [
          'عروض',
          'خصومات',
          'تخفيضات',
          'هواتف رخيصة',
          'جيم روم',
          'السعودية',
          'توفير'
        ],
        slug: 'deals',
        h1: 'العروض والخصومات',
        indexing: {
          index: true,
          follow: true,
          sitemap: true,
          priority: 0.8,
          changeFreq: 'daily'
        },
        status: 'active'
      },
      {
        pageId: 'privacy',
        pageType: 'page',
        title: 'سياسة الخصوصية - جيم روم',
        description: 'اطلع على سياسة الخصوصية الخاصة بجيم روم. نحن نحترم خصوصيتك ونحمي بياناتك الشخصية.',
        keywords: [
          'سياسة الخصوصية',
          'حماية البيانات',
          'خصوصية',
          'جيم روم',
          'أمان'
        ],
        slug: 'privacy',
        h1: 'سياسة الخصوصية',
        indexing: {
          index: true,
          follow: true,
          sitemap: true,
          priority: 0.4,
          changeFreq: 'yearly'
        },
        status: 'active'
      },
      {
        pageId: 'terms',
        pageType: 'page',
        title: 'الشروط والأحكام - جيم روم',
        description: 'اقرأ الشروط والأحكام الخاصة بالتسوق في جيم روم. شروط الاستخدام، الإرجاع، والضمان.',
        keywords: [
          'شروط وأحكام',
          'شروط الاستخدام',
          'إرجاع',
          'ضمان',
          'جيم روم'
        ],
        slug: 'terms',
        h1: 'الشروط والأحكام',
        indexing: {
          index: true,
          follow: true,
          sitemap: true,
          priority: 0.4,
          changeFreq: 'yearly'
        },
        status: 'active'
      }
    ];

    // إدراج البيانات
    await SEO.insertMany(seoPages);
    console.log(`✅ تم إنشاء ${seoPages.length} صفحة SEO`);

    console.log('\n📊 ملخص البيانات المُنشأة:');
    seoPages.forEach(page => {
      console.log(`- ${page.title} (/${page.slug})`);
    });

  } catch (error) {
    console.error('❌ خطأ في إنشاء بيانات SEO:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
};

seedSEO();