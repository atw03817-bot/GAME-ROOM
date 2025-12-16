import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function TapPaymentSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [showSecretKey, setShowSecretKey] = useState(false);
  
  const [settings, setSettings] = useState({
    tapEnabled: false,
    tapSecretKey: '',
    tapPublicKey: '',
    tapTestMode: true
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/payments/settings/tap`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setSettings({
          tapEnabled: data.enabled || false,
          tapSecretKey: data.config?.secretKey || '',
          tapPublicKey: data.config?.publicKey || '',
          tapTestMode: data.config?.testMode !== false
        });
      }
    } catch (error) {
      // If not found, use defaults
      if (error.response?.status === 404) {
        console.log('No Tap settings found, using defaults');
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
    
    // Auto-detect test mode from secret key
    if (field === 'tapSecretKey') {
      setSettings(prev => ({
        ...prev,
        tapTestMode: value.includes('test')
      }));
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');

      console.log('💾 Saving settings:', {
        enabled: settings.tapEnabled,
        secretKey: settings.tapSecretKey?.substring(0, 10) + '...',
        publicKey: settings.tapPublicKey?.substring(0, 10) + '...',
        testMode: settings.tapTestMode
      });

      const response = await axios.put(
        `${API_URL}/payments/settings/tap`,
        {
          enabled: settings.tapEnabled,
          config: {
            secretKey: settings.tapSecretKey,
            publicKey: settings.tapPublicKey,
            testMode: settings.tapTestMode
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        console.log('✅ Settings saved successfully:', response.data);
        alert('✅ تم حفظ الإعدادات بنجاح');
        
        // Update local state with saved data
        if (response.data.data) {
          const data = response.data.data;
          setSettings({
            tapEnabled: data.enabled || false,
            tapSecretKey: data.config?.secretKey || settings.tapSecretKey,
            tapPublicKey: data.config?.publicKey || settings.tapPublicKey,
            tapTestMode: data.config?.testMode !== false
          });
        }
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('❌ خطأ في حفظ الإعدادات: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!settings.tapSecretKey) {
      alert('⚠️ الرجاء إدخال المفتاح السري أولاً');
      return;
    }

    try {
      setTesting(true);
      setTestResult(null);

      const token = localStorage.getItem('token');
      
      // Test the connection with Tap API
      const response = await axios.post(
        `${API_URL}/payments/tap/test`,
        {
          secretKey: settings.tapSecretKey
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setTestResult({
          success: true,
          message: '✅ الاتصال ناجح! المفاتيح صحيحة',
          details: {
            testMode: response.data.testMode ? 'وضع التجربة' : 'وضع الإنتاج',
            note: 'يمكنك الآن حفظ الإعدادات واستخدام Tap Payment'
          }
        });
      }
    } catch (error) {
      console.error('Test failed:', error);
      setTestResult({
        success: false,
        message: '❌ فشل الاتصال: ' + (error.response?.data?.message || error.message),
        details: error.response?.data
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/admin/settings')}
            className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            العودة للإعدادات
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">إعدادات Tap Payment</h1>
              <p className="text-gray-600 mt-2">إدارة بوابة الدفع الإلكتروني</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings.tapTestMode 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-green-100 text-green-800'
              }`}>
                {settings.tapTestMode ? '🧪 وضع التجربة' : '🚀 وضع الإنتاج'}
              </span>
              
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                settings.tapEnabled 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {settings.tapEnabled ? '✅ مفعل' : '⭕ معطل'}
              </span>
            </div>
          </div>
        </div>

        {/* Main Settings Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Enable/Disable Toggle */}
          <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-primary-50 to-primary-50">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-gray-900">تفعيل Tap Payment</h3>
                <p className="text-sm text-gray-600 mt-1">
                  السماح للعملاء بالدفع عبر البطاقات الائتمانية والمحافظ الإلكترونية
                </p>
              </div>
              
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.tapEnabled}
                  onChange={(e) => handleChange('tapEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* API Keys Section */}
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">مفاتيح API</h3>
              <p className="text-sm text-gray-600 mb-6">
                احصل على المفاتيح من{' '}
                <a 
                  href="https://dashboard.tap.company" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary-600 hover:underline font-medium"
                >
                  لوحة تحكم Tap
                </a>
              </p>

              {/* Secret Key */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  المفتاح السري (Secret Key) *
                </label>
                <div className="relative">
                  <input
                    type={showSecretKey ? 'text' : 'password'}
                    value={settings.tapSecretKey}
                    onChange={(e) => handleChange('tapSecretKey', e.target.value)}
                    placeholder="sk_test_... أو sk_live_..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSecretKey(!showSecretKey)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showSecretKey ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  {settings.tapTestMode 
                    ? '🧪 يبدأ بـ sk_test_ للوضع التجريبي' 
                    : '🚀 يبدأ بـ sk_live_ للوضع الحقيقي'}
                </p>
              </div>

              {/* Public Key */}
              <div className="mb-6">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  المفتاح العام (Public Key) *
                </label>
                <input
                  type="text"
                  value={settings.tapPublicKey}
                  onChange={(e) => handleChange('tapPublicKey', e.target.value)}
                  placeholder="pk_test_... أو pk_live_..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">
                  يستخدم في واجهة المستخدم (Frontend)
                </p>
              </div>

              {/* Test Connection Button */}
              <button
                onClick={handleTestConnection}
                disabled={testing || !settings.tapSecretKey}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
                    جاري الاختبار...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    اختبار الاتصال
                  </>
                )}
              </button>

              {/* Test Result */}
              {testResult && (
                <div className={`mt-4 p-4 rounded-lg ${
                  testResult.success 
                    ? 'bg-green-50 border border-green-200' 
                    : 'bg-red-50 border border-red-200'
                }`}>
                  <p className={`font-medium ${
                    testResult.success ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {testResult.message}
                  </p>
                  {testResult.details && (
                    <pre className="mt-2 text-xs text-gray-600 overflow-auto">
                      {JSON.stringify(testResult.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Webhook URL Section */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">إعدادات Webhook</h3>
            <p className="text-sm text-gray-600 mb-4">
              أضف هذا الرابط في إعدادات Webhook في لوحة تحكم Tap:
            </p>
            
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={`${API_URL}/api/payments/tap/webhook`}
                readOnly
                className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg font-mono text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${API_URL}/api/payments/tap/webhook`);
                  alert('✅ تم النسخ!');
                }}
                className="px-4 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="p-6 bg-white border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full py-4 px-6 bg-gradient-to-r from-primary-600 to-primary-600 hover:from-primary-700 hover:to-primary-700 text-white font-bold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري الحفظ...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  حفظ الإعدادات
                </>
              )}
            </button>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-primary-50 border border-primary-200 rounded-xl p-6">
          <h3 className="text-lg font-bold text-primary-900 mb-4">📚 كيفية الحصول على المفاتيح</h3>
          <ol className="space-y-3 text-sm text-primary-800">
            <li className="flex items-start gap-2">
              <span className="font-bold">1.</span>
              <span>سجل دخول إلى <a href="https://dashboard.tap.company" target="_blank" rel="noopener noreferrer" className="underline font-medium">لوحة تحكم Tap</a></span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">2.</span>
              <span>اذهب إلى Settings → API Keys</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">3.</span>
              <span>انسخ Secret Key و Public Key</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">4.</span>
              <span>الصقها في الحقول أعلاه</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="font-bold">5.</span>
              <span>اذهب إلى Settings → Webhooks وأضف رابط Webhook</span>
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
