import express from 'express';
import Category from '../models/Category.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .populate('parent')
      .sort('order');
    
    console.log('📋 Categories found:', categories.length);
    console.log('🖼️ Categories with images:', categories.filter(c => c.image).map(c => ({ 
      name: c.name.ar, 
      image: c.image 
    })));
    
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get category by ID
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).populate('parent');
    if (!category) {
      return res.status(404).json({ message: 'الفئة غير موجودة' });
    }
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create category (Admin only)
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const category = new Category(req.body);
    await category.save();
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update category (Admin only)
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!category) {
      return res.status(404).json({ message: 'الفئة غير موجودة' });
    }
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete category (Admin only)
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const category = await Category.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ message: 'الفئة غير موجودة' });
    }
    res.json({ success: true, message: 'تم حذف الفئة بنجاح' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
