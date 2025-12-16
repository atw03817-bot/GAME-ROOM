import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../styles/tamara.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export default function TamaraPaymentSettings() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  
  const [settings, setSettings] = useState({
    tamaraEnabled: false,
    apiToken: '',
    publicKey: '',
    merchantUrl: '',
    testMode: true,
    webhookSecret: '',
    defaultPaymentType: 'PAY_BY_INSTALMENTS',
    defaultInstalments: 3,
    minAmount: 100,
    maxAmount: 10000
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(`${API_URL}/payments/settings/tamara`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success && response.data.data) {
        const config = response.data.data.config || {};
        setSettings({
          tamaraEnabled: response.data.data.enabled || false,
          apiToken: config.apiToken || '',
          publicKey: config.publicKey || '',
          merchantUrl: config.merchantUrl || '',
          testMode: config.testMode !== false,
          webhookSecret: config.webhookSecret || '',
          defaultPaymentType: config.defaultPaymentType || 'PAY_BY_INSTALMENTS',
          defaultInstalments: config.defaultInstalments || 3,
          minAmount: config.minAmount || 100,
          maxAmount: config.maxAmount || 10000
        });
      }
    } catch (error) {
      console.error('Error fetching Tamara settings:', error);
      if (error.response?.status === 404) {
        // Settings don't exist yet, use defaults
        console.log('No Tamara settings found, using defaults');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setTestResult(null);
    
    try {
      const token = localStorage.getItem('token');

      const response = await axios.put(
        `${API_URL}/payments/settings/tamara`,
        {
          enabled: settings.tamaraEnabled,
          config: {
            apiToken: settings.apiToken,
            publicKey: settings.publicKey,
            merchantUrl: settings.merchantUrl,
            testMode: settings.testMode,
            webhookSecret: settings.webhookSecret,
            defaultPaymentType: settings.defaultPaymentType,
            defaultInstalments: settings.defaultInstalments,
            minAmount: settings.minAmount,
            maxAmount: settings.maxAmount
          }
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setTestResult({
          success: true,
          message: 'تم حفظ إعدادات تمارا بنجاح'
        });
      }
    } catch (error) {
      console.error('Error saving Tamara settings:', error);
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'خطأ في حفظ الإعدادات'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!settings.apiToken) {
      setTestResult({
        success: false,
        message: 'يرجى إدخال رمز API أولاً'
      });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      const token = localStorage.getItem('token');

      const response = await axios.post(
        `${API_URL}/payments/tamara/test`,
        {
          apiToken: settings.apiToken,
          merchantUrl: settings.merchantUrl
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setTestResult({
          success: true,
          message: 'الاتصال بتمارا ناجح! ✅',
          data: response.data.data
        });
      }
    } catch (error) {
      console.error('Error testing Tamara connection:', error);
      setTestResult({
        success: false,
        message: error.response?.data?.message || 'فشل في الاتصال بتمارا'
      });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل إعدادات تمارا...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-12 flex items-center justify-center">
                <img 
                  src="https://f.nooncdn.com/s/app/com/noon/design-system/payment-methods-v2/tamara-ar.svg" 
                  alt="Tamara"
                  className="tamara-logo-large h-8 w-auto"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-16 h-10 bg-green-600 rounded items-center justify-center hidden">
                  <span className="text-sm font-bold text-white">تمارا</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">إعدادات تمارا</h1>
                <p className="text-gray-600">
                  قم بتكوين نظام الدفع عبر تمارا - اشتري الآن وادفع لاحقاً
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('/admin/settings')}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              العودة للإعدادات
            </button>
          </div>
        </div>

        {/* Settings Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-900">إعدادات الاتصال</h2>
            <p className="text-sm text-gray-600 mt-1">
              أدخل بيانات حسابك في تمارا
            </p>
          </div>

          <div className="p-6 space-y-6">
            {/* Enable Tamara */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">تفعيل تمارا</label>
                <p className="text-sm text-gray-500">تفعيل أو إيقاف نظام الدفع عبر تمارا</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.tamaraEnabled}
                  onChange={(e) => setSettings({...settings, tamaraEnabled: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Test Mode */}
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-900">وضع التجربة</label>
                <p className="text-sm text-gray-500">استخدام بيئة التجربة (Sandbox)</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.testMode}
                  onChange={(e) => setSettings({...settings, testMode: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* API Token */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                رمز API *
              </label>
              <input
                type="password"
                value={settings.apiToken}
                onChange={(e) => setSettings({...settings, apiToken: e.target.value})}
                placeholder={settings.testMode ? "sandbox_api_token_here" : "live_api_token_here"}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                {settings.testMode 
                  ? "رمز API الخاص ببيئة التجربة من لوحة تحكم تمارا"
                  : "رمز API الحقيقي من لوحة تحكم تمارا"
                }
              </p>
            </div>

            {/* Public Key */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                المفتاح العام (Public Key) *
              </label>
              <input
                type="text"
                value={settings.publicKey}
                onChange={(e) => setSettings({...settings, publicKey: e.target.value})}
                placeholder={settings.testMode ? "pk_test_..." : "pk_live_..."}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                المفتاح العام المطلوب لـ Tamara Widget (يبدأ بـ pk_)
              </p>
            </div>

            {/* Merchant URL */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                رابط المتجر
              </label>
              <input
                type="url"
                value={settings.merchantUrl}
                onChange={(e) => setSettings({...settings, merchantUrl: e.target.value})}
                placeholder="https://yourstore.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                رابط موقعك الإلكتروني المسجل في تمارا
              </p>
            </div>

            {/* Webhook Secret */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                مفتاح Webhook (اختياري)
              </label>
              <input
                type="password"
                value={settings.webhookSecret}
                onChange={(e) => setSettings({...settings, webhookSecret: e.target.value})}
                placeholder="webhook_secret_key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                مفتاح التحقق من صحة إشعارات تمارا (للأمان الإضافي)
              </p>
            </div>
          </div>

          {/* Payment Options */}
          <div className="p-6 border-t border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">خيارات الدفع</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Default Payment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  نوع الدفع الافتراضي
                </label>
                <select
                  value={settings.defaultPaymentType}
                  onChange={(e) => setSettings({...settings, defaultPaymentType: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="PAY_BY_INSTALMENTS">الدفع بالتقسيط</option>
                  <option value="PAY_BY_LATER">ادفع لاحقاً</option>
                </select>
              </div>

              {/* Default Installments */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  عدد الأقساط الافتراضي
                </label>
                <select
                  value={settings.defaultInstalments}
                  onChange={(e) => setSettings({...settings, defaultInstalments: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  disabled={settings.defaultPaymentType === 'PAY_BY_LATER'}
                >
                  <option value={3}>3 أقساط</option>
                  <option value={4}>4 أقساط</option>
                </select>
              </div>

              {/* Min Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  الحد الأدنى للمبلغ (ريال)
                </label>
                <input
                  type="number"
                  value={settings.minAmount}
                  onChange={(e) => setSettings({...settings, minAmount: parseInt(e.target.value) || 100})}
                  min="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>

              {/* Max Amount */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  الحد الأقصى للمبلغ (ريال)
                </label>
                <input
                  type="number"
                  value={settings.maxAmount}
                  onChange={(e) => setSettings({...settings, maxAmount: parseInt(e.target.value) || 10000})}
                  max="10000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Test Result */}
          {testResult && (
            <div className="p-6 border-t border-gray-100">
              <div className={`p-4 rounded-lg ${
                testResult.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-center">
                  <div className={`flex-shrink-0 ${
                    testResult.success ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {testResult.success ? (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <div className="mr-3">
                    <p className={`text-sm font-medium ${
                      testResult.success ? 'text-green-800' : 'text-red-800'
                    }`}>
                      {testResult.message}
                    </p>
                    {testResult.data && (
                      <div className="mt-2 text-xs text-green-700">
                        <p>وضع التجربة: {testResult.data.testMode ? 'مفعل' : 'معطل'}</p>
                        {testResult.data.merchantUrl && (
                          <p>رابط المتجر: {testResult.data.merchantUrl}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="p-6 border-t border-gray-100 flex gap-3">
            <button
              onClick={handleTest}
              disabled={testing || !settings.apiToken}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {testing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الاختبار...
                </>
              ) : (
                'اختبار الاتصال'
              )}
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  جاري الحفظ...
                </>
              ) : (
                'حفظ الإعدادات'
              )}
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">معلومات مهمة</h3>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• تمارا تدعم المبالغ من 100 إلى 10,000 ريال سعودي</p>
            <p>• يمكن للعملاء الدفع بالتقسيط (3 أو 4 أقساط) أو الدفع لاحقاً خلال 30 يوم</p>
            <p>• تأكد من تسجيل رابط Webhook في لوحة تحكم تمارا:</p>
            <code className="bg-blue-100 px-2 py-1 rounded text-xs">
              {process.env.NODE_ENV === 'production' 
                ? 'https://yourdomain.com/api/payments/tamara/webhook'
                : 'http://localhost:5000/api/payments/tamara/webhook'
              }
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}