import { useState, useEffect } from 'react';
import api from '../utils/api';

function useSEOSettings() {
  const [seoSettings, setSeoSettings] = useState({
    title: '',
    titleEn: '',
    description: '',
    descriptionEn: '',
    keywords: '',
    keywordsEn: '',
    favicon: '',
    appleTouchIcon: '',
    ogImage: ''
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSEOSettings();
    
    // الاستماع للتغييرات من ThemeSettings
    const handleSEOChange = (event) => {
      console.log('SEO settings changed:', event.detail);
      setSeoSettings(prev => ({ ...prev, ...event.detail }));
    };

    window.addEventListener('seoSettingsChanged', handleSEOChange);

    return () => {
      window.removeEventListener('seoSettingsChanged', handleSEOChange);
    };
  }, []);

  const loadSEOSettings = async () => {
    try {
      // تحميل من localStorage أولاً
      const savedSettings = localStorage.getItem('seoSettings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          setSeoSettings(prev => ({ ...prev, ...settings }));
        } catch (error) {
          console.log('Error parsing saved SEO settings');
        }
      }

      // ثم تحميل من الخادم
      const response = await api.get('/theme');
      if (response.data.success && response.data.data.siteMetadata) {
        const serverSettings = response.data.data.siteMetadata;
        setSeoSettings(prev => ({ ...prev, ...serverSettings }));
        
        // حفظ في localStorage
        localStorage.setItem('seoSettings', JSON.stringify(serverSettings));
      }
    } catch (error) {
      console.error('Error loading SEO settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSEOSettings = (newSettings) => {
    setSeoSettings(prev => ({ ...prev, ...newSettings }));
    localStorage.setItem('seoSettings', JSON.stringify({ ...seoSettings, ...newSettings }));
  };

  return {
    seoSettings,
    loading,
    updateSEOSettings,
    reloadSettings: loadSEOSettings
  };
}

export default useSEOSettings;