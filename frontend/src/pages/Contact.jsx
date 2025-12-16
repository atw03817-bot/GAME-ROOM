import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function Contact() {
  const [contactData, setContactData] = useState(null);
  const [faqData, setFaqData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContactData();
  }, []);

  const fetchContactData = async () => {
    try {
      const response = await api.get('/legal-pages');
      if (response.data.success) {
        setContactData(response.data.data.contactInfo);
        setFaqData(response.data.data.faq);
      }
    } catch (error) {
      console.error('Error fetching contact data:', error);
      // Use default data if API fails
      setContactData({
        email: 'info@store.com',
        phone: '+966 50 000 0000',
        address: 'الرياض، المملكة العربية السعودية',
        companyName: '',
        workingHours: 'السبت - الخميس: 9 صباحاً - 6 مساءً',
        supportDescription: 'متاح على مدار الساعة عبر الواتساب والبريد الإلكتروني'
      });
      setFaqData({
        enabled: true,
        title: 'الأسئلة الشائعة',
        questions: [
          { question: 'كم تستغرق مدة التوصيل؟', answer: 'عادة من 2-5 أيام عمل حسب موقعك' },
          { question: 'هل يمكنني إرجاع المنتج؟', answer: 'نعم، خلال 14 يوم من تاريخ الاستلام' },
          { question: 'هل المنتجات أصلية؟', answer: 'نعم، جميع منتجاتنا أصلية 100% مع ضمان الوكيل' },
          { question: 'ما هي طرق الدفع المتاحة؟', answer: 'الدفع عند الاستلام، البطاقات الائتمانية، Tabby' }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">تواصل معنا</h1>
          <p className="text-xl text-primary-100">نحن هنا لمساعدتك</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">معلومات التواصل</h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  📱
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">الهاتف</h3>
                  <p className="text-gray-600">{contactData?.phone || '+966 50 000 0000'}</p>
                  <p className="text-sm text-gray-500 mt-1">{contactData?.workingHours || 'السبت - الخميس: 9 صباحاً - 6 مساءً'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  📧
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">البريد الإلكتروني</h3>
                  <p className="text-gray-600">{contactData?.email || 'info@store.com'}</p>
                  <p className="text-sm text-gray-500 mt-1">نرد خلال 24 ساعة</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  💬
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">الدعم الفني</h3>
                  <p className="text-gray-600">{contactData?.supportDescription || 'متاح على مدار الساعة عبر الواتساب والبريد الإلكتروني'}</p>
                </div>
              </div>

              <div className="flex items-start gap-4 bg-white p-6 rounded-xl shadow-sm">
                <div className="flex-shrink-0 w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center text-2xl">
                  🏢
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">العنوان</h3>
                  <p className="text-gray-600">{contactData?.address || 'الرياض، المملكة العربية السعودية'}</p>
                  <p className="text-sm text-gray-500 mt-1">{contactData?.companyName || ''}</p>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="mt-8 bg-white p-6 rounded-xl shadow-sm">
              <h3 className="font-bold text-lg mb-4">تابعنا على</h3>
              <div className="flex gap-4">
                <a href="#" className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition">
                  <span className="text-2xl">📘</span>
                </a>
                <a href="#" className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition">
                  <span className="text-2xl">📷</span>
                </a>
                <a href="#" className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition">
                  <span className="text-2xl">🐦</span>
                </a>
                <a href="#" className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center hover:bg-primary-200 transition">
                  <span className="text-2xl">💼</span>
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white p-8 rounded-xl shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">أرسل لنا رسالة</h2>
            
            <form className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل *
                </label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="أدخل اسمك"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني *
                </label>
                <input
                  type="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="05xxxxxxxx"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموضوع *
                </label>
                <select
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">اختر الموضوع</option>
                  <option value="order">استفسار عن طلب</option>
                  <option value="product">استفسار عن منتج</option>
                  <option value="technical">دعم فني</option>
                  <option value="complaint">شكوى</option>
                  <option value="suggestion">اقتراح</option>
                  <option value="other">أخرى</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الرسالة *
                </label>
                <textarea
                  required
                  rows="5"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                  placeholder="اكتب رسالتك هنا..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-3 rounded-lg font-bold hover:bg-primary-700 transition"
              >
                إرسال الرسالة
              </button>
            </form>
          </div>
        </div>

        {/* FAQ Section */}
        {faqData?.enabled && (
          <div className="mt-12 bg-white rounded-xl shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              {faqData.title || 'الأسئلة الشائعة'}
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              {(faqData.questions || []).sort((a, b) => (a.order || 0) - (b.order || 0)).map((faq, index) => (
                <div key={index}>
                  <h3 className="font-bold text-lg mb-2">{faq.question}</h3>
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
