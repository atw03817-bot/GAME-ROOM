import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../products/ProductCard';
import api from '../../utils/api';

export default function DealsSection() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    enabled: true,
    title: 'عروض حصرية',
    subtitle: 'خصومات تصل إلى {maxDiscount}% على أفضل الأجهزة',
    bannerTitle: 'عروض لفترة محدودة',
    bannerSubtitle: 'لا تفوت الفرصة - العروض تنتهي قريباً',
    productsCount: 6,
    ctaText: 'اكتشف جميع العروض',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  useEffect(() => {
    if (settings.productsCount) {
      fetchDeals();
    }
  }, [settings.productsCount]);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/homepage/featured-deals');
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      fetchDeals();
    }
  };

  const fetchDeals = async () => {
    try {
      const { data } = await api.get('/products', { params: { limit: 1000 } });
      const productsList = Array.isArray(data) ? data : (data.products || []);
      
      const dealsProducts = productsList
        .filter((p) => p.originalPrice && p.originalPrice > p.price)
        .sort((a, b) => {
          const discountA = ((a.originalPrice - a.price) / a.originalPrice) * 100;
          const discountB = ((b.originalPrice - b.price) / b.originalPrice) * 100;
          return discountB - discountA;
        })
        .slice(0, settings.productsCount || 6);
      
      setDeals(dealsProducts);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!settings.enabled || loading || deals.length === 0) return null;

  const maxDiscount = Math.max(...deals.map(d => 
    Math.round(((d.originalPrice - d.price) / d.originalPrice) * 100)
  ));

  return (
    <section className="py-8 md:py-12 bg-[#111111]" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-3xl">🔥</span>
              <h2 className="text-xl md:text-3xl font-bold text-white">
                {settings.title}
              </h2>
            </div>
            <p className="text-gray-300 text-xs md:text-sm">
              {settings.subtitle.replace('{maxDiscount}', maxDiscount.toString())}
            </p>
          </div>
          <Link to="/deals">
            <button className="px-4 py-2 bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white rounded-lg hover:opacity-90 transition text-sm md:text-base">
              <span>عرض الكل</span>
            </button>
          </Link>
        </div>

        {/* Deals Banner */}
        <div className="bg-gradient-to-r from-[#E08713] to-[#C72C15] rounded-xl p-4 md:p-6 mb-6 text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)'
          }}></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-lg md:text-2xl font-bold mb-1 md:mb-2">
                {settings.bannerTitle}
              </h3>
              <p className="text-xs md:text-sm text-white/90">
                {settings.bannerSubtitle}
              </p>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-lg p-2 md:p-4">
              <div className="text-2xl md:text-4xl font-bold">{maxDiscount}%</div>
              <div className="text-[10px] md:text-xs">خصم</div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {deals.map((product) => (
            <div key={product._id}>
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-6 md:mt-8">
          <Link to="/deals">
            <button className="px-6 py-3 bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white rounded-lg hover:opacity-90 transition font-semibold">
              <span>🎁</span>
              <span className="mx-2">{settings.ctaText}</span>
              <svg className="inline w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
