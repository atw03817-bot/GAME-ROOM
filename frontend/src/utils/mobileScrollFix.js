/**
 * حل مشكلة التمرير في الجوال
 * يستخدم طرق متعددة لضمان التمرير للأعلى في جميع الأجهزة
 */

export const scrollToTopMobile = (delay = 0) => {
  const scroll = () => {
    // الطريقة الأولى: التمرير العادي
    window.scrollTo(0, 0);
    
    // الطريقة الثانية: تمرير مباشر للعناصر
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // الطريقة الثالثة: للجوال خصوصاً
    if (window.innerWidth <= 768) {
      // إجبار إعادة رسم الصفحة
      window.requestAnimationFrame(() => {
        window.scrollTo(0, 0);
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      });
      
      // تأكيد إضافي بعد تأخير قصير
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 50);
    }
  };
  
  if (delay > 0) {
    setTimeout(scroll, delay);
  } else {
    scroll();
  }
};

export const forceScrollToTop = () => {
  // تمرير قوي للجوال
  scrollToTopMobile(0);
  scrollToTopMobile(10);
  scrollToTopMobile(50);
  scrollToTopMobile(100);
  scrollToTopMobile(200);
};

export default { scrollToTopMobile, forceScrollToTop };