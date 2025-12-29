import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const TabbyPaymentSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  
  const [settings, setSettings] = useState({
    tabbyEnabled: false,
    publicKey: '',
    secretKey: '',
    apiUrl: 'https://api.tabby.ai',
    merchantCode: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/payments/settings/tabby`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setSettings({
          tabbyEnabled: data.enabled || false,
          publicKey: data.config?.publicKey || '',
          secretKey: data.config?.secretKey || '',
          apiUrl: data.config?.apiUrl || 'https://api.tabby.ai',
          merchantCode: data.config?.merchantCode || ''
        });
      }
    } catch (error) {
      if (error.response?.status === 404) {
        console.log('No Tabby settings found, using defaults...');
        setSettings({
          tabbyEnabled: false,
          publicKey: '',
          secretKey: '',
          apiUrl: 'https://api.tabby.ai',
          merchantCode: ''
        });
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

      const payload = {
        enabled: settings.tabbyEnabled,
        config: {
          publicKey: settings.publicKey,
          secretKey: settings.secretKey,
          apiUrl: settings.apiUrl,
          merchantCode: settings.merchantCode
        }
      };

      const response = await axios.put(`${API_URL}/payments/settings/tabby`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        alert('تم حفظ الإعدادات بنجاح');
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
      const token = localStorage.getItem('token');

      const response = await axios.post(`${API_URL}/payments/tabby/test`, {
        publicKey: settings.publicKey,
        secretKey: settings.secretKey,
        merchantCode: settings.merchantCode
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setTestResult({
        success: true,
        data: response.data.data,
        message: response.data.message
      });
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'فشل في اختبار الاتصال'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الإعدادات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/admin/settings')}
                  className="ml-4 text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">إعدادات Tabby</h1>
                  <p className="text-sm text-gray-600 mt-1">
                    إعداد طريقة الدفع بالتقسيط مع Tabby - ادفع على 4 دفعات
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3 space-x-reverse">
                <img 
                  src="/images/tabby-logo.png" 
                  alt="Tabby" 
                  className="h-8"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="text-lg font-semibold text-purple-600">Tabby</span>
              </div>
            </div>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">إعدادات API</h2>
            <p className="text-sm text-gray-600 mt-1">
              قم بإدخال بيانات API الخاصة بـ Tabby
            </p>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Enable/Disable */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-base font-medium text-gray-900">تفعيل Tabby</label>
                <p className="text-sm text-gray-600">تفعيل أو إلغاء تفعيل طريقة الدفع</p>
              </div>
              <button
                type="button"
                onClick={() => handleChange('tabbyEnabled', !settings.tabbyEnabled)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                  settings.tabbyEnabled ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    settings.tabbyEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Public Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المفتاح العام (Public Key) *
              </label>
              <input
                type="text"
                value={settings.publicKey}
                onChange={(e) => handleChange('publicKey', e.target.value)}
                placeholder="pk_test_..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                المفتاح العام المستخدم للعروض والتخصيص
              </p>
            </div>

            {/* Secret Key */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المفتاح السري (Secret Key) *
              </label>
              <div className="relative">
                <input
                  type={showSecretKey ? 'text' : 'password'}
                  value={settings.secretKey}
                  onChange={(e) => handleChange('secretKey', e.target.value)}
                  placeholder="sk_test_..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {showSecretKey ? (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                    ) : (
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    )}
                  </svg>
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                المفتاح السري المستخدم لـ Checkout و Payments APIs
              </p>
            </div>

            {/* Merchant Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                كود التاجر (Merchant Code)
              </label>
              <input
                type="text"
                value={settings.merchantCode}
                onChange={(e) => handleChange('merchantCode', e.target.value)}
                placeholder="top1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                كود التاجر المخصص لك من Tabby
              </p>
            </div>

            {/* API URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                رابط API
              </label>
              <select
                value={settings.apiUrl}
                onChange={(e) => handleChange('apiUrl', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="https://api.tabby.ai">الإنتاج (Production)</option>
                <option value="https://api.tabby.ai">التجريبي (Sandbox)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                اختر البيئة المناسبة للاختبار أو الإنتاج
              </p>
            </div>
          </div>

          {/* Test Connection */}
          {testResult && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className={`p-4 rounded-md ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
                <div className="flex">
                  <div className="flex-shrink-0">
                    {testResult.success ? (
                      <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="mr-3">
                    <h3 className={`text-sm font-medium ${testResult.success ? 'text-green-800' : 'text-red-800'}`}>
                      {testResult.success ? 'نجح الاتصال' : 'فشل الاتصال'}
                    </h3>
                    <p className={`text-sm mt-1 ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                      {testResult.message}
                    </p>
                    {testResult.success && testResult.data && (
                      <div className="mt-2 text-xs text-green-600">
                        <p>البيئة: {testResult.data.details?.environment}</p>
                        <p>رابط API: {testResult.data.details?.apiUrl}</p>
                        <p>كود التاجر: {testResult.data.details?.merchantCode || 'غير محدد'}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between">
            <button
              onClick={handleTest}
              disabled={testing || !settings.publicKey || !settings.secretKey}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {testing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الاختبار...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  اختبار الاتصال
                </>
              )}
            </button>

            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  حفظ الإعدادات
                </>
              )}
            </button>
          </div>
        </div>

        {/* Documentation */}
        <div className="bg-white shadow rounded-lg mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">معلومات مهمة</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">مفاتيح الاختبار:</h3>
                <div className="bg-gray-50 p-3 rounded-md text-sm font-mono">
                  <p>Public Key: pk_test_01968174-594d-7042-be8f-f9d25036ec54</p>
                  <p>Secret Key: sk_test_01968174-594d-7042-be8f-f9d2b3c79dce</p>
                  <p>Merchant Code: top1</p>
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">روابط مفيدة:</h3>
                <ul className="text-sm text-blue-600 space-y-1">
                  <li>
                    <a href="https://docs.tabby.ai/pay-in-4-custom-integration" target="_blank" rel="noopener noreferrer" className="hover:underline">
                      📚 وثائق API الرسمية
                    </a>
                  </li>
                  <li>
                    <a href="https://docs.tabby.ai/testing-guidelines" target="_blank" rel="noopener noreferrer" className="hover:underline">
                      🧪 دليل الاختبار
                    </a>
                  </li>
                  <li>
                    <a href="https://www.tabby-status.com/" target="_blank" rel="noopener noreferrer" className="hover:underline">
                      📊 حالة الخدمة
                    </a>
                  </li>
                  <li>
                    <a href="https://docs.tabby.ai/marketing/toolkit" target="_blank" rel="noopener noreferrer" className="hover:underline">
                      🎨 أدوات التسويق
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabbyPaymentSettings;