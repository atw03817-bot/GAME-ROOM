import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  FiSave,
  FiSettings,
  FiDollarSign,
  FiTruck,
  FiGlobe,
} from 'react-icons/fi'
import api from '../../utils/api'

function Settings() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general')
  const [settings, setSettings] = useState({
    storeName: '',
    storeNameAr: '',
    storeDescription: '',
    storeDescriptionAr: '',
    contactEmail: '',
    contactPhone: '',
    vatNumber: '',
    currency: 'SAR',
    taxRate: 15,
    shippingEnabled: true,
    freeShippingEnabled: false,
    freeShippingThreshold: 200,
    codEnabled: true,
  })
  const [shippingProviders, setShippingProviders] = useState([])
  const [loadingProviders, setLoadingProviders] = useState(false)

  useEffect(() => {
    fetchSettings()
    fetchShippingProviders()
  }, [])

  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['general', 'payment', 'shipping', 'providers'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const response = await api.get('/settings')
      console.log('📥 Fetched settings:', response.data)
      if (response.data) {
        // Ensure all fields are set, including empty strings
        const fetchedSettings = {
          ...settings, // Keep defaults
          ...response.data, // Override with fetched data
          tapSecretKey: response.data.tapSecretKey || '',
          tapPublicKey: response.data.tapPublicKey || ''
        }
        console.log('💾 Setting state with:', fetchedSettings)
        setSettings(fetchedSettings)
      }
    } catch (error) {
      console.error('❌ Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchShippingProviders = async () => {
    try {
      setLoadingProviders(true)
      // Use /providers/all to get all providers (enabled and disabled)
      const response = await api.get('/shipping/providers/all')
      // Handle different response formats
      const data = response.data?.data || response.data || []
      setShippingProviders(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching shipping providers:', error)
      setShippingProviders([])
    } finally {
      setLoadingProviders(false)
    }
  }

  const handleProviderToggle = async (providerId, enabled) => {
    try {
      await api.put(`/shipping/providers/${providerId}`, { enabled })
      // Update local state instead of refetching
      setShippingProviders(prev => 
        prev.map(p => p._id === providerId ? { ...p, enabled } : p)
      )
      alert(enabled ? 'تم تفعيل شركة الشحن' : 'تم تعطيل شركة الشحن')
    } catch (error) {
      console.error('Error updating provider:', error)
      alert('حدث خطأ أثناء تحديث شركة الشحن')
    }
  }

  const handleProviderApiUpdate = async (providerId, apiKey, apiSecret) => {
    try {
      await api.put(`/shipping/providers/${providerId}/api`, { apiKey, apiSecret })
      // Update local state
      setShippingProviders(prev => 
        prev.map(p => p._id === providerId ? { ...p, apiKey, apiSecret } : p)
      )
      alert('تم تحديث بيانات الربط بنجاح')
    } catch (error) {
      console.error('Error updating provider API:', error)
      alert('حدث خطأ أثناء تحديث بيانات الربط')
    }
  }

  const handleProviderPriceUpdate = async (providerId, defaultPrice) => {
    try {
      await api.put(`/shipping/providers/${providerId}`, { 
        settings: { defaultPrice: parseFloat(defaultPrice) || 0 }
      })
      // Update local state
      setShippingProviders(prev => 
        prev.map(p => p._id === providerId 
          ? { ...p, settings: { ...p.settings, defaultPrice: parseFloat(defaultPrice) || 0 } } 
          : p
        )
      )
      alert('تم تحديث السعر بنجاح')
    } catch (error) {
      console.error('Error updating provider price:', error)
      alert('حدث خطأ أثناء تحديث السعر')
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      console.log('📤 Sending settings:', settings)
      const response = await api.put('/settings', settings)
      console.log('✅ Response:', response.data)
      alert('تم حفظ الإعدادات بنجاح')
    } catch (error) {
      console.error('❌ Error saving settings:', error)
      console.error('Error details:', error.response?.data)
      alert('حدث خطأ أثناء حفظ الإعدادات: ' + (error.response?.data?.message || error.message))
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/settings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          العودة إلى مركز الإعدادات
        </button>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">⚙️ الإعدادات</h1>
          <p className="text-gray-600">إدارة إعدادات المتجر</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
        >
          <FiSave size={18} />
          {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
              activeTab === 'general'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiSettings size={18} />
            عام
          </button>
          <button
            onClick={() => setActiveTab('payment')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
              activeTab === 'payment'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiDollarSign size={18} />
            الدفع
          </button>
          <button
            onClick={() => setActiveTab('shipping')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
              activeTab === 'shipping'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiTruck size={18} />
            الشحن
          </button>
          <button
            onClick={() => setActiveTab('providers')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
              activeTab === 'providers'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiTruck size={18} />
            شركات الشحن
          </button>
        </div>
      </div>

      {/* General Settings */}
      {activeTab === 'general' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">الإعدادات العامة</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المتجر (عربي)
                </label>
                <input
                  type="text"
                  value={settings.storeNameAr}
                  onChange={(e) => handleChange('storeNameAr', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="متجر الإلكترونيات"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اسم المتجر (English)
                </label>
                <input
                  type="text"
                  value={settings.storeName}
                  onChange={(e) => handleChange('storeName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Electronics Store"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف المتجر (عربي)
              </label>
              <textarea
                value={settings.storeDescriptionAr}
                onChange={(e) => handleChange('storeDescriptionAr', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="وصف مختصر عن المتجر..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                وصف المتجر (English)
              </label>
              <textarea
                value={settings.storeDescription}
                onChange={(e) => handleChange('storeDescription', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Brief description about the store..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البريد الإلكتروني
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => handleChange('contactEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="info@store.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الجوال
                </label>
                <input
                  type="tel"
                  value={settings.contactPhone}
                  onChange={(e) => handleChange('contactPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="+966 50 123 4567"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الرقم الضريبي
              </label>
              <input
                type="text"
                value={settings.vatNumber}
                onChange={(e) => handleChange('vatNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="123456789012345"
              />
              <p className="text-xs text-gray-500 mt-1">
                الرقم الضريبي للمنشأة (15 رقم) - مطلوب للفواتير الضريبية
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العملة
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="SAR">ريال سعودي (SAR)</option>
                  <option value="USD">دولار أمريكي (USD)</option>
                  <option value="EUR">يورو (EUR)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نسبة الضريبة (%)
                </label>
                <input
                  type="number"
                  value={settings.taxRate}
                  onChange={(e) => handleChange('taxRate', parseFloat(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="15"
                  min="0"
                  max="100"
                  step="0.1"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Settings */}
      {activeTab === 'payment' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800 mb-2">إعدادات الدفع</h2>
            <p className="text-gray-600">إدارة جميع طرق الدفع المتاحة في المتجر</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* COD Settings - Inline */}
            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiDollarSign className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-800">الدفع عند الاستلام (COD)</h3>
                    <p className="text-sm text-gray-600">السماح للعملاء بالدفع عند استلام الطلب</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.codEnabled}
                    onChange={(e) => handleChange('codEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              <div className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
                💡 متاح لجميع المناطق داخل المملكة العربية السعودية
              </div>
            </div>

            {/* Payment Methods Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Tap Payment */}
              <div className="bg-gradient-to-br from-primary-50 to-indigo-50 rounded-xl p-6 border border-primary-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">Tap Payment</h3>
                    <p className="text-sm text-gray-600">البطاقات الائتمانية والمحافظ الإلكترونية</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                    <span>فيزا وماستركارد</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                    <span>Apple Pay و Google Pay</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-primary-400 rounded-full"></span>
                    <span>إعدادات API والربط</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/tap-payment-settings')}
                  className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  إدارة إعدادات Tap
                </button>
              </div>

              {/* Tamara Payment API */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 hover:shadow-lg transition-shadow">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">تمارا - الربط</h3>
                    <p className="text-sm text-gray-600">اشتري الآن وادفع لاحقاً</p>
                  </div>
                </div>
                <div className="space-y-2 text-xs text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    <span>تقسيط بدون فوائد</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    <span>إعدادات API والربط</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                    <span>تفعيل وتعطيل الخدمة</span>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/tamara-payment-settings')}
                  className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  إعدادات الربط
                </button>
              </div>
            </div>

            {/* Tamara Commission - Separate Section */}
            <div className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-xl p-6 border border-orange-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">تمارا - العمولات</h3>
                    <p className="text-sm text-gray-600">إدارة عمولة الأقساط الإضافية عند استخدام تمارا</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        حساب العمولة التلقائي
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        تخصيص نسبة العمولة
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                        معاينة الحسابات
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate('/admin/tamara-settings')}
                  className="px-6 py-2.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
                >
                  إعدادات العمولة
                </button>
              </div>
            </div>

            {/* Info Section */}
            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-semibold text-blue-900 mb-2">معلومات مهمة</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• جميع طرق الدفع تعمل مع نظام الضرائب السعودي (15%)</li>
                    <li>• يمكن تفعيل أكثر من طريقة دفع في نفس الوقت</li>
                    <li>• إعدادات كل طريقة دفع منفصلة ومستقلة</li>
                    <li>• تأكد من اختبار طرق الدفع قبل التفعيل النهائي</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Settings */}
      {activeTab === 'shipping' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات الشحن</h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-bold text-gray-800">تفعيل الشحن</h3>
                <p className="text-sm text-gray-600">السماح بشحن الطلبات للعملاء</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shippingEnabled}
                  onChange={(e) => handleChange('shippingEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Free Shipping */}
            <div className="border-t pt-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
                <div>
                  <h3 className="font-bold text-gray-800">الشحن المجاني</h3>
                  <p className="text-sm text-gray-600">تفعيل الشحن المجاني للطلبات فوق حد معين</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.freeShippingEnabled}
                    onChange={(e) => handleChange('freeShippingEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>

              {settings.freeShippingEnabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحد الأدنى للشحن المجاني (ر.س)
                  </label>
                  <input
                    type="number"
                    value={settings.freeShippingThreshold}
                    onChange={(e) => handleChange('freeShippingThreshold', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="200"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    الطلبات التي تتجاوز هذا المبلغ ستحصل على شحن مجاني
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800 mb-2">
                ✅ أسعار الشحن تُدار من هنا مباشرة:
              </p>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• السعر المحدد هنا يُستخدم لجميع المدن</li>
                <li>• التغييرات تظهر فوراً للعملاء في صفحة الدفع</li>
                <li>• يمكن تحديد سعر مختلف لكل شركة شحن</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Shipping Providers Settings */}
      {activeTab === 'providers' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">شركات الشحن</h2>
          
          {loadingProviders ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {shippingProviders.map((provider) => (
                <div key={provider._id} className="border border-gray-200 rounded-lg p-6">
                  {/* Provider Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                        <FiTruck size={32} className="text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-800">{provider.displayName}</h3>
                        <p className="text-sm text-gray-600">{provider.settings?.nameEn || provider.name}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={provider.enabled}
                        onChange={(e) => handleProviderToggle(provider._id, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  {/* Provider Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">الكود:</span>
                      <span className="font-mono bg-gray-100 px-2 py-1 rounded">{provider.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <span className="font-medium">الحالة:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        provider.enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {provider.enabled ? 'مفعل' : 'معطل'}
                      </span>
                    </div>
                  </div>

                  {/* Pricing */}
                  {provider.enabled && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiDollarSign size={16} />
                        الأسعار
                      </h4>
                      
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          السعر الافتراضي (ر.س)
                        </label>
                        <input
                          type="number"
                          defaultValue={provider.settings?.defaultPrice || 0}
                          placeholder="35"
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          onBlur={(e) => {
                            const newPrice = parseFloat(e.target.value) || 0
                            if (newPrice !== (provider.settings?.defaultPrice || 0)) {
                              handleProviderPriceUpdate(provider._id, newPrice)
                            }
                          }}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          السعر الفعلي للشحن لجميع المدن. يمكن تعديله وسيظهر فوراً للعملاء.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* API Integration */}
                  {provider.enabled && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <FiSettings size={16} />
                        إعدادات الربط API (اختياري)
                      </h4>
                      
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Key
                          </label>
                          <input
                            type="text"
                            defaultValue={provider.apiKey || ''}
                            placeholder="أدخل API Key"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            onBlur={(e) => {
                              if (e.target.value !== provider.apiKey) {
                                handleProviderApiUpdate(provider._id, e.target.value, provider.apiSecret || '')
                              }
                            }}
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            API Secret
                          </label>
                          <input
                            type="password"
                            defaultValue={provider.apiSecret || ''}
                            placeholder="أدخل API Secret"
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                            onBlur={(e) => {
                              if (e.target.value !== provider.apiSecret) {
                                handleProviderApiUpdate(provider._id, provider.apiKey || '', e.target.value)
                              }
                            }}
                          />
                        </div>

                        {/* Connection Status */}
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-gray-600">حالة الربط API:</span>
                          {provider.apiKey && provider.apiSecret ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              متصل - الربط الفعلي مفعل
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-gray-600">
                              <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                              غير متصل - يعمل بالأسعار اليدوية فقط
                            </span>
                          )}
                        </div>

                        {/* Documentation Link */}
                        <div className="bg-primary-50 border border-primary-200 rounded-lg p-3 text-sm">
                          <p className="text-primary-800 mb-2">
                            💡 الربط API اختياري - للحصول على بيانات API:
                          </p>
                          <ul className="text-primary-700 space-y-1 text-xs mr-4">
                            {provider.name === 'smsa' && (
                              <>
                                <li>• سجل دخول إلى حسابك في SMSA</li>
                                <li>• انتقل إلى API Settings</li>
                                <li>• انسخ API Key و Secret</li>
                              </>
                            )}
                            {provider.name === 'aramex' && (
                              <>
                                <li>• سجل دخول إلى حسابك في Aramex</li>
                                <li>• انتقل إلى Developer Portal</li>
                                <li>• احصل على API Credentials</li>
                              </>
                            )}
                            {provider.name === 'redbox' && (
                              <>
                                <li>• سجل دخول إلى حسابك في RedBox</li>
                                <li>• انتقل إلى Integration Settings</li>
                                <li>• احصل على API Token</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Important Notice */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 text-lg">💡</div>
                  <div>
                    <h4 className="font-semibold text-blue-800 mb-2">أسعار الشحن الموحدة</h4>
                    <p className="text-sm text-blue-700">
                      الأسعار المحددة أعلاه تُستخدم لجميع المدن في المملكة. 
                      عند تعديل السعر هنا، سيظهر التغيير فوراً لجميع العملاء في صفحة الدفع.
                    </p>
                  </div>
                </div>
              </div>

              {shippingProviders.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <FiTruck size={48} className="mx-auto mb-4 text-gray-400" />
                  <p>لا توجد شركات شحن متاحة</p>
                  <p className="text-sm mt-2">تواصل مع الدعم الفني لإضافة شركات الشحن</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Settings
