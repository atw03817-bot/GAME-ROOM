import express from 'express';
import {
  getAllPosts,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  getCategories,
  getFeaturedPosts,
  getLatestPosts,
  searchPosts,
  getBlogStats
} from '../controllers/blogController.js';
import { auth, adminAuth } from '../middleware/auth.js';

const router = express.Router();

// المسارات العامة (بدون مصادقة)
router.get('/', getAllPosts);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedPosts);
router.get('/latest', getLatestPosts);
router.get('/search', searchPosts);
router.get('/:slug', getPostBySlug);

// المسارات الإدارية (تتطلب مصادقة المدير)
router.post('/', auth, adminAuth, createPost);
router.put('/:id', auth, adminAuth, updatePost);
router.delete('/:id', auth, adminAuth, deletePost);
router.get('/admin/stats', auth, adminAuth, getBlogStats);

export default router;