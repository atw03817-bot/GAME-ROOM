import { useEffect } from 'react';

/**
 * Hook لتمرير الصفحة إلى الأعلى
 * @param {boolean} smooth - استخدام التمرير السلس أم لا (افتراضي: true)
 * @param {Array} deps - المتغيرات التي تؤدي إلى إعادة التمرير عند تغييرها
 */
function useScrollToTop(smooth = false, deps = []) {
  useEffect(() => {
    // طرق متعددة لضمان العمل في الجوال
    
    // الطريقة الأولى: فوري
    window.scrollTo(0, 0);
    
    // الطريقة الثانية: مع behavior
    setTimeout(() => {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: smooth ? 'smooth' : 'instant'
      });
    }, 10);
    
    // الطريقة الثالثة: للجوال خصوصاً
    setTimeout(() => {
      if (window.innerWidth <= 768) { // إذا كان جوال
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
        // إجبار إعادة رسم الصفحة
        window.requestAnimationFrame(() => {
          window.scrollTo(0, 0);
        });
      }
    }, 100);
  }, deps);
}

export default useScrollToTop;