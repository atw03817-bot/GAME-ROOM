import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FiSave, FiSettings, FiType, FiLayout, FiArrowLeft } from 'react-icons/fi';
import api from '../../utils/api';
import toast from 'react-hot-toast';

function ThemeSettings() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'header');
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingIcon, setUploadingIcon] = useState(null);
  const [settings, setSettings] = useState({
    header: {
      logo: '',
      storeName: '',
      tagline: '',
      showTagline: false,
      showStoreNameMobile: false,
      showTaglineMobile: false,
      showSearch: false,
      showCart: false,
      showUserMenu: false,
      sticky: false,
      transparent: false,
      shadow: false
    },
    banner: {
      enabled: false,
      text: '',
      backgroundColor: '#7c3aed',
      textColor: '#ffffff',
      showCloseButton: false,
      link: ''
    },
    theme: {
      colors: {
        primary: '',
        primaryHover: '',
        secondary: '',
        accent: '',
        success: '',
        warning: '',
        error: '',
        background: '',
        surface: '',
        textPrimary: '',
        textSecondary: ''
      },
      fonts: {
        primary: '',
        secondary: '',
        size: {
          base: '',
          small: '',
          large: '',
          heading: ''
        }
      },
      layout: {
        borderRadius: '',
        spacing: '',
        containerWidth: ''
      },
      effects: {
        animations: false,
        shadows: false,
        gradients: false
      }
    },
    siteMetadata: {
      title: '',
      titleEn: '',
      description: '',
      descriptionEn: '',
      keywords: '',
      keywordsEn: '',
      favicon: '',
      appleTouchIcon: '',
      ogImage: ''
    }
  });

  useEffect(() => {
    // تحميل إعدادات الـ header من localStorage أولاً
    const savedHeaderSettings = localStorage.getItem('headerSettings');
    if (savedHeaderSettings) {
      try {
        const headerSettings = JSON.parse(savedHeaderSettings);
        console.log('Loading saved header settings:', headerSettings);
        setSettings(prev => ({
          ...prev,
          header: {
            ...prev.header,
            ...headerSettings
          }
        }));
      } catch (error) {
        console.log('Error loading header settings from localStorage');
      }
    }

    // تحميل إعدادات البانر من localStorage
    const savedBannerSettings = localStorage.getItem('bannerSettings');
    if (savedBannerSettings) {
      try {
        const bannerSettings = JSON.parse(savedBannerSettings);
        console.log('Loading saved banner settings:', bannerSettings);
        setSettings(prev => ({
          ...prev,
          banner: {
            ...prev.banner,
            ...bannerSettings
          }
        }));
      } catch (error) {
        console.log('Error loading banner settings from localStorage');
      }
    } else {
      // إذا لم توجد إعدادات محفوظة، يبقى البانر مغلق
      console.log('No saved banner settings found, banner will remain disabled');
    }
    
    // ثم جلب باقي الإعدادات من الخادم
    fetchSettings();
    
    // تأكد من وجود إعدادات افتراضية في localStorage
    const ensureDefaultSettings = () => {
      if (!localStorage.getItem('headerSettings')) {
        const defaultHeader = {
          showStoreNameMobile: false,
          showTaglineMobile: false,
          storeName: '',
          tagline: ''
        };
        localStorage.setItem('headerSettings', JSON.stringify(defaultHeader));
        console.log('ThemeSettings: Created default header settings');
      }
      
      if (!localStorage.getItem('bannerSettings')) {
        const defaultBanner = {
          enabled: false,
          text: '',
          backgroundColor: '#7c3aed',
          textColor: '#ffffff',
          showCloseButton: false,
          link: ''
        };
        localStorage.setItem('bannerSettings', JSON.stringify(defaultBanner));
        console.log('ThemeSettings: Created default banner settings');
      }
    };
    
    ensureDefaultSettings();
  }, []);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['banner', 'header', 'colors', 'fonts', 'layout', 'metadata'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const fetchSettings = async () => {
    try {
      const response = await api.get('/theme');
      if (response.data.success) {
        // احتفظ بإعدادات localStorage للـ header والبانر
        const savedHeaderSettings = localStorage.getItem('headerSettings');
        const savedBannerSettings = localStorage.getItem('bannerSettings');
        
        let localHeaderSettings = {};
        let localBannerSettings = {};
        
        if (savedHeaderSettings) {
          try {
            localHeaderSettings = JSON.parse(savedHeaderSettings);
          } catch (error) {
            console.log('Error parsing localStorage header settings');
          }
        }
        
        if (savedBannerSettings) {
          try {
            localBannerSettings = JSON.parse(savedBannerSettings);
          } catch (error) {
            console.log('Error parsing localStorage banner settings');
          }
        }
        
        // دمج الإعدادات من الخادم مع localStorage
        setSettings(prev => ({
          ...response.data.data,
          header: {
            ...response.data.data.header,
            ...localHeaderSettings // localStorage له الأولوية
          },
          banner: {
            ...response.data.data.banner,
            ...localBannerSettings // localStorage له الأولوية
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching theme settings:', error);
      // استخدام الإعدادات الافتراضية مع localStorage
      const savedBannerSettings = localStorage.getItem('bannerSettings');
      if (savedBannerSettings) {
        try {
          const bannerSettings = JSON.parse(savedBannerSettings);
          setSettings(prev => ({
            ...prev,
            banner: {
              ...prev.banner,
              ...bannerSettings
            }
          }));
        } catch (error) {
          console.log('Error loading banner from localStorage in catch');
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    
    const formData = new FormData();
    formData.append('image', file);
    
    try {
      const response = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      if (response.data.success) {
        const logoPath = response.data.filePath;
        handleHeaderChange('logo', logoPath);
        setLogoPreview(logoPath);
        toast.success('تم رفع اللوجو بنجاح');
      }
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('خطأ في رفع اللوجو');
    }
  };

  const handleLogoFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setLogoPreview(e.target.result);
      };
      reader.readAsDataURL(file);
      handleLogoUpload(file);
    }
  };

  const applyColorPreset = (preset) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          ...preset
        }
      }
    }));
  };

  const colorPresets = [
    {
      name: 'بنفسجي أبعاد التواصل الأصلي',
      colors: {
        primary: '#a855f7',
        primaryHover: '#9333ea',
        secondary: '#6b7280',
        accent: '#c084fc',
        background: '#ffffff',
        surface: '#f8fafc',
        textPrimary: '#1f2937',
        textSecondary: '#6b7280'
      }
    },
    {
      name: 'بنفسجي داكن احترافي',
      colors: {
        primary: '#7c3aed',
        primaryHover: '#6d28d9',
        secondary: '#64748b',
        accent: '#a78bfa'
      }
    },
    {
      name: 'بنفسجي فاتح عصري',
      colors: {
        primary: '#c084fc',
        primaryHover: '#a855f7',
        secondary: '#6b7280',
        accent: '#ddd6fe'
      }
    },
    {
      name: 'أخضر طبيعي',
      colors: {
        primary: '#22c55e',
        primaryHover: '#16a34a',
        secondary: '#6b7280',
        accent: '#10b981'
      }
    },
    {
      name: 'برتقالي دافئ',
      colors: {
        primary: '#f97316',
        primaryHover: '#ea580c',
        secondary: '#6b7280',
        accent: '#fb923c'
      }
    },
    {
      name: 'أزرق كلاسيكي',
      colors: {
        primary: '#3b82f6',
        primaryHover: '#2563eb',
        secondary: '#6b7280',
        accent: '#60a5fa'
      }
    }
  ];

  const handleSave = async () => {
    try {
      setSaving(true);
      console.log('Saving settings:', settings); // للتشخيص
      
      // حفظ إعدادات البانر في localStorage قبل الإرسال للخادم
      if (settings.banner) {
        localStorage.setItem('bannerSettings', JSON.stringify(settings.banner));
        console.log('handleSave: Saved banner settings to localStorage:', settings.banner);
        
        // إشعار البانر بالتغيير
        window.dispatchEvent(new CustomEvent('bannerSettingsChanged', { 
          detail: settings.banner 
        }));
      }
      
      // حفظ إعدادات الـ header في localStorage قبل الإرسال للخادم
      if (settings.header) {
        localStorage.setItem('headerSettings', JSON.stringify(settings.header));
        console.log('handleSave: Saved header settings to localStorage:', settings.header);
        
        // إشعار الـ header بالتغيير
        window.dispatchEvent(new CustomEvent('headerSettingsChanged', { 
          detail: settings.header 
        }));
      }
      
      const response = await api.put('/theme', settings);
      if (response.data.success) {
        toast.success('تم حفظ إعدادات الثيم بنجاح');
        
        // إشعار البانر بالتغيير بدلاً من إعادة تحميل الصفحة
        if (settings.banner) {
          window.dispatchEvent(new CustomEvent('bannerSettingsChanged', { 
            detail: settings.banner 
          }));
        }
        
        // إشعار الـ header بالتغيير
        if (settings.header) {
          window.dispatchEvent(new CustomEvent('headerSettingsChanged', { 
            detail: settings.header 
          }));
        }
        
        // لا نعيد تحميل الصفحة لتجنب فقدان الإعدادات
      }
    } catch (error) {
      console.error('Error saving theme settings:', error);
      toast.error('خطأ في حفظ إعدادات الثيم');
    } finally {
      setSaving(false);
    }
  };

  const handleHeaderChange = (field, value) => {
    console.log(`Changing ${field} to ${value}`); // للتشخيص
    
    const newSettings = {
      ...settings,
      header: {
        ...settings.header,
        [field]: value
      }
    };
    
    setSettings(newSettings);
    
    // حفظ فوري في localStorage لجميع إعدادات الـ header
    const headerSettings = {
      ...settings.header,
      [field]: value
    };
    localStorage.setItem('headerSettings', JSON.stringify(headerSettings));
    console.log('ThemeSettings: Saved header to localStorage:', headerSettings); // للتشخيص
    
    // إشعار الـ Navbar بالتغيير مع تأخير بسيط
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('headerSettingsChanged', { 
        detail: headerSettings 
      }));
    }, 100);
  };

  const handleBannerChange = async (field, value) => {
    console.log(`Banner: Changing ${field} to ${value}`);
    
    // تحديث الحالة المحلية
    const updatedBannerSettings = {
      ...settings.banner,
      [field]: value
    };
    
    setSettings(prev => ({
      ...prev,
      banner: updatedBannerSettings
    }));
    
    console.log('Banner: Updated settings:', updatedBannerSettings);
    
    // حفظ فوري في الخادم
    try {
      const response = await api.put('/theme/banner', updatedBannerSettings);
      if (response.data.success) {
        console.log('Banner: ✅ Saved to server successfully');
        
        // إشعار البانر بالتحديث
        window.dispatchEvent(new CustomEvent('bannerUpdated'));
        console.log('Banner: ✅ Update event dispatched');
      } else {
        console.log('Banner: ❌ Failed to save to server');
      }
    } catch (error) {
      console.error('Banner: ❌ Error saving to server:', error);
    }
  };

  const handleColorChange = (colorKey, value) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        colors: {
          ...prev.theme.colors,
          [colorKey]: value
        }
      }
    }));
  };

  const handleFontChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        fonts: {
          ...prev.theme.fonts,
          [section]: section === 'size' ? {
            ...prev.theme.fonts.size,
            [field]: value
          } : value
        }
      }
    }));
  };

  const handleLayoutChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        layout: {
          ...prev.theme.layout,
          [field]: value
        }
      }
    }));
  };

  const handleEffectChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        effects: {
          ...prev.theme.effects,
          [field]: value
        }
      }
    }));
  };

  const handleMetadataChange = (field, value) => {
    const newMetadata = {
      ...settings.siteMetadata,
      [field]: value
    };
    
    setSettings(prev => ({
      ...prev,
      siteMetadata: newMetadata
    }));
    
    // حفظ فوري في localStorage
    localStorage.setItem('seoSettings', JSON.stringify(newMetadata));
    console.log('Updated SEO settings:', newMetadata);
    
    // إشعار النظام بالتغيير
    window.dispatchEvent(new CustomEvent('seoSettingsChanged', { 
      detail: newMetadata 
    }));
  };

  const handleIconUpload = async (event, iconType) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = {
      favicon: ['image/x-icon', 'image/png', 'image/jpeg', 'image/gif', 'image/svg+xml'],
      appleTouchIcon: ['image/png', 'image/jpeg'],
      ogImage: ['image/png', 'image/jpeg', 'image/gif']
    };

    if (!validTypes[iconType].includes(file.type)) {
      toast.error('نوع الملف غير مدعوم');
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('حجم الملف كبير جداً (الحد الأقصى 2MB)');
      return;
    }

    try {
      setUploadingIcon(iconType);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', iconType);

      const response = await api.post('/upload/icon', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        const uploadedUrl = response.data.url;
        handleMetadataChange(iconType, uploadedUrl);
        toast.success('تم رفع الأيقونة بنجاح');
      }
    } catch (error) {
      console.error('Error uploading icon:', error);
      toast.error('خطأ في رفع الأيقونة');
    } finally {
      setUploadingIcon(null);
      // Clear the input
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Back Button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/admin/settings')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <FiArrowLeft className="w-4 h-4" />
          العودة إلى مركز الإعدادات
        </button>
      </div>

      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center gap-3">
            <FiSettings className="text-primary-600" />
            إعدادات الثيم والتصميم
          </h1>
          <p className="text-gray-600">تخصيص شكل ولون الموقع</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition disabled:opacity-50"
        >
          <FiSave size={18} />
          {saving ? 'جاري الحفظ...' : 'حفظ وتطبيق'}
        </button>
      </div>     
 {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
        <div className="flex border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('banner')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
              activeTab === 'banner'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiSettings size={18} />
            الإعلان العلوي
          </button>
          <button
            onClick={() => setActiveTab('header')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
              activeTab === 'header'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiLayout size={18} />
            رأس الصفحة
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
              activeTab === 'colors'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiSettings size={18} />
            الألوان
          </button>
          <button
            onClick={() => setActiveTab('fonts')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
              activeTab === 'fonts'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiType size={18} />
            الخطوط
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
              activeTab === 'layout'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiLayout size={18} />
            التخطيط
          </button>
          
          <button
            onClick={() => setActiveTab('metadata')}
            className={`flex items-center gap-2 px-6 py-4 font-medium transition ${
              activeTab === 'metadata'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            <FiSettings size={18} />
            إعدادات الموقع
          </button>
        </div>
      </div>

      {/* Header Settings */}
      {activeTab === 'header' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات رأس الصفحة</h2>
          
          <div className="space-y-6">
            {/* Logo Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اللوجو</label>
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border-2 border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {(logoPreview || settings.header.logo) ? (
                    <img 
                      src={logoPreview || settings.header.logo} 
                      alt="Logo Preview" 
                      className="w-full h-full object-contain rounded-lg"
                    />
                  ) : (
                    <div className="text-gray-400 text-xs">لا يوجد لوجو</div>
                  )}
                </div>
                
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoFileChange}
                    className="hidden"
                    id="logo-upload"
                  />
                  <label
                    htmlFor="logo-upload"
                    className="cursor-pointer bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition"
                  >
                    <FiSettings size={16} />
                    رفع لوجو جديد
                  </label>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, SVG - الحد الأقصى 2MB</p>
                </div>
              </div>
              
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">أو أدخل مسار اللوجو يدوياً</label>
                <input
                  type="text"
                  value={settings.header?.logo || ''}
                  onChange={(e) => handleHeaderChange('logo', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="/logo.png"
                />
              </div>
            </div>

            {/* Store Name and Tagline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اسم المتجر</label>
                <input
                  type="text"
                  value={settings.header?.storeName || ''}
                  onChange={(e) => handleHeaderChange('storeName', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الشعار</label>
                <input
                  type="text"
                  value={settings.header?.tagline || ''}
                  onChange={(e) => handleHeaderChange('tagline', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Display Options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">خيارات العرض</h3>
                
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.header?.showTagline || false}
                      onChange={(e) => handleHeaderChange('showTagline', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="font-medium">إظهار الشعار</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.header?.showStoreNameMobile || false}
                      onChange={(e) => handleHeaderChange('showStoreNameMobile', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="font-medium">إظهار اسم المتجر في الجوال</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.header?.showTaglineMobile || false}
                      onChange={(e) => handleHeaderChange('showTaglineMobile', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="font-medium">إظهار الشعار في الجوال</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.header?.showSearch || false}
                      onChange={(e) => handleHeaderChange('showSearch', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="font-medium">إظهار البحث</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.header?.showCart || false}
                      onChange={(e) => handleHeaderChange('showCart', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="font-medium">إظهار السلة</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800">خيارات التخطيط</h3>
                
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.header?.sticky || false}
                      onChange={(e) => handleHeaderChange('sticky', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="font-medium">ثابت في الأعلى</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.header?.shadow || false}
                      onChange={(e) => handleHeaderChange('shadow', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="font-medium">إظهار الظل</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Banner Settings */}
      {activeTab === 'banner' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات الإعلان العلوي</h2>
          
          <div className="space-y-6">
            {/* Enable/Disable Banner */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <h3 className="font-semibold text-gray-800">تفعيل الإعلان العلوي</h3>
                <p className="text-sm text-gray-600">إظهار أو إخفاء البانر في أعلى الموقع</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.banner?.enabled || false}
                  onChange={(e) => handleBannerChange('enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            {/* Banner Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">نص الإعلان</label>
              <input
                type="text"
                value={settings.banner?.text || ''}
                onChange={(e) => handleBannerChange('text', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="اكتب نص الإعلان الذي تريد عرضه..."
              />
              <p className="text-xs text-gray-500 mt-1">النص الذي سيظهر في البانر</p>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">لون الخلفية</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.banner?.backgroundColor || '#7c3aed'}
                    onChange={(e) => handleBannerChange('backgroundColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.banner?.backgroundColor || '#7c3aed'}
                    onChange={(e) => handleBannerChange('backgroundColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="#7c3aed"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">لون النص</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={settings.banner?.textColor || '#ffffff'}
                    onChange={(e) => handleBannerChange('textColor', e.target.value)}
                    className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <input
                    type="text"
                    value={settings.banner?.textColor || '#ffffff'}
                    onChange={(e) => handleBannerChange('textColor', e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="#ffffff"
                  />
                </div>
              </div>
            </div>

            {/* Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">رابط الإعلان (اختياري)</label>
              <input
                type="text"
                value={settings.banner?.link || ''}
                onChange={(e) => handleBannerChange('link', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="/deals"
              />
              <p className="text-xs text-gray-500 mt-1">الصفحة التي سيتم الانتقال إليها عند النقر على البانر</p>
            </div>

            {/* ملاحظة */}
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-800 mb-2">ملاحظة مهمة</h3>
              <p className="text-sm text-blue-700">
                البانر سيظهر بشكل ثابت للعملاء ولن يتمكنوا من إغلاقه. يمكنك التحكم في إظهاره أو إخفاؤه من خلال خيار "تفعيل الإعلان العلوي" أعلاه.
              </p>
            </div>

            {/* Color Presets for Banner */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-4">ألوان مقترحة للبانر</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    handleBannerChange('backgroundColor', '#7c3aed');
                    handleBannerChange('textColor', '#ffffff');
                  }}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-primary-500 transition"
                >
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#7c3aed' }}></div>
                  <span className="text-sm">بنفسجي داكن</span>
                </button>
                
                <button
                  onClick={() => {
                    handleBannerChange('backgroundColor', '#a855f7');
                    handleBannerChange('textColor', '#ffffff');
                  }}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-primary-500 transition"
                >
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#a855f7' }}></div>
                  <span className="text-sm">بنفسجي فاتح</span>
                </button>
                
                <button
                  onClick={() => {
                    handleBannerChange('backgroundColor', '#059669');
                    handleBannerChange('textColor', '#ffffff');
                  }}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-primary-500 transition"
                >
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#059669' }}></div>
                  <span className="text-sm">أخضر</span>
                </button>
                
                <button
                  onClick={() => {
                    handleBannerChange('backgroundColor', '#dc2626');
                    handleBannerChange('textColor', '#ffffff');
                  }}
                  className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg hover:border-primary-500 transition"
                >
                  <div className="w-6 h-6 rounded" style={{ backgroundColor: '#dc2626' }}></div>
                  <span className="text-sm">أحمر</span>
                </button>
              </div>
            </div>

            {/* Preview */}
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">معاينة البانر</h3>
              <div 
                className="relative w-full py-2 px-3 text-center text-sm sm:text-xs font-medium rounded-lg"
                style={{
                  background: `linear-gradient(135deg, ${settings.banner?.backgroundColor || '#7c3aed'} 0%, #8b5cf6 100%)`,
                  color: settings.banner?.textColor || '#ffffff'
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse opacity-30 rounded-lg"></div>
                
                <div className="container mx-auto flex items-center justify-center relative z-10">
                  <span className="inline-block ml-1 sm:ml-2 text-xs sm:text-sm">🚚</span>
                  
                  <span className="flex-1 text-center font-medium px-2">
                    {settings.banner?.text || 'اكتب نص الإعلان هنا...'}
                  </span>
                  
                  <span className="inline-block mr-1 sm:mr-2 text-xs sm:text-sm">💬</span>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Colors Settings */}
      {activeTab === 'colors' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات الألوان</h2>
          
          {/* Color Presets */}
          <div className="mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">ألوان مقترحة مستوحاة من الشعار</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {colorPresets.map((preset, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 hover:border-primary-500 transition cursor-pointer"
                     onClick={() => applyColorPreset(preset.colors)}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex gap-1">
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.colors.primary }}
                      ></div>
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.colors.primaryHover }}
                      ></div>
                      <div 
                        className="w-4 h-4 rounded-full border"
                        style={{ backgroundColor: preset.colors.accent }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-sm font-medium mb-1">{preset.name}</div>
                  <button className="text-xs text-primary-600 hover:text-primary-700">
                    تطبيق هذه الألوان
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اللون الأساسي</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.theme.colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.theme.colors.primary}
                  onChange={(e) => handleColorChange('primary', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">اللون الأساسي (Hover)</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.theme.colors.primaryHover}
                  onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.theme.colors.primaryHover}
                  onChange={(e) => handleColorChange('primaryHover', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">لون التمييز</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.theme.colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.theme.colors.accent}
                  onChange={(e) => handleColorChange('accent', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">لون الخلفية</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.theme.colors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.theme.colors.background}
                  onChange={(e) => handleColorChange('background', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">لون السطح</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={settings.theme.colors.surface}
                  onChange={(e) => handleColorChange('surface', e.target.value)}
                  className="w-12 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <input
                  type="text"
                  value={settings.theme.colors.surface}
                  onChange={(e) => handleColorChange('surface', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3">معاينة الألوان</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: settings.theme.colors.primary }}
                ></div>
                <span className="text-sm">أساسي</span>
              </div>
              <div className="flex items-center gap-2">
                <div 
                  className="w-6 h-6 rounded border"
                  style={{ backgroundColor: settings.theme.colors.accent }}
                ></div>
                <span className="text-sm">تمييز</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fonts Settings */}
      {activeTab === 'fonts' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات الخطوط</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الخط الأساسي (العربي)</label>
                <select
                  value={settings.theme.fonts.primary}
                  onChange={(e) => handleFontChange('primary', null, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Cairo">Cairo</option>
                  <option value="Tajawal">Tajawal</option>
                  <option value="Amiri">Amiri</option>
                  <option value="Noto Sans Arabic">Noto Sans Arabic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الخط الثانوي (الإنجليزي)</label>
                <select
                  value={settings.theme.fonts.secondary}
                  onChange={(e) => handleFontChange('secondary', null, e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Inter">Inter</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                  <option value="Poppins">Poppins</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-800 mb-3">معاينة الخطوط</h3>
              <div className="space-y-3">
                <div style={{ fontFamily: settings.theme.fonts.primary, fontSize: '24px' }}>
                  عنوان رئيسي بالخط العربي
                </div>
                <div style={{ fontFamily: settings.theme.fonts.primary }}>
                  نص عادي بالخط العربي - هذا مثال على النص العادي
                </div>
                <div style={{ fontFamily: settings.theme.fonts.secondary }}>
                  English text with secondary font
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Layout Settings */}
      {activeTab === 'layout' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات التخطيط والتأثيرات</h2>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نصف قطر الحواف</label>
                <input
                  type="text"
                  value={settings.theme.layout.borderRadius}
                  onChange={(e) => handleLayoutChange('borderRadius', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="12px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المسافات</label>
                <input
                  type="text"
                  value={settings.theme.layout.spacing}
                  onChange={(e) => handleLayoutChange('spacing', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="16px"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عرض الحاوية</label>
                <input
                  type="text"
                  value={settings.theme.layout.containerWidth}
                  onChange={(e) => handleLayoutChange('containerWidth', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="1200px"
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-4">التأثيرات البصرية</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.theme.effects.animations}
                      onChange={(e) => handleEffectChange('animations', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="font-medium">الرسوم المتحركة</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.theme.effects.shadows}
                      onChange={(e) => handleEffectChange('shadows', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="font-medium">الظلال</span>
                </div>

                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.theme.effects.gradients}
                      onChange={(e) => handleEffectChange('gradients', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                  </label>
                  <span className="font-medium">التدرجات اللونية</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Site Metadata Settings */}
      {activeTab === 'metadata' && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">إعدادات الموقع العامة</h2>
          
          <div className="space-y-6">
            {/* Site Title */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الموقع (عربي)</label>
                <input
                  type="text"
                  value={settings.siteMetadata?.title || ''}
                  onChange={(e) => handleMetadataChange('title', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="اكتب اسم الموقع هنا..."
                />
                <p className="text-xs text-gray-500 mt-1">يظهر في تبويب المتصفح</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الموقع (إنجليزي)</label>
                <input
                  type="text"
                  value={settings.siteMetadata?.titleEn || ''}
                  onChange={(e) => handleMetadataChange('titleEn', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Site Name in English..."
                />
                <p className="text-xs text-gray-500 mt-1">للمتصفحات الإنجليزية</p>
              </div>
            </div>

            {/* Site Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف الموقع (عربي)</label>
                <textarea
                  value={settings.siteMetadata?.description || ''}
                  onChange={(e) => handleMetadataChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="اكتب وصف الموقع هنا..."
                />
                <p className="text-xs text-gray-500 mt-1">يظهر في نتائج البحث</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف الموقع (إنجليزي)</label>
                <textarea
                  value={settings.siteMetadata?.descriptionEn || ''}
                  onChange={(e) => handleMetadataChange('descriptionEn', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Site description in English..."
                />
                <p className="text-xs text-gray-500 mt-1">للمحركات الإنجليزية</p>
              </div>
            </div>

            {/* Keywords */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الكلمات المفتاحية (عربي)</label>
                <input
                  type="text"
                  value={settings.siteMetadata?.keywords || ''}
                  onChange={(e) => handleMetadataChange('keywords', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="الكلمات المفتاحية مفصولة بفاصلة..."
                />
                <p className="text-xs text-gray-500 mt-1">افصل بفاصلة</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الكلمات المفتاحية (إنجليزي)</label>
                <input
                  type="text"
                  value={settings.siteMetadata?.keywordsEn || ''}
                  onChange={(e) => handleMetadataChange('keywordsEn', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Keywords separated by commas..."
                />
                <p className="text-xs text-gray-500 mt-1">Separate with commas</p>
              </div>
            </div>

            {/* Icons and Images */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800">الأيقونات والصور</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Favicon Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Favicon</label>
                  <div className="space-y-3">
                    {/* Current favicon preview */}
                    {settings.siteMetadata?.favicon && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img 
                          src={settings.siteMetadata?.favicon} 
                          alt="Current favicon" 
                          className="w-6 h-6"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="w-6 h-6 bg-gray-300 rounded flex items-center justify-center text-xs text-gray-600 hidden">
                          ICO
                        </div>
                        <span className="text-sm text-gray-600 flex-1">{settings.siteMetadata?.favicon}</span>
                      </div>
                    )}
                    
                    {/* File upload */}
                    <div className="relative">
                      <input
                        type="file"
                        accept=".ico,.png,.jpg,.jpeg,.gif,.svg"
                        onChange={(e) => handleIconUpload(e, 'favicon')}
                        className="hidden"
                        id="favicon-upload"
                      />
                      <label
                        htmlFor="favicon-upload"
                        className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg transition ${
                          uploadingIcon === 'favicon' 
                            ? 'border-primary-500 bg-primary-50 cursor-not-allowed' 
                            : 'border-gray-300 cursor-pointer hover:border-primary-500 hover:bg-primary-50'
                        }`}
                      >
                        <div className="text-center">
                          {uploadingIcon === 'favicon' ? (
                            <>
                              <div className="animate-spin text-2xl mb-1">⏳</div>
                              <div className="text-sm font-medium text-primary-700">جاري الرفع...</div>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl mb-1">📁</div>
                              <div className="text-sm font-medium text-gray-700">رفع Favicon</div>
                              <div className="text-xs text-gray-500">ICO, PNG, JPG (16x16 أو 32x32)</div>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    
                    {/* Manual input */}
                    <input
                      type="text"
                      value={settings.siteMetadata?.favicon || ''}
                      onChange={(e) => handleMetadataChange('favicon', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="/favicon.ico"
                    />
                  </div>
                </div>

                {/* Apple Touch Icon Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Apple Touch Icon</label>
                  <div className="space-y-3">
                    {/* Current icon preview */}
                    {settings.siteMetadata?.appleTouchIcon && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <img 
                          src={settings.siteMetadata?.appleTouchIcon} 
                          alt="Current apple touch icon" 
                          className="w-8 h-8 rounded-lg"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center text-xs text-gray-600 hidden">
                          🍎
                        </div>
                        <span className="text-sm text-gray-600 flex-1">{settings.siteMetadata?.appleTouchIcon}</span>
                      </div>
                    )}
                    
                    {/* File upload */}
                    <div className="relative">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg"
                        onChange={(e) => handleIconUpload(e, 'appleTouchIcon')}
                        className="hidden"
                        id="apple-icon-upload"
                      />
                      <label
                        htmlFor="apple-icon-upload"
                        className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg transition ${
                          uploadingIcon === 'appleTouchIcon' 
                            ? 'border-primary-500 bg-primary-50 cursor-not-allowed' 
                            : 'border-gray-300 cursor-pointer hover:border-primary-500 hover:bg-primary-50'
                        }`}
                      >
                        <div className="text-center">
                          {uploadingIcon === 'appleTouchIcon' ? (
                            <>
                              <div className="animate-spin text-2xl mb-1">⏳</div>
                              <div className="text-sm font-medium text-primary-700">جاري الرفع...</div>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl mb-1">🍎</div>
                              <div className="text-sm font-medium text-gray-700">رفع أيقونة iOS</div>
                              <div className="text-xs text-gray-500">PNG, JPG (180x180)</div>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    
                    {/* Manual input */}
                    <input
                      type="text"
                      value={settings.siteMetadata?.appleTouchIcon || ''}
                      onChange={(e) => handleMetadataChange('appleTouchIcon', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="/apple-touch-icon.png"
                    />
                  </div>
                </div>

                {/* OG Image Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">صورة المشاركة</label>
                  <div className="space-y-3">
                    {/* Current image preview */}
                    {settings.siteMetadata?.ogImage && (
                      <div className="space-y-2">
                        <img 
                          src={settings.siteMetadata?.ogImage} 
                          alt="Current OG image" 
                          className="w-full h-20 object-cover rounded-lg border"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'block';
                          }}
                        />
                        <div className="w-full h-20 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600 hidden">
                          🖼️ صورة المشاركة
                        </div>
                        <span className="text-xs text-gray-600">{settings.siteMetadata.ogImage}</span>
                      </div>
                    )}
                    
                    {/* File upload */}
                    <div className="relative">
                      <input
                        type="file"
                        accept=".png,.jpg,.jpeg,.gif"
                        onChange={(e) => handleIconUpload(e, 'ogImage')}
                        className="hidden"
                        id="og-image-upload"
                      />
                      <label
                        htmlFor="og-image-upload"
                        className={`flex items-center justify-center w-full px-4 py-3 border-2 border-dashed rounded-lg transition ${
                          uploadingIcon === 'ogImage' 
                            ? 'border-primary-500 bg-primary-50 cursor-not-allowed' 
                            : 'border-gray-300 cursor-pointer hover:border-primary-500 hover:bg-primary-50'
                        }`}
                      >
                        <div className="text-center">
                          {uploadingIcon === 'ogImage' ? (
                            <>
                              <div className="animate-spin text-2xl mb-1">⏳</div>
                              <div className="text-sm font-medium text-primary-700">جاري الرفع...</div>
                            </>
                          ) : (
                            <>
                              <div className="text-2xl mb-1">🖼️</div>
                              <div className="text-sm font-medium text-gray-700">رفع صورة المشاركة</div>
                              <div className="text-xs text-gray-500">PNG, JPG (1200x630 مُفضل)</div>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                    
                    {/* Manual input */}
                    <input
                      type="text"
                      value={settings.siteMetadata.ogImage}
                      onChange={(e) => handleMetadataChange('ogImage', e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="/og-image.jpg"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-gray-800 mb-3">معاينة التبويب</h3>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-4 h-4 bg-blue-500 rounded-sm flex items-center justify-center text-white text-xs">
                  📱
                </div>
                <span className="font-medium">
                  {settings.siteMetadata.titleEn} | {settings.siteMetadata.title}
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 max-w-md">
                {settings.siteMetadata.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ThemeSettings;