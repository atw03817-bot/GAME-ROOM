import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSave, FiPlus, FiTrash2, FiSettings, FiArrowLeft } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function FooterSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [footerData, setFooterData] = useState({
    newsletter: {
      enabled: true,
      title: 'اشترك معنا',
      subtitle: 'احصل على أحدث العروض والمنتجات',
      buttonText: 'اشترك'
    },
    company: {
      name: '',
      tagline: '',
      description: '',
      logo: ''
    },
    contact: {
      phone: '+966 50 000 0000',
      email: 'info@store.com',
      address: 'الرياض، المملكة العربية السعودية'
    },
    social: {
      instagram: 'https://instagram.com',
      twitter: 'https://twitter.com',
      facebook: 'https://facebook.com',
      youtube: '',
      tiktok: '',
      snapchat: ''
    },
    features: [
      { icon: '🚚', title: 'شحن مجاني', subtitle: 'للطلبات فوق 200 ر.س' },
      { icon: '✅', title: 'ضمان الجودة', subtitle: 'منتجات أصلية 100%' },
      { icon: '🔄', title: 'إرجاع مجاني', subtitle: 'خلال 14 يوم' },
      { icon: '💳', title: 'دفع آمن', subtitle: 'حماية كاملة' }
    ],
    paymentMethods: {
      enabled: true,
      title: 'طرق الدفع المقبولة',
      methods: [
        {
          name: 'mada',
          image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/mada_mini.png',
          alt: 'مدى',
          enabled: true
        },
        {
          name: 'visa',
          image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/credit_card_mini.png',
          alt: 'فيزا وماستركارد',
          enabled: true
        },
        {
          name: 'stc_pay',
          image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/stc_pay_mini.png',
          alt: 'STC Pay',
          enabled: true
        },
        {
          name: 'apple_pay',
          image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/apple_pay_mini.png',
          alt: 'Apple Pay',
          enabled: true
        },
        {
          name: 'cod',
          image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/payment/cod_mini.png',
          alt: 'الدفع عند الاستلام',
          enabled: true
        },
        {
          name: 'sbc',
          image: 'https://cdn.salla.network/cdn-cgi/image/fit=scale-down,width=58,height=58,onerror=redirect,format=auto/images/sbc.png',
          alt: 'السجل التجاري السعودي',
          link: 'https://eauthenticate.saudibusiness.gov.sa/certificate-details/0000193908',
          enabled: true
        }
      ]
    },
    copyright: {
      text: 'أبعاد التواصل. جميع الحقوق محفوظة.',
      showYear: true
    },
    quickLinks: {
      enabled: true,
      title: 'روابط سريعة',
      links: [
        { title: 'الرئيسية', url: '/', external: false },
        { title: 'جميع المنتجات', url: '/products', external: false },
        { title: 'من نحن', url: '/about', external: false },
        { title: 'اتصل بنا', url: '/contact', external: false }
      ]
    },
    supportLinks: {
      enabled: true,
      title: 'خدمة العملاء',
      links: [
        { title: 'حسابي', url: '/account', external: false },
        { title: 'طلباتي', url: '/orders', external: false },
        { title: 'الشروط والأحكام', url: '/terms', external: false },
        { title: 'سياسة الخصوصية', url: '/privacy', external: false }
      ]
    }
  });

  useEffect(() => {
    fetchFooterData();
  }, []);

  const fetchFooterData = async () => {
    try {
      const response = await api.get('/footer');
      if (response.data.success) {
        setFooterData(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching footer data:', error);
      toast.error('خطأ في جلب بيانات Footer');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Clean data before sending
      const cleanData = {
        ...footerData,
        // Ensure paymentMethods has proper structure
        paymentMethods: footerData.paymentMethods ? {
          enabled: footerData.paymentMethods.enabled || false,
          title: footerData.paymentMethods.title || 'طرق الدفع المقبولة',
          methods: (footerData.paymentMethods.methods || []).map(method => ({
            name: method.name || '',
            image: method.image || '',
            alt: method.alt || '',
            link: method.link || '',
            enabled: method.enabled !== false
          }))
        } : {
          enabled: false,
          title: 'طرق الدفع المقبولة',
          methods: []
        }
      };
      
      const response = await api.put('/footer', cleanData);
      if (response.data.success) {
        toast.success('تم حفظ إعدادات Footer بنجاح');
      }
    } catch (error) {
      console.error('Error saving footer data:', error);
      
      let errorMessage = 'خطأ في حفظ إعدادات Footer';
      
      if (error.response) {
        const { status, data } = error.response;
        switch (status) {
          case 400:
            errorMessage = data?.message || 'بيانات غير صحيحة';
            break;
          case 500:
            errorMessage = data?.message || 'خطأ في الخادم. تحقق من أن الباك إند محدث';
            break;
          default:
            errorMessage = data?.message || error.message;
        }
      } else if (error.request) {
        errorMessage = 'لا يمكن الاتصال بالخادم';
      }
      
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFooterData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const addFeature = () => {
    setFooterData(prev => ({
      ...prev,
      features: [
        ...prev.features,
        { icon: '⭐', title: 'ميزة جديدة', subtitle: 'وصف الميزة' }
      ]
    }));
  };

  const removeFeature = (index) => {
    setFooterData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const updateFeature = (index, field, value) => {
    setFooterData(prev => ({
      ...prev,
      features: prev.features.map((feature, i) => 
        i === index ? { ...feature, [field]: value } : feature
      )
    }));
  };

  // Quick Links Functions
  const addQuickLink = () => {
    setFooterData(prev => ({
      ...prev,
      quickLinks: {
        ...prev.quickLinks,
        links: [
          ...(prev.quickLinks?.links || []),
          { title: 'رابط جديد', url: '/', external: false }
        ]
      }
    }));
  };

  const removeQuickLink = (index) => {
    setFooterData(prev => ({
      ...prev,
      quickLinks: {
        ...prev.quickLinks,
        links: (prev.quickLinks?.links || []).filter((_, i) => i !== index)
      }
    }));
  };

  const updateQuickLink = (index, field, value) => {
    setFooterData(prev => ({
      ...prev,
      quickLinks: {
        ...prev.quickLinks,
        links: (prev.quickLinks?.links || []).map((link, i) => 
          i === index ? { ...link, [field]: value } : link
        )
      }
    }));
  };

  // Support Links Functions
  const addSupportLink = () => {
    setFooterData(prev => ({
      ...prev,
      supportLinks: {
        ...prev.supportLinks,
        links: [
          ...(prev.supportLinks?.links || []),
          { title: 'رابط جديد', url: '/', external: false }
        ]
      }
    }));
  };

  const removeSupportLink = (index) => {
    setFooterData(prev => ({
      ...prev,
      supportLinks: {
        ...prev.supportLinks,
        links: (prev.supportLinks?.links || []).filter((_, i) => i !== index)
      }
    }));
  };

  const updateSupportLink = (index, field, value) => {
    setFooterData(prev => ({
      ...prev,
      supportLinks: {
        ...prev.supportLinks,
        links: (prev.supportLinks?.links || []).map((link, i) => 
          i === index ? { ...link, [field]: value } : link
        )
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/settings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          العودة إلى مركز الإعدادات
        </button>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FiSettings className="text-primary-600" />
            إعدادات Footer
          </h1>
          <p className="text-gray-600">تخصيص محتوى وشكل Footer الموقع</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
        >
          <FiSave size={18} />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      <div className="space-y-8">
        {/* Newsletter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">قسم النشرة البريدية</h2>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={footerData.newsletter.enabled}
                  onChange={(e) => handleInputChange('newsletter', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
              <span className="font-medium">تفعيل قسم النشرة البريدية</span>
            </div>

            {footerData.newsletter.enabled && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
                  <input
                    type="text"
                    value={footerData.newsletter.title}
                    onChange={(e) => handleInputChange('newsletter', 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">النص الفرعي</label>
                  <input
                    type="text"
                    value={footerData.newsletter.subtitle}
                    onChange={(e) => handleInputChange('newsletter', 'subtitle', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نص الزر</label>
                  <input
                    type="text"
                    value={footerData.newsletter.buttonText}
                    onChange={(e) => handleInputChange('newsletter', 'buttonText', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Company Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">معلومات الشركة</h2>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم الشركة</label>
                <input
                  type="text"
                  value={footerData.company.name}
                  onChange={(e) => handleInputChange('company', 'name', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الشعار</label>
                <input
                  type="text"
                  value={footerData.company.tagline}
                  onChange={(e) => handleInputChange('company', 'tagline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">وصف الشركة</label>
              <textarea
                value={footerData.company.description}
                onChange={(e) => handleInputChange('company', 'description', e.target.value)}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مسار اللوجو</label>
              <input
                type="text"
                value={footerData.company.logo}
                onChange={(e) => handleInputChange('company', 'logo', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="/logo.png"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">معلومات الاتصال</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رقم الهاتف</label>
              <input
                type="text"
                value={footerData.contact.phone}
                onChange={(e) => handleInputChange('contact', 'phone', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني</label>
              <input
                type="email"
                value={footerData.contact.email}
                onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">العنوان</label>
              <input
                type="text"
                value={footerData.contact.address}
                onChange={(e) => handleInputChange('contact', 'address', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Social Media */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">وسائل التواصل الاجتماعي</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">إنستغرام</label>
              <input
                type="url"
                value={footerData.social.instagram}
                onChange={(e) => handleInputChange('social', 'instagram', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">تويتر</label>
              <input
                type="url"
                value={footerData.social.twitter}
                onChange={(e) => handleInputChange('social', 'twitter', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">فيسبوك</label>
              <input
                type="url"
                value={footerData.social.facebook}
                onChange={(e) => handleInputChange('social', 'facebook', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://facebook.com/page"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">يوتيوب</label>
              <input
                type="url"
                value={footerData.social.youtube}
                onChange={(e) => handleInputChange('social', 'youtube', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="https://youtube.com/channel"
              />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">الميزات</h2>
            <button
              onClick={addFeature}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <FiPlus size={16} />
              إضافة ميزة
            </button>
          </div>
          
          <div className="space-y-4">
            {footerData.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الأيقونة</label>
                    <input
                      type="text"
                      value={feature.icon}
                      onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="🚚"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">العنوان</label>
                    <input
                      type="text"
                      value={feature.title}
                      onChange={(e) => updateFeature(index, 'title', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                    <input
                      type="text"
                      value={feature.subtitle}
                      onChange={(e) => updateFeature(index, 'subtitle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <button
                  onClick={() => removeFeature(index)}
                  className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Links Management */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">الروابط السريعة</h2>
            <button
              onClick={addQuickLink}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <FiPlus size={16} />
              إضافة رابط
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={footerData.quickLinks?.enabled || false}
                  onChange={(e) => handleInputChange('quickLinks', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
              <span className="font-medium">تفعيل قسم الروابط السريعة</span>
            </div>

            {footerData.quickLinks?.enabled && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان القسم</label>
                  <input
                    type="text"
                    value={footerData.quickLinks?.title || 'روابط سريعة'}
                    onChange={(e) => handleInputChange('quickLinks', 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {(footerData.quickLinks?.links || []).map((link, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الرابط</label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateQuickLink(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="الرئيسية"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الرابط</label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateQuickLink(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="/"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={link.external || false}
                          onChange={(e) => updateQuickLink(index, 'external', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                      <span className="text-xs text-gray-600">خارجي</span>
                    </div>
                    <button
                      onClick={() => removeQuickLink(index)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Support Links Management */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">روابط خدمة العملاء</h2>
            <button
              onClick={addSupportLink}
              className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition"
            >
              <FiPlus size={16} />
              إضافة رابط
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-4">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={footerData.supportLinks?.enabled || false}
                  onChange={(e) => handleInputChange('supportLinks', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
              <span className="font-medium">تفعيل قسم خدمة العملاء</span>
            </div>

            {footerData.supportLinks?.enabled && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">عنوان القسم</label>
                  <input
                    type="text"
                    value={footerData.supportLinks?.title || 'خدمة العملاء'}
                    onChange={(e) => handleInputChange('supportLinks', 'title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                {(footerData.supportLinks?.links || []).map((link, index) => (
                  <div key={index} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الرابط</label>
                        <input
                          type="text"
                          value={link.title}
                          onChange={(e) => updateSupportLink(index, 'title', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="حسابي"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الرابط</label>
                        <input
                          type="text"
                          value={link.url}
                          onChange={(e) => updateSupportLink(index, 'url', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          placeholder="/account"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={link.external || false}
                          onChange={(e) => updateSupportLink(index, 'external', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-8 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-600"></div>
                      </label>
                      <span className="text-xs text-gray-600">خارجي</span>
                    </div>
                    <button
                      onClick={() => removeSupportLink(index)}
                      className="text-red-600 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Payment Methods */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">طرق الدفع المقبولة</h2>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={footerData.paymentMethods?.enabled || false}
                onChange={(e) => handleInputChange('paymentMethods', 'enabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          {footerData.paymentMethods?.enabled && (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان القسم</label>
                <input
                  type="text"
                  value={footerData.paymentMethods?.title || 'طرق الدفع المقبولة'}
                  onChange={(e) => handleInputChange('paymentMethods', 'title', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-800">طرق الدفع</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newMethod = {
                        name: '',
                        image: '',
                        alt: '',
                        link: '',
                        enabled: true
                      };
                      const updatedMethods = [...(footerData.paymentMethods?.methods || []), newMethod];
                      handleInputChange('paymentMethods', 'methods', updatedMethods);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    إضافة طريقة دفع
                  </button>
                </div>

                {footerData.paymentMethods?.methods?.map((method, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-medium text-gray-800">طريقة الدفع #{index + 1}</h4>
                      <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={method.enabled}
                            onChange={(e) => {
                              const updatedMethods = [...footerData.paymentMethods.methods];
                              updatedMethods[index].enabled = e.target.checked;
                              handleInputChange('paymentMethods', 'methods', updatedMethods);
                            }}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            const updatedMethods = footerData.paymentMethods.methods.filter((_, i) => i !== index);
                            handleInputChange('paymentMethods', 'methods', updatedMethods);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">اسم طريقة الدفع</label>
                        <input
                          type="text"
                          value={method.name}
                          onChange={(e) => {
                            const updatedMethods = [...footerData.paymentMethods.methods];
                            updatedMethods[index].name = e.target.value;
                            handleInputChange('paymentMethods', 'methods', updatedMethods);
                          }}
                          placeholder="mada, visa, stc_pay..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">النص البديل</label>
                        <input
                          type="text"
                          value={method.alt}
                          onChange={(e) => {
                            const updatedMethods = [...footerData.paymentMethods.methods];
                            updatedMethods[index].alt = e.target.value;
                            handleInputChange('paymentMethods', 'methods', updatedMethods);
                          }}
                          placeholder="مدى، فيزا، STC Pay..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">رابط الصورة</label>
                        <input
                          type="url"
                          value={method.image}
                          onChange={(e) => {
                            const updatedMethods = [...footerData.paymentMethods.methods];
                            updatedMethods[index].image = e.target.value;
                            handleInputChange('paymentMethods', 'methods', updatedMethods);
                          }}
                          placeholder="https://..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">رابط خارجي (اختياري)</label>
                        <input
                          type="url"
                          value={method.link || ''}
                          onChange={(e) => {
                            const updatedMethods = [...footerData.paymentMethods.methods];
                            updatedMethods[index].link = e.target.value;
                            handleInputChange('paymentMethods', 'methods', updatedMethods);
                          }}
                          placeholder="https://... (للسجل التجاري مثلاً)"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    {method.image && (
                      <div className="mt-3">
                        <p className="text-sm text-gray-600 mb-2">معاينة:</p>
                        <img
                          src={method.image}
                          alt={method.alt}
                          className="w-16 h-10 object-contain border border-gray-200 rounded-lg bg-white p-2"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}

                {(!footerData.paymentMethods?.methods || footerData.paymentMethods.methods.length === 0) && (
                  <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                    لم يتم إضافة طرق دفع بعد
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Copyright */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">حقوق النشر</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نص حقوق النشر</label>
              <input
                type="text"
                value={footerData.copyright.text}
                onChange={(e) => handleInputChange('copyright', 'text', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center gap-3">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={footerData.copyright.showYear}
                  onChange={(e) => handleInputChange('copyright', 'showYear', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
              <span className="font-medium">إظهار السنة الحالية</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FooterSettings;