import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FiMail, FiPhone, FiInstagram, FiFacebook } from 'react-icons/fi';
import { SiTiktok, SiSnapchat } from 'react-icons/si';
import api from '../../utils/api';

function Footer() {
  const currentYear = new Date().getFullYear();
  const [footerData, setFooterData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFooterData();
    
    // الاستماع لتغييرات إعدادات الثيم
    const handleThemeSettingsChange = (event) => {
      console.log('Footer: Theme settings changed:', event.detail);
      if (event.detail.logo) {
        setFooterData(prev => ({
          ...prev,
          company: {
            ...prev?.company,
            logo: event.detail.logo
          }
        }));
      }
    };

    window.addEventListener('headerSettingsChanged', handleThemeSettingsChange);
    
    return () => {
      window.removeEventListener('headerSettingsChanged', handleThemeSettingsChange);
    };
  }, []);

  const fetchFooterData = async () => {
    try {
      // جلب بيانات الـ footer
      const footerResponse = await api.get('/footer');
      console.log('Footer: Loaded footer data from API:', footerResponse.data.data);
      
      // جلب بيانات الثيم للحصول على اللوجو
      const themeResponse = await api.get('/theme');
      console.log('Footer: Loaded theme data from API:', themeResponse.data.data);
      
      let footerData = footerResponse.data.data;
      
      // إذا كان هناك لوجو في إعدادات الثيم، استخدمه
      if (themeResponse.data.success && themeResponse.data.data.header?.logo) {
        footerData = {
          ...footerData,
          company: {
            ...footerData.company,
            logo: themeResponse.data.data.header.logo
          }
        };
        console.log('Footer: Using logo from theme settings:', themeResponse.data.data.header.logo);
      }
      
      setFooterData(footerData);
    } catch (error) {
      console.error('Error fetching footer data:', error);
      // Use default data if API fails
      setFooterData({
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
          logo: '' // إزالة الشعار الافتراضي
        },
        contact: {
          phone: '+966 50 000 0000',
          email: 'info@store.com',
          address: 'الرياض، المملكة العربية السعودية'
        },
        social: {
          instagram: 'https://instagram.com',
          twitter: 'https://tiktok.com',      // سيظهر كأيقونة TikTok
          facebook: 'https://facebook.com',
          youtube: 'https://snapchat.com',    // سيظهر كأيقونة Snapchat
          tiktok: '',
          snapchat: ''
        },
        features: [
          { icon: '🚚', title: 'شحن مجاني', subtitle: 'للطلبات فوق 200 ر.س' },
          { icon: '✅', title: 'ضمان الجودة', subtitle: 'منتجات أصلية 100%' },
          { icon: '🔄', title: 'إرجاع مجاني', subtitle: 'خلال 14 يوم' },
          { icon: '💳', title: 'دفع آمن', subtitle: 'حماية كاملة' }
        ],
        copyright: {
          text: 'جيم روم. جميع الحقوق محفوظة.',
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <footer className="text-white mt-16" style={{backgroundImage: 'linear-gradient(90deg, rgba(224, 135, 19, 0.99) 0%, rgba(199, 44, 21, 1) 100%)'}}>
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">جاري التحميل...</div>
        </div>
      </footer>
    );
  }

  if (!footerData) return null;

  return (
    <footer className="text-white mt-16" style={{backgroundImage: 'linear-gradient(90deg, rgba(224, 135, 19, 0.99) 0%, rgba(199, 44, 21, 1) 100%)'}}>
      {/* Newsletter */}
      {footerData.newsletter?.enabled && (
        <div className="bg-black/10 py-10">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <h3 className="text-xl font-bold mb-2">{footerData.newsletter.title}</h3>
            <p className="text-sm text-white/90 mb-5">{footerData.newsletter.subtitle}</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 px-4 py-3 rounded-lg bg-white/20 backdrop-blur border border-white/30 focus:outline-none focus:border-white text-white placeholder:text-white/70 text-sm"
              />
              <button className="bg-white text-black px-6 py-3 rounded-lg font-bold hover:bg-gray-100 transition whitespace-nowrap">
                {footerData.newsletter.buttonText}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Brand - Mobile Only */}
        <div className="md:hidden text-right mb-10">
          <div className="flex items-center gap-3 mb-4">
            {footerData.company?.logo && (
              <img 
                src={footerData.company.logo} 
                alt={footerData.company?.name || 'جيم روم'} 
                className="w-16 h-16 object-contain"
                onError={(e) => e.target.style.display = 'none'}
              />
            )}
            <div>
              <div className="text-lg font-bold text-white">{footerData.company?.name || ''}</div>
              <div className="text-xs text-white/70">{footerData.company?.tagline || ''}</div>
            </div>
          </div>
          <p className="text-sm text-white/80 leading-relaxed mb-5">
            {footerData.company?.description || ''}
          </p>
          
          {/* Social Media - Mobile */}
          <div className="flex gap-3">
            {footerData.social?.instagram && (
              <a
                href={footerData.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-600 transition"
              >
                <FiInstagram size={20} />
              </a>
            )}
            {footerData.social?.twitter && (
              <a
                href={footerData.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-600 transition"
                title="TikTok"
              >
                <SiTiktok size={20} />
              </a>
            )}
            {footerData.social?.facebook && (
              <a
                href={footerData.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-600 transition"
              >
                <FiFacebook size={20} />
              </a>
            )}
            {footerData.social?.youtube && (
              <a
                href={footerData.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-600 transition"
                title="Snapchat"
              >
                <SiSnapchat size={20} />
              </a>
            )}
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-10 text-right">
          {/* Brand - Desktop */}
          <div className="hidden md:block">
            <div className="flex items-center gap-3 mb-4">
              {footerData.company?.logo && (
                <img 
                  src={footerData.company.logo} 
                  alt={footerData.company?.name || 'جيم روم'} 
                  className="w-16 h-16 object-contain"
                  onError={(e) => e.target.style.display = 'none'}
                />
              )}
              <div>
                <div className="text-lg font-bold text-white">{footerData.company?.name || ''}</div>
                <div className="text-xs text-white/70">{footerData.company?.tagline || ''}</div>
              </div>
            </div>
            <p className="text-sm text-white/80 leading-relaxed mb-5">
              {footerData.company?.description || ''}
            </p>
            
            {/* Social Media - Desktop */}
            <div className="flex gap-3">
              {footerData.social?.instagram && (
                <a
                  href={footerData.social.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-600 transition"
                >
                  <FiInstagram size={18} />
                </a>
              )}
              {footerData.social?.twitter && (
                <a
                  href={footerData.social.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-600 transition"
                  title="TikTok"
                >
                  <SiTiktok size={18} />
                </a>
              )}
              {footerData.social?.facebook && (
                <a
                  href={footerData.social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-600 transition"
                >
                  <FiFacebook size={18} />
                </a>
              )}
              {footerData.social?.youtube && (
                <a
                  href={footerData.social.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary-600 transition"
                  title="Snapchat"
                >
                  <SiSnapchat size={18} />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          {footerData.quickLinks?.enabled && (
            <div>
              <h4 className="font-bold mb-4 text-white">{footerData.quickLinks.title}</h4>
              <ul className="space-y-2.5 text-sm text-white/80">
                {(footerData.quickLinks.links || [
                  { title: 'الرئيسية', url: '/', external: false },
                  { title: 'جميع المنتجات', url: '/products', external: false },
                  { title: 'من نحن', url: '/about', external: false },
                  { title: 'اتصل بنا', url: '/contact', external: false }
                ]).map((link, index) => (
                  <li key={index}>
                    {link.external ? (
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-white/80 transition"
                      >
                        {link.title}
                      </a>
                    ) : (
                      <Link to={link.url} className="hover:text-white/80 transition">
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Support Links */}
          {footerData.supportLinks?.enabled && (
            <div>
              <h4 className="font-bold mb-4 text-white">{footerData.supportLinks.title}</h4>
              <ul className="space-y-2.5 text-sm text-white/80">
                {(footerData.supportLinks.links || [
                  { title: 'حسابي', url: '/account', external: false },
                  { title: 'طلباتي', url: '/orders', external: false },
                  { title: 'الشروط والأحكام', url: '/terms', external: false },
                  { title: 'سياسة الخصوصية', url: '/privacy', external: false }
                ]).map((link, index) => (
                  <li key={index}>
                    {link.external ? (
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:text-white/80 transition"
                      >
                        {link.title}
                      </a>
                    ) : (
                      <Link to={link.url} className="hover:text-white/80 transition">
                        {link.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-4 text-white">تواصل معنا</h4>
            <ul className="space-y-3 text-sm text-white/80">
              {footerData.contact?.phone && (
                <li className="flex items-center gap-2">
                  <FiPhone className="text-white" />
                  <a href={`tel:${footerData.contact.phone}`} className="hover:text-white/80 transition" dir="ltr">
                    {footerData.contact.phone}
                  </a>
                </li>
              )}
              {footerData.contact?.email && (
                <li className="flex items-center gap-2">
                  <FiMail className="text-white" />
                  <a href={`mailto:${footerData.contact.email}`} className="hover:text-white/80 transition">
                    {footerData.contact.email}
                  </a>
                </li>
              )}
              {footerData.contact?.address && (
                <li className="text-xs text-white/60 mt-2">
                  {footerData.contact.address}
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Features */}
        {footerData.features && footerData.features.length > 0 && (
          <div className={`grid grid-cols-2 md:grid-cols-${Math.min(footerData.features.length, 4)} gap-4 py-8 border-t border-white/10`}>
            {footerData.features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <div className="text-sm font-medium">{feature.title}</div>
                <div className="text-xs text-gray-400">{feature.subtitle}</div>
              </div>
            ))}
          </div>
        )}

        {/* Payment Methods */}
        {footerData.paymentMethods?.enabled && footerData.paymentMethods?.methods?.length > 0 && (
          <div className="py-6 border-t border-white/10">
            <div className="text-center">
              <div className="flex flex-wrap items-center justify-center gap-1.5">
                {footerData.paymentMethods.methods
                  .filter(method => method.enabled)
                  .map((method, index) => {
                    const content = (
                      <img
                        src={method.image}
                        alt={method.alt}
                        className="w-full h-full object-contain"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    );

                    if (method.link) {
                      return (
                        <a
                          key={index}
                          href={method.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-16 h-10 bg-white rounded-lg p-2 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                          title={method.alt}
                        >
                          {content}
                        </a>
                      );
                    }

                    return (
                      <div
                        key={index}
                        className="w-16 h-10 bg-white rounded-lg p-2 flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
                        title={method.alt}
                      >
                        {content}
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Copyright */}
        <div className="text-center pt-8 border-t border-white/20">
          <p className="text-sm text-white/80">
            {footerData.copyright?.showYear && `© ${currentYear} `}
            {footerData.copyright?.text || 'جيم روم. جميع الحقوق محفوظة.'}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

