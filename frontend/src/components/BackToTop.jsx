import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);

  // إظهار الزر عند التمرير لأسفل
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  // التمرير إلى الأعلى
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // فتح الواتساب
  const openWhatsApp = () => {
    const phoneNumber = '966507303172';
    const message = 'مرحباً، أحتاج مساعدة في المتجر';
    const whatsappUrl = `https://api.whatsapp.com/send/?phone=${phoneNumber}&text=${encodeURIComponent(message)}&type=phone_number&app_absent=0`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <>
      {isVisible && (
        <div className="fixed bottom-6 left-6 z-50 flex flex-col gap-3">
          {/* زر الواتساب */}
          <button
            onClick={openWhatsApp}
            className="bg-[#25D366] hover:bg-[#20BA5A] text-white p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="تواصل معنا عبر الواتساب"
            title="تواصل معنا عبر الواتساب"
          >
            <FaWhatsapp size={18} />
          </button>
          
          {/* زر الرجوع للأعلى */}
          <button
            onClick={scrollToTop}
            className="bg-gradient-to-r from-[#E08713] to-[#C72C15] hover:opacity-90 text-white p-2.5 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
            aria-label="العودة إلى الأعلى"
            title="العودة إلى الأعلى"
          >
            <FiArrowUp size={18} />
          </button>
        </div>
      )}
    </>
  );
}

export default BackToTop;