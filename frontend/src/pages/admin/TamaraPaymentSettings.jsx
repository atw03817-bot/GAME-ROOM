import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TamaraPaymentSettings = () => {
  // Debug: Log the API URL being used
  console.log('🔍 TamaraPaymentSettings API_URL:', API_URL);
  console.log('🔍 Environment variables:', {
    VITE_API_URL: import.meta.env.VITE_API_URL,
    MODE: import.meta.env.MODE,
    DEV: import.meta.env.DEV,
    PROD: import.meta.env.PROD
  });
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showMerchantToken, setShowMerchantToken] = useState(false);
  const [showNotificationToken, setShowNotificationToken] = useState(false);
  
  const [settings, setSettings] = useState({
    tamaraEnabled: false,
    merchantToken: '',
    apiUrl: 'https://api.tamara.co',
    notificationToken: '',
    publicKey: '',
    merchantId: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/payments/settings/tamara`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setSettings({
          tamaraEnabled: data.enabled || false,
          merchantToken: data.config?.merchantToken || '',
          apiUrl: data.config?.apiUrl || 'https://api-sandbox.tamara.co',
          notificationToken: data.config?.notificationToken || '',
          publicKey: data.config?.publicKey || '',
          merchantId: data.config?.merchantId || ''
        });
      }
    } catch (error) {
      // If not found, try to initialize default settings
      if (error.response?.status === 404) {
        console.log('No Tamara settings found, initializing defaults...');
        try {
          await axios.post(`${API_URL}/payments/tamara/init`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // Retry fetching after initialization
          setTimeout(fetchSettings, 1000);
        } catch (initError) {
          console.error('Error initializing Tamara settings:', initError);
          alert('خطأ في إنشاء إعدادات Tamara الافتراضية');
        }
      } else {
        console.error('Error fetching settings:', error);
        alert('خطأ في جلب الإعدادات');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      const response = await axios.put(`${API_URL}/payments/settings/tamara`, {
        enabled: settings.tamaraEnabled,
        config: {
          merchantToken: settings.merchantToken,
          apiUrl: settings.apiUrl,
          notificationToken: settings.notificationToken,
          publicKey: settings.publicKey,
          merchantId: settings.merchantId
        }
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('تم حفظ إعدادات تمارا بنجاح');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('خطأ في حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      let token = localStorage.getItem('token');

      console.log('🔍 Testing Tamara connection...');
      console.log('📝 Request data:', {
        apiUrl: API_URL,
        hasMerchantToken: !!settings.merchantToken,
        merchantTokenLength: settings.merchantToken?.length,
        apiUrlSetting: settings.apiUrl,
        hasToken: !!token
      });

      // Check if token is valid
      if (!token || token === 'null' || token === 'undefined') {
        console.log('❌ Invalid token, redirecting to login');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/admin/login';
        return;
      }

      const response = await axios.post(`${API_URL}/payments/tamara/test`, {
        merchantToken: settings.merchantToken,
        apiUrl: settings.apiUrl,
        notificationToken: settings.notificationToken,
        publicKey: settings.publicKey
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log('✅ Test successful:', response.data);
      setTestResult({
        success: true,
        message: response.data.message
      });
    } catch (error) {
      console.error('❌ Error testing connection:', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url
      });
      
      let errorMessage = 'خطأ في اختبار الاتصال';
      
      if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'بيانات الطلب غير صحيحة';
      } else if (error.response?.status === 401) {
        errorMessage = 'غير مصرح لك بالوصول - تحقق من تسجيل الدخول';
      } else if (error.response?.status === 403) {
        errorMessage = 'ليس لديك صلاحية إدارية';
      } else if (error.response?.status === 500) {
        errorMessage = error.response.data?.message || 'خطأ في الخادم';
      } else if (!error.response) {
        errorMessage = 'فشل في الاتصال بالخادم';
      }
      
      setTestResult({
        success: false,
        message: errorMessage,
        debug: error.response?.data?.debug
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">إعدادات تمارا للدفع</h1>
          <button
            onClick={() => navigate('/admin/payments')}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            العودة
          </button>
        </div>

        {/* Test Result */}
        {testResult && (
          <div className={`mb-6 p-4 rounded-lg ${
            testResult.success 
              ? 'bg-green-100 border border-green-400 text-green-700'
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            <div className="flex items-center mb-2">
              <span className="ml-2">
                {testResult.success ? '✅' : '❌'}
              </span>
              <span>{testResult.message}</span>
            </div>
            {testResult.debug && (
              <div className="text-xs mt-2 p-2 bg-gray-100 rounded border-r-4 border-gray-400">
                <strong>تفاصيل تقنية:</strong> {testResult.debug}
              </div>
            )}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
          {/* Enable/Disable */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h3 className="text-lg font-medium text-gray-800">تفعيل تمارا للدفع</h3>
              <p className="text-sm text-gray-600">اشتري الآن وادفع لاحقاً</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.tamaraEnabled}
                onChange={(e) => handleChange('tamaraEnabled', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {/* Merchant Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merchant Token *
            </label>
            <div className="relative">
              <input
                type={showMerchantToken ? 'text' : 'password'}
                value={settings.merchantToken}
                onChange={(e) => handleChange('merchantToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل Merchant Token"
                required
              />
              <button
                type="button"
                onClick={() => setShowMerchantToken(!showMerchantToken)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showMerchantToken ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              يمكنك الحصول عليه من لوحة تحكم تمارا
            </p>
          </div>

          {/* API URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API URL
            </label>
            <select
              value={settings.apiUrl}
              onChange={(e) => handleChange('apiUrl', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="https://api-sandbox.tamara.co">Sandbox (للاختبار)</option>
              <option value="https://api.tamara.co">Production (الإنتاج)</option>
            </select>
          </div>

          {/* Notification Token */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notification Token (اختياري)
            </label>
            <div className="relative">
              <input
                type={showNotificationToken ? 'text' : 'password'}
                value={settings.notificationToken}
                onChange={(e) => handleChange('notificationToken', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="أدخل Notification Token"
              />
              <button
                type="button"
                onClick={() => setShowNotificationToken(!showNotificationToken)}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showNotificationToken ? '🙈' : '👁️'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              لتأمين Webhooks (مستحسن للإنتاج)
            </p>
          </div>

          {/* Public Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Public Key (اختياري)
            </label>
            <textarea
              value={settings.publicKey}
              onChange={(e) => handleChange('publicKey', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows="3"
              placeholder="أدخل Public Key"
            />
            <p className="text-xs text-gray-500 mt-1">
              للتحقق من صحة البيانات (مستحسن للإنتاج)
            </p>
          </div>

          {/* Merchant ID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Merchant ID (اختياري)
            </label>
            <input
              type="text"
              value={settings.merchantId}
              onChange={(e) => handleChange('merchantId', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="أدخل Merchant ID"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
            </button>
            
            <button
              type="button"
              onClick={handleTest}
              disabled={testing || !settings.merchantToken}
              className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? 'جاري الاختبار...' : 'اختبار الاتصال'}
            </button>
          </div>
        </form>

        {/* Documentation Links */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">روابط مفيدة</h3>
          <ul className="space-y-2 text-sm text-blue-600">
            <li>
              <a 
                href="https://docs.tamara.co/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                📚 وثائق Tamara API
              </a>
            </li>
            <li>
              <a 
                href="https://partners.tamara.co/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                🏪 لوحة تحكم الشركاء
              </a>
            </li>
            <li>
              <a 
                href="https://docs.tamara.co/docs/direct-online-checkout" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:underline"
              >
                🛒 دليل Direct Online Checkout
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TamaraPaymentSettings;
