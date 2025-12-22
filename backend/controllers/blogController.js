import BlogPost from '../models/BlogPost.js';
import mongoose from 'mongoose';

// جلب جميع المقالات مع الفلترة والبحث
export const getAllPosts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      category,
      status = 'published',
      search,
      featured,
      sort = '-publishedAt'
    } = req.query;

    const query = {};
    
    // فلترة حسب الحالة
    if (status !== 'all') {
      query.status = status;
    }
    
    // فلترة حسب التصنيف
    if (category && category !== 'all') {
      query.category = category;
    }
    
    // فلترة المقالات المميزة
    if (featured === 'true') {
      query.featured = true;
    }
    
    // البحث في العنوان والمحتوى
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort,
      populate: 'relatedProducts'
    };

    // استخدام pagination عادي بدلاً من المكتبة
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const posts = await BlogPost.find(query)
      .populate('relatedProducts')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await BlogPost.countDocuments(query);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        pages: totalPages,
        total: total,
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('خطأ في جلب المقالات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المقالات'
    });
  }
};

// جلب مقال واحد بالـ slug
export const getPostBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const post = await BlogPost.findOne({ 
      slug, 
      status: 'published' 
    }).populate('relatedProducts');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    // زيادة عدد المشاهدات
    await BlogPost.findByIdAndUpdate(post._id, {
      $inc: { 'stats.views': 1 }
    });

    // جلب المقالات المشابهة
    const similarPosts = await post.getSimilarPosts(3);

    res.json({
      success: true,
      data: {
        post,
        similarPosts
      }
    });
  } catch (error) {
    console.error('خطأ في جلب المقال:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المقال'
    });
  }
};

// إنشاء مقال جديد
export const createPost = async (req, res) => {
  try {
    const postData = req.body;
    
    // إنشاء slug تلقائياً إذا لم يتم توفيره
    if (!postData.slug) {
      postData.slug = postData.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }

    const post = new BlogPost(postData);
    await post.save();

    res.status(201).json({
      success: true,
      data: post,
      message: 'تم إنشاء المقال بنجاح'
    });
  } catch (error) {
    console.error('خطأ في إنشاء المقال:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'الرابط المخصص (slug) مستخدم بالفعل'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المقال'
    });
  }
};

// تحديث مقال
export const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const post = await BlogPost.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    res.json({
      success: true,
      data: post,
      message: 'تم تحديث المقال بنجاح'
    });
  } catch (error) {
    console.error('خطأ في تحديث المقال:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث المقال'
    });
  }
};

// حذف مقال
export const deletePost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await BlogPost.findByIdAndDelete(id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'المقال غير موجود'
      });
    }

    res.json({
      success: true,
      message: 'تم حذف المقال بنجاح'
    });
  } catch (error) {
    console.error('خطأ في حذف المقال:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المقال'
    });
  }
};

// جلب التصنيفات مع عدد المقالات
export const getCategories = async (req, res) => {
  try {
    const categories = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const categoryMap = {
      'اخبار-hotwav': 'أخبار HOTWAV',
      'مراجعات-جوالات': 'مراجعات الجوالات',
      'مقارنات': 'مقارنات',
      'دليل-الشراء': 'دليل الشراء',
      'نصائح-استخدام': 'نصائح الاستخدام',
      'تقنية': 'تقنية',
      'اكسسوارات': 'إكسسوارات'
    };

    const formattedCategories = categories.map(cat => ({
      key: cat._id,
      name: categoryMap[cat._id] || cat._id,
      count: cat.count
    }));

    res.json({
      success: true,
      data: formattedCategories
    });
  } catch (error) {
    console.error('خطأ في جلب التصنيفات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب التصنيفات'
    });
  }
};

// جلب المقالات المميزة
export const getFeaturedPosts = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const posts = await BlogPost.find({
      status: 'published',
      featured: true
    })
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit))
    .select('title slug excerpt featuredImage publishedAt stats.readingTime category');

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('خطأ في جلب المقالات المميزة:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المقالات المميزة'
    });
  }
};

// جلب أحدث المقالات
export const getLatestPosts = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const posts = await BlogPost.find({
      status: 'published'
    })
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit))
    .select('title slug excerpt featuredImage publishedAt stats.readingTime category');

    res.json({
      success: true,
      data: posts
    });
  } catch (error) {
    console.error('خطأ في جلب أحدث المقالات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب أحدث المقالات'
    });
  }
};

// البحث في المقالات
export const searchPosts = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'يجب توفير كلمة البحث'
      });
    }

    const posts = await BlogPost.find({
      status: 'published',
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { excerpt: { $regex: q, $options: 'i' } },
        { content: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } }
      ]
    })
    .sort({ publishedAt: -1 })
    .limit(parseInt(limit))
    .select('title slug excerpt featuredImage publishedAt stats.readingTime category');

    res.json({
      success: true,
      data: posts,
      count: posts.length
    });
  } catch (error) {
    console.error('خطأ في البحث:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث'
    });
  }
};

// إحصائيات المدونة
export const getBlogStats = async (req, res) => {
  try {
    const stats = await BlogPost.aggregate([
      {
        $group: {
          _id: null,
          totalPosts: { $sum: 1 },
          publishedPosts: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          draftPosts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          totalViews: { $sum: '$stats.views' },
          totalLikes: { $sum: '$stats.likes' }
        }
      }
    ]);

    const categoryStats = await BlogPost.aggregate([
      { $match: { status: 'published' } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalPosts: 0,
          publishedPosts: 0,
          draftPosts: 0,
          totalViews: 0,
          totalLikes: 0
        },
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('خطأ في جلب الإحصائيات:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الإحصائيات'
    });
  }
};