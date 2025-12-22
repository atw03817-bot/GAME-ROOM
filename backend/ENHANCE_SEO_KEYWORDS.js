// تحسين الكلمات المفتاحية لمحركات البحث
import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

// Schema مبسط للـ SEO
const seoSchema = new mongoose.Schema({
  pageId: String,
  pageType: String,
  title: String,
  description: String,
  keywords: [String],
  slug: String,
  h1: String,
  status: { type: String, default: 'active' }
}, { timestamps: true });

const SEO = mongoose.model('SEO', seoSchema);

const enhanceSEO = async () => {
  try {
    console.log('🚀 ENHANCING SEO FOR "متجر أبعاد التواصل"');
    console.log('='.repeat(60));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // 1. تحديث الصفحة الرئيسية بكلمات مفتاحية قوية
    console.log('\n1️⃣ Updating homepage SEO...');
    
    const homePageSEO = {
      pageId: 'home',
      pageType: 'page',
      title: 'متجر أبعاد التواصل - أفضل متجر هواتف في السعودية | جوالات وإكسسوارات',
      description: 'متجر أبعاد التواصل الرائد في السعودية للهواتف الذكية والإكسسوارات. آيفون، سامسونج، هواوي بأفضل الأسعار. توصيل مجاني وضمان أصلي.',
      keywords: [
        'متجر أبعاد التواصل',
        'أبعاد التواصل',
        'متجر هواتف السعودية',
        'جوالات السعودية',
        'هواتف ذكية',
        'آيفون السعودية',
        'سامسونج السعودية',
        'متجر إلكتروني',
        'هواتف بالتقسيط',
        'إكسسوارات جوالات',
        'أفضل متجر هواتف',
        'جوالات أصلية',
        'ضمان أصلي',
        'توصيل مجاني',
        'أسعار منافسة',
        'خدمة عملاء ممتازة',
        'تقنية حديثة',
        'هواتف محمولة',
        'أجهزة ذكية',
        'تسوق آمن'
      ],
      slug: '',
      h1: 'متجر أبعاد التواصل - أفضل متجر هواتف في السعودية',
      status: 'active'
    };

    await SEO.findOneAndUpdate(
      { pageId: 'home' },
      homePageSEO,
      { upsert: true, new: true }
    );
    console.log('✅ Homepage SEO updated');

    // 2. إضافة صفحات SEO إضافية للكلمات المفتاحية
    console.log('\n2️⃣ Adding keyword-focused pages...');

    const keywordPages = [
      {
        pageId: 'best-mobile-store-saudi',
        pageType: 'page',
        title: 'أفضل متجر جوالات في السعودية - متجر أبعاد التواصل',
        description: 'اكتشف لماذا متجر أبعاد التواصل هو أفضل متجر جوالات في السعودية. أسعار منافسة، جودة عالية، وخدمة عملاء ممتازة.',
        keywords: [
          'أفضل متجر جوالات السعودية',
          'متجر أبعاد التواصل',
          'أفضل متجر هواتف',
          'جوالات أصلية السعودية',
          'متجر موثوق',
          'أسعار منافسة'
        ],
        slug: 'best-mobile-store-saudi-arabia',
        h1: 'أفضل متجر جوالات في السعودية - متجر أبعاد التواصل',
        status: 'active'
      },
      {
        pageId: 'iphone-saudi-store',
        pageType: 'page',
        title: 'آيفون السعودية - أفضل أسعار آيفون | متجر أبعاد التواصل',
        description: 'تسوق آيفون بأفضل الأسعار في السعودية من متجر أبعاد التواصل. آيفون 15، 14، 13 بضمان أصلي وتوصيل مجاني.',
        keywords: [
          'آيفون السعودية',
          'أسعار آيفون',
          'متجر أبعاد التواصل',
          'آيفون أصلي',
          'آيفون 15',
          'آيفون 14',
          'ضمان آبل'
        ],
        slug: 'iphone-saudi-arabia-store',
        h1: 'آيفون السعودية - أفضل أسعار آيفون',
        status: 'active'
      },
      {
        pageId: 'samsung-saudi-store',
        pageType: 'page',
        title: 'سامسونج السعودية - هواتف سامسونج أصلية | متجر أبعاد التواصل',
        description: 'احصل على هواتف سامسونج الأصلية بأفضل الأسعار في السعودية. جالاكسي S24، A55، Note بضمان رسمي من متجر أبعاد التواصل.',
        keywords: [
          'سامسونج السعودية',
          'هواتف سامسونج',
          'متجر أبعاد التواصل',
          'جالاكسي السعودية',
          'سامسونج أصلي',
          'ضمان سامسونج'
        ],
        slug: 'samsung-saudi-arabia-store',
        h1: 'سامسونج السعودية - هواتف سامسونج أصلية',
        status: 'active'
      }
    ];

    for (const page of keywordPages) {
      await SEO.findOneAndUpdate(
        { pageId: page.pageId },
        page,
        { upsert: true, new: true }
      );
      console.log(`✅ Added SEO page: ${page.title}`);
    }

    // 3. إحصائيات نهائية
    console.log('\n3️⃣ Final SEO statistics:');
    const totalSEOPages = await SEO.countDocuments();
    const activeSEOPages = await SEO.countDocuments({ status: 'active' });
    
    console.log(`📊 Total SEO pages: ${totalSEOPages}`);
    console.log(`✅ Active SEO pages: ${activeSEOPages}`);

    // 4. عرض الكلمات المفتاحية الرئيسية
    console.log('\n4️⃣ Main keywords for "متجر أبعاد التواصل":');
    const mainKeywords = [
      'متجر أبعاد التواصل',
      'أبعاد التواصل',
      'أفضل متجر هواتف السعودية',
      'جوالات السعودية',
      'آيفون السعودية',
      'سامسونج السعودية',
      'متجر إلكتروني موثوق'
    ];

    mainKeywords.forEach((keyword, index) => {
      console.log(`   ${index + 1}. ${keyword}`);
    });

    console.log('\n✅ SEO Enhancement completed!');
    console.log('🎯 Your store should now rank better for "متجر أبعاد التواصل"');

  } catch (error) {
    console.error('❌ SEO Enhancement failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

enhanceSEO();