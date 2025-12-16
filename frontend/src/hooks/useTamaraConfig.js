import { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useTamaraConfig = () => {
  const [config, setConfig] = useState({
    enabled: false,
    publicKey: '',
    instalments: 3,
    minAmount: 100,
    maxAmount: 10000,
    loading: true
  });

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await axios.get(`${API_URL}/payments/methods`);
        const tamaraMethod = response.data.data?.find(method => method.provider === 'tamara');
        
        if (tamaraMethod) {
          setConfig({
            enabled: true,
            publicKey: tamaraMethod.config?.publicKey || '',
            instalments: tamaraMethod.config?.defaultInstalments || 3,
            minAmount: tamaraMethod.config?.minAmount || 100,
            maxAmount: tamaraMethod.config?.maxAmount || 10000,
            loading: false
          });
        } else {
          setConfig(prev => ({ ...prev, enabled: false, loading: false }));
        }
      } catch (error) {
        console.error('Error fetching Tamara config:', error);
        setConfig(prev => ({ ...prev, enabled: false, loading: false }));
      }
    };

    fetchConfig();
  }, []);

  return config;
};