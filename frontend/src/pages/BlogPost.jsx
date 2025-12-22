import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  Eye, 
  User, 
  Tag, 
  Share2, 
  ArrowRight,
  Heart,
  MessageCircle,
  ChevronRight
} from 'lucide-react';
import api from '../utils/api';

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [similarPosts, setSimilarPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/blog/${slug}`);
      setPost(response.data.data.post);
      setSimilarPosts(response.data.data.similarPosts);
    } catch (error) {
      console.error('خطأ في جلب المقال:', error);
      setError('المقال غير موجود');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.log('خطأ في المشاركة:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('تم نسخ الرابط');
    }
  };

  const getCategoryName = (category) => {
    const categoryMap = {
      'اخبار-hotwav': 'أخبار HOTWAV',
      'مراجعات-جوالات': 'مراجعات الجوالات',
      'مقارنات': 'مقارنات',
      'دليل-الشراء': 'دليل الشراء',
      'نصائح-استخدام': 'نصائح الاستخدام',
      'تقنية': 'تقنية',
      'اكسسوارات': 'إكسسوارات'
    };
    return categoryMap[category] || category;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">المقال غير موجود</h1>
          <Link
            to="/blog"
            className="text-blue-600 hover:text-blue-800 flex items-center gap-2 justify-center"
          >
            <ArrowRight className="w-4 h-4" />
            العودة إلى المدونة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-blue-600">الرئيسية</Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/blog" className="hover:text-blue-600">المدونة</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900">{getCategoryName(post.category)}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Article Header */}
          <article className="bg-white rounded-lg shadow-sm overflow-hidden">
            {/* Featured Image */}
            {post.featuredImage?.url && (
              <div className="relative w-full overflow-hidden rounded-lg">
                <div className="w-full h-[800px] max-w-[800px] mx-auto">
                  <img
                    src={post.featuredImage.url}
                    alt={post.featuredImage.alt}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-6 right-6">
                  <span className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-full">
                    {getCategoryName(post.category)}
                  </span>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Title */}
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                {post.title}
              </h1>

              {/* Meta Info */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-gray-600 mb-6 pb-6 border-b">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>{post.author?.name || 'فريق أبعاد التواصل'}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>
                    {new Date(post.publishedAt).toLocaleDateString('ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{post.stats?.readingTime || 5} دقائق قراءة</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  <span>{post.stats?.views || 0} مشاهدة</span>
                </div>

                <button
                  onClick={handleShare}
                  className="flex items-center gap-2 text-blue-600 hover:text-blue-800"
                >
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة</span>
                </button>
              </div>

              {/* Excerpt */}
              {post.excerpt && (
                <div className="bg-blue-50 border-r-4 border-blue-600 p-4 mb-8">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    {post.excerpt}
                  </p>
                </div>
              )}

              {/* Content */}
              <div className="prose prose-lg max-w-none">
                <div 
                  className="text-gray-800 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: post.content.replace(/\n/g, '<br />') 
                  }}
                />
              </div>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Tag className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-600">الكلمات المفتاحية:</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Author Bio */}
              {post.author?.bio && (
                <div className="mt-8 pt-6 border-t">
                  <div className="flex items-start gap-4">
                    {post.author.avatar && (
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {post.author.name}
                      </h3>
                      <p className="text-gray-600">{post.author.bio}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* Similar Posts */}
          {similarPosts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">مقالات مشابهة</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {similarPosts.map((similarPost) => (
                  <Link
                    key={similarPost._id}
                    to={`/blog/${similarPost.slug}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    {similarPost.featuredImage?.url && (
                      <div className="h-56 overflow-hidden">
                        <img
                          src={similarPost.featuredImage.url}
                          alt={similarPost.featuredImage.alt}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-2">
                        {similarPost.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {similarPost.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{similarPost.stats?.readingTime || 5} دقائق</span>
                        </div>
                        <span>
                          {new Date(similarPost.publishedAt).toLocaleDateString('ar-SA')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Related Products */}
          {post.relatedProducts && post.relatedProducts.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">منتجات مرتبطة</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {post.relatedProducts.map((product) => (
                  <Link
                    key={product._id}
                    to={`/products/${product._id}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    {product.images?.[0] && (
                      <div className="h-56 overflow-hidden">
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 line-clamp-2">
                        {product.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-bold text-blue-600">
                          {product.price} ريال
                        </span>
                        <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                          متوفر
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Back to Blog */}
          <div className="mt-8 text-center">
            <Link
              to="/blog"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              العودة إلى المدونة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;