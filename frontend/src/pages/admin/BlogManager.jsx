import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Search,
  Filter,
  Calendar,
  User,
  BarChart3,
  FileText,
  Image,
  Tag,
  Clock,
  TrendingUp,
  Star,
  BookOpen
} from 'lucide-react';
import api from '../../utils/api';

const BlogManager = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [stats, setStats] = useState(null);
  const [categories, setCategories] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [products, setProducts] = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'اخبار-hotwav',
    tags: [],
    featuredImage: {
      url: '',
      alt: '',
      caption: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: [],
      canonicalUrl: ''
    },
    author: {
      name: 'فريق أبعاد التواصل',
      avatar: '',
      bio: ''
    },
    status: 'draft',
    featured: false,
    commentsEnabled: true,
    relatedProducts: []
  });

  const categoryOptions = [
    { key: 'اخبار-hotwav', name: 'أخبار HOTWAV' },
    { key: 'مراجعات-جوالات', name: 'مراجعات الجوالات' },
    { key: 'مقارنات', name: 'مقارنات' },
    { key: 'دليل-الشراء', name: 'دليل الشراء' },
    { key: 'نصائح-استخدام', name: 'نصائح الاستخدام' },
    { key: 'تقنية', name: 'تقنية' },
    { key: 'اكسسوارات', name: 'إكسسوارات' }
  ];

  useEffect(() => {
    fetchPosts();
    fetchStats();
    fetchCategories();
    fetchProducts();
  }, [currentPage, filterCategory, filterStatus, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 10,
        status: filterStatus
      });
      
      if (filterCategory !== 'all') params.append('category', filterCategory);
      if (searchTerm) params.append('search', searchTerm);

      const response = await api.get(`/blog?${params}`);
      setPosts(response.data.data);
      setTotalPages(response.data.pagination.pages);
    } catch (error) {
      console.error('خطأ في جلب المقالات:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/blog/admin/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب الإحصائيات:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/blog/categories');
      setCategories(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب التصنيفات:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      // المحاولة الأولى: رابط المنتجات مع الفلترة
      const response = await api.get('/products?limit=100&status=active');
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('خطأ في جلب المنتجات:', error);
      // المحاولة الثانية: رابط المنتجات العادي
      try {
        const response2 = await api.get('/products');
        setProducts(response2.data.products || response2.data.data || []);
      } catch (error2) {
        console.error('خطأ في جلب المنتجات (المحاولة الثانية):', error2);
        setProducts([]);
      }
    }
  };

  const handleImageUpload = async (file) => {
    if (!file) return null;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await api.post('/upload/image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.url;
    } catch (error) {
      console.error('خطأ في رفع الصورة:', error);
      alert('خطأ في رفع الصورة');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // رفع الصورة إذا تم اختيار ملف جديد
      if (imageFile) {
        const imageUrl = await handleImageUpload(imageFile);
        if (imageUrl) {
          formData.featuredImage.url = imageUrl;
        }
      }

      // إنشاء slug تلقائياً إذا لم يتم توفيره
      if (!formData.slug && formData.title) {
        formData.slug = formData.title
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/\s+/g, '-')
          .trim();
      }

      if (editingPost) {
        await api.put(`/blog/${editingPost._id}`, formData);
      } else {
        await api.post('/blog', formData);
      }

      setShowModal(false);
      setEditingPost(null);
      resetForm();
      fetchPosts();
      fetchStats();
    } catch (error) {
      console.error('خطأ في حفظ المقال:', error);
      alert('خطأ في حفظ المقال');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      slug: post.slug || '',
      excerpt: post.excerpt || '',
      content: post.content || '',
      category: post.category || 'اخبار-hotwav',
      tags: post.tags || [],
      featuredImage: post.featuredImage || { url: '', alt: '', caption: '' },
      seo: post.seo || { metaTitle: '', metaDescription: '', keywords: [], canonicalUrl: '' },
      author: post.author || { name: 'فريق أبعاد التواصل', avatar: '', bio: '' },
      status: post.status || 'draft',
      featured: post.featured || false,
      commentsEnabled: post.commentsEnabled !== undefined ? post.commentsEnabled : true,
      relatedProducts: post.relatedProducts?.map(p => p._id || p) || []
    });
    setImageFile(null); // إعادة تعيين ملف الصورة
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المقال؟')) {
      try {
        await api.delete(`/blog/${id}`);
        fetchPosts();
        fetchStats();
      } catch (error) {
        console.error('خطأ في حذف المقال:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'اخبار-hotwav',
      tags: [],
      featuredImage: { url: '', alt: '', caption: '' },
      seo: { metaTitle: '', metaDescription: '', keywords: [], canonicalUrl: '' },
      author: { name: 'فريق أبعاد التواصل', avatar: '', bio: '' },
      status: 'draft',
      featured: false,
      commentsEnabled: true,
      relatedProducts: []
    });
    setImageFile(null);
  };

  const addTag = (tag) => {
    if (tag && !formData.tags.includes(tag)) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tag]
      });
    }
  };

  const removeTag = (index) => {
    const newTags = formData.tags.filter((_, i) => i !== index);
    setFormData({ ...formData, tags: newTags });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'published': return 'منشور';
      case 'draft': return 'مسودة';
      case 'archived': return 'مؤرشف';
      default: return status;
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            إدارة المدونة
          </h1>
          <p className="text-gray-600">
            إنشاء وإدارة مقالات المدونة لتحسين SEO وجذب العملاء
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-4 h-4" />
          مقال جديد
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المقالات</p>
                <p className="text-2xl font-bold text-gray-900">{stats.overview.totalPosts}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المقالات المنشورة</p>
                <p className="text-2xl font-bold text-green-600">{stats.overview.publishedPosts}</p>
              </div>
              <BookOpen className="w-8 h-8 text-green-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">إجمالي المشاهدات</p>
                <p className="text-2xl font-bold text-purple-600">{stats.overview.totalViews}</p>
              </div>
              <Eye className="w-8 h-8 text-purple-600" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">المسودات</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.overview.draftPosts}</p>
              </div>
              <Edit className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="البحث في المقالات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pr-10 pl-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع التصنيفات</option>
            {categoryOptions.map(cat => (
              <option key={cat.key} value={cat.key}>{cat.name}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">جميع الحالات</option>
            <option value="published">منشور</option>
            <option value="draft">مسودة</option>
            <option value="archived">مؤرشف</option>
          </select>

          <div className="flex gap-2">
            <button
              onClick={fetchPosts}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              <Filter className="w-4 h-4" />
              تحديث
            </button>
          </div>
        </div>
      </div>

      {/* Posts Table */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  المقال
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  التصنيف
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  الحالة
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  المشاهدات
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                  تاريخ النشر
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
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
              ) : posts.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    لا توجد مقالات
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {post.featuredImage?.url && (
                          <img
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {post.title}
                            {post.featured && <Star className="w-4 h-4 text-yellow-500" />}
                          </div>
                          <div className="text-sm text-gray-500">
                            {post.excerpt?.substring(0, 60)}...
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-500">
                              {post.stats?.readingTime || 5} دقائق قراءة
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                        {categoryOptions.find(cat => cat.key === post.category)?.name || post.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(post.status)}`}>
                        {getStatusText(post.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-900">{post.stats?.views || 0}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('ar-SA') : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(post)}
                          className="p-1 text-gray-600 hover:text-gray-800"
                          title="تعديل"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(post._id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="حذف"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        {post.status === 'published' && (
                          <a
                            href={`/blog/${post.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 text-green-600 hover:text-green-800"
                            title="عرض المقال"
                          >
                            <Eye className="w-4 h-4" />
                          </a>
                        )}
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
                  {editingPost ? 'تعديل المقال' : 'مقال جديد'}
                </h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingPost(null);
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
                      عنوان المقال *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      الرابط المخصص (slug)
                    </label>
                    <input
                      type="text"
                      value={formData.slug}
                      onChange={(e) => setFormData({...formData, slug: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="سيتم إنشاؤه تلقائياً من العنوان"
                    />
                  </div>
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      التصنيف *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat.key} value={cat.key}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      حالة النشر
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="draft">مسودة</option>
                      <option value="published">منشور</option>
                      <option value="archived">مؤرشف</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="mr-2"
                      />
                      مقال مميز
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.commentsEnabled}
                        onChange={(e) => setFormData({...formData, commentsEnabled: e.target.checked})}
                        className="mr-2"
                      />
                      تفعيل التعليقات
                    </label>
                  </div>
                </div>

                {/* Excerpt */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الملخص ({formData.excerpt.length}/300) *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="3"
                    maxLength="300"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    محتوى المقال *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({...formData, content: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows="10"
                    required
                  />
                </div>

                {/* Featured Image */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الصورة المميزة
                  </label>
                  
                  {/* عرض الصورة الحالية */}
                  {(formData.featuredImage.url || imageFile) && (
                    <div className="mb-4 relative">
                      <img
                        src={imageFile ? URL.createObjectURL(imageFile) : formData.featuredImage.url}
                        alt="معاينة الصورة"
                        className="w-full h-48 object-cover rounded-lg border"
                      />
                      {/* زر حذف الصورة */}
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null);
                          setFormData({
                            ...formData,
                            featuredImage: { ...formData.featuredImage, url: '' }
                          });
                        }}
                        className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  
                  {/* رفع صورة جديدة */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          // التحقق من حجم الملف (10MB)
                          if (file.size > 10 * 1024 * 1024) {
                            alert('حجم الصورة كبير جداً. الحد الأقصى 10MB');
                            return;
                          }
                          
                          setImageFile(file);
                          // تحديث النص البديل تلقائياً
                          setFormData({
                            ...formData,
                            featuredImage: {
                              ...formData.featuredImage,
                              alt: formData.featuredImage.alt || formData.title
                            }
                          });
                        }
                      }}
                      className="hidden"
                      id="image-upload"
                      disabled={uploadingImage}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer flex flex-col items-center ${uploadingImage ? 'opacity-50' : ''}`}
                    >
                      <Image className="w-12 h-12 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600 font-medium">
                        {uploadingImage ? 'جاري الرفع...' : 
                         imageFile ? 'تغيير الصورة' : 
                         formData.featuredImage.url ? 'تغيير الصورة' : 
                         'اضغط لاختيار صورة'}
                      </span>
                      <span className="text-xs text-gray-400 mt-1">
                        PNG, JPG, GIF حتى 10MB
                      </span>
                    </label>
                  </div>
                  
                  {/* النص البديل */}
                  <div className="mt-4">
                    <input
                      type="text"
                      placeholder="النص البديل للصورة (مهم لـ SEO)"
                      value={formData.featuredImage.alt}
                      onChange={(e) => setFormData({
                        ...formData,
                        featuredImage: {...formData.featuredImage, alt: e.target.value}
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-1 text-xs text-gray-500">
                      💡 وصف مختصر للصورة يساعد في تحسين SEO
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الكلمات المفتاحية
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    placeholder="اضغط Enter لإضافة كلمة مفتاحية"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(e.target.value.trim());
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Related Products */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المنتجات المرتبطة
                  </label>
                  
                  {/* عرض المنتجات المختارة */}
                  {formData.relatedProducts.length > 0 && (
                    <div className="mb-3">
                      <div className="text-sm text-gray-600 mb-2">
                        المنتجات المختارة ({formData.relatedProducts.length}):
                      </div>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {formData.relatedProducts.map((productId, index) => {
                          const product = products.find(p => p._id === productId);
                          return (
                            <div
                              key={index}
                              className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                {product?.images?.[0] && (
                                  <img
                                    src={product.images[0]}
                                    alt={product.name}
                                    className="w-10 h-10 object-cover rounded"
                                  />
                                )}
                                <span className="text-sm font-medium">
                                  {product?.name || 'منتج غير موجود'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const newProducts = formData.relatedProducts.filter((_, i) => i !== index);
                                  setFormData({...formData, relatedProducts: newProducts});
                                }}
                                className="text-red-600 hover:text-red-800"
                              >
                                ✕
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                  
                  {/* اختيار منتجات جديدة */}
                  <select
                    onChange={(e) => {
                      const productId = e.target.value;
                      if (productId && !formData.relatedProducts.includes(productId)) {
                        setFormData({
                          ...formData,
                          relatedProducts: [...formData.relatedProducts, productId]
                        });
                      }
                      e.target.value = '';
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر منتج لإضافته</option>
                    {products
                      .filter(product => !formData.relatedProducts.includes(product._id))
                      .map(product => (
                        <option key={product._id} value={product._id}>
                          {product.name}
                        </option>
                      ))
                    }
                  </select>
                  
                  <div className="mt-2 text-sm text-gray-500">
                    💡 اختر المنتجات المرتبطة بهذا المقال لعرضها في نهاية المقال
                  </div>
                </div>

                {/* SEO Settings */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">إعدادات SEO</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        عنوان SEO ({formData.seo.metaTitle.length}/80)
                      </label>
                      <input
                        type="text"
                        value={formData.seo.metaTitle}
                        onChange={(e) => setFormData({
                          ...formData,
                          seo: {...formData.seo, metaTitle: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        maxLength="80"
                        placeholder="سيتم استخدام عنوان المقال إذا ترك فارغاً"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        وصف SEO ({formData.seo.metaDescription.length}/180)
                      </label>
                      <textarea
                        value={formData.seo.metaDescription}
                        onChange={(e) => setFormData({
                          ...formData,
                          seo: {...formData.seo, metaDescription: e.target.value}
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        maxLength="180"
                        placeholder="سيتم استخدام ملخص المقال إذا ترك فارغاً"
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-3 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPost(null);
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
                    {editingPost ? 'تحديث المقال' : 'إنشاء المقال'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager;