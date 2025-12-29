import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useSiteMetadata() {
  const [siteMetadata, setSiteMetadata] = useState({
    title: 'جيم روم',
    titleEn: 'Game Room Store',
    description: 'متجرك الموثوق للألعاب والتقنية',
    descriptionEn: 'Your trusted gaming store',
    keywords: 'جوالات, هواتف ذكية, إكسسوارات, جيم روم',
    keywordsEn: 'games, gaming, technology, accessories',
    favicon: '/favicon.ico',
    appleTouchIcon: '/apple-touch-icon.png',
    ogImage: '/og-image.jpg'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSiteMetadata = async () => {
      try {
        const response = await api.get('/theme');
        if (response?.data?.success && response?.data?.data?.siteMetadata) {
          setSiteMetadata(prev => ({
            ...prev,
            ...response.data.data.siteMetadata
          }));
        }
      } catch (err) {
        console.error('Error fetching site metadata:', err);
        setError(err);
        // Keep default metadata on error (already set in useState)
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we're in browser environment
    if (typeof window !== 'undefined') {
      fetchSiteMetadata();
    } else {
      setLoading(false);
    }
  }, []);

  return { siteMetadata, loading, error };
}

export default useSiteMetadata;