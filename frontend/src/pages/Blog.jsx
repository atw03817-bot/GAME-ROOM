import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Calendar, Clock, Eye, Tag, TrendingUp } from 'lucide-react';
import api from '../utils/api';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPosts();
    fetchFeaturedPosts();
    fetchCategories();
  }, [currentPage, selectedCategory, searchTerm]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage,
        limit: 9,
        status: 'published'
      });
      
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
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

  const fetchFeaturedPosts = async () => {
    try {
      const response = await api.get('/blog/featured?limit=3');
      setFeaturedPosts(response.data.data);
    } catch (error) {
      console.error('خطأ في جلب المقالات المميزة:', error);
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

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchPosts();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              مدونة أبعاد التواصل
            </h1>
            <p className="text-xl text-blue-100 mb-8">
              آخر الأخبار والمراجعات والنصائح حول جوالات HOTWAV والهواتف الذكية
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث في المقالات..."
                  className="w-full px-6 py-4 pr-12 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                >
                  <Search className="w-5 h-5" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4">التصنيفات</h3>
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setCurrentPage(1);
                  }}
                  className={`w-full text-right px-4 py-2 rounded-lg transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  جميع المقالات
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setSelectedCategory(cat.key);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-right px-4 py-2 rounded-lg transition-colors flex items-center justify-between ${
                      selectedCategory === cat.key
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span>{cat.name}</span>
                    <span className="text-sm">{cat.count}</span>
                  </button>
                ))}
              </div>

              {/* Featured Posts Sidebar */}
              {featuredPosts.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-yellow-500" />
                    مقالات مميزة
                  </h3>
                  <div className="space-y-4">
                    {featuredPosts.map((post) => (
                      <Link
                        key={post._id}
                        to={`/blog/${post.slug}`}
                        className="block group"
                      >
                        {post.featuredImage?.url && (
                          <img
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt}
                            className="w-full h-24 object-cover rounded-lg mb-2"
                          />
                        )}
                        <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 line-clamp-2">
                          {post.title}
                        </h4>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{post.stats?.readingTime || 5} دقائق</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : posts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <p className="text-gray-500 text-lg">لا توجد مقالات</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {posts.map((post) => (
                    <Link
                      key={post._id}
                      to={`/blog/${post.slug}`}
                      className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      {post.featuredImage?.url && (
                        <div className="relative w-full h-40 sm:h-48 md:h-56 lg:h-64 overflow-hidden bg-white">
                          <img
                            src={post.featuredImage.url}
                            alt={post.featuredImage.alt}
                            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute top-3 right-3">
                            <span className="px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded-full">
                              {post.category === 'اخبار-hotwav' && 'أخبار HOTWAV'}
                              {post.category === 'مراجعات-جوالات' && 'مراجعات'}
                              {post.category === 'مقارنات' && 'مقارنات'}
                              {post.category === 'دليل-الشراء' && 'دليل الشراء'}
                              {post.category === 'نصائح-استخدام' && 'نصائح'}
                              {post.category === 'تقنية' && 'تقنية'}
                              {post.category === 'اكسسوارات' && 'إكسسوارات'}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      <div className="p-5">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-2">
                          {post.title}
                        </h3>
                        
                        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              <span>
                                {new Date(post.publishedAt).toLocaleDateString('ar-SA', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{post.stats?.readingTime || 5} دقائق</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.stats?.views || 0}</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      >
                        السابق
                      </button>
                      
                      <div className="flex gap-2">
                        {[...Array(totalPages)].map((_, i) => (
                          <button
                            key={i + 1}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-4 py-2 rounded-lg ${
                              currentPage === i + 1
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                      </div>
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
                      >
                        التالي
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;