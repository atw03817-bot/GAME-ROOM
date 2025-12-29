// اختبار حد الكلمات المفتاحية
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import SEO from './models/SEO.js';

dotenv.config();

const testKeywordsLimit = async () => {
  try {
    console.log('🔍 TESTING KEYWORDS LIMIT');
    console.log('='.repeat(40));

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // إنشاء قائمة كبيرة من الكلمات المفتاحية (200 كلمة)
    const manyKeywords = [];
    for (let i = 1; i <= 200; i++) {
      manyKeywords.push(`كلمة مفتاحية ${i}`);
    }

    // إضافة كلمات حقيقية أيضاً
    const realKeywords = [
      'جيم روم',
      'متجر هواتف السعودية',
      'جوالات أصلية',
      'آيفون السعودية',
      'سامسونج السعودية',
      'هواتف ذكية',
      'إكسسوارات جوالات',
      'ضمان أصلي',
      'توصيل مجاني',
      'أسعار منافسة'
    ];

    const allKeywords = [...realKeywords, ...manyKeywords];
    console.log(`📊 Total keywords to test: ${allKeywords.length}`);

    // محاولة إنشاء صفحة SEO بكلمات كثيرة
    const testSEO = new SEO({
      pageId: 'test-keywords-limit',
      pageType: 'page',
      title: 'اختبار حد الكلمات المفتاحية',
      description: 'صفحة لاختبار إذا كان فيه حد للكلمات المفتاحية في قاعدة البيانات',
      keywords: allKeywords,
      slug: 'test-keywords-limit',
      h1: 'اختبار حد الكلمات المفتاحية',
      status: 'active'
    });

    await testSEO.save();
    console.log('✅ SEO page with many keywords saved successfully!');

    // جلب البيانات للتأكد
    const savedSEO = await SEO.findOne({ pageId: 'test-keywords-limit' });
    console.log(`📋 Keywords saved: ${savedSEO.keywords.length}`);
    console.log('📝 First 10 keywords:', savedSEO.keywords.slice(0, 10));
    console.log('📝 Last 10 keywords:', savedSEO.keywords.slice(-10));

    // اختبار التحديث
    console.log('\n🔄 Testing update with even more keywords...');
    const moreKeywords = [];
    for (let i = 201; i <= 500; i++) {
      moreKeywords.push(`كلمة إضافية ${i}`);
    }

    savedSEO.keywords = [...savedSEO.keywords, ...moreKeywords];
    await savedSEO.save();

    console.log(`✅ Updated with ${savedSEO.keywords.length} total keywords`);

    // تنظيف
    await SEO.deleteOne({ pageId: 'test-keywords-limit' });
    console.log('🗑️ Test data cleaned up');

    console.log('\n🎯 CONCLUSION:');
    console.log('✅ No limit on keywords in database schema');
    console.log('✅ Can save 500+ keywords without issues');
    console.log('⚠️ If you can\'t see all keywords, the issue is in frontend display');

  } catch (error) {
    console.error('❌ Test failed:', error);
    
    if (error.name === 'ValidationError') {
      console.log('🔍 Validation errors:');
      Object.keys(error.errors).forEach(key => {
        console.log(`   ${key}: ${error.errors[key].message}`);
      });
    }
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 MongoDB disconnected');
  }
};

testKeywordsLimit();