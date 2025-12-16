import { useState, useEffect } from 'react'
import {
  FiPlus,
  FiEdit,
  FiTrash2,
  FiSearch,
  FiEye,
  FiEyeOff,
  FiFolder,
  FiChevronUp,
  FiChevronDown,
} from 'react-icons/fi'
import api from '../../utils/api'
import toast from 'react-hot-toast'
import ImageUploader from '../../components/ImageUploader'

function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [formData, setFormData] = useState({
    name: { ar: '', en: '' },
    slug: '',
    description: { ar: '', en: '' },
    image: '',
    icon: '📁',
    parent: null,
    order: 0,
    isActive: true,
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const response = await api.get('/categories')
      setCategories(response.data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('خطأ في جلب الفئات')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.name.ar || !formData.name.en) {
      toast.error('الرجاء إدخال اسم الفئة بالعربي والإنجليزي')
      return
    }

    if (!formData.slug) {
      toast.error('الرجاء إدخال الرابط (Slug)')
      return
    }

    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory._id}`, formData)
        toast.success('تم تحديث الفئة بنجاح')
      } else {
        await api.post('/categories', formData)
        toast.success('تم إضافة الفئة بنجاح')
      }
      
      fetchCategories()
      closeModal()
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error(error.response?.data?.message || 'حدث خطأ')
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذه الفئة؟')) return

    try {
      await api.delete(`/categories/${id}`)
      toast.success('تم حذف الفئة بنجاح')
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('حدث خطأ أثناء الحذف')
    }
  }

  const handleEdit = (category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name || { ar: '', en: '' },
      slug: category.slug || '',
      description: category.description || { ar: '', en: '' },
      image: category.image || '',
      icon: category.icon || '📁',
      parent: category.parent?._id || null,
      order: category.order || 0,
      isActive: category.isActive !== false,
    })
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setEditingCategory(null)
    setFormData({
      name: { ar: '', en: '' },
      slug: '',
      description: { ar: '', en: '' },
      image: '',
      icon: '📁',
      parent: null,
      order: 0,
      isActive: true,
    })
  }

  const generateSlug = (text) => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
  }

  const filteredCategories = categories.filter(
    (cat) =>
      cat.name.ar.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.name.en.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">📂 إدارة الفئات</h1>
          <p className="text-gray-600">إدارة فئات المنتجات</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FiPlus size={18} />
          إضافة فئة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">إجمالي الفئات</span>
          <span className="text-2xl font-bold text-gray-800">{categories.length}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">الفئات النشطة</span>
          <span className="text-2xl font-bold text-green-600">
            {categories.filter((c) => c.isActive).length}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">الفئات المخفية</span>
          <span className="text-2xl font-bold text-gray-600">
            {categories.filter((c) => !c.isActive).length}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="relative">
          <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث عن فئة..."
            className="w-full pr-10 pl-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* Categories List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  الأيقونة
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  الاسم
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  الرابط (Slug)
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  الترتيب
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  الحالة
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCategories.length > 0 ? (
                filteredCategories.map((category) => (
                  <tr key={category._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4">
                      <span className="text-3xl">{category.icon || '📁'}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{category.name.ar}</p>
                        <p className="text-sm text-gray-500">{category.name.en}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-700">{category.order}</span>
                    </td>
                    <td className="px-6 py-4">
                      {category.isActive ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          <FiEye size={12} />
                          نشط
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          <FiEyeOff size={12} />
                          مخفي
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition"
                          title="تعديل"
                        >
                          <FiEdit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(category._id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="حذف"
                        >
                          <FiTrash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    <FiFolder size={48} className="mx-auto mb-3 opacity-50" />
                    <p className="text-lg mb-1">لا توجد فئات</p>
                    <p className="text-sm">ابدأ بإضافة فئة جديدة</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full my-8">
            <form onSubmit={handleSubmit}>
              {/* Header */}
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingCategory ? 'تعديل الفئة' : 'إضافة فئة جديدة'}
                </h2>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                {/* Arabic Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم بالعربي *
                  </label>
                  <input
                    type="text"
                    value={formData.name.ar}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        name: { ...formData.name, ar: e.target.value },
                      })
                      if (!editingCategory && !formData.slug) {
                        setFormData((prev) => ({
                          ...prev,
                          slug: generateSlug(e.target.value),
                        }))
                      }
                    }}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="مثال: هواتف ذكية"
                    required
                  />
                </div>

                {/* English Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الاسم بالإنجليزي *
                  </label>
                  <input
                    type="text"
                    value={formData.name.en}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: { ...formData.name, en: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Example: Smartphones"
                    required
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرابط (Slug) *
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({ ...formData, slug: generateSlug(e.target.value) })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono text-sm"
                    placeholder="smartphones"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    سيستخدم في الرابط: /products?category={formData.slug}
                  </p>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الأيقونة (Emoji)
                  </label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-center text-3xl"
                    placeholder="📱"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    استخدم Emoji: 📱 💻 🎧 ⌚ 📷 🎮
                  </p>
                </div>

                {/* Image */}
                <div>
                  <ImageUploader
                    value={formData.image}
                    onChange={(url) => setFormData({ ...formData, image: url })}
                    label="صورة الفئة (اختياري)"
                    type="category"
                  />
                </div>

                {/* Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الترتيب
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) =>
                      setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    min="0"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    الفئات ذات الترتيب الأقل تظهر أولاً
                  </p>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 text-primary-600 rounded"
                  />
                  <label htmlFor="isActive" className="text-sm text-gray-700">
                    فئة نشطة (ستظهر في المتجر)
                  </label>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button
                  type="submit"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition"
                >
                  {editingCategory ? 'حفظ التغييرات' : 'إضافة الفئة'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Categories
