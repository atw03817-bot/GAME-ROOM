import { useState, useEffect } from 'react';
import api from '../utils/api';

const useSEO = (slug) => {
  const [seoData, setSeoData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      return;
    }

    const fetchSEOData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/seo/page/${slug}`);
        setSeoData(response.data.data);
        setError(null);
      } catch (err) {
        if (err.response?.status !== 404) {
          setError(err.message);
        }
        setSeoData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSEOData();
  }, [slug]);

  return { seoData, loading, error };
};

export default useSEO;