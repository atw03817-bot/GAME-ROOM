import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSmartphone, FiTool, FiUser, FiSend, FiAlertCircle, FiX, FiCamera } from 'react-icons/fi'
import api from '../utils/api'
import toast from 'react-hot-toast'
import PatternInput from '../components/PatternInput'
import '../styles/maintenance-clean.css'

function MaintenanceRequest() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState([])
  const [products, setProducts] = useState([])
  const [loadingProducts, setLoadingProducts] = useState(true)
  
  const [formData, setFormData] = useState({
    // معلومات الجهاز
    brand: 'HOTWAV',
    model: '',
    color: '',
    storage: '',
    serialNumber: '',
    purchaseDate: '',
    
    // كلمة السر
    hasPassword: false,
    passwordType: 'none',
    passwordValue: '',
    patternValue: '',
    
    // المشكلة
    category: '',
    subCategory: '',
    description: '',
    symptoms: [],
    priority: 'normal',
    
    // معلومات العميل
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    customerAddress: '',
    
    // معلومات الشحن
    needsShipping: false,
    shippingProvider: 'none', // تعيين قيمة افتراضية صحيحة
    shippingCost: 0,
    pickupAddress: '',
  })

  // جلب شركات الشحن من قاعدة البيانات
  const [shippingProviders, setShippingProviders] = useState([])
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [calculatingCost, setCalculatingCost] = useState(null) // لتتبع أي شركة يتم حساب تكلفتها

  // جلب المنتجات من قاعدة البيانات
  useEffect(() => {
    fetchProducts()
    fetchShippingProviders()
  }, [])

  const fetchShippingProviders = async () => {
    try {
      setLoadingShipping(true)
      const response = await api.get('/shipping/providers')
      
      if (response.data.success && response.data.data) {
        setShippingProviders(response.data.data)
      } else {
        console.log('No shipping providers found')
        setShippingProviders([])
      }
    } catch (error) {
      console.error('Error fetching shipping providers:', error)
      // استخدام شركات الشحن الافتراضية في حالة الخطأ
      setShippingProviders([
        { 
          _id: 'aramex', 
          name: 'aramex',
          displayName: 'أرامكس', 
          nameAr: 'أرامكس',
          enabled: true
        },
        { 
          _id: 'smsa', 
          name: 'smsa',
          displayName: 'سمسا إكسبرس', 
          nameAr: 'سمسا إكسبرس',
          enabled: true
        },
        { 
          _id: 'naqel', 
          name: 'naqel',
          displayName: 'ناقل إكسبرس', 
          nameAr: 'ناقل إكسبرس',
          enabled: true
        }
      ])
    } finally {
      setLoadingShipping(false)
    }
  }

  const fetchProducts = async () => {
    try {
      setLoadingProducts(true)
      const response = await api.get('/products', {
        params: { limit: 1000 }
      })
      
      let productsArray = []
      if (Array.isArray(response.data)) {
        productsArray = response.data
      } else if (response.data && response.data.products) {
        productsArray = response.data.products
      } else if (response.data && Array.isArray(response.data.data)) {
        productsArray = response.data.data
      }
      
      if (productsArray.length > 0) {
        setProducts(productsArray)
        // تم إزالة الإشعار المزعج
      } else {
        toast.error('لا توجد منتجات في قاعدة البيانات')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('خطأ في جلب قائمة الأجهزة')
    } finally {
      setLoadingProducts(false)
    }
  }

  const colorOptions = ['أسود', 'أبيض', 'ذهبي', 'فضي', 'أزرق', 'أخضر', 'بنفسجي', 'أحمر', 'وردي', 'أخرى']
  const storageOptions = ['64GB', '128GB', '256GB', '512GB', '1TB']
  
  const issueCategories = [
    { value: 'screen', label: 'مشاكل الشاشة', subCategories: ['شاشة مكسورة', 'شاشة لا تعمل', 'خطوط في الشاشة', 'بقع سوداء', 'لمس لا يعمل'] },
    { value: 'battery', label: 'مشاكل البطارية', subCategories: ['بطارية لا تشحن', 'بطارية تفرغ بسرعة', 'بطارية منتفخة', 'جهاز لا يشتغل', 'شحن بطيء'] },
    { value: 'software', label: 'مشاكل السوفتوير', subCategories: ['جهاز بطيء', 'تطبيقات تتوقف', 'مشاكل النظام', 'فيروسات', 'تحديث فاشل'] },
    { value: 'hardware', label: 'مشاكل الهاردوير', subCategories: ['كاميرا لا تعمل', 'مايكروفون', 'سماعة', 'أزرار', 'واي فاي', 'بلوتوث'] },
    { value: 'water', label: 'أضرار المياه', subCategories: ['سقط في الماء', 'تعرض للمطر', 'انسكب عليه سائل', 'رطوبة'] },
    { value: 'physical', label: 'أضرار جسدية', subCategories: ['سقط وانكسر', 'خدوش', 'انبعاج', 'كسر في الإطار'] },
    { value: 'other', label: 'أخرى', subCategories: ['مشكلة أخرى'] }
  ]

  const symptoms = [
    'لا يشتغل نهائياً', 'يشتغل ويطفي', 'بطيء جداً', 'يسخن كثيراً',
    'لا يشحن', 'الشحن بطيء', 'مشاكل في الصوت', 'مشاكل في اللمس',
    'الشاشة مظلمة', 'ألوان غريبة', 'تطبيقات تتوقف', 'إعادة تشغيل تلقائي'
  ]

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleShippingProviderChange = async (providerId) => {
    setCalculatingCost(providerId) // بدء حساب التكلفة لهذه الشركة
    
    try {
      // جلب سعر الشحن من النظام الموجود
      const response = await api.post('/shipping/calculate', {
        providerId: providerId,
        city: 'الرياض', // يمكن تحديثها حسب مدينة العميل
        weight: 0.5 // وزن افتراضي للجهاز (أقل من 5 كيلو)
      })
      
      let shippingCost = 25 // سعر افتراضي
      if (response.data.success && response.data.data) {
        shippingCost = response.data.data.cost || response.data.data.finalCost || 25
      }
      
      setFormData(prev => ({
        ...prev,
        shippingProvider: providerId,
        shippingCost: shippingCost
      }))
    } catch (error) {
      console.error('Error calculating shipping cost:', error)
      
      // في حالة الخطأ، استخدام السعر الافتراضي بدون إظهار رسالة خطأ مزعجة
      setFormData(prev => ({
        ...prev,
        shippingProvider: providerId,
        shippingCost: 25 // سعر افتراضي في حالة الخطأ
      }))
    } finally {
      setCalculatingCost(null) // انتهاء حساب التكلفة
    }
  }

  const handleSymptomToggle = (symptom) => {
    setFormData(prev => ({
      ...prev,
      symptoms: prev.symptoms.includes(symptom)
        ? prev.symptoms.filter(s => s !== symptom)
        : [...prev.symptoms, symptom]
    }))
  }

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files)
    if (files.length + images.length > 5) {
      toast.error('يمكن رفع 5 صور كحد أقصى')
      return
    }

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5 ميجا')
        return
      }

      const reader = new FileReader()
      reader.onload = (e) => {
        setImages(prev => [...prev, {
          file,
          preview: e.target.result,
          name: file.name
        }])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const errors = []
    
    if (!formData.model) errors.push('نوع الجهاز مطلوب')
    if (!formData.serialNumber) errors.push('السيريال نمبر مطلوب')
    if (!formData.category) errors.push('نوع المشكلة مطلوب')
    if (!formData.description.trim()) errors.push('وصف المشكلة مطلوب')
    if (!formData.customerName.trim()) errors.push('اسم العميل مطلوب')
    if (!formData.customerPhone.trim()) errors.push('رقم الجوال مطلوب')
    if (!formData.customerAddress.trim()) errors.push('العنوان مطلوب')
    
    if (formData.hasPassword === null || formData.hasPassword === undefined) {
      errors.push('يرجى تحديد حالة حماية الجهاز')
    } else if (formData.hasPassword) {
      if (!formData.passwordType || formData.passwordType === 'none') {
        errors.push('يرجى تحديد نوع كلمة السر')
      } else if (formData.passwordType === 'text' && !formData.passwordValue.trim()) {
        errors.push('كلمة السر النصية مطلوبة')
      } else if (formData.passwordType === 'pattern' && !formData.patternValue.trim()) {
        errors.push('نمط كلمة السر مطلوب')
      }
    }
    
    // التحقق من الصور (اختياري مؤقتاً للاختبار)
    // if (images.length < 3) {
    //   errors.push('يجب رفع 3 صور على الأقل للجهاز (أمام، خلف، جانب)')
    // }
    
    const phoneRegex = /^(05|5)[0-9]{8}$/
    if (formData.customerPhone && !phoneRegex.test(formData.customerPhone.replace(/\s/g, ''))) {
      errors.push('رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)')
    }
    
    // التحقق من معلومات الشحن
    if (formData.needsShipping) {
      if (!formData.shippingProvider) {
        errors.push('يرجى اختيار شركة الشحن')
      }
      if (!formData.pickupAddress.trim()) {
        errors.push('عنوان استلام الجهاز مطلوب')
      }
    }
    
    return errors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const errors = validateForm()
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error))
      return
    }

    try {
      setLoading(true)
      
      const imageUrls = []
      
      // محاولة رفع الصور مع معالجة أفضل للأخطاء
      if (images && images.length > 0) {
        for (const image of images) {
          const uploadFormData = new FormData()
          uploadFormData.append('image', image.file)
          
          try {
            const uploadResponse = await api.post('/upload/maintenance', uploadFormData, {
              headers: { 'Content-Type': 'multipart/form-data' },
              timeout: 30000 // 30 ثانية timeout
            })
            
            if (uploadResponse.data && uploadResponse.data.url) {
              imageUrls.push(uploadResponse.data.url)
            }
          } catch (uploadError) {
            console.error('Error uploading image:', uploadError)
            // عدم إيقاف العملية إذا فشل رفع صورة واحدة
            toast.error(`فشل رفع إحدى الصور: ${uploadError.message}`)
          }
        }
      }
      
      console.log('📸 Uploaded images:', imageUrls.length, 'out of', images.length)

      const requestData = {
        customerInfo: {
          name: formData.customerName,
          phone: formData.customerPhone,
          email: formData.customerEmail,
          address: formData.customerAddress
        },
        device: {
          brand: formData.brand,
          model: formData.model,
          color: formData.color,
          storage: formData.storage,
          serialNumber: formData.serialNumber,
          purchaseDate: formData.purchaseDate,
          hasPassword: formData.hasPassword,
          passwordType: formData.hasPassword ? formData.passwordType : 'none',
          passwordValue: formData.passwordType === 'text' ? formData.passwordValue : '',
          patternValue: formData.passwordType === 'pattern' ? formData.patternValue : ''
        },
        issue: {
          category: formData.category,
          subCategory: formData.subCategory,
          description: formData.description,
          symptoms: formData.symptoms,
          priority: formData.priority,
          images: imageUrls
        },
        shipping: {
          isRequired: formData.needsShipping,
          provider: formData.needsShipping ? formData.shippingProvider : 'none',
          providerName: formData.needsShipping ? 
            (() => {
              const selectedProvider = shippingProviders.find(p => (p._id || p.id) === formData.shippingProvider);
              return selectedProvider?.displayName || selectedProvider?.nameAr || selectedProvider?.name || 'غير محدد';
            })() : '',
          cost: formData.needsShipping ? formData.shippingCost : 0,
          pickupAddress: formData.needsShipping ? formData.pickupAddress : '',
          deliveryAddress: formData.customerAddress,
          status: 'pending'
        }
      }

      const response = await api.post('/maintenance/request', requestData)
      
      if (response.data.success) {
        toast.success('تم إرسال طلب الصيانة بنجاح!')
        toast.success(`رقم الطلب: ${response.data.data.requestNumber}`)
        
        // إعادة تعيين النموذج
        setFormData({
          brand: 'HOTWAV', model: '', color: '', storage: '', serialNumber: '', purchaseDate: '',
          hasPassword: false, passwordType: 'none', passwordValue: '', patternValue: '',
          category: '', subCategory: '', description: '', symptoms: [], priority: 'normal',
          customerName: '', customerPhone: '', customerEmail: '', customerAddress: '',
          needsShipping: false, shippingProvider: 'none', shippingCost: 0, pickupAddress: '',
        })
        setImages([])
      }
    } catch (error) {
      console.error('Error submitting maintenance request:', error)
      console.error('Error response:', error.response?.data)
      
      let errorMessage = 'حدث خطأ أثناء إرسال الطلب'
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 maintenance-clean" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <FiTool className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 صيانة أجهزة HOTWAV</h1>
          <p className="text-gray-600">املأ النموذج أدناه وسنتواصل معك خلال 24 ساعة</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* معلومات الجهاز */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FiSmartphone className="w-6 h-6 text-primary-600" />
              <h2 className="text-xl font-bold text-gray-900">📱 معلومات جهاز HOTWAV</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الجهاز <span className="text-red-500">*</span>
                </label>
                {loadingProducts ? (
                  <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm">
                    جاري تحميل قائمة الأجهزة...
                  </div>
                ) : (
                  <select
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                    required
                  >
                    <option value="">اختر نوع الجهاز</option>
                    {products.map((product, index) => (
                      <option 
                        key={product._id || index} 
                        value={product.nameAr || product.name?.ar || product.name || product.title || `منتج ${index + 1}`}
                      >
                        {product.nameAr || product.name?.ar || product.name || product.title || `منتج ${index + 1}`}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
                <select
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">اختر اللون</option>
                  {colorOptions.map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السعة</label>
                <select
                  value={formData.storage}
                  onChange={(e) => handleInputChange('storage', e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900"
                >
                  <option value="">اختر السعة</option>
                  {storageOptions.map(storage => (
                    <option key={storage} value={storage}>{storage}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* معلومات الجهاز والحماية */}
            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-4">
                <FiAlertCircle className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">🔢 معلومات الجهاز (مطلوبة)</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    السيريال نمبر <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono"
                    placeholder="مثال: HW2024XXXXX"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الشراء (اختياري)</label>
                  <input
                    type="date"
                    value={formData.purchaseDate}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* كلمة السر */}
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-3">🔐 كلمة سر الجهاز <span className="text-red-500">*</span></h4>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حالة الحماية <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasPassword"
                          value="true"
                          checked={formData.hasPassword === true}
                          onChange={() => {
                            handleInputChange('hasPassword', true)
                            if (formData.passwordType === 'none') {
                              handleInputChange('passwordType', 'text')
                            }
                          }}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">الجهاز محمي بكلمة سر أو نمط</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="hasPassword"
                          value="false"
                          checked={formData.hasPassword === false}
                          onChange={() => {
                            handleInputChange('hasPassword', false)
                            handleInputChange('passwordType', 'none')
                            handleInputChange('passwordValue', '')
                            handleInputChange('patternValue', '')
                          }}
                          className="text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">الجهاز غير محمي</span>
                      </label>
                    </div>
                  </div>

                  {formData.hasPassword && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          نوع الحماية <span className="text-red-500">*</span>
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="passwordType"
                              value="text"
                              checked={formData.passwordType === 'text'}
                              onChange={(e) => {
                                handleInputChange('passwordType', e.target.value)
                                handleInputChange('patternValue', '')
                              }}
                              className="text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">كلمة سر نصية أو رقم PIN</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="passwordType"
                              value="pattern"
                              checked={formData.passwordType === 'pattern'}
                              onChange={(e) => {
                                handleInputChange('passwordType', e.target.value)
                                handleInputChange('passwordValue', '')
                              }}
                              className="text-primary-600 focus:ring-primary-500"
                            />
                            <span className="text-sm text-gray-700">نمط الفتح</span>
                          </label>
                        </div>
                      </div>

                      {formData.passwordType === 'text' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            كلمة السر أو رقم PIN <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="password"
                            value={formData.passwordValue}
                            onChange={(e) => handleInputChange('passwordValue', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            placeholder="أدخل كلمة السر أو رقم PIN"
                            required
                          />
                        </div>
                      )}

                      {formData.passwordType === 'pattern' && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            نمط الفتح <span className="text-red-500">*</span>
                          </label>
                          <PatternInput
                            value={formData.patternValue}
                            onChange={(value) => handleInputChange('patternValue', value)}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* وصف المشكلة */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FiAlertCircle className="w-6 h-6 text-red-600" />
              <h2 className="text-xl font-bold text-gray-900">⚠️ وصف المشكلة</h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع المشكلة <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  required
                >
                  <option value="">اختر نوع المشكلة</option>
                  {issueCategories.map(category => (
                    <option key={category.value} value={category.value}>{category.label}</option>
                  ))}
                </select>
              </div>

              {formData.category && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المشكلة التفصيلية</label>
                  <select
                    value={formData.subCategory}
                    onChange={(e) => handleInputChange('subCategory', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">اختر المشكلة التفصيلية</option>
                    {issueCategories.find(cat => cat.value === formData.category)?.subCategories.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">الأعراض (يمكن اختيار أكثر من واحد)</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {symptoms.map(symptom => (
                    <label key={symptom} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.symptoms.includes(symptom)}
                        onChange={() => handleSymptomToggle(symptom)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">{symptom}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف تفصيلي للمشكلة <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="اشرح المشكلة بالتفصيل... متى بدأت؟ ماذا حدث؟ هل جربت حلول؟"
                  required
                />
              </div>

              {/* رفع الصور */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  صور الجهاز (اختياري)
                  <span className="text-xs text-gray-500 block mt-1">
                    يمكنك رفع حتى 5 صور للجهاز (أمام، خلف، جانب، إلخ)
                  </span>
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <FiCamera className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">اضغط لرفع الصور</p>
                    <p className="text-xs text-gray-500">PNG, JPG حتى 5MB لكل صورة</p>
                  </label>
                </div>

                {images.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        الصور المرفوعة ({images.length}/5)
                      </p>
                      <p className={`text-xs text-gray-600`}>
                        {images.length > 0 ? `✅ تم رفع ${images.length} صور` : 'لم يتم رفع صور بعد'}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      {images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image.preview}
                            alt={`صورة ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* معلومات التواصل */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FiUser className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">📞 معلومات التواصل</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الاسم الكامل <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="أدخل اسمك الكامل"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الجوال <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="05xxxxxxxx"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">البريد الإلكتروني (اختياري)</label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.customerAddress}
                  onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="المدينة، الحي، الشارع"
                  required
                />
              </div>
            </div>
          </div>

          {/* معلومات الشحن */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-6 h-6 text-blue-600">🚚</div>
              <h2 className="text-xl font-bold text-gray-900">معلومات الشحن</h2>
            </div>

            {/* سؤال هل يحتاج شحن */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                هل تحتاج خدمة الشحن؟ (للعملاء خارج الرياض)
              </label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="needsShipping"
                    value="false"
                    checked={!formData.needsShipping}
                    onChange={(e) => handleInputChange('needsShipping', e.target.value === 'true')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">لا، سأحضر للمحل بنفسي</div>
                    <div className="text-sm text-gray-600">مجاني - يمكنك زيارة المحل لتسليم واستلام الجهاز</div>
                  </div>
                </label>

                <label className="flex items-center gap-3 p-4 border border-blue-200 rounded-lg cursor-pointer hover:bg-blue-50">
                  <input
                    type="radio"
                    name="needsShipping"
                    value="true"
                    checked={formData.needsShipping}
                    onChange={(e) => handleInputChange('needsShipping', e.target.value === 'true')}
                    className="text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">نعم، أحتاج خدمة الشحن</div>
                    <div className="text-sm text-gray-600">سنرسل لك بوليصة الشحن وستتواصل الشركة معك</div>
                  </div>
                </label>
              </div>
            </div>

            {/* اختيار شركة الشحن */}
            {formData.needsShipping && (
              <>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    اختر شركة الشحن <span className="text-red-500">*</span>
                  </label>
                  <div className="space-y-3">
                    {loadingShipping ? (
                      <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="text-sm text-gray-600 mt-2">جاري تحميل شركات الشحن...</p>
                      </div>
                    ) : shippingProviders.length > 0 ? (
                      shippingProviders.map((provider) => (
                        <label 
                          key={provider._id || provider.id}
                          className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${
                            formData.shippingProvider === (provider._id || provider.id)
                              ? 'border-primary-500 bg-primary-50' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="shippingProvider"
                              value={provider._id || provider.id}
                              checked={formData.shippingProvider === (provider._id || provider.id)}
                              onChange={(e) => handleShippingProviderChange(e.target.value)}
                              className="text-primary-600 focus:ring-primary-500"
                            />
                            <div>
                              <div className="font-medium text-gray-900">
                                {provider.displayName || provider.nameAr || provider.name}
                              </div>
                              <div className="text-sm text-gray-600">
                                {provider.description || 'خدمة شحن موثوقة'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-primary-600">
                              {calculatingCost === (provider._id || provider.id) ? (
                                <div className="flex items-center gap-2">
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                                  <span>جاري الحساب...</span>
                                </div>
                              ) : formData.shippingProvider === (provider._id || provider.id) && formData.shippingCost ? (
                                `${formData.shippingCost} ريال`
                              ) : (
                                'اختر للحساب'
                              )}
                            </div>
                            <div className="text-xs text-gray-500">رسوم الشحن</div>
                          </div>
                        </label>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <p>لا توجد شركات شحن متاحة حالياً</p>
                        <p className="text-sm">يرجى المحاولة لاحقاً أو التواصل مع الدعم</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* عنوان الاستلام */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    عنوان استلام الجهاز <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.pickupAddress}
                    onChange={(e) => handleInputChange('pickupAddress', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="العنوان التفصيلي لاستلام الجهاز من منزلك أو مكتبك..."
                    rows="3"
                    required={formData.needsShipping}
                  />
                </div>

                {/* تنبيه مهم */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <FiAlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">معلومات مهمة عن الشحن</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• سنرسل لك بوليصة الشحن عبر الواتساب أو الإيميل</li>
                        <li>• ستتواصل شركة الشحن معك لتحديد موعد الاستلام</li>
                        <li>• تأكد من تغليف الجهاز جيداً قبل التسليم</li>
                        <li>• رسوم الشحن ستُضاف للفاتورة النهائية</li>
                        <li>• سنعيد لك الجهاز بنفس طريقة الشحن بعد الإصلاح</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* الأولوية */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">⚡ أولوية الطلب</h3>
            
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="radio"
                  name="priority"
                  value="normal"
                  checked={formData.priority === 'normal'}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="text-primary-600 focus:ring-primary-500"
                />
                <div>
                  <div className="font-medium text-gray-900">عادي (3-5 أيام عمل)</div>
                  <div className="text-sm text-gray-600">مجاني - الخيار الافتراضي</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-orange-200 rounded-lg cursor-pointer hover:bg-orange-50">
                <input
                  type="radio"
                  name="priority"
                  value="urgent"
                  checked={formData.priority === 'urgent'}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="text-orange-600 focus:ring-orange-500"
                />
                <div>
                  <div className="font-medium text-gray-900">عاجل (1-2 يوم عمل)</div>
                  <div className="text-sm text-gray-600">رسوم إضافية: +50 ريال</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border border-red-200 rounded-lg cursor-pointer hover:bg-red-50">
                <input
                  type="radio"
                  name="priority"
                  value="emergency"
                  checked={formData.priority === 'emergency'}
                  onChange={(e) => handleInputChange('priority', e.target.value)}
                  className="text-red-600 focus:ring-red-500"
                />
                <div>
                  <div className="font-medium text-gray-900">طارئ (نفس اليوم)</div>
                  <div className="text-sm text-gray-600">رسوم إضافية: +100 ريال</div>
                </div>
              </label>
            </div>
          </div>

          {/* زر الإرسال */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  إرسال طلب صيانة HOTWAV
                </>
              )}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              سنتواصل معك خلال 24 ساعة لتأكيد استلام الطلب وتحديد موعد التسليم
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default MaintenanceRequest