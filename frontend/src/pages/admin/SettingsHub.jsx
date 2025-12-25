import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FiSettings,
  FiDollarSign,
  FiTruck,
  FiCreditCard,
  FiLayers,
  FiSearch,
  FiShoppingBag,
  FiGlobe,
  FiFileText,
  FiChevronRight,
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin
} from 'react-icons/fi'

function SettingsHub() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')

  const settingsCategories = [
    {
      id: 'general',
      title: 'الإعدادات العامة',
      description: 'معلومات المتجر الأساسية والإعدادات العامة',
      icon: FiSettings,
      color: 'bg-blue-500',
      items: [
        'اسم المتجر',
        'معلومات الاتصال',
        'الضرائب',
        'العملة'
      ],
      path: '/admin/settings/old?tab=general'
    },
    {
      id: 'payments',
      title: 'طرق الدفع',
      description: 'إعداد وإدارة جميع طرق الدفع والعمولات',
      icon: FiCreditCard,
      color: 'bg-green-500',
      items: [
        'الدفع عند الاستلام',
        'Tap Payment + API',
        'تمارا - الربط مع API',
        'تمارا - العمولات والحسابات'
      ],
      subTabs: [
        { id: 'cod', name: 'الدفع عند الاستلام', path: '/admin/settings/old?tab=payment' },
        { id: 'tap', name: 'Tap Payment', path: '/admin/tap-payment-settings' },
        { id: 'tamara-api', name: 'تمارا - الربط', path: '/admin/tamara-payment-settings' },
        { id: 'tamara-commission', name: 'تمارا - العمولات', path: '/admin/tamara-settings' }
      ],
      path: '/admin/settings/old?tab=payment'
    },
    {
      id: 'shipping',
      title: 'الشحن والتوصيل',
      description: 'إعدادات الشحن وشركات التوصيل',
      icon: FiTruck,
      color: 'bg-orange-500',
      items: [
        'أسعار الشحن',
        'الشحن المجاني',
        'شركات الشحن',
        'مناطق التوصيل'
      ],
      path: '/admin/settings/old?tab=shipping'
    },
    {
      id: 'providers',
      title: 'شركات الشحن',
      description: 'إدارة شركات الشحن وأسعارها',
      icon: FiTruck,
      color: 'bg-orange-600',
      items: [
        'SMSA Express',
        'Aramex',
        'RedBox',
        'أسعار الشحن'
      ],
      path: '/admin/settings/old?tab=providers'
    },
    {
      id: 'design',
      title: 'إعدادات التصميم',
      description: 'تخصيص مظهر وألوان الموقع',
      icon: FiLayers,
      color: 'bg-purple-500',
      items: [
        'الإعلان العلوي',
        'رأس الصفحة',
        'الألوان والخطوط',
        'التخطيط والتأثيرات'
      ],
      subTabs: [
        { id: 'banner', name: 'الإعلان العلوي' },
        { id: 'header', name: 'رأس الصفحة' },
        { id: 'colors', name: 'الألوان' },
        { id: 'fonts', name: 'الخطوط' },
        { id: 'layout', name: 'التخطيط' },
        { id: 'metadata', name: 'إعدادات الموقع' }
      ],
      path: '/admin/theme-settings'
    },
    {
      id: 'seo',
      title: 'تحسين محركات البحث',
      description: 'إعدادات SEO وتحسين الظهور في البحث',
      icon: FiSearch,
      color: 'bg-indigo-500',
      items: [
        'العناوين والأوصاف',
        'الكلمات المفتاحية',
        'خريطة الموقع',
        'Google Analytics'
      ],
      path: '/admin/seo'
    },
    {
      id: 'footer',
      title: 'إعدادات Footer',
      description: 'تخصيص محتوى وروابط أسفل الصفحة',
      icon: FiGlobe,
      color: 'bg-teal-500',
      items: [
        'روابط التواصل الاجتماعي',
        'معلومات الشركة',
        'الروابط السريعة',
        'حقوق النشر'
      ],
      path: '/admin/footer-settings'
    },
    {
      id: 'legal',
      title: 'الصفحات القانونية',
      description: 'سياسات الخصوصية والشروط والأحكام',
      icon: FiFileText,
      color: 'bg-gray-500',
      items: [
        'سياسة الخصوصية',
        'الشروط والأحكام',
        'سياسة الاسترجاع',
        'معلومات الاتصال'
      ],
      subTabs: [
        { id: 'privacy-policy', name: 'سياسة الخصوصية' },
        { id: 'terms-conditions', name: 'الشروط والأحكام' },
        { id: 'return-policy', name: 'سياسة الاسترجاع' },
        { id: 'contact-info', name: 'معلومات الاتصال' },
        { id: 'faq', name: 'الأسئلة الشائعة' }
      ],
      path: '/admin/legal-pages'
    }
  ]

  const filteredCategories = settingsCategories.filter(category =>
    category.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.items.some(item => item.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const handleCategoryClick = (path) => {
    navigate(path)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-primary-100 rounded-xl">
              <FiSettings className="w-8 h-8 text-primary-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">مركز الإعدادات</h1>
              <p className="text-gray-600">إدارة وتخصيص جميع إعدادات المتجر</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="البحث في الإعدادات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCategories.map((category) => {
            const IconComponent = category.icon
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryClick(category.path)}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-primary-200 transition-all duration-200 cursor-pointer group"
              >
                {/* Card Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${category.color} bg-opacity-10`}>
                      <IconComponent className={`w-6 h-6 ${category.color.replace('bg-', 'text-')}`} />
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {category.title}
                  </h3>
                  
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {category.description}
                  </p>
                </div>

                {/* Card Content */}
                <div className="px-6 pb-6">
                  <div className="space-y-2">
                    {category.items.slice(0, 3).map((item, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                        <span>{item}</span>
                      </div>
                    ))}
                    {category.items.length > 3 && (
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <div className="w-1.5 h-1.5 bg-gray-300 rounded-full"></div>
                        <span>و {category.items.length - 3} المزيد...</span>
                      </div>
                    )}
                  </div>

                  {/* Sub-tabs if available */}
                  {category.subTabs && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <p className="text-xs text-gray-400 mb-2">التبويبات المتاحة:</p>
                      <div className="flex flex-wrap gap-1">
                        {category.subTabs.slice(0, 3).map((tab, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                            {tab.name}
                          </span>
                        ))}
                        {category.subTabs.length > 3 && (
                          <span className="text-xs text-gray-400">+{category.subTabs.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Hover Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
              </div>
            )
          })}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FiUser className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إعدادات المتجر</p>
                <p className="text-xl font-semibold text-gray-900">8</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FiCreditCard className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">طرق الدفع</p>
                <p className="text-xl font-semibold text-gray-900">3</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <FiTruck className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">شركات الشحن</p>
                <p className="text-xl font-semibold text-gray-900">4</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <FiLayers className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">إعدادات التصميم</p>
                <p className="text-xl font-semibold text-gray-900">12</p>
              </div>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-12 bg-gradient-to-r from-primary-50 to-primary-100 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary-500 rounded-xl">
              <FiMail className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                تحتاج مساعدة في الإعدادات؟
              </h3>
              <p className="text-gray-600 mb-4">
                فريق الدعم الفني جاهز لمساعدتك في إعداد وتخصيص متجرك بالطريقة المثلى
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors">
                  <FiPhone className="w-4 h-4" />
                  اتصل بنا
                </button>
                <button className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition-colors">
                  <FiMail className="w-4 h-4" />
                  راسلنا
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsHub