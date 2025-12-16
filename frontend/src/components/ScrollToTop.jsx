import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // التمرير إلى أعلى الصفحة عند تغيير المسار
    // استخدام طرق متعددة لضمان العمل في الجوال
    
    // الطريقة الأولى: فوري
    window.scrollTo(0, 0);
    
    // الطريقة الثانية: مع تأخير قصير للجوال
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'instant' // فوري بدلاً من smooth للجوال
      });
    }, 10);
    
    // الطريقة الثالثة: للتأكد في الجوال
    setTimeout(() => {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
  }, [pathname]);

  return null;
}

export default ScrollToTop;