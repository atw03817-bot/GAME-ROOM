import { useState, useEffect } from 'react';

export default function About() {
  const [companyInfo, setCompanyInfo] = useState({
    name: '',
    tagline: '',
    description: ''
  });

  useEffect(() => {
    // تحميل معلومات الشركة من الإعدادات
    const loadCompanyInfo = () => {
      const savedFooterSettings = localStorage.getItem('footerSettings');
      const savedHeaderSettings = localStorage.getItem('headerSettings');
      
      if (savedFooterSettings) {
        try {
          const footerData = JSON.parse(savedFooterSettings);
          if (footerData.company) {
            setCompanyInfo(prev => ({
              ...prev,
              name: footerData.company.name || '',
              tagline: footerData.company.tagline || '',
              description: footerData.company.description || ''
            }));
          }
        } catch (error) {
          console.log('Error loading footer settings');
        }
      }
      
      if (savedHeaderSettings) {
        try {
          const headerData = JSON.parse(savedHeaderSettings);
          setCompanyInfo(prev => ({
            ...prev,
            name: headerData.storeName || prev.name,
            tagline: headerData.tagline || prev.tagline
          }));
        } catch (error) {
          console.log('Error loading header settings');
        }
      }
    };

    loadCompanyInfo();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">من نحن</h1>
          <p className="text-xl text-primary-100">{companyInfo.tagline || 'تعرف علينا أكثر'}</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* About Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
              أ
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{companyInfo.name || 'اسم الشركة'}</h2>
            <p className="text-gray-600">{companyInfo.description || 'وصف الشركة'}</p>
          </div>

          <div className="space-y-6 text-gray-700 leading-relaxed">
            <p className="text-lg">
              نحن في <span className="font-bold text-primary-600">{companyInfo.name || 'شركتنا'}</span> نؤمن بأن التكنولوجيا هي جسر التواصل في عصرنا الحديث. 
              نسعى لتوفير أحدث الأجهزة الإلكترونية والهواتف الذكية بأفضل الأسعار وأعلى معايير الجودة.
            </p>

            <p>
              تأسس متجرنا برؤية واضحة: <span className="font-semibold">جعل التكنولوجيا في متناول الجميع</span>. 
              نقدم مجموعة واسعة من المنتجات من أشهر العلامات التجارية العالمية، مع ضمان الجودة والأصالة.
            </p>

            <div className="bg-primary-50 border-r-4 border-primary-600 p-6 rounded-lg my-8">
              <h3 className="text-xl font-bold text-primary-900 mb-3">رؤيتنا</h3>
              <p className="text-primary-800">
                أن نكون الخيار الأول للعملاء في المملكة العربية السعودية عند البحث عن الأجهزة الإلكترونية، 
                من خلال تقديم تجربة تسوق استثنائية وخدمة عملاء متميزة.
              </p>
            </div>

            <div className="bg-green-50 border-r-4 border-green-600 p-6 rounded-lg my-8">
              <h3 className="text-xl font-bold text-green-900 mb-3">مهمتنا</h3>
              <p className="text-green-800">
                توفير أحدث التقنيات بأسعار تنافسية، مع ضمان رضا العملاء من خلال منتجات أصلية وخدمة ما بعد البيع المتميزة.
              </p>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">قيمنا</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  ✓
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">الجودة</h3>
                <p className="text-gray-600">نضمن أصالة جميع منتجاتنا من مصادر موثوقة</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  🚀
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">السرعة</h3>
                <p className="text-gray-600">توصيل سريع لجميع مناطق المملكة</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  💎
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">الثقة</h3>
                <p className="text-gray-600">نبني علاقات طويلة الأمد مع عملائنا</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  🎯
                </div>
              </div>
              <div>
                <h3 className="font-bold text-lg mb-2">الابتكار</h3>
                <p className="text-gray-600">نواكب أحدث التقنيات والمنتجات</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us */}
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">لماذا تختار {companyInfo.name || 'متجرنا'}؟</h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="text-primary-600 text-xl">✓</span>
              <p className="text-gray-700">منتجات أصلية 100% مع ضمان الوكيل</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-600 text-xl">✓</span>
              <p className="text-gray-700">أسعار تنافسية وعروض حصرية</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-600 text-xl">✓</span>
              <p className="text-gray-700">خدمة عملاء متاحة على مدار الساعة</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-600 text-xl">✓</span>
              <p className="text-gray-700">توصيل مجاني للطلبات فوق 500 ريال</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-600 text-xl">✓</span>
              <p className="text-gray-700">إمكانية الدفع عند الاستلام</p>
            </div>
            <div className="flex items-start gap-3">
              <span className="text-primary-600 text-xl">✓</span>
              <p className="text-gray-700">سياسة استرجاع مرنة خلال 14 يوم</p>
            </div>
          </div>
        </div>

        {/* Contact CTA */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white rounded-xl p-8 mt-8 text-center">
          <h2 className="text-2xl font-bold mb-3">هل لديك استفسار؟</h2>
          <p className="mb-6 text-primary-100">فريقنا جاهز لمساعدتك</p>
          <a
            href="/contact"
            className="inline-block bg-white text-primary-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition"
          >
            تواصل معنا
          </a>
        </div>
      </div>
    </div>
  );
}
