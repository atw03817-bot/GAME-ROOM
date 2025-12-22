import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  BarChart3, 
  Globe, 
  Target,
  TrendingUp,
  FileText,
  Image,
  Link,
  CheckCircle,
  AlertCircle,
  XCircle,
  Lightbulb,
  Zap
} from 'lucide-react';
import api from '../../utils/api';

const SEOManager = () => {
  const { t } = useTranslation();
  const [seoPages, setSeoPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [keywordSuggestions, setKeywordSuggestions] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [formData, setFormData] = useState({
    pageId: '',
    pageType: 'page',
    title: '',
    description: '',
    keywords: [],
    slug: '',
    h1: '',
    featuredImage: {
      url: '',
      alt: '',
      width: 1200,
      height: 630
    },
    openGraph: {
      title: '',
      description: '',
      image: {
        url: '',
        alt: '',
        width: 1200,
        height: 630
      },
      type: 'website'
    },
    twitter: {
      card: 'summary_large_image',
      title: '',
      description: '',
      image: ''
    },
    schemaMarkup: {
      type: 'WebSite',
      data: {}
    },
    indexing: {
      index: true,
      follow: true,
      sitemap: true,
      priority: 0.5,
      changeFreq: 'weekly'
    },
    status: 'active'
  });

  useEffect(() => {
    fetchSEOPages();
  }, [currentPage, filterType, filterStatus, searchTerm]);

  const fetchSEOPages = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 20
      });
      
      if (filterType !== 'all') params.append('pageType', filterType);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/seo?${params}`);

      setSeoPages(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('خطأ في جلب صفحات SEO:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editingPage 
        ? `/api/seo/${editingPage._id}`
        : '/api/seo';
      
      const method = editingPage ? 'put' : 'post';
      
      if (editingPage) {
        await api.put(`/seo/${editingPage._id}`, formData);
      } else {
        await api.post('/seo', formData);
      }

      setShowModal(false);
      setEditingPage(null);
      resetForm();
      fetchSEOPages();
    } catch (error) {
      console.error('خطأ في حفظ إعدادات SEO:', error);
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      ...page,
      keywords: page.keywords || [],
      featuredImage: page.featuredImage || {
        url: '',
        alt: '',
        width: 1200,
        height: 630
      },
      openGraph: page.openGraph || {
        title: '',
        description: '',
        image: {
          url: '',
          alt: '',
          width: 1200,
          height: 630
        },
        type: 'website'
      },
      twitter: page.twitter || {
        card: 'summary_large_image',
        title: '',
        description: '',
        image: ''
      },
      schemaMarkup: page.schemaMarkup || {
        type: 'WebSite',
        data: {}
      },
      indexing: page.indexing || {
        index: true,
        follow: true,
        sitemap: true,
        priority: 0.5,
        changeFreq: 'weekly'
      }
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
      try {
        await api.delete(`/seo/${id}`);
        fetchSEOPages();
      } catch (error) {
        console.error('خطأ في حذف الصفحة:', error);
      }
    }
  };

  const handleAnalyze = async (page) => {
    try {
      const response = await api.get(`/seo/${page._id}/analyze`);
      setAnalysis(response.data.data);
      setShowAnalysis(true);
    } catch (error) {
      console.error('خطأ في تحليل SEO:', error);
    }
  };

  const handleAutoGenerate = async () => {
    try {
      await api.post('/seo/auto-generate-products', {});
      fetchSEOPages();
      alert('تم إنشاء إعدادات SEO للمنتجات بنجاح');
    } catch (error) {
      console.error('خطأ في الإنشاء التلقائي:', error);
    }
  };

  const getKeywordSuggestions = async (keyword) => {
    if (!keyword) return;
    try {
      const response = await api.get(`/seo/keywords/suggestions?keyword=${keyword}`);
      setKeywordSuggestions(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب اقتراحات الكلمات:', error);
    }
  };

  const addKeyword = (keyword) => {
    if (!formData.keywords.includes(keyword)) {
      setFormData({
        ...formData,
        keywords: [...formData.keywords, keyword]
      });
    }
  };

  const removeKeyword = (index) => {
    const newKeywords = formData.keywords.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      keywords: newKeywords
    });
  };

  const resetForm = () => {
    setFormData({
      pageId: '',
      pageType: 'page',
      title: '',
      description: '',
      keywords: [],
      slug: '',
      h1: '',
      featuredImage: {
        url: '',
        alt: '',
        width: 1200,
        height: 630
      },
      openGraph: {
        title: '',
        description: '',
        image: {
          url: '',
          alt: '',
          width: 1200,
          height: 630
        },
        type: 'website'
      },
      twitter: {
        card: 'summary_large_image',
        title: '',
        description: '',
        image: ''
      },
      schemaMarkup: {
        type: 'WebSite',
        data: {}
      },
      indexing: {
        index: true,
        follow: true,
        sitemap: true,
        priority: 0.5,
        changeFreq: 'weekly'
      },
      status: 'active'
    });
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score) => {
    if (score >= 80) return <CheckCircle className="w-5 h-5 text-green-600" />;
    if (score >= 60) return <AlertCircle className="w-5 h-5 text-yellow-600" />;
    return <XCircle className="w-5 h-5 text-red-600" />;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            إدارة تحسين محركات البحث (SEO)
          </h1>
          <p className="text-gray-600">
            تحكم في ظهور موقعك في نتائج البحث وحسن ترتيبه في جوجل
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAutoGenerate}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Zap className="w-4 h-4" />
            إنشاء تلقائي للمنتجات
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Plus className="w-4 h-4" />
            إضافة صفحة جديدة
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في الصفحات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الأنواع</option>
            <option value="page">صفحات</option>
            <option value="product">منتجات</option>
            <option value="category">فئات</option>
            <option value="blog">مدونة</option>
            <option value="custom">مخصص</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="inactive">غير نشط</option>
            <option value="draft">مسودة</option>
          </select>

          <div className="flex gap-2">
            <a
              href="/api/seo/sitemap.xml"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Globe className="w-4 h-4" />
              Sitemap
            </a>
            <a
              href="/api/seo/robots.txt"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <FileText className="w-4 h-4" />
              Robots
            </a>
          </div>
        </div>
      </div>

      {/* SEO Pages Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الصفحة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  النوع
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  نتيجة SEO
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  آخر تحديث
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  الإجراءات
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : seoPages.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    لا توجد صفحات SEO
                  </td>
                </tr>
              ) : (
                seoPages.map((page) => (
                  <tr key={page._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {page.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          /{page.slug}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        page.pageType === 'product' ? 'bg-blue-100 text-blue-800' :
                        page.pageType === 'category' ? 'bg-green-100 text-green-800' :
                        page.pageType === 'blog' ? 'bg-purple-100 text-purple-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {page.pageType === 'product' ? 'منتج' :
                         page.pageType === 'category' ? 'فئة' :
                         page.pageType === 'blog' ? 'مدونة' :
                         page.pageType === 'page' ? 'صفحة' : 'مخصص'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        {getScoreIcon(page.analytics?.score || 0)}
                        <span className={`text-sm font-medium ${getScoreColor(page.analytics?.score || 0)}`}>
                          {page.analytics?.score || 0}%
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        page.status === 'active' ? 'bg-green-100 text-green-800' :
                        page.status === 'inactive' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {page.status === 'active' ? 'نشط' :
                         page.status === 'inactive' ? 'غير نشط' : 'مسودة'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(page.lastModified).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleAnalyze(page)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                          title="تحليل SEO"
                        >
                          <BarChart3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEdit(page)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(page._id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <a
                          href={`/${page.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1 text-green-600 hover:text-green-800"
                          title="عرض الصفحة"
                        >
                          <Eye className="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-3 border-t border-gray-200">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                صفحة {currentPage} من {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">
                  {editingPage ? 'تعديل إعدادات SEO' : 'إضافة صفحة SEO جديدة'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingPage(null);
                    resetForm();
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      معرف الصفحة
                    </label>
                    <input
                      type="text"
                      value={formData.pageId}
                      onChange={(e) => setFormData({...formData, pageId: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الصفحة
                    </label>
                    <select
                      value={formData.pageType}
                      onChange={(e) => setFormData({...formData, pageType: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="page">صفحة</option>
                      <option value="product">منتج</option>
                      <option value="category">فئة</option>
                      <option value="blog">مدونة</option>
                      <option value="custom">مخصص</option>
                    </select>
                  </div>
                </div>

                {/* Title & Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    العنوان ({formData.title.length}/60)
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    maxLength="60"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الوصف ({formData.description.length}/160)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    maxLength="160"
                    required
                  />
                </div>

                {/* Keywords */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الكلمات المفتاحية
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.keywords.map((keyword, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {keyword}
                        <button
                          type="button"
                          onClick={() => removeKeyword(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="أضف كلمة مفتاحية..."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const keyword = e.target.value.trim();
                          if (keyword && !formData.keywords.includes(keyword)) {
                            addKeyword(keyword);
                            e.target.value = '';
                          }
                        }
                      }}
                      onChange={(e) => getKeywordSuggestions(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  {keywordSuggestions.length > 0 && (
                    <div className="mt-2 p-2 border border-gray-200 rounded-lg">
                      <div className="text-sm text-gray-600 mb-2">اقتراحات:</div>
                      <div className="flex flex-wrap gap-1">
                        {keywordSuggestions.slice(0, 10).map((suggestion, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => addKeyword(suggestion)}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الرابط المخصص (Slug)
                  </label>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصورة المميزة
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input
                      type="url"
                      placeholder="رابط الصورة"
                      value={formData.featuredImage?.url || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        featuredImage: {...(formData.featuredImage || {}), url: e.target.value}
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="النص البديل"
                      value={formData.featuredImage?.alt || ''}
                      onChange={(e) => setFormData({
                        ...formData,
                        featuredImage: {...(formData.featuredImage || {}), alt: e.target.value}
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* Indexing Settings */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    إعدادات الفهرسة
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.indexing?.index || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          indexing: {...(formData.indexing || {}), index: e.target.checked}
                        })}
                        className="mr-2"
                      />
                      فهرسة
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.indexing?.follow || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          indexing: {...(formData.indexing || {}), follow: e.target.checked}
                        })}
                        className="mr-2"
                      />
                      متابعة الروابط
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.indexing?.sitemap || false}
                        onChange={(e) => setFormData({
                          ...formData,
                          indexing: {...(formData.indexing || {}), sitemap: e.target.checked}
                        })}
                        className="mr-2"
                      />
                      في Sitemap
                    </label>
                    <select
                      value={formData.indexing?.changeFreq || 'weekly'}
                      onChange={(e) => setFormData({
                        ...formData,
                        indexing: {...(formData.indexing || {}), changeFreq: e.target.value}
                      })}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="always">دائماً</option>
                      <option value="hourly">كل ساعة</option>
                      <option value="daily">يومياً</option>
                      <option value="weekly">أسبوعياً</option>
                      <option value="monthly">شهرياً</option>
                      <option value="yearly">سنوياً</option>
                      <option value="never">أبداً</option>
                    </select>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPage(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    {editingPage ? 'تحديث' : 'إضافة'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Modal */}
      {showAnalysis && analysis && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">تحليل SEO</h2>
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Score */}
              <div className="text-center mb-6">
                <div className={`text-4xl font-bold mb-2 ${getScoreColor(analysis.score)}`}>
                  {analysis.score}%
                </div>
                <div className={`text-lg font-medium ${
                  analysis.level === 'ممتاز' ? 'text-green-600' :
                  analysis.level === 'جيد' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {analysis.level}
                </div>
              </div>

              {/* Strengths */}
              {analysis.strengths.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    نقاط القوة
                  </h3>
                  <ul className="space-y-2">
                    {analysis.strengths.map((strength, index) => (
                      <li key={index} className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="w-4 h-4" />
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Issues */}
              {analysis.issues.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5" />
                    مشاكل يجب حلها
                  </h3>
                  <ul className="space-y-2">
                    {analysis.issues.map((issue, index) => (
                      <li key={index} className="flex items-center gap-2 text-red-700">
                        <XCircle className="w-4 h-4" />
                        {issue}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggestions */}
              {analysis.suggestions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-yellow-600 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-5 h-5" />
                    اقتراحات للتحسين
                  </h3>
                  <ul className="space-y-2">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-center gap-2 text-yellow-700">
                        <Lightbulb className="w-4 h-4" />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setShowAnalysis(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SEOManager;