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
  }, []);

  const fetchFooterData = async () => {
    try {
      const response = await api.get('/footer');
      setFooterData(response.data.data);
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
          logo: '/logo.png'
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
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <footer className="bg-gradient-to-b from-slate-900 to-black text-white mt-16">
        <div className="container mx-auto px-4 py-12 text-center">
          <div className="animate-pulse">جاري التحميل...</div>
        </div>
      </footer>
    );
  }

  if (!footerData) return null;

  return (
    <footer className="bg-gradient-to-b from-slate-900 to-black text-white mt-16">
      {/* Newsletter */}
      {footerData.newsletter?.enabled && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 py-10">
          <div className="container mx-auto px-4 max-w-lg text-center">
            <h3 className="text-xl font-bold mb-2">{footerData.newsletter.title}</h3>
            <p className="text-sm text-primary-100 mb-5">{footerData.newsletter.subtitle}</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="بريدك الإلكتروني"
                className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur border border-white/20 focus:outline-none focus:border-white text-white placeholder:text-white/60 text-sm"
              />
              <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-bold hover:bg-primary-50 transition whitespace-nowrap">
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
            <img 
              src={footerData.company?.logo || '/logo.png'} 
              alt={footerData.company?.name || 'أبعاد التواصل'} 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-12 h-12 bg-primary-600 rounded-lg items-center justify-center text-white font-bold text-xl hidden">
              {footerData.company?.name?.charAt(0) || 'أ'}
            </div>
            <div>
              <div className="text-lg font-bold">{footerData.company?.name || ''}</div>
              <div className="text-xs text-gray-400">{footerData.company?.tagline || ''}</div>
            </div>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed mb-5">
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
              <img 
                src={footerData.company?.logo || '/logo.png'} 
                alt={footerData.company?.name || 'أبعاد التواصل'} 
                className="w-12 h-12 object-contain"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="w-12 h-12 bg-primary-600 rounded-lg items-center justify-center text-white font-bold text-xl hidden">
                {footerData.company?.name?.charAt(0) || 'أ'}
              </div>
              <div>
                <div className="text-lg font-bold">{footerData.company?.name || ''}</div>
                <div className="text-xs text-gray-400">{footerData.company?.tagline || ''}</div>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-5">
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
              <h4 className="font-bold mb-4 text-primary-400">{footerData.quickLinks.title}</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
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
                        className="hover:text-primary-400 transition"
                      >
                        {link.title}
                      </a>
                    ) : (
                      <Link to={link.url} className="hover:text-primary-400 transition">
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
              <h4 className="font-bold mb-4 text-primary-400">{footerData.supportLinks.title}</h4>
              <ul className="space-y-2.5 text-sm text-gray-400">
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
                        className="hover:text-primary-400 transition"
                      >
                        {link.title}
                      </a>
                    ) : (
                      <Link to={link.url} className="hover:text-primary-400 transition">
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
            <h4 className="font-bold mb-4 text-primary-400">تواصل معنا</h4>
            <ul className="space-y-3 text-sm text-gray-400">
              {footerData.contact?.phone && (
                <li className="flex items-center gap-2">
                  <FiPhone className="text-primary-400" />
                  <a href={`tel:${footerData.contact.phone}`} className="hover:text-primary-400 transition" dir="ltr">
                    {footerData.contact.phone}
                  </a>
                </li>
              )}
              {footerData.contact?.email && (
                <li className="flex items-center gap-2">
                  <FiMail className="text-primary-400" />
                  <a href={`mailto:${footerData.contact.email}`} className="hover:text-primary-400 transition">
                    {footerData.contact.email}
                  </a>
                </li>
              )}
              {footerData.contact?.address && (
                <li className="text-xs text-gray-500 mt-2">
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
        <div className="text-center pt-8 border-t border-white/10">
          <p className="text-sm text-gray-400">
            {footerData.copyright?.showYear && `© ${currentYear} `}
            {footerData.copyright?.text || 'أبعاد التواصل. جميع الحقوق محفوظة.'}
          </p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;

