import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FiSave, FiX, FiUpload, FiTrash2, FiCheck } from 'react-icons/fi'
import api from '../../utils/api'
import CategorySelector from '../../components/CategorySelector'
import '../../styles/admin-images.css'

function AddProduct() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    nameAr: '',
    nameEn: '',
    descriptionAr: '',
    descriptionEn: '',
    price: '',
    comparePrice: '',
    category: '',
    brand: '',
    stock: '',
    images: [],
    colors: [],
    storage: [],
    featured: false,
    brandInfo: {
      text: '',
      image: '',
      displayType: 'text'
    }
  })
  const [colorImages, setColorImages] = useState({})
  const [imagePreview, setImagePreview] = useState([])
  const [colorInput, setColorInput] = useState('')
  const [storageInput, setStorageInput] = useState('')
  const [specKey, setSpecKey] = useState('')
  const [specValue, setSpecValue] = useState('')
  const [specifications, setSpecifications] = useState([])
  const [descriptionImages, setDescriptionImages] = useState([])
  const [colorPrices, setColorPrices] = useState({}) // إضافات أسعار الألوان
  const [storagePrices, setStoragePrices] = useState({}) // إضافات أسعار السعات
  const [customOptions, setCustomOptions] = useState([]) // الخيارات المخصصة

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    
    for (const file of files) {
      // التحقق من حجم الملف
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 10 ميجابايت')
        continue
      }

      try {
        // رفع الصورة
        const formDataUpload = new FormData()
        formDataUpload.append('image', file)

        const response = await api.post('/upload/image', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        const imageUrl = response.data.url
        
        setImagePreview(prev => [...prev, imageUrl])
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, imageUrl]
        }))
      } catch (error) {
        console.error('Error uploading image:', error)
        alert('حدث خطأ أثناء رفع الصورة')
      }
    }
  }

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index))
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }))
  }

  const moveImage = (index, direction) => {
    const newImages = [...imagePreview]
    const newFormImages = [...formData.images]
    
    if (direction === 'left' && index > 0) {
      // Swap with previous
      [newImages[index], newImages[index - 1]] = [newImages[index - 1], newImages[index]]
      [newFormImages[index], newFormImages[index - 1]] = [newFormImages[index - 1], newFormImages[index]]
    } else if (direction === 'right' && index < newImages.length - 1) {
      // Swap with next
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]]
      [newFormImages[index], newFormImages[index + 1]] = [newFormImages[index + 1], newFormImages[index]]
    }
    
    setImagePreview(newImages)
    setFormData(prev => ({ ...prev, images: newFormImages }))
  }

  const addColor = () => {
    if (colorInput.trim()) {
      setFormData(prev => ({
        ...prev,
        colors: [...prev.colors, colorInput.trim()]
      }))
      setColorInput('')
    }
  }

  const removeColor = (index) => {
    const colorToRemove = formData.colors[index]
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.filter((_, i) => i !== index)
    }))
    // Remove color from colorImages mapping
    setColorImages(prev => {
      const newColorImages = { ...prev }
      delete newColorImages[colorToRemove]
      return newColorImages
    })
    // Remove color from colorPrices
    setColorPrices(prev => {
      const newColorPrices = { ...prev }
      delete newColorPrices[colorToRemove]
      return newColorPrices
    })
  }

  const addStorage = () => {
    if (storageInput.trim()) {
      setFormData(prev => ({
        ...prev,
        storage: [...prev.storage, storageInput.trim()]
      }))
      setStorageInput('')
    }
  }

  const removeStorage = (index) => {
    const storageToRemove = formData.storage[index]
    setFormData(prev => ({
      ...prev,
      storage: prev.storage.filter((_, i) => i !== index)
    }))
    // Remove storage from storagePrices
    setStoragePrices(prev => {
      const newStoragePrices = { ...prev }
      delete newStoragePrices[storageToRemove]
      return newStoragePrices
    })
  }

  const addSpecification = () => {
    if (specKey.trim() && specValue.trim()) {
      setSpecifications(prev => [...prev, { key: specKey.trim(), value: specValue.trim() }])
      setSpecKey('')
      setSpecValue('')
    }
  }

  const removeSpecification = (index) => {
    setSpecifications(prev => prev.filter((_, i) => i !== index))
  }

  const handleDescriptionImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    
    for (const file of files) {
      // التحقق من حجم الملف
      if (file.size > 10 * 1024 * 1024) {
        alert('حجم الصورة يجب أن يكون أقل من 10 ميجابايت')
        continue
      }

      try {
        // رفع الصورة إلى الخادم
        const formDataUpload = new FormData()
        formDataUpload.append('image', file)

        const response = await api.post('/upload/image', formDataUpload, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        })

        const imageUrl = response.data.url
        setDescriptionImages(prev => [...prev, imageUrl])
        
        // إضافة الصورة كرابط وليس Base64
        const imgTag = `\n<img src="${imageUrl}" alt="صورة المنتج" style="max-width: 100%; height: auto;" />\n`
        setFormData(prev => ({
          ...prev,
          descriptionAr: prev.descriptionAr + imgTag
        }))
      } catch (error) {
        console.error('Error uploading description image:', error)
        alert('حدث خطأ أثناء رفع صورة الوصف')
      }
    }
  }

  const copyImageToClipboard = (imageUrl) => {
    const imgTag = `<img src="${imageUrl}" alt="صورة المنتج" />`
    navigator.clipboard.writeText(imgTag)
    alert('تم نسخ كود الصورة! الصقه في الوصف')
  }

  // تحديث إضافة سعر اللون
  const updateColorPrice = (color, additionalPrice) => {
    setColorPrices(prev => ({
      ...prev,
      [color]: parseFloat(additionalPrice) || 0
    }))
  }

  // تحديث إضافة سعر السعة
  const updateStoragePrice = (storage, additionalPrice) => {
    setStoragePrices(prev => ({
      ...prev,
      [storage]: parseFloat(additionalPrice) || 0
    }))
  }

  // حساب السعر النهائي لتركيبة معينة
  const calculateFinalPrice = (color, storage) => {
    const basePrice = parseFloat(formData.price) || 0
    const colorAddition = colorPrices[color] || 0
    const storageAddition = storagePrices[storage] || 0
    return basePrice + colorAddition + storageAddition
  }

  // إضافة خيار مخصص جديد
  const addCustomOption = () => {
    const newOption = {
      id: Date.now(),
      name: '',
      nameAr: '',
      type: 'text',
      options: [],
      basePrice: 0, // للنص والرقم
      required: false,
      placeholder: '',
      description: ''
    }
    setCustomOptions(prev => [...prev, newOption])
  }

  // تحديث خيار مخصص
  const updateCustomOption = (id, field, value) => {
    setCustomOptions(prev => prev.map(option => 
      option.id === id ? { ...option, [field]: value } : option
    ))
  }

  // حذف خيار مخصص
  const removeCustomOption = (id) => {
    setCustomOptions(prev => prev.filter(option => option.id !== id))
  }

  // إضافة خيار للقائمة المنسدلة مع السعر
  const addSelectOption = (optionId, selectValue, selectPrice = 0) => {
    if (!selectValue.trim()) return
    
    setCustomOptions(prev => prev.map(option => 
      option.id === optionId 
        ? { 
            ...option, 
            options: [...(option.options || []), {
              value: selectValue.trim(),
              label: selectValue.trim(),
              price: parseFloat(selectPrice) || 0
            }]
          }
        : option
    ))
  }

  // تحديث سعر خيار في القائمة
  const updateSelectOptionPrice = (optionId, optionIndex, newPrice) => {
    setCustomOptions(prev => prev.map(option => 
      option.id === optionId 
        ? { 
            ...option, 
            options: option.options.map((opt, i) => 
              i === optionIndex ? { ...opt, price: parseFloat(newPrice) || 0 } : opt
            )
          }
        : option
    ))
  }

  // حذف خيار من القائمة المنسدلة
  const removeSelectOption = (optionId, optionIndex) => {
    setCustomOptions(prev => prev.map(option => 
      option.id === optionId 
        ? { ...option, options: option.options.filter((_, i) => i !== optionIndex) }
        : option
    ))
  }

  const assignImageToColor = (imageUrl, color) => {
    setColorImages(prev => ({
      ...prev,
      [color]: [...(prev[color] || []), imageUrl]
    }))
  }

  const removeImageFromColor = (imageUrl, color) => {
    setColorImages(prev => ({
      ...prev,
      [color]: (prev[color] || []).filter(img => img !== imageUrl)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setLoading(true)

      // Validate
      if (!formData.nameAr || !formData.nameEn) {
        alert('الرجاء إدخال اسم المنتج بالعربي والإنجليزي')
        return
      }
      if (!formData.price) {
        alert('الرجاء إدخال السعر')
        return
      }
      if (formData.images.length === 0) {
        alert('الرجاء إضافة صورة واحدة على الأقل')
        return
      }

      // Prepare data - simplified version without category ObjectId requirement
      const productData = {
        nameAr: formData.nameAr,
        nameEn: formData.nameEn,
        price: parseFloat(formData.price),
        comparePrice: formData.comparePrice ? parseFloat(formData.comparePrice) : undefined,
        brand: formData.brand || 'غير محدد',
        stock: parseInt(formData.stock) || 0,
        images: formData.images,
        featured: formData.featured,
        sales: 0,
        isActive: true
      }
      
      // Add optional fields
      if (formData.descriptionAr) productData.descriptionAr = formData.descriptionAr
      if (formData.descriptionEn) productData.descriptionEn = formData.descriptionEn
      if (formData.colors.length > 0) productData.colors = formData.colors
      if (formData.storage.length > 0) productData.storage = formData.storage
      if (Object.keys(colorImages).length > 0) productData.colorImages = colorImages
      if (formData.category) productData.category = formData.category
      if (formData.brandInfo) productData.brandInfo = formData.brandInfo
      
      // Add price additions
      if (Object.keys(colorPrices).length > 0) productData.colorPrices = colorPrices
      if (Object.keys(storagePrices).length > 0) productData.storagePrices = storagePrices
      
      // Add custom options
      if (customOptions.length > 0) {
        // فلترة الخيارات المكتملة فقط (التي لها اسم)
        const validCustomOptions = customOptions.filter(option => 
          option.name && option.name.trim() !== '' && 
          option.nameAr && option.nameAr.trim() !== ''
        );
        
        if (validCustomOptions.length > 0) {
          productData.customOptions = validCustomOptions.map(option => ({
            name: option.name.trim(),
            nameAr: option.nameAr.trim(),
            type: option.type,
            options: option.options || [],
            basePrice: parseFloat(option.basePrice) || 0,
            required: option.required,
            placeholder: option.placeholder || '',
            description: option.description || '',
            maxLength: option.maxLength,
            minValue: option.minValue,
            maxValue: option.maxValue
          }));
        }
      }
      
      // Add specifications as object
      if (specifications.length > 0) {
        productData.specifications = {}
        specifications.forEach(spec => {
          productData.specifications[spec.key] = spec.value
        })
      }

      await api.post('/products', productData)
      alert('تم إضافة المنتج بنجاح!')
      navigate('/admin/products')
    } catch (error) {
      console.error('Error adding product:', error)
      
      let errorMessage = 'حدث خطأ أثناء إضافة المنتج'
      
      if (error.response) {
        const { status, data } = error.response
        switch (status) {
          case 413:
            errorMessage = data?.message || 'حجم البيانات كبير جداً. حاول تقليل حجم الصور أو عددها أو استخدم صور أصغر'
            if (data?.size) {
              errorMessage += `\nالحجم الحالي: ${data.size} (الحد الأقصى: ${data.maxSize || '15MB'})`
            }
            break
          case 400:
            errorMessage = data?.message || 'بيانات غير صحيحة'
            break
          case 500:
            errorMessage = 'خطأ في الخادم. حاول مرة أخرى'
            break
          default:
            errorMessage = data?.message || error.message
        }
      } else if (error.request) {
        errorMessage = 'لا يمكن الاتصال بالخادم. تحقق من الاتصال بالإنترنت'
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">➕ إضافة منتج جديد</h1>
          <p className="text-gray-600">أضف منتج جديد للمتجر</p>
        </div>
        <button
          onClick={() => navigate('/admin/products')}
          className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
        >
          <FiX size={18} />
          إلغاء
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">المعلومات الأساسية</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المنتج (عربي) *
              </label>
              <input
                type="text"
                value={formData.nameAr}
                onChange={(e) => handleChange('nameAr', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="آيفون 15 برو ماكس"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اسم المنتج (English) *
              </label>
              <input
                type="text"
                value={formData.nameEn}
                onChange={(e) => handleChange('nameEn', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="iPhone 15 Pro Max"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف (عربي)
              </label>
              <textarea
                value={formData.descriptionAr}
                onChange={(e) => handleChange('descriptionAr', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="وصف المنتج بالعربي... يمكنك استخدام HTML للتنسيق:
مثال:
<p>فقرة نصية</p>
<ul><li>نقطة 1</li><li>نقطة 2</li></ul>
<img src='رابط الصورة' alt='وصف' />"
              />
              <p className="text-xs text-gray-500 mt-1">💡 يمكنك استخدام HTML للتنسيق وإضافة صور</p>
              
              {/* زر رفع صور للوصف */}
              <div className="mt-3">
                <label className="inline-flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-lg cursor-pointer hover:bg-primary-100 transition">
                  <FiUpload size={18} />
                  <span className="text-sm font-medium">إضافة صورة للوصف</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleDescriptionImageUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">الصورة ستضاف تلقائياً للوصف العربي</p>
              </div>

              {/* عرض الصور المرفوعة */}
              {descriptionImages.length > 0 && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-xs font-medium text-gray-700 mb-2">الصور المرفوعة:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {descriptionImages.map((img, index) => (
                      <div key={index} className="relative group aspect-square">
                        <img
                          src={img}
                          alt={`وصف ${index + 1}`}
                          className="w-full h-full object-cover rounded border"
                        />
                        <button
                          type="button"
                          onClick={() => copyImageToClipboard(img)}
                          className="absolute inset-0 bg-black bg-opacity-50 text-white text-xs opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                        >
                          نسخ الكود
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف (English)
              </label>
              <textarea
                value={formData.descriptionEn}
                onChange={(e) => handleChange('descriptionEn', e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                placeholder="Product description in English... You can use HTML:
Example:
<p>Text paragraph</p>
<ul><li>Point 1</li><li>Point 2</li></ul>
<img src='image-url' alt='description' />"
              />
              <p className="text-xs text-gray-500 mt-1">💡 You can use HTML for formatting and adding images</p>
            </div>
          </div>
        </div>

        {/* Pricing & Stock */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">السعر والمخزون</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر (ر.س) *
              </label>
              <input
                type="number"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="5499"
                min="0"
                step="0.01"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعر قبل الخصم (ر.س)
              </label>
              <input
                type="number"
                value={formData.comparePrice}
                onChange={(e) => handleChange('comparePrice', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="5999"
                min="0"
                step="0.01"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المخزون
              </label>
              <input
                type="number"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="50"
                min="0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة
              </label>
              <CategorySelector
                value={formData.category}
                onChange={(value) => handleChange('category', value)}
              />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-4">
              العلامة التجارية
            </label>
            
            {/* نوع العرض */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">نوع العرض</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="brandDisplayType"
                    value="text"
                    checked={formData.brandInfo.displayType === 'text'}
                    onChange={(e) => handleChange('brandInfo', { ...formData.brandInfo, displayType: e.target.value })}
                    className="text-primary-600"
                  />
                  <span className="text-sm">نص فقط</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="brandDisplayType"
                    value="image"
                    checked={formData.brandInfo.displayType === 'image'}
                    onChange={(e) => handleChange('brandInfo', { ...formData.brandInfo, displayType: e.target.value })}
                    className="text-primary-600"
                  />
                  <span className="text-sm">صورة فقط</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="brandDisplayType"
                    value="both"
                    checked={formData.brandInfo.displayType === 'both'}
                    onChange={(e) => handleChange('brandInfo', { ...formData.brandInfo, displayType: e.target.value })}
                    className="text-primary-600"
                  />
                  <span className="text-sm">نص وصورة</span>
                </label>
              </div>
            </div>

            {/* النص */}
            {(formData.brandInfo.displayType === 'text' || formData.brandInfo.displayType === 'both') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">اسم العلامة التجارية</label>
                <input
                  type="text"
                  value={formData.brandInfo.text}
                  onChange={(e) => {
                    handleChange('brandInfo', { ...formData.brandInfo, text: e.target.value });
                    handleChange('brand', e.target.value); // للتوافق مع الكود القديم
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Apple, Samsung, Huawei..."
                />
              </div>
            )}

            {/* الصورة */}
            {(formData.brandInfo.displayType === 'image' || formData.brandInfo.displayType === 'both') && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-600 mb-2">شعار العلامة التجارية</label>
                
                {/* خيارات الرفع */}
                <div className="mb-3">
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center px-4 py-3 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition">
                      <div className="text-center">
                        <FiUpload className="mx-auto mb-1 text-gray-400" size={20} />
                        <span className="text-sm text-gray-600">رفع من الجهاز</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            // التحقق من حجم الملف
                            if (file.size > 5 * 1024 * 1024) {
                              alert('حجم الصورة يجب أن يكون أقل من 5 ميجابايت');
                              return;
                            }

                            try {
                              // رفع الصورة
                              const formDataUpload = new FormData();
                              formDataUpload.append('image', file);

                              const response = await api.post('/upload/image', formDataUpload, {
                                headers: {
                                  'Content-Type': 'multipart/form-data',
                                },
                              });

                              const imageUrl = response.data.url;
                              handleChange('brandInfo', { ...formData.brandInfo, image: imageUrl });
                            } catch (error) {
                              console.error('Error uploading brand image:', error);
                              alert('حدث خطأ أثناء رفع صورة العلامة التجارية');
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* إدخال رابط */}
                <div className="mb-3">
                  <label className="block text-xs text-gray-500 mb-1">أو أدخل رابط الصورة:</label>
                  <input
                    type="url"
                    value={formData.brandInfo.image}
                    onChange={(e) => handleChange('brandInfo', { ...formData.brandInfo, image: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    placeholder="https://example.com/logo.png"
                  />
                </div>

                {/* معاينة الصورة */}
                {formData.brandInfo.image && (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-16 h-10 border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center p-1">
                      <img
                        src={formData.brandInfo.image}
                        alt="معاينة الشعار"
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-700">معاينة الشعار</p>
                      <p className="text-xs text-gray-500">الأبعاد المثلى: 120×40 بكسل</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleChange('brandInfo', { ...formData.brandInfo, image: '' })}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                      title="حذف الصورة"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  💡 يُفضل استخدام صور بخلفية شفافة (PNG) بأبعاد 120×40 بكسل
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">الصور *</h2>
          
          <div className="mb-4">
            <label className="flex items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition">
              <div className="text-center">
                <FiUpload className="mx-auto mb-2 text-gray-400" size={32} />
                <span className="text-sm text-gray-600">اضغط لرفع الصور</span>
                <p className="text-xs text-gray-500 mt-1">حد أقصى 10MB لكل صورة</p>
              </div>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </label>
            
            {/* تحذير عند وجود صور كثيرة */}
            {imagePreview.length > 8 && (
              <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ تحذير: عدد كبير من الصور ({imagePreview.length}) قد يؤثر على سرعة التحميل
                </p>
              </div>
            )}
          </div>

          {imagePreview.length > 0 && (
            <>
              <p className="text-sm text-gray-600 mb-3">
                💡 الصورة رقم 1 هي الصورة الرئيسية. اسحب الصور لترتيبها أو استخدم الأسهم.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {imagePreview.map((img, index) => (
                  <div
                    key={index}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.effectAllowed = 'move'
                      e.dataTransfer.setData('text/html', index.toString())
                    }}
                    onDragOver={(e) => {
                      e.preventDefault()
                      e.dataTransfer.dropEffect = 'move'
                    }}
                    onDrop={(e) => {
                      e.preventDefault()
                      const dragIndex = parseInt(e.dataTransfer.getData('text/html'))
                      if (dragIndex !== index) {
                        const newImages = [...imagePreview]
                        const newFormImages = [...formData.images]
                        
                        // Swap images
                        const draggedImage = newImages[dragIndex]
                        const draggedFormImage = newFormImages[dragIndex]
                        
                        newImages.splice(dragIndex, 1)
                        newFormImages.splice(dragIndex, 1)
                        
                        newImages.splice(index, 0, draggedImage)
                        newFormImages.splice(index, 0, draggedFormImage)
                        
                        setImagePreview(newImages)
                        setFormData(prev => ({ ...prev, images: newFormImages }))
                      }
                    }}
                    className="relative group border-2 border-gray-200 rounded-lg overflow-hidden cursor-move hover:border-primary-500 transition aspect-square"
                  >
                    {/* Badge للصورة الأولى */}
                    {index === 0 && (
                      <div className="absolute top-2 left-2 z-10 px-2 py-1 bg-primary-600 text-white text-xs font-bold rounded shadow-lg">
                        رئيسية
                      </div>
                    )}
                    
                    <img
                      src={img}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                    
                    {/* أزرار التحكم */}
                    <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2">
                      {/* سهم لليسار */}
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, 'left')}
                          className="p-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition"
                          title="تحريك لليسار"
                        >
                          ←
                        </button>
                      )}
                      
                      {/* زر الحذف */}
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        title="حذف"
                      >
                        <FiTrash2 size={16} />
                      </button>
                      
                      {/* سهم لليمين */}
                      {index < imagePreview.length - 1 && (
                        <button
                          type="button"
                          onClick={() => moveImage(index, 'right')}
                          className="p-2 bg-white text-gray-800 rounded-lg hover:bg-gray-100 transition"
                          title="تحريك لليمين"
                        >
                          →
                        </button>
                      )}
                    </div>
                    
                    {/* رقم الصورة - قابل للتعديل */}
                    <div className="absolute bottom-2 left-2 flex items-center gap-1">
                      <input
                        type="number"
                        value={index + 1}
                        onChange={(e) => {
                          const newPos = parseInt(e.target.value) - 1
                          if (newPos >= 0 && newPos < imagePreview.length && newPos !== index) {
                            const newImages = [...imagePreview]
                            const newFormImages = [...formData.images]
                            
                            const [movedImage] = newImages.splice(index, 1)
                            const [movedFormImage] = newFormImages.splice(index, 1)
                            
                            newImages.splice(newPos, 0, movedImage)
                            newFormImages.splice(newPos, 0, movedFormImage)
                            
                            setImagePreview(newImages)
                            setFormData(prev => ({ ...prev, images: newFormImages }))
                          }
                        }}
                        min="1"
                        max={imagePreview.length}
                        className="w-10 px-1 py-0.5 bg-black bg-opacity-70 text-white text-xs text-center rounded border-0 focus:outline-none focus:ring-1 focus:ring-white"
                        title="اكتب الرقم لتغيير الترتيب"
                      />
                    </div>
                    
                    {/* أيقونة السحب */}
                    <div className="absolute top-2 right-2 text-white bg-black bg-opacity-50 p-1 rounded text-xs">
                      ⋮⋮
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Color Images Mapping */}
        {formData.colors.length > 0 && formData.images.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">ربط الصور بالألوان</h2>
            <p className="text-sm text-gray-600 mb-4">
              اختر الصور المناسبة لكل لون. عندما يختار العميل لون معين، ستظهر له الصور المرتبطة بهذا اللون فقط.
            </p>
            
            <div className="space-y-6">
              {formData.colors.map((color, colorIndex) => (
                <div key={color} className="border border-gray-200 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-gray-300"></span>
                    {color}
                    <span className="text-sm text-gray-500">
                      ({colorImages[color]?.length || 0} صور مربوطة)
                    </span>
                  </h3>
                  
                  {/* Available Images */}
                  <div className="mb-3">
                    <p className="text-sm text-gray-600 mb-2">الصور المتاحة:</p>
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {formData.images.map((imageUrl, imageIndex) => {
                        const isAssigned = colorImages[color]?.includes(imageUrl)
                        return (
                          <div
                            key={imageIndex}
                            className={`relative cursor-pointer border-2 rounded-lg overflow-hidden transition ${
                              isAssigned 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 hover:border-primary-500'
                            }`}
                            onClick={() => {
                              if (isAssigned) {
                                removeImageFromColor(imageUrl, color)
                              } else {
                                assignImageToColor(imageUrl, color)
                              }
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt={`صورة ${imageIndex + 1}`}
                              className="w-full aspect-square object-cover"
                            />
                            {isAssigned && (
                              <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                                <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                                  <FiCheck className="text-white text-sm" />
                                </div>
                              </div>
                            )}
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs text-center py-1">
                              {imageIndex + 1}
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  
                  {/* Assigned Images Preview */}
                  {colorImages[color]?.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">الصور المربوطة بهذا اللون:</p>
                      <div className="flex gap-2 flex-wrap">
                        {colorImages[color].map((imageUrl, index) => (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`${color} - صورة ${index + 1}`}
                              className="w-12 h-12 object-cover rounded border-2 border-green-500 aspect-square"
                            />
                            <button
                              onClick={() => removeImageFromColor(imageUrl, color)}
                              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Variants */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">الخيارات</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Colors */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الألوان
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={colorInput}
                  onChange={(e) => setColorInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="أسود، أبيض، ذهبي..."
                />
                <button
                  type="button"
                  onClick={addColor}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  إضافة
                </button>
              </div>
              
              {/* عرض الألوان مع إضافات الأسعار */}
              {formData.colors.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">
                    💡 أضف سعر إضافي للألوان التي تحتاج زيادة في السعر (اتركها فارغة إذا لم تحتج إضافة)
                  </p>
                  {formData.colors.map((color, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">{color}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({colorImages[color]?.length || 0} صور)
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">سعر إضافي:</label>
                        <input
                          type="number"
                          value={colorPrices[color] || ''}
                          onChange={(e) => updateColorPrice(color, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-sm text-gray-500">ر.س</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeColor(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="حذف اللون"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Storage */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                السعات
              </label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={storageInput}
                  onChange={(e) => setStorageInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStorage())}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="128GB، 256GB، 512GB..."
                />
                <button
                  type="button"
                  onClick={addStorage}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  إضافة
                </button>
              </div>
              
              {/* عرض السعات مع إضافات الأسعار */}
              {formData.storage.length > 0 && (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600 mb-3">
                    💡 أضف سعر إضافي للسعات التي تحتاج زيادة في السعر (اتركها فارغة إذا لم تحتج إضافة)
                  </p>
                  {formData.storage.map((storage, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <span className="font-medium text-gray-700">{storage}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">سعر إضافي:</label>
                        <input
                          type="number"
                          value={storagePrices[storage] || ''}
                          onChange={(e) => updateStoragePrice(storage, e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-sm text-gray-500">ر.س</span>
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => removeStorage(index)}
                        className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                        title="حذف السعة"
                      >
                        <FiTrash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Custom Options */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">الخيارات المخصصة</h2>
            <button
              type="button"
              onClick={addCustomOption}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
            >
              <FiCheck size={16} />
              إضافة خيار
            </button>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            💡 أضف خيارات مخصصة للمنتجات حسب الطلب مثل النقش، التخصيص، الملاحظات الخاصة، إلخ
          </p>

          {customOptions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">⚙️</div>
              <p>لا توجد خيارات مخصصة بعد</p>
              <p className="text-sm">اضغط "إضافة خيار" لإضافة خيار مخصص</p>
            </div>
          ) : (
            <div className="space-y-6">
              {customOptions.map((option, index) => (
                <div key={option.id} className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">خيار #{index + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCustomOption(option.id)}
                      className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                      title="حذف الخيار"
                    >
                      <FiTrash2 size={16} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* اسم الخيار بالإنجليزي */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم الخيار (English) *
                      </label>
                      <input
                        type="text"
                        value={option.name}
                        onChange={(e) => updateCustomOption(option.id, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Custom Engraving"
                      />
                    </div>

                    {/* اسم الخيار بالعربي */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        اسم الخيار (عربي) *
                      </label>
                      <input
                        type="text"
                        value={option.nameAr}
                        onChange={(e) => updateCustomOption(option.id, 'nameAr', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="نقش مخصص"
                      />
                    </div>

                    {/* نوع الخيار */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نوع الخيار *
                      </label>
                      <select
                        value={option.type}
                        onChange={(e) => updateCustomOption(option.id, 'type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="text">نص قصير</option>
                        <option value="textarea">نص طويل</option>
                        <option value="select">قائمة منسدلة</option>
                        <option value="radio">اختيار واحد</option>
                        <option value="checkbox">صح/خطأ</option>
                        <option value="number">رقم</option>
                      </select>
                    </div>

                    {/* السعر الأساسي - للنص والرقم فقط */}
                    {(option.type === 'text' || option.type === 'textarea' || option.type === 'number' || option.type === 'checkbox') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          السعر الإضافي (ر.س)
                        </label>
                        <input
                          type="number"
                          value={option.basePrice || 0}
                          onChange={(e) => updateCustomOption(option.id, 'basePrice', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          placeholder="0"
                          min="0"
                          step="0.01"
                        />
                      </div>
                    )}
                  </div>

                  {/* خيارات القائمة المنسدلة */}
                  {(option.type === 'select' || option.type === 'radio') && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الخيارات المتاحة مع أسعارها
                      </label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
                        <input
                          type="text"
                          placeholder="اسم الخيار"
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          id={`option-value-${option.id}`}
                        />
                        <input
                          type="number"
                          placeholder="السعر الإضافي"
                          className="px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          id={`option-price-${option.id}`}
                          min="0"
                          step="0.01"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const valueInput = document.getElementById(`option-value-${option.id}`)
                            const priceInput = document.getElementById(`option-price-${option.id}`)
                            if (valueInput.value.trim()) {
                              addSelectOption(option.id, valueInput.value, priceInput.value)
                              valueInput.value = ''
                              priceInput.value = ''
                            }
                          }}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
                        >
                          إضافة
                        </button>
                      </div>
                      
                      {/* عرض الخيارات الموجودة */}
                      <div className="space-y-2">
                        {(option.options || []).map((opt, optIndex) => (
                          <div
                            key={optIndex}
                            className="flex items-center gap-3 p-3 bg-gray-100 rounded-lg"
                          >
                            <div className="flex-1">
                              <span className="font-medium text-gray-700">
                                {opt.label || opt.value || opt}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <label className="text-sm text-gray-600">السعر:</label>
                              <input
                                type="number"
                                value={opt.price || 0}
                                onChange={(e) => updateSelectOptionPrice(option.id, optIndex, e.target.value)}
                                className="w-20 px-2 py-1 border border-gray-200 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
                                min="0"
                                step="0.01"
                              />
                              <span className="text-sm text-gray-500">ر.س</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeSelectOption(option.id, optIndex)}
                              className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* وصف الخيار */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وصف الخيار
                      </label>
                      <input
                        type="text"
                        value={option.description}
                        onChange={(e) => updateCustomOption(option.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="وصف مختصر للخيار"
                      />
                    </div>

                    {/* نص المساعدة */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        نص المساعدة
                      </label>
                      <input
                        type="text"
                        value={option.placeholder}
                        onChange={(e) => updateCustomOption(option.id, 'placeholder', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="أدخل النص المطلوب نقشه..."
                      />
                    </div>
                  </div>

                  {/* إعدادات إضافية */}
                  <div className="mt-4 flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={option.required}
                        onChange={(e) => updateCustomOption(option.id, 'required', e.target.checked)}
                        className="text-primary-600"
                      />
                      <span className="text-sm text-gray-700">خيار إجباري</span>
                    </label>

                    {option.type === 'text' && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700">الحد الأقصى للأحرف:</label>
                        <input
                          type="number"
                          value={option.maxLength || ''}
                          onChange={(e) => updateCustomOption(option.id, 'maxLength', e.target.value)}
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                          placeholder="50"
                          min="1"
                        />
                      </div>
                    )}

                    {option.type === 'number' && (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-700">الحد الأدنى:</label>
                          <input
                            type="number"
                            value={option.minValue || ''}
                            onChange={(e) => updateCustomOption(option.id, 'minValue', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                            placeholder="1"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-700">الحد الأقصى:</label>
                          <input
                            type="number"
                            value={option.maxValue || ''}
                            onChange={(e) => updateCustomOption(option.id, 'maxValue', e.target.value)}
                            className="w-20 px-2 py-1 border border-gray-200 rounded text-sm"
                            placeholder="100"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Price Preview */}
        {(formData.colors.length > 0 || formData.storage.length > 0 || customOptions.length > 0) && formData.price && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-6">معاينة الأسعار النهائية</h2>
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800 mb-2">
                <strong>السعر الأساسي:</strong> {parseFloat(formData.price || 0).toFixed(2)} ر.س
              </p>
              <p className="text-xs text-blue-600">
                💡 الأسعار أدناه تشمل السعر الأساسي + الإضافات المحددة لكل لون وسعة والخيارات المخصصة
              </p>
            </div>

            {/* عرض الخيارات المخصصة */}
            {customOptions.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">الخيارات المخصصة:</h3>
                <div className="space-y-4">
                  {customOptions.map((option, index) => (
                    <div key={option.id} className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <div className="font-medium text-gray-700 mb-2">
                        {option.nameAr || option.name || `خيار ${index + 1}`}
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        النوع: {
                          option.type === 'text' ? 'نص قصير' :
                          option.type === 'textarea' ? 'نص طويل' :
                          option.type === 'select' ? 'قائمة منسدلة' :
                          option.type === 'radio' ? 'اختيار واحد' :
                          option.type === 'checkbox' ? 'صح/خطأ' :
                          option.type === 'number' ? 'رقم' : option.type
                        }
                      </div>
                      
                      {/* عرض السعر الأساسي للخيارات البسيطة */}
                      {(option.type === 'text' || option.type === 'textarea' || option.type === 'number' || option.type === 'checkbox') && (
                        <div className="text-lg font-bold text-green-600">
                          +{parseFloat(option.basePrice || 0).toFixed(2)} ر.س
                        </div>
                      )}
                      
                      {/* عرض خيارات القائمة مع أسعارها */}
                      {(option.type === 'select' || option.type === 'radio') && option.options && option.options.length > 0 && (
                        <div className="mt-2">
                          <div className="text-sm font-medium text-gray-700 mb-2">الخيارات المتاحة:</div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {option.options.map((opt, optIndex) => (
                              <div key={optIndex} className="flex justify-between items-center p-2 bg-white rounded border">
                                <span className="text-sm text-gray-700">
                                  {opt.label || opt.value || opt}
                                </span>
                                <span className="text-sm font-bold text-green-600">
                                  +{parseFloat(opt.price || 0).toFixed(2)} ر.س
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {option.required && (
                        <div className="text-xs text-red-600 mt-2">إجباري</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {formData.colors.length > 0 && formData.storage.length > 0 ? (
              // عرض جدول التركيبات
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-right p-3 font-medium text-gray-700">اللون</th>
                      <th className="text-right p-3 font-medium text-gray-700">السعة</th>
                      <th className="text-right p-3 font-medium text-gray-700">السعر النهائي</th>
                      <th className="text-right p-3 font-medium text-gray-700">التفاصيل</th>
                    </tr>
                  </thead>
                  <tbody>
                    {formData.colors.map(color => 
                      formData.storage.map(storage => {
                        const finalPrice = calculateFinalPrice(color, storage)
                        const colorAddition = colorPrices[color] || 0
                        const storageAddition = storagePrices[storage] || 0
                        
                        return (
                          <tr key={`${color}-${storage}`} className="border-t">
                            <td className="p-3">{color}</td>
                            <td className="p-3">{storage}</td>
                            <td className="p-3 font-bold text-primary-600">
                              {finalPrice.toFixed(2)} ر.س
                            </td>
                            <td className="p-3 text-xs text-gray-500">
                              {formData.price} 
                              {colorAddition > 0 && ` + ${colorAddition}`}
                              {storageAddition > 0 && ` + ${storageAddition}`}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            ) : formData.colors.length > 0 ? (
              // عرض الألوان فقط
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {formData.colors.map(color => {
                  const finalPrice = calculateFinalPrice(color, '')
                  const colorAddition = colorPrices[color] || 0
                  
                  return (
                    <div key={color} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-700">{color}</div>
                      <div className="text-lg font-bold text-primary-600">
                        {finalPrice.toFixed(2)} ر.س
                      </div>
                      {colorAddition > 0 && (
                        <div className="text-xs text-gray-500">
                          {formData.price} + {colorAddition}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ) : (
              // عرض السعات فقط
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {formData.storage.map(storage => {
                  const finalPrice = calculateFinalPrice('', storage)
                  const storageAddition = storagePrices[storage] || 0
                  
                  return (
                    <div key={storage} className="p-3 bg-gray-50 rounded-lg">
                      <div className="font-medium text-gray-700">{storage}</div>
                      <div className="text-lg font-bold text-primary-600">
                        {finalPrice.toFixed(2)} ر.س
                      </div>
                      {storageAddition > 0 && (
                        <div className="text-xs text-gray-500">
                          {formData.price} + {storageAddition}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Specifications */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">المواصفات</h2>
          
          <div className="mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
              <input
                type="text"
                value={specKey}
                onChange={(e) => setSpecKey(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="اسم المواصفة (مثال: المعالج)"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={specValue}
                  onChange={(e) => setSpecValue(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSpecification())}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="القيمة (مثال: A17 Pro)"
                />
                <button
                  type="button"
                  onClick={addSpecification}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                >
                  إضافة
                </button>
              </div>
            </div>
          </div>

          {specifications.length > 0 && (
            <div className="space-y-2">
              {specifications.map((spec, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex-1">
                    <span className="font-medium text-gray-800">{spec.key}:</span>
                    <span className="text-gray-600 mr-2">{spec.value}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSpecification(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {specifications.length === 0 && (
            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
              لم يتم إضافة مواصفات بعد
            </div>
          )}
        </div>

        {/* Featured */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleChange('featured', e.target.checked)}
              className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            />
            <div>
              <span className="font-medium text-gray-800">منتج مميز</span>
              <p className="text-sm text-gray-600">سيظهر في قسم المنتجات المميزة</p>
            </div>
          </label>
        </div>

        {/* Submit */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-4 rounded-lg font-medium flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <FiSave size={20} />
            {loading ? 'جاري الحفظ...' : 'حفظ المنتج'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/products')}
            className="px-6 py-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            إلغاء
          </button>
        </div>
      </form>
    </div>
  )
}

export default AddProduct
