import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import BackToTop from '../BackToTop';
import TopBanner from './TopBanner';
import SEOHead from '../SEOHead';
import useSEOSettings from '../../hooks/useSEOSettings';
import useFaviconUpdater from '../../hooks/useFaviconUpdater';

function Layout() {
  const { seoSettings } = useSEOSettings();
  
  // تحديث الفافيكون والأيقونات تلقائياً
  useFaviconUpdater(seoSettings.favicon, seoSettings.appleTouchIcon);

  return (
    <div className="flex flex-col min-h-screen" style={{ overscrollBehavior: 'none' }}>
      {/* إعدادات SEO الديناميكية */}
      <SEOHead
        title={`${seoSettings.title} | ${seoSettings.titleEn}`}
        description={seoSettings.description}
        keywords={seoSettings.keywords}
        ogImage={seoSettings.ogImage}
        favicon={seoSettings.favicon}
        appleTouchIcon={seoSettings.appleTouchIcon}
      />
      
      {/* إعلان علوي */}
      <TopBanner />
      
      <Navbar />
      <main className="flex-grow" style={{ overscrollBehavior: 'none' }}>
        <Outlet />
      </main>
      <Footer />
      
      {/* زر العودة إلى الأعلى */}
      <BackToTop />
    </div>
  );
}

export default Layout;
