import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSmartphone, FiTool, FiUser, FiSend, FiAlertCircle, FiX, FiCamera } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import PatternInput from '../../components/PatternInput'
import '../../styles/maintenance-clean.css'

function CreateMaintenanceRequest() {
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
    hasPassword: false, // تغيير من null إلى false
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
    shippingProvider: '',
    shippingCost: 0,
    pickupAddress: '',
  })

  // جلب المنتجات من قاعدة البيانات
  useEffect(() => {
    fetchProducts()
  }, [])

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
    
    if (images.length < 3) {
      errors.push('يجب رفع 3 صور على الأقل للجهاز (أمام، خلف، جانب)')
    }
    
    const phoneRegex = /^(05|5)[0-9]{8}$/
    if (formData.customerPhone && !phoneRegex.test(formData.customerPhone.replace(/\s/g, ''))) {
      errors.push('رقم الجوال غير صحيح (يجب أن يبدأ بـ 05)')
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
      for (const image of images) {
        const uploadFormData = new FormData()
        uploadFormData.append('image', image.file)
        
        try {
          const uploadResponse = await api.post('/upload/maintenance', uploadFormData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          })
          imageUrls.push(uploadResponse.data.url)
        } catch (uploadError) {
          console.error('Error uploading image:', uploadError)
        }
      }

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
        }
      }

      const response = await api.post('/maintenance/admin/request', requestData)
      
      if (response.data.success) {
        toast.success('تم إنشاء طلب الصيانة بنجاح!')
        toast.success(`رقم الطلب: ${response.data.data.requestNumber}`)
        
        // الانتقال لقائمة الطلبات
        navigate('/admin/maintenance')
      }
    } catch (error) {
      console.error('Error submitting maintenance request:', error)
      toast.error(error.response?.data?.message || 'حدث خطأ أثناء إرسال الطلب')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 maintenance-clean" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - التعديل الوحيد */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => navigate('/admin/maintenance')}
            className="flex items-center justify-center w-10 h-10 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <FiArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          
          <div className="text-center flex-1">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
              <FiTool className="w-8 h-8 text-primary-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 إنشاء طلب صيانة جديد</h1>
            <p className="text-gray-600">املأ النموذج أدناه لإنشاء طلب صيانة لعميل</p>
          </div>
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
                  <p className="text-xs text-gray-500 mt-1">
                    يمكن العثور عليه في الإعدادات → حول الجهاز
                  </p>
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
                  صور الجهاز <span className="text-red-500">*</span>
                  <span className="text-xs text-gray-500 block mt-1">
                    مطلوب 3 صور على الأقل: (أمام، خلف، جانب) - حتى 5 صور
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
                    <p className="text-xs text-red-500 mt-1">
                      يجب رفع 3 صور على الأقل (أمام، خلف، جانب)
                    </p>
                  </label>
                </div>

                {/* معاينة الصور */}
                {images.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-sm font-medium text-gray-700">
                        الصور المرفوعة ({images.length}/5)
                      </p>
                      <p className={`text-xs ${images.length >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                        {images.length >= 3 ? '✅ تم رفع العدد المطلوب' : `❌ يجب رفع ${3 - images.length} صور إضافية`}
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
                          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg text-center">
                            صورة {index + 1}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* اقتراحات للصور */}
                    {images.length < 3 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 font-medium mb-2">💡 اقتراحات للصور:</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• صورة من الأمام (الشاشة)</li>
                          <li>• صورة من الخلف</li>
                          <li>• صورة من الجانب</li>
                          <li>• صور إضافية للمشكلة (إن وجدت)</li>
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* معلومات التواصل */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FiUser className="w-6 h-6 text-blue-600" />
              <h2 className="text-xl font-bold text-gray-900">📞 معلومات العميل</h2>
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
                  placeholder="أدخل اسم العميل الكامل"
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
                  جاري الإنشاء...
                </>
              ) : (
                <>
                  <FiSend className="w-5 h-5" />
                  إنشاء طلب صيانة HOTWAV
                </>
              )}
            </button>
            
            <p className="text-center text-sm text-gray-500 mt-4">
              سيتم إنشاء الطلب وإرسال إشعار للعميل
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateMaintenanceRequest