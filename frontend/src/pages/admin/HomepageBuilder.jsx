import { useState, useEffect } from 'react'
import {
  FiPlus,
  FiEye,
  FiEyeOff,
  FiCopy,
  FiTrash2,
  FiChevronUp,
  FiChevronDown,
  FiEdit,
  FiImage,
  FiTag,
} from 'react-icons/fi'
import api from '../../utils/api'
import SectionEditor from '../../components/SectionEditor'

function HomepageBuilder() {
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingSection, setEditingSection] = useState(null)
  const [newSection, setNewSection] = useState({
    type: 'products',
    title: '',
    subtitle: '',
  })

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      const response = await api.get('/homepage')
      setConfig(response.data)
    } catch (error) {
      console.error('Error fetching config:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleSection = async (sectionId) => {
    try {
      await api.post(`/homepage/sections/${sectionId}/toggle`)
      fetchConfig()
    } catch (error) {
      console.error('Error toggling section:', error)
      alert('حدث خطأ أثناء تغيير حالة القسم')
    }
  }

  const deleteSection = async (sectionId) => {
    if (!confirm('هل أنت متأكد من حذف هذا القسم؟')) return

    try {
      await api.delete(`/homepage/sections/${sectionId}`)
      fetchConfig()
    } catch (error) {
      console.error('Error deleting section:', error)
      alert('حدث خطأ أثناء حذف القسم')
    }
  }

  const duplicateSection = async (sectionId) => {
    try {
      await api.post(`/homepage/sections/${sectionId}/duplicate`)
      fetchConfig()
    } catch (error) {
      console.error('Error duplicating section:', error)
      alert('حدث خطأ أثناء نسخ القسم')
    }
  }

  const moveSection = async (sectionId, direction) => {
    if (!config) return

    const sections = [...config.sections]
    const index = sections.findIndex((s) => s.id === sectionId)

    if (direction === 'up' && index > 0) {
      [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]]
    } else if (direction === 'down' && index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]]
    }

    sections.forEach((s, i) => (s.order = i + 1))
    await reorderSections(sections)
  }

  const reorderSections = async (sections) => {
    try {
      await api.post('/homepage/sections/reorder', { sections })
      fetchConfig()
    } catch (error) {
      console.error('Error reordering sections:', error)
      alert('حدث خطأ أثناء إعادة الترتيب')
    }
  }

  const addSection = async () => {
    if (!newSection.title.trim()) {
      alert('الرجاء إدخال عنوان القسم')
      return
    }

    try {
      setSaving(true)
      await api.post('/homepage/sections', {
        type: newSection.type,
        title: newSection.title,
        subtitle: newSection.subtitle,
        active: true,
        settings: {},
        content: {},
      })
      
      setShowAddModal(false)
      setNewSection({ type: 'products', title: '', subtitle: '' })
      fetchConfig()
      alert('تم إضافة القسم بنجاح!')
    } catch (error) {
      console.error('Error adding section:', error)
      alert('حدث خطأ أثناء إضافة القسم')
    } finally {
      setSaving(false)
    }
  }

  const updateSection = async (sectionId, updates) => {
    try {
      setSaving(true)
      await api.put(`/homepage/sections/${sectionId}`, updates)
      fetchConfig()
      setEditingSection(null)
      alert('تم تحديث القسم بنجاح!')
    } catch (error) {
      console.error('Error updating section:', error)
      alert('حدث خطأ أثناء تحديث القسم')
    } finally {
      setSaving(false)
    }
  }

  const getSectionIcon = (type) => {
    const icons = {
      hero: '🎯',
      categories: '📂',
      products: '📦',
      banner: '🖼️',
      text: '📝',
      imageGrid: '🎨',
      exclusiveOffers: '🎁',
      deals: '🔥',
    }
    return icons[type] || '📄'
  }

  const getSectionName = (type) => {
    const names = {
      hero: 'البنر الرئيسي',
      categories: 'الفئات',
      products: 'المنتجات',
      banner: 'بنر إعلاني',
      text: 'نص',
      imageGrid: 'شبكة صور',
      exclusiveOffers: 'العروض الحصرية',
      deals: 'الصفقات المميزة',
    }
    return names[type] || type
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">لا توجد إعدادات للصفحة الرئيسية</h2>
        <p className="text-gray-600">يرجى التواصل مع المطور</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">🏠 بناء الصفحة الرئيسية</h1>
          <p className="text-gray-600">إدارة أقسام الصفحة الرئيسية</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
          >
            <FiPlus size={18} />
            إضافة قسم
          </button>
          <a
            href="/"
            target="_blank"
            className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            <FiEye size={18} />
            معاينة
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">إجمالي الأقسام</span>
          <span className="text-2xl font-bold text-gray-800">{config.sections?.length || 0}</span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">الأقسام النشطة</span>
          <span className="text-2xl font-bold text-green-600">
            {config.sections?.filter((s) => s.active).length || 0}
          </span>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <span className="text-sm text-gray-600 block mb-2">الأقسام المخفية</span>
          <span className="text-2xl font-bold text-gray-600">
            {config.sections?.filter((s) => !s.active).length || 0}
          </span>
        </div>
      </div>

      {/* Sections List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-800">الأقسام</h2>
          <p className="text-sm text-gray-600 mt-1">رتب الأقسام بالترتيب الذي تريده</p>
        </div>

        {config.sections && config.sections.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {config.sections
              .sort((a, b) => a.order - b.order)
              .map((section, index) => (
                <div
                  key={section.id}
                  className={`p-6 transition ${
                    section.active ? 'bg-white' : 'bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Order */}
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => moveSection(section.id, 'up')}
                        disabled={index === 0}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FiChevronUp size={16} />
                      </button>
                      <button
                        onClick={() => moveSection(section.id, 'down')}
                        disabled={index === config.sections.length - 1}
                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <FiChevronDown size={16} />
                      </button>
                    </div>

                    {/* Icon & Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="text-3xl">{getSectionIcon(section.type)}</span>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800">
                            {section.title || getSectionName(section.type)}
                          </h3>
                          {section.subtitle && (
                            <p className="text-sm text-gray-600">{section.subtitle}</p>
                          )}
                          <div className="flex items-center gap-3 mt-1">
                            <p className="text-xs text-gray-500">
                              النوع: {getSectionName(section.type)}
                            </p>
                            {section.content?.image && (
                              <span className="text-xs text-primary-600 flex items-center gap-1">
                                <FiImage size={12} />
                                صورة
                              </span>
                            )}
                            {section.content?.category && (
                              <span className="text-xs text-purple-600 flex items-center gap-1">
                                <FiTag size={12} />
                                {section.content.category}
                              </span>
                            )}
                            {section.settings?.limit && (
                              <span className="text-xs text-green-600">
                                {section.settings.limit} عنصر
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      {section.active ? (
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                          نشط
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                          مخفي
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => setEditingSection(section)}
                        className="p-2 hover:bg-primary-50 text-primary-600 rounded-lg transition"
                        title="تعديل"
                      >
                        <FiEdit size={18} />
                      </button>
                      <button
                        onClick={() => toggleSection(section.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                        title={section.active ? 'إخفاء' : 'إظهار'}
                      >
                        {section.active ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                      </button>
                      <button
                        onClick={() => duplicateSection(section.id)}
                        className="p-2 hover:bg-gray-200 rounded-lg transition"
                        title="نسخ"
                      >
                        <FiCopy size={18} />
                      </button>
                      <button
                        onClick={() => deleteSection(section.id)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition"
                        title="حذف"
                      >
                        <FiTrash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="p-12 text-center text-gray-500">
            <p className="text-lg mb-2">لا توجد أقسام</p>
            <p className="text-sm">ابدأ بإضافة قسم جديد</p>
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="mt-6 p-6 bg-primary-50 border border-primary-200 rounded-xl">
        <h3 className="font-bold text-primary-900 mb-2">💡 ملاحظات:</h3>
        <ul className="text-sm text-primary-800 space-y-1">
          <li>• استخدم الأسهم لتغيير ترتيب الأقسام</li>
          <li>• اضغط على أيقونة العين لإخفاء/إظهار القسم</li>
          <li>• يمكنك نسخ أي قسم بالضغط على أيقونة النسخ</li>
          <li>• الأقسام المخفية لن تظهر في الصفحة الرئيسية</li>
        </ul>
      </div>

      {/* Add Section Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">إضافة قسم جديد</h2>

            <div className="space-y-4">
              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع القسم *
                </label>
                <select
                  value={newSection.type}
                  onChange={(e) => setNewSection({ ...newSection, type: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="hero">🎯 البنر الرئيسي</option>
                  <option value="categories">📂 الفئات</option>
                  <option value="products">📦 المنتجات</option>
                  <option value="deals">🔥 الصفقات المميزة</option>
                  <option value="exclusiveOffers">🎁 العروض الحصرية</option>
                  <option value="banner">🖼️ بنر إعلاني</option>
                  <option value="text">📝 نص</option>
                  <option value="imageGrid">🎨 شبكة صور</option>
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان القسم *
                </label>
                <input
                  type="text"
                  value={newSection.title}
                  onChange={(e) => setNewSection({ ...newSection, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="مثال: أحدث المنتجات"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان الفرعي (اختياري)
                </label>
                <input
                  type="text"
                  value={newSection.subtitle}
                  onChange={(e) => setNewSection({ ...newSection, subtitle: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="مثال: تصفح أحدث المنتجات المتوفرة"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={addSection}
                disabled={saving}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
              >
                {saving ? 'جاري الإضافة...' : 'إضافة'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false)
                  setNewSection({ type: 'products', title: '', subtitle: '' })
                }}
                className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Section Modal */}
      {editingSection && (
        <SectionEditor
          section={editingSection}
          onSave={updateSection}
          onCancel={() => setEditingSection(null)}
          saving={saving}
        />
      )}
    </div>
  )
}

export default HomepageBuilder
