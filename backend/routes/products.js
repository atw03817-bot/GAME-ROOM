import express from 'express';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all products
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 1000, // زيادة الحد لعرض جميع المنتجات
      category, 
      search, 
      sort = '-createdAt',
      minPrice,
      maxPrice
    } = req.query;

    const query = { isActive: true };

    // Handle category filter - support both slug and ObjectId
    if (category) {
      console.log('🔍 Category filter requested:', category);
      
      // Check if it's a valid ObjectId
      if (category.match(/^[0-9a-fA-F]{24}$/)) {
        console.log('📋 Using ObjectId filter:', category);
        query.category = category;
      } else {
        // It's a slug, find the category first
        console.log('🔗 Looking up category by slug:', category);
        const categoryDoc = await Category.findOne({ 
          $or: [
            { slug: category },
            { 'name.ar': category },
            { 'name.en': category }
          ]
        });
        
        if (categoryDoc) {
          console.log('✅ Found category:', categoryDoc.name.ar, 'ID:', categoryDoc._id);
          query.category = categoryDoc._id;
        } else {
          console.log('❌ Category not found, returning empty results');
          // Category not found, return empty results
          return res.json({
            success: true,
            products: [],
            totalPages: 0,
            currentPage: page,
            total: 0
          });
        }
      }
    }
    
    if (search) {
      query.$or = [
        { 'name.ar': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } }
      ];
    }
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const products = await Product.find(query)
      .populate('category')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit);

    console.log(`🔍 Products query:`, JSON.stringify(query));
    console.log(`📦 Found ${products.length} products`);
    if (category) {
      console.log(`🏷️ Category filter: ${category}`);
      console.log(`📊 Sample product categories:`, products.slice(0, 3).map(p => ({ 
        name: p.nameAr, 
        category: p.category ? p.category.name?.ar : 'No category' 
      })));
    }

    const count = await Product.countDocuments(query);

    res.json({
      success: true,
      products,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get product by ID
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    
    // Increment views
    product.views += 1;
    await product.save();

    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (Admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    // فحص حجم البيانات قبل الحفظ
    const dataSize = JSON.stringify(req.body).length;
    const maxSize = 15 * 1024 * 1024; // 15MB حد أقصى
    
    if (dataSize > maxSize) {
      return res.status(413).json({ 
        message: 'حجم البيانات كبير جداً. حاول تقليل حجم الصور أو الوصف',
        size: `${(dataSize / 1024 / 1024).toFixed(2)}MB`,
        maxSize: '15MB'
      });
    }
    
    console.log('Create product data size:', `${(dataSize / 1024).toFixed(2)}KB`);
    
    const product = new Product(req.body);
    await product.save();
    res.status(201).json({ success: true, product });
  } catch (error) {
    console.error('Error creating product:', error);
    
    // معالجة خطأ حجم الوثيقة الكبير
    if (error.code === 10334 || error.message.includes('BSONObjectTooLarge')) {
      return res.status(413).json({ 
        message: 'حجم البيانات كبير جداً للحفظ في قاعدة البيانات. حاول تقليل حجم الصور أو الوصف'
      });
    }
    
    res.status(500).json({ message: error.message });
  }
});

// Update product (Admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    console.log('Updating product:', req.params.id);
    
    // فحص حجم البيانات قبل الحفظ
    const dataSize = JSON.stringify(req.body).length;
    const maxSize = 15 * 1024 * 1024; // 15MB حد أقصى
    
    if (dataSize > maxSize) {
      return res.status(413).json({ 
        message: 'حجم البيانات كبير جداً. حاول تقليل حجم الصور أو الوصف',
        size: `${(dataSize / 1024 / 1024).toFixed(2)}MB`,
        maxSize: '15MB'
      });
    }
    
    console.log('Update data size:', `${(dataSize / 1024).toFixed(2)}KB`);
    
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    res.json({ success: true, product });
  } catch (error) {
    console.error('Error updating product:', error);
    
    // معالجة خطأ حجم الوثيقة الكبير
    if (error.code === 10334 || error.message.includes('BSONObjectTooLarge')) {
      return res.status(413).json({ 
        message: 'حجم البيانات كبير جداً للحفظ في قاعدة البيانات. حاول تقليل حجم الصور أو الوصف'
      });
    }
    
    res.status(500).json({ message: error.message, error: error.toString() });
  }
});

// Delete product (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'المنتج غير موجود' });
    }
    res.json({ success: true, message: 'تم حذف المنتج بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
