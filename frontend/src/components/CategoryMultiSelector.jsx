import { useState, useEffect } from 'react'
import { FiFolder, FiCheck, FiX } from 'react-icons/fi'
import api from '../utils/api'

function CategoryMultiSelector({ selectedCategories = [], onChange }) {
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
      console.log('🔍 Raw categories from API:', categoriesData);
      console.log('📷 Categories with images:', categoriesData.filter(c => c.image));
      categoriesData.forEach((cat, index) => {
        if (cat.image) {
          console.log(`✅ Category "${cat.name.ar}" has image:`, cat.image);
        } else {
          console.log(`❌ Category "${cat.name.ar}" has NO image, only icon:`, cat.icon);
        }
      });
      setCategories(categoriesData.filter((cat) => cat.isActive))
    } catch (error) {
      console.error('Error fetching categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (category) => {
    const isSelected = selectedCategories.some((c) => c._id === category._id)
    
    if (isSelected) {
      // Remove
      onChange(selectedCategories.filter((c) => c._id !== category._id))
    } else {
      // Add
      const categoryData = {
        _id: category._id,
        name: category.name.ar,
        icon: category.icon,
        image: category.image,
        slug: category.slug,
        link: `/products?category=${category.slug}`
      };
      
      console.log('➕ Adding category to selection:', categoryData);
      onChange([...selectedCategories, categoryData])
    }
  }

  const clearAll = () => {
    onChange([])
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (categories.length === 0) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
        <p className="font-medium text-yellow-800 mb-1">⚠️ لا توجد فئات</p>
        <p className="text-yellow-700 text-xs">
          يرجى إضافة فئات من{' '}
          <a href="/admin/categories" className="underline font-medium">
            صفحة إدارة الفئات
          </a>
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FiFolder className="text-gray-600" />
          <span className="text-sm font-medium text-gray-700">
            الفئات المختارة: {selectedCategories.length}
          </span>
        </div>
        {selectedCategories.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <FiX size={16} />
            مسح الكل
          </button>
        )}
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-2 gap-3">
        {categories.map((category) => {
          const isSelected = selectedCategories.some((c) => c._id === category._id)
          
          return (
            <button
              key={category._id}
              type="button"
              onClick={() => toggleCategory(category)}
              className={`p-3 rounded-lg border-2 transition text-right ${
                isSelected
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex items-center gap-2">
                {/* Checkbox */}
                <div
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${
                    isSelected
                      ? 'bg-primary-600 border-primary-600'
                      : 'border-gray-300'
                  }`}
                >
                  {isSelected && <FiCheck className="text-white" size={14} />}
                </div>

                {/* Icon & Name */}
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-2xl">{category.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate text-sm">
                      {category.name.ar}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {category.name.en}
                    </p>
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {/* Info */}
      <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
        <p className="text-xs text-primary-800">
          💡 <strong>نصيحة:</strong> اختر الفئات التي تريد عرضها في هذا القسم. سيتم عرضها بنفس الترتيب.
        </p>
      </div>
    </div>
  )
}

export default CategoryMultiSelector
