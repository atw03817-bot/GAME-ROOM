import express from 'express';
import Product from '../models/Product.js';

const router = express.Router();

// البحث الذكي مع الاقتراحات
router.get('/suggestions', async (req, res) => {
  try {
    const { q, limit = 8 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: {
          suggestions: [],
          products: []
        }
      });
    }

    const searchTerm = q.trim();
    
    // البحث البسيط في المنتجات
    const products = await Product.find({
      nameAr: { $regex: searchTerm, $options: 'i' }
    })
    .select('nameAr price images brand')
    .limit(parseInt(limit))
    .catch(() => []);

    // اقتراحات بسيطة من المنتجات الموجودة
    const suggestions = [];
    const addedSuggestions = new Set();

    products.forEach(product => {
      if (product.nameAr && !addedSuggestions.has(product.nameAr.toLowerCase())) {
        suggestions.push({
          text: product.nameAr,
          type: 'product',
          category: 'منتج'
        });
        addedSuggestions.add(product.nameAr.toLowerCase());
      }
      
      if (product.brand && !addedSuggestions.has(product.brand.toLowerCase()) && suggestions.length < 6) {
        suggestions.push({
          text: product.brand,
          type: 'brand',
          category: 'علامة تجارية'
        });
        addedSuggestions.add(product.brand.toLowerCase());
      }
    });

    res.json({
      success: true,
      data: {
        query: searchTerm,
        suggestions: suggestions.slice(0, 6),
        products: products.map(product => ({
          _id: product._id,
          nameAr: product.nameAr,
          price: product.price,
          image: product.images?.[0] || '/placeholder.jpg',
          brand: product.brand
        }))
      }
    });

  } catch (error) {
    console.error('Search suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث',
      error: error.message
    });
  }
});

// البحث الكامل
router.get('/', async (req, res) => {
  try {
    const { 
      q, 
      category, 
      brand, 
      minPrice, 
      maxPrice, 
      sortBy = 'relevance',
      page = 1, 
      limit = 20 
    } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json({
        success: true,
        data: {
          products: [],
          total: 0,
          page: 1,
          totalPages: 0
        }
      });
    }

    const searchTerm = q.trim();
    
    // بناء استعلام البحث البسيط
    let searchQuery = {
      nameAr: { $regex: searchTerm, $options: 'i' }
    };

    // إضافة فلاتر إضافية
    if (category) {
      searchQuery.category = { $regex: category, $options: 'i' };
    }
    
    if (brand) {
      searchQuery.brand = { $regex: brand, $options: 'i' };
    }
    
    if (minPrice || maxPrice) {
      searchQuery.price = {};
      if (minPrice) searchQuery.price.$gte = parseFloat(minPrice);
      if (maxPrice) searchQuery.price.$lte = parseFloat(maxPrice);
    }

    // ترتيب النتائج
    let sortOptions = { createdAt: -1 };
    switch (sortBy) {
      case 'price_asc':
        sortOptions = { price: 1 };
        break;
      case 'price_desc':
        sortOptions = { price: -1 };
        break;
      case 'newest':
        sortOptions = { createdAt: -1 };
        break;
      case 'popular':
        sortOptions = { sales: -1 };
        break;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const products = await Product.find(searchQuery)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .catch(() => []);

    const total = await Product.countDocuments(searchQuery).catch(() => 0);
    const totalPages = Math.ceil(total / parseInt(limit));

    res.json({
      success: true,
      data: {
        query: searchTerm,
        products,
        total,
        page: parseInt(page),
        totalPages,
        filters: {
          category,
          brand,
          minPrice,
          maxPrice,
          sortBy
        }
      }
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في البحث',
      error: error.message
    });
  }
});

// الحصول على العلامات التجارية والفئات للفلاتر
router.get('/filters', async (req, res) => {
  try {
    const brands = await Product.distinct('brand').catch(() => []);
    const categories = await Product.distinct('category').catch(() => []);

    res.json({
      success: true,
      data: {
        brands: brands.filter(Boolean).sort(),
        categories: categories.filter(Boolean).sort()
      }
    });

  } catch (error) {
    console.error('Filters error:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الفلاتر',
      error: error.message
    });
  }
});

export default router;