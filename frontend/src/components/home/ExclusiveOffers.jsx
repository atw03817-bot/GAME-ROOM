import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiClock, FiZap, FiGift } from 'react-icons/fi';
import api from '../../utils/api';

export default function ExclusiveOffers() {
  const [offersData, setOffersData] = useState(null);
  const [enabled, setEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data } = await api.get('/homepage/exclusive-offers');
      setOffersData(data);
      if (data.enabled !== undefined) {
        setEnabled(data.enabled);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !enabled) return null;

  const offers = [
    {
      id: 1,
      title: offersData?.offer1?.title || 'عرض الجمعة البيضاء',
      titleEn: offersData?.offer1?.titleEn || 'Black Friday Deal',
      discount: offersData?.offer1?.discount || '50%',
      description: offersData?.offer1?.description || 'خصم يصل إلى 50% على أجهزة مختارة',
      descriptionEn: offersData?.offer1?.descriptionEn || 'Up to 50% off on selected devices',
      icon: FiZap,
      color: 'from-orange-500 to-red-600',
      bgPattern: 'bg-gradient-to-br',
      link: offersData?.offer1?.link || '/deals?category=black-friday',
    },
    {
      id: 2,
      title: offersData?.offer2?.title || 'هدية مجانية',
      titleEn: offersData?.offer2?.titleEn || 'Free Gift',
      discount: offersData?.offer2?.discount || 'هدية',
      description: offersData?.offer2?.description || 'احصل على سماعات لاسلكية مع كل جهاز',
      descriptionEn: offersData?.offer2?.descriptionEn || 'Get free wireless earbuds with every device',
      icon: FiGift,
      color: 'from-purple-500 to-pink-600',
      bgPattern: 'bg-gradient-to-br',
      link: offersData?.offer2?.link || '/deals?category=free-gift',
    },
    {
      id: 3,
      title: offersData?.offer3?.title || 'عرض محدود',
      titleEn: offersData?.offer3?.titleEn || 'Limited Offer',
      discount: offersData?.offer3?.discount || '30%',
      description: offersData?.offer3?.description || 'خصم 30% على الأجهزة الصلبة',
      descriptionEn: offersData?.offer3?.descriptionEn || '30% off on rugged devices',
      icon: FiClock,
      color: 'from-primary-500 to-cyan-600',
      bgPattern: 'bg-gradient-to-br',
      link: offersData?.offer3?.link || '/deals?category=rugged',
    },
  ];

  return (
    <section className="py-12 bg-[#111111]">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-[#E08713] to-[#C72C15] bg-clip-text text-transparent">
            🔥 عروض حصرية
          </h2>
          <p className="text-gray-300 text-lg">
            عروض لفترة محدودة - لا تفوت الفرصة!
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {offers.map((offer) => {
            const Icon = offer.icon;
            return (
              <Link
                key={offer.id}
                to={offer.link}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-[#C72C15]"
              >
                {/* Background Gradient */}
                <div className="bg-gradient-to-br from-[#E08713] to-[#C72C15] p-6 h-full min-h-[280px] flex flex-col justify-between relative">
                  {/* Decorative Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl mb-4">
                      <Icon className="w-7 h-7 text-white" />
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {offer.title}
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      {offer.titleEn}
                    </p>

                    {/* Discount Badge */}
                    <div className="inline-block bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
                      <span className="text-2xl font-black bg-gradient-to-r from-[#E08713] to-[#C72C15] bg-clip-text text-transparent">
                        {offer.discount}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-white text-base font-medium mb-1">
                      {offer.description}
                    </p>
                    <p className="text-white/70 text-sm">
                      {offer.descriptionEn}
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="relative z-10 mt-4">
                    <div className="flex items-center justify-between bg-white/20 backdrop-blur-sm rounded-xl px-4 py-3 group-hover:bg-white/30 transition">
                      <span className="text-white font-bold">تسوق الآن</span>
                      <svg className="w-5 h-5 text-white transform group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Shine Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </Link>
            );
          })}
        </div>

        {/* View All Link */}
        <div className="text-center mt-10">
          <Link
            to="/deals"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white font-bold rounded-xl hover:shadow-lg transform hover:scale-105 transition"
          >
            <span>عرض جميع العروض</span>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
