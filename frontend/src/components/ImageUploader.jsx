import { useState, useRef } from 'react'
import { FiUpload, FiX, FiImage, FiMonitor, FiSmartphone } from 'react-icons/fi'
import api from '../utils/api'

function ImageUploader({ 
  value, 
  onChange, 
  label, 
  type = 'desktop', // 'desktop', 'mobile', 'banner', 'product'
  required = false 
}) {
  const [uploading, setUploading] = useState(false)
  const [preview, setPreview] = useState(value || '')
  const fileInputRef = useRef(null)

  // المقاسات الموصى بها
  const dimensions = {
    desktop: { width: 1920, height: 600, label: 'كمبيوتر (1920x600)' },
    mobile: { width: 800, height: 600, label: 'جوال (800x600)' },
    banner: { width: 1920, height: 400, label: 'بنر (1920x400)' },
    product: { width: 800, height: 800, label: 'منتج (800x800)' },
    category: { width: 400, height: 400, label: 'فئة (400x400)' },
  }

  const currentDimension = dimensions[type] || dimensions.desktop

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    // التحقق من نوع الملف
    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار صورة فقط')
      return
    }

    // التحقق من حجم الملف (أقل من 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('حجم الصورة يجب أن يكون أقل من 10 ميجابايت')
      return
    }

    try {
      setUploading(true)

      // إنشاء FormData
      const formData = new FormData()
      formData.append('image', file)

      // رفع الصورة
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      // استخدام الرابط الكامل من الـ response
      const imageUrl = response.data.url
      setPreview(imageUrl)
      onChange(imageUrl)
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('حدث خطأ أثناء رفع الصورة: ' + (error.response?.data?.message || error.message))
    } finally {
      setUploading(false)
    }
  }

  const handleRemove = () => {
    setPreview('')
    onChange('')
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUrlInput = (url) => {
    setPreview(url)
    onChange(url)
  }

  return (
    <div className="space-y-3">
      {/* Label */}
      <label className="block text-sm font-medium text-gray-700">
        {type === 'desktop' && <FiMonitor className="inline ml-1" />}
        {type === 'mobile' && <FiSmartphone className="inline ml-1" />}
        {(type === 'banner' || type === 'product' || type === 'category') && (
          <FiImage className="inline ml-1" />
        )}
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>

      {/* Preview */}
      {preview && (
        <div className="relative group">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          >
            <FiX size={16} />
          </button>
          <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/70 text-white text-xs rounded">
            {currentDimension.label}
          </div>
        </div>
      )}

      {/* Upload Button */}
      {!preview && (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
            disabled={uploading}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50"
          >
            <FiUpload size={18} />
            {uploading ? 'جاري الرفع...' : 'رفع صورة'}
          </button>
          <p className="text-xs text-gray-500 mt-2">
            المقاس الموصى به: {currentDimension.width}x{currentDimension.height} بكسل
          </p>
          <p className="text-xs text-gray-500">
            الحد الأقصى: 10 ميجابايت
          </p>
        </div>
      )}

      {/* URL Input Alternative */}
      <div className="relative">
        <input
          type="url"
          value={preview}
          onChange={(e) => handleUrlInput(e.target.value)}
          placeholder="أو أدخل رابط الصورة مباشرة"
          className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute left-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-red-500"
          >
            <FiX size={16} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="flex items-start gap-2 p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <FiImage className="text-primary-600 mt-0.5 flex-shrink-0" size={16} />
        <div className="text-xs text-primary-800">
          <p className="font-medium mb-1">نصائح للصورة:</p>
          <ul className="space-y-0.5">
            <li>• استخدم صور عالية الجودة</li>
            <li>• المقاس الموصى به: {currentDimension.width}x{currentDimension.height}</li>
            <li>• صيغ مدعومة: JPG, PNG, WebP</li>
            <li>• يمكنك رفع صورة أو إدخال رابط</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default ImageUploader
