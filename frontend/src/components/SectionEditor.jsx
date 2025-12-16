import { useState } from 'react'
import { FiImage, FiLink, FiTag, FiPackage, FiX, FiPlus, FiTrash2 } from 'react-icons/fi'
import ImageUploader from './ImageUploader'
import ProductSelector from './ProductSelector'
import CategoryMultiSelector from './CategoryMultiSelector'

function SectionEditor({ section, onSave, onCancel, saving }) {
  const [formData, setFormData] = useState({
    title: section.title || '',
    subtitle: section.subtitle || '',
    settings: section.settings || {},
    content: section.content || {},
  })

  const handleSave = () => {
    onSave(section.id, formData)
  }

  const updateSettings = (key, value) => {
    setFormData({
      ...formData,
      settings: { ...formData.settings, [key]: value },
    })
  }

  const updateContent = (key, value) => {
    setFormData({
      ...formData,
      content: { ...formData.content, [key]: value },
    })
  }

  // محرر البنر الرئيسي (Hero Slider)
  const renderHeroEditor = () => {
    const slides = formData.content.slides || []

    const addSlide = () => {
      updateContent('slides', [
        ...slides,
        {
          title: '',
          subtitle: '',
          description: '',
          image: '',
          mobileImage: '',
          link: '/products',
          buttonText: 'تسوق الآن',
        },
      ])
    }

    const updateSlide = (index, field, value) => {
      const newSlides = [...slides]
      newSlides[index] = { ...newSlides[index], [field]: value }
      updateContent('slides', newSlides)
    }

    const removeSlide = (index) => {
      const newSlides = slides.filter((_, i) => i !== index)
      updateContent('slides', newSlides)
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            السلايدات ({slides.length})
          </label>
          <button
            type="button"
            onClick={addSlide}
            className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition"
          >
            <FiPlus size={16} />
            إضافة سلايد
          </button>
        </div>

        <div className="space-y-4">
          {slides.map((slide, index) => (
            <div
              key={index}
              className="p-4 border-2 border-gray-200 rounded-lg space-y-3 bg-gray-50"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-bold text-gray-700">
                  سلايد {index + 1}
                </span>
                <button
                  type="button"
                  onClick={() => removeSlide(index)}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                >
                  <FiTrash2 size={16} />
                </button>
              </div>

              <ImageUploader
                value={slide.image}
                onChange={(url) => updateSlide(index, 'image', url)}
                label="صورة الكمبيوتر"
                type="desktop"
                required
              />

              <ImageUploader
                value={slide.mobileImage || ''}
                onChange={(url) => updateSlide(index, 'mobileImage', url)}
                label="صورة الجوال (اختياري)"
                type="mobile"
              />

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  <FiLink className="inline ml-1" /> رابط الانتقال
                </label>
                <input
                  type="text"
                  value={slide.link || '/products'}
                  onChange={(e) => updateSlide(index, 'link', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="/products"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  نص الزر
                </label>
                <input
                  type="text"
                  value={slide.buttonText || 'تسوق الآن'}
                  onChange={(e) => updateSlide(index, 'buttonText', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="تسوق الآن"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  العنوان (اختياري)
                </label>
                <input
                  type="text"
                  value={slide.title || ''}
                  onChange={(e) => updateSlide(index, 'title', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="عنوان السلايد"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  العنوان الفرعي (اختياري)
                </label>
                <input
                  type="text"
                  value={slide.subtitle || ''}
                  onChange={(e) => updateSlide(index, 'subtitle', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="عنوان فرعي"
                />
              </div>
            </div>
          ))}

          {slides.length === 0 && (
            <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
              <FiImage size={32} className="mx-auto mb-2 opacity-50" />
              <p className="text-sm">لا توجد سلايدات</p>
              <p className="text-xs mt-1">اضغط "إضافة سلايد" للبدء</p>
            </div>
          )}
        </div>

        <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-xs text-primary-800">
            💡 <strong>ملاحظة:</strong> البنر الرئيسي يدعم عدة سلايدات مع تبديل تلقائي. صورة
            الجوال اختيارية وستظهر على الهواتف فقط.
          </p>
        </div>
      </div>
    )
  }

  // محرر المنتجات
  const renderProductsEditor = () => {
    const productIds = formData.content.productIds || []

    return (
      <div className="space-y-4">
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-800">
            ✨ <strong>اختر المنتجات:</strong> اختر المنتجات التي تريد عرضها في هذا القسم من القائمة أدناه
          </p>
        </div>

        <ProductSelector
          selectedIds={productIds}
          onChange={(ids) => updateContent('productIds', ids)}
        />

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            💡 <strong>نصيحة:</strong> يمكنك إعادة ترتيب المنتجات لاحقاً من خلال تغيير ترتيب الاختيار
          </p>
        </div>
      </div>
    )
  }

  // محرر البنر الإعلاني
  const renderBannerEditor = () => (
    <div className="space-y-4">
      <ImageUploader
        value={formData.content.image || ''}
        onChange={(url) => updateContent('image', url)}
        label="صورة الكمبيوتر"
        type="banner"
        required
      />

      <ImageUploader
        value={formData.content.mobileImage || ''}
        onChange={(url) => updateContent('mobileImage', url)}
        label="صورة الجوال (اختياري)"
        type="mobile"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <FiLink className="inline ml-1" /> رابط الانتقال (اختياري)
        </label>
        <input
          type="text"
          value={formData.content.buttonLink || ''}
          onChange={(e) => updateContent('buttonLink', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="/products"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نص الزر (اختياري)
        </label>
        <input
          type="text"
          value={formData.content.buttonText || ''}
          onChange={(e) => updateContent('buttonText', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          placeholder="تسوق الآن"
        />
        <p className="text-xs text-gray-500 mt-1">
          سيظهر كزر فوق البنر (اختياري)
        </p>
      </div>

      <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
        <p className="text-xs text-primary-800 mb-2">
          💡 <strong>ملاحظة:</strong> البنر الإعلاني يدعم:
        </p>
        <ul className="text-xs text-primary-800 space-y-1">
          <li>• صورة منفصلة للكمبيوتر والجوال</li>
          <li>• عنوان وعنوان فرعي يظهران فوق البنر</li>
          <li>• زر اختياري مع رابط</li>
        </ul>
      </div>
    </div>
  )

  // محرر النص
  const renderTextEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          المحتوى *
        </label>
        <textarea
          value={formData.content.text || ''}
          onChange={(e) => updateContent('text', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows="6"
          placeholder="أدخل النص هنا..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          محاذاة النص
        </label>
        <select
          value={formData.settings.align || 'center'}
          onChange={(e) => updateSettings('align', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="right">يمين</option>
          <option value="center">وسط</option>
          <option value="left">يسار</option>
        </select>
      </div>
    </div>
  )

  // محرر الصفقات
  const renderDealsEditor = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          عدد الصفقات
        </label>
        <input
          type="number"
          value={formData.settings.limit || 6}
          onChange={(e) => updateSettings('limit', parseInt(e.target.value))}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          min="2"
          max="12"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          نوع العرض
        </label>
        <select
          value={formData.settings.displayType || 'grid'}
          onChange={(e) => updateSettings('displayType', e.target.value)}
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="grid">شبكة</option>
          <option value="slider">سلايدر</option>
        </select>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          id="showTimer"
          checked={formData.settings.showTimer !== false}
          onChange={(e) => updateSettings('showTimer', e.target.checked)}
          className="w-5 h-5 text-primary-600 rounded"
        />
        <label htmlFor="showTimer" className="text-sm text-gray-700">
          إظهار مؤقت العد التنازلي
        </label>
      </div>
    </div>
  )

  // محرر العروض الحصرية
  const renderExclusiveOffersEditor = () => {
    const productIds = formData.content.productIds || []

    return (
      <div className="space-y-4">
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-800">
            ✨ <strong>اختر المنتجات:</strong> اختر المنتجات التي تريد عرضها كعروض حصرية
          </p>
        </div>

        <ProductSelector
          selectedIds={productIds}
          onChange={(ids) => updateContent('productIds', ids)}
          maxSelection={8}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نمط العرض
          </label>
          <select
            value={formData.settings.style || 'cards'}
            onChange={(e) => updateSettings('style', e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="cards">بطاقات</option>
            <option value="compact">مضغوط</option>
            <option value="featured">مميز</option>
          </select>
        </div>

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            💡 <strong>نصيحة:</strong> العروض الحصرية تعرض المنتجات بشكل مميز مع تركيز على الخصومات
          </p>
        </div>
      </div>
    )
  }

  // محرر الفئات
  const renderCategoriesEditor = () => {
    const categories = formData.content.categories || []

    return (
      <div className="space-y-4">
        <div className="p-4 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-sm text-primary-800">
            ✨ <strong>اختر الفئات:</strong> اختر الفئات التي تريد عرضها في هذا القسم من القائمة أدناه
          </p>
        </div>

        <CategoryMultiSelector
          selectedCategories={categories}
          onChange={(cats) => updateContent('categories', cats)}
        />

        <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            💡 <strong>نصيحة:</strong> الفئات المختارة ستظهر بنفس الترتيب في الصفحة الرئيسية
          </p>
        </div>
      </div>
    )
  }

  // محرر شبكة الصور
  const renderImageGridEditor = () => {
    const images = formData.content.images || []

    const addImage = () => {
      updateContent('images', [...images, { image: '', link: '' }])
    }

    const updateImage = (index, field, value) => {
      const newImages = [...images]
      newImages[index] = { ...newImages[index], [field]: value }
      updateContent('images', newImages)
    }

    const removeImage = (index) => {
      const newImages = images.filter((_, i) => i !== index)
      updateContent('images', newImages)
    }

    return (
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-medium text-gray-700">
              الصور ({images.length})
            </label>
            <button
              type="button"
              onClick={addImage}
              className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 transition"
            >
              <FiPlus size={16} />
              إضافة صورة
            </button>
          </div>

          <div className="space-y-3">
            {images.map((img, index) => (
              <div
                key={index}
                className="p-4 border border-gray-200 rounded-lg space-y-3 bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    صورة {index + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>

                <ImageUploader
                  value={img.image}
                  onChange={(url) => updateImage(index, 'image', url)}
                  label="الصورة"
                  type="category"
                  required
                />

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    <FiLink className="inline ml-1" /> رابط الانتقال (اختياري)
                  </label>
                  <input
                    type="text"
                    value={img.link || ''}
                    onChange={(e) => updateImage(index, 'link', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="/products"
                  />
                </div>
              </div>
            ))}

            {images.length === 0 && (
              <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-200 rounded-lg">
                <FiImage size={32} className="mx-auto mb-2 opacity-50" />
                <p className="text-sm">لا توجد صور</p>
                <p className="text-xs mt-1">اضغط "إضافة صورة" للبدء</p>
              </div>
            )}
          </div>
        </div>

        <div className="p-3 bg-primary-50 border border-primary-200 rounded-lg">
          <p className="text-xs text-primary-800">
            💡 <strong>نصيحة:</strong> شبكة الصور تعرض 3 أعمدة على الكمبيوتر وعمود واحد
            على الجوال
          </p>
        </div>
      </div>
    )
  }

  const renderEditor = () => {
    switch (section.type) {
      case 'hero':
        return renderHeroEditor()
      case 'products':
        return renderProductsEditor()
      case 'banner':
        return renderBannerEditor()
      case 'text':
        return renderTextEditor()
      case 'deals':
        return renderDealsEditor()
      case 'exclusiveOffers':
        return renderExclusiveOffersEditor()
      case 'categories':
        return renderCategoriesEditor()
      case 'imageGrid':
        return renderImageGridEditor()
      default:
        return (
          <div className="text-center py-8 text-gray-500">
            لا يوجد محرر متاح لهذا النوع من الأقسام
          </div>
        )
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-800">
            تعديل القسم: {section.title}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FiX size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان القسم *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="مثال: أحدث المنتجات"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                العنوان الفرعي (اختياري)
              </label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="مثال: تصفح أحدث المنتجات المتوفرة"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">إعدادات القسم</h3>
            {renderEditor()}
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition disabled:opacity-50"
          >
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </button>
          <button
            onClick={onCancel}
            className="px-6 py-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}

export default SectionEditor
