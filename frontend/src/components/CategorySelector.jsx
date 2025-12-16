import { useState, useEffect } from 'react'
import { FiFolder, FiChevronDown } from 'react-icons/fi'
import api from '../utils/api'

function CategorySelector({ value, onChange, required = false }) {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.get('/categories')
      const categoriesData = response.data.categories || []
      setCategories(categoriesData.filter((cat) => cat.isActive))
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 text-center">
        جاري التحميل...
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-yellow-50 text-yellow-700 text-sm">
        <p className="font-medium mb-1">⚠️ لا توجد فئات</p>
        <p className="text-xs">
          يرجى إضافة فئات من{' '}
          <a href="/admin/categories" className="underline font-medium">
            صفحة إدارة الفئات
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="relative">
      <FiFolder className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
      <FiChevronDown className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        className="w-full pr-10 pl-10 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 appearance-none bg-white"
      >
        <option value="">اختر الفئة...</option>
        {categories.map((category) => (
          <option key={category._id} value={category._id}>
            {category.icon} {category.name.ar} ({category.name.en})
          </option>
        ))}
      </select>
    </div>
  )
}

export default CategorySelector
