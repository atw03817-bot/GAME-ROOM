import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FiArrowLeft, FiSave, FiSmartphone, FiTool, FiUser } from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import PatternInput from '../../components/PatternInput'
import '../../styles/maintenance-clean.css'

function EditMaintenanceRequest() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [products, setProducts] = useState([])
  
  const [formData, setFormData] = useState({
    // معلومات الجهاز
    brand: 'HOTWAV',
    model: '',
    color: '',
    storage: '',
    serialNumber: '',
    purchaseDate: '',
    
    // كلمة السر
    hasPassword: null,
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

  // شركات الشحن المتاحة
  const shippingProviders = [
    { id: 'aramex', name: 'أرامكس', cost: 25, description: 'التسليم خلال 2-3 أيام عمل' },
    { id: 'smsa', name: 'سمسا إكسبرس', cost: 20, description: 'التسليم خلال 3-4 أيام عمل' },
    { id: 'naqel', name: 'ناقل إكسبرس', cost: 22, description: 'التسليم خلال 2-4 أيام عمل' }
  ]

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

  useEffect(() => {
    fetchRequest()
    fetchProducts()
  }, [id])

  const fetchRequest = async () => {
    try {
      setLoading(true)
      const response = await api.get(`/maintenance/${id}`)
      if (response.data.success) {
        const request = response.data.data
        
        // التحقق من أن الطلب منشأ من الإدارة
        if (request.createdBy !== 'admin') {
          toast.error('لا يمكن تعديل الطلبات المنشأة من العملاء')
          navigate(`/admin/maintenance/${id}`)
          return
        }
        
        // تحويل البيانات للنموذج
        setFormData({
          brand: request.device.brand || 'HOTWAV',
          model: request.device.model || '',
          color: request.device.color || '',
          storage: request.device.storage || '',
          serialNumber: request.device.serialNumber || '',
          purchaseDate: request.device.purchaseDate ? new Date(request.device.purchaseDate).toISOString().split('T')[0] : '',
          
          hasPassword: request.device.hasPassword,
          passwordType: request.device.passwordType || 'none',
          passwordValue: request.device.passwordValue || '',
          patternValue: request.device.patternValue || '',
          
          category: request.issue.category || '',
          subCategory: request.issue.subCategory || '',
          description: request.issue.description || '',
          symptoms: request.issue.symptoms || [],
          priority: request.issue.priority || 'normal',
          
          customerName: request.customerInfo.name || '',
          customerPhone: request.customerInfo.phone || '',
          customerEmail: request.customerInfo.email || '',
          customerAddress: request.customerInfo.address || '',
          
          needsShipping: request.shipping?.isRequired || false,
          shippingProvider: request.shipping?.provider || '',
          shippingCost: request.shipping?.cost || 0,
          pickupAddress: request.shipping?.pickupAddress || '',
        })
      }
    } catch (error) {
      console.error('Error fetching request:', error)
      toast.error('خطأ في جلب بيانات الطلب')
      navigate('/admin/maintenance')
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await api.get('/products', { params: { limit: 1000 } })
      let productsArray = []
      if (Array.isArray(response.data)) {
        productsArray = response.data
      } else if (response.data && response.data.products) {
        productsArray = response.data.products
      } else if (response.data && Array.isArray(response.data.data)) {
        productsArray = response.data.data
      }
      setProducts(productsArray)
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleShippingProviderChange = (providerId) => {
    const provider = shippingProviders.find(p => p.id === providerId)
    setFormData(prev => ({
      ...prev,
      shippingProvider: providerId,
      shippingCost: provider ? provider.cost : 0
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setSaving(true)
      
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
          priority: formData.priority
        },
        shipping: {
          isRequired: formData.needsShipping,
          provider: formData.needsShipping ? formData.shippingProvider : 'none',
          providerName: formData.needsShipping ? shippingProviders.find(p => p.id === formData.shippingProvider)?.name : '',
          cost: formData.needsShipping ? formData.shippingCost : 0,
          pickupAddress: formData.needsShipping ? formData.pickupAddress : '',
          deliveryAddress: formData.customerAddress,
          status: 'pending'
        }
      }

      const response = await api.put(`/maintenance/admin/${id}`, requestData)
      
      if (response.data.success) {
        toast.success('تم تحديث طلب الصيانة بنجاح!')
        navigate(`/admin/maintenance/${id}`)
      }
    } catch (error) {
      console.error('Error updating request:', error)
      if (error.response?.status === 403) {
        toast.error('لا يمكن تعديل الطلبات المنشأة من العملاء')
      } else {
        toast.error('خطأ في تحديث الطلب')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 maintenance-form" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/admin/maintenance/${id}`)}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">تعديل طلب الصيانة</h1>
              <p className="text-gray-600">تعديل بيانات الطلب المنشأ من الإدارة</p>
            </div>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* معلومات الجهاز */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <FiSmartphone className="w-6 h-6 text-green-600" />
              <h2 className="text-xl font-bold text-gray-900">📱 معلومات الجهاز</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الجهاز <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.model}
                  onChange={(e) => handleInputChange('model', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mobile-select"
                  required
                >
                  <option value="">اختر نوع الجهاز</option>
                  {products.map((product) => (
                    <option key={product._id} value={product.name}>
                      {product.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
                <select
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mobile-select"
                >
                  <option value="">اختر اللون</option>
                  {colorOptions.map((color) => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السعة التخزينية</label>
                <select
                  value={formData.storage}
                  onChange={(e) => handleInputChange('storage', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mobile-select"
                >
                  <option value="">اختر السعة</option>
                  {storageOptions.map((storage) => (
                    <option key={storage} value={storage}>{storage}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السيريال نمبر <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => handleInputChange('serialNumber', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="مثال: HW123456789"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الشراء</label>
                <input
                  type="date"
                  value={formData.purchaseDate}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* باقي النموذج مشابه لصفحة الإنشاء... */}
          {/* يمكن إضافة باقي الأقسام حسب الحاجة */}

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate(`/admin/maintenance/${id}`)}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
            >
              {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default EditMaintenanceRequest