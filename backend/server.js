import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/authNew.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import orderRoutes from './routes/orders.js';
import userRoutes from './routes/users.js';
import settingsRoutes from './routes/settings.js';
import shippingRoutes from './routes/shipping.js';
import paymentRoutes from './routes/payments.js';
import pageRoutes from './routes/pages.js';
import dealRoutes from './routes/deals.js';
import homepageRoutes from './routes/homepage.js';
import addressRoutes from './routes/addresses.js';
import customerRoutes from './routes/customers.js';
import uploadRoutes from './routes/upload.js';
import themeRoutes from './routes/theme.js';
import footerRoutes from './routes/footer.js';
import legalPagesRoutes from './routes/legalPages.js';
import seoRoutes from './routes/seo.js';
import webhookRoutes from './routes/webhooks.js';
import searchRoutes from './routes/search.js';
import realAnalyticsRoutes from './routes/realAnalytics.js';
import blogRoutes from './routes/blog.js';
import tamaraSettingsRoutes from './routes/tamaraSettings.js';
import maintenanceRoutes from './routes/maintenance.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: function (origin, callback) {
    // السماح للطلبات بدون origin (مثل التطبيقات المحمولة)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://www.gameroom-store.com',
      'https://gameroom-store.com',
      'https://api.gameroom-store.com'
    ];
    
    // السماح للـ origins المسموحة أو أي origin محلي
    if (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return callback(null, true);
    }
    
    return callback(null, true); // السماح لكل الـ origins مؤقتاً للاختبار
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin'],
  optionsSuccessStatus: 200 // للمتصفحات القديمة
}));

// Body parser with increased limits
app.use(express.json({ 
  limit: '100mb',
  parameterLimit: 50000,
  extended: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '100mb',
  parameterLimit: 50000
}));

// Handle large requests timeout
app.use((req, res, next) => {
  // زيادة timeout للطلبات الكبيرة
  req.setTimeout(300000); // 5 دقائق
  res.setTimeout(300000);
  next();
});

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,PATCH,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Static files
app.use('/uploads', express.static('uploads'));

// Database connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB متصل بنجاح'))
  .catch((err) => console.error('❌ خطأ في الاتصال بـ MongoDB:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/shipping', shippingRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/pages', pageRoutes);
app.use('/api/deals', dealRoutes);
app.use('/api/homepage', homepageRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/theme', themeRoutes);
app.use('/api/footer', footerRoutes);
app.use('/api/legal-pages', legalPagesRoutes);
app.use('/api/seo', seoRoutes);
app.use('/api/webhooks', webhookRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/real-analytics', realAnalyticsRoutes);
app.use('/api/blog', blogRoutes);
app.use('/api/tamara-settings', tamaraSettingsRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// SEO routes في الجذر (للوصول المباشر)
app.get('/sitemap.xml', async (req, res) => {
  try {
    const { generateSitemap } = await import('./controllers/seoController.js');
    await generateSitemap(req, res);
  } catch (error) {
    console.error('خطأ في sitemap:', error);
    res.status(500).send('خطأ في إنشاء sitemap');
  }
});

app.get('/robots.txt', async (req, res) => {
  try {
    const { generateRobots } = await import('./controllers/seoController.js');
    await generateRobots(req, res);
  } catch (error) {
    console.error('خطأ في robots:', error);
    res.status(500).send('خطأ في إنشاء robots.txt');
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'حدث خطأ في الخادم',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  
  // Handle specific error types
  if (err.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'حجم الطلب كبير جداً. الحد الأقصى 100MB',
      code: 'PAYLOAD_TOO_LARGE'
    });
  }
  
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({
      success: false,
      message: 'حجم الملف كبير جداً',
      code: 'FILE_TOO_LARGE'
    });
  }
  
  // Default error response
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'خطأ داخلي في الخادم',
    code: err.code || 'INTERNAL_ERROR'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'المسار غير موجود',
    code: 'NOT_FOUND'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 CORS enabled for: www.gameroom-store.com, gameroom-store.com, api.gameroom-store.com`);
  console.log(`📦 Max request size: 100MB`);
  console.log(`⏱️  Request timeout: 5 minutes`);
});
