import { useState, useEffect } from 'react';
import api from '../../utils/api';

function TopBanner() {
  const [bannerData, setBannerData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('TopBanner: Component mounted, loading banner...');
    loadBannerFromAPI();
  }, []);

  const loadBannerFromAPI = async () => {
    try {
      console.log('TopBanner: Making API call to /theme...');
      const response = await api.get('/theme');
      console.log('TopBanner: API response:', response.data);
      
      if (response.data.success && response.data.data.banner) {
        const banner = response.data.data.banner;
        console.log('TopBanner: Banner data from API:', banner);
        console.log('TopBanner: Banner enabled:', banner.enabled);
        console.log('TopBanner: Banner text:', banner.text);
        
        if (banner.enabled && banner.text && banner.text.trim() !== '') {
          setBannerData(banner);
          console.log('TopBanner: ✅ Banner will be shown');
        } else {
          setBannerData(null);
          console.log('TopBanner: ❌ Banner will NOT be shown - enabled:', banner.enabled, 'text:', banner.text);
        }
      } else {
        setBannerData(null);
        console.log('TopBanner: ❌ No banner data in API response');
      }
    } catch (error) {
      console.error('TopBanner: ❌ Error loading banner:', error);
      setBannerData(null);
    } finally {
      setLoading(false);
    }
  };

  // إعادة تحميل البانر عند تحديث الإعدادات
  useEffect(() => {
    const handleBannerUpdate = () => {
      console.log('TopBanner: Received banner update event, reloading...');
      loadBannerFromAPI();
    };

    window.addEventListener('bannerUpdated', handleBannerUpdate);
    return () => window.removeEventListener('bannerUpdated', handleBannerUpdate);
  }, []);

  const handleClick = () => {
    if (bannerData && bannerData.link && bannerData.link.trim() !== '') {
      window.location.href = bannerData.link;
    }
  };

  if (loading) {
    console.log('TopBanner: Still loading...');
    return null;
  }

  if (!bannerData) {
    console.log('TopBanner: No banner data, not rendering');
    return null;
  }

  console.log('TopBanner: Rendering banner with data:', bannerData);

  return (
    <div 
      className={`w-full py-3 px-4 text-center text-sm font-medium ${
        bannerData.link ? 'cursor-pointer hover:opacity-90' : ''
      }`}
      style={{
        backgroundColor: bannerData.backgroundColor,
        color: bannerData.textColor
      }}
      onClick={bannerData.link ? handleClick : undefined}
    >
      {bannerData.text}
    </div>
  );
}

export default TopBanner;