import { useState, useEffect } from 'react';
import { FiArrowUp } from 'react-icons/fi';

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

  return (
    <>
      {isVisible && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 left-6 z-50 bg-primary-600 hover:bg-primary-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110"
          aria-label="العودة إلى الأعلى"
        >
          <FiArrowUp size={20} />
        </button>
      )}
    </>
  );
}

export default BackToTop;