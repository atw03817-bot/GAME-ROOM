import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// إنشاء مجلد uploads إذا لم يكن موجوداً
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// إعداد multer للتخزين
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // إنشاء اسم فريد للملف
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, 'image-' + uniqueSuffix + ext);
  },
});

// فلتر للتحقق من نوع الملف
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم. الرجاء رفع صورة (JPG, PNG, WebP, GIF)'), false);
  }
};

// فلتر خاص بالأيقونات
const iconFileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/x-icon', 'image/svg+xml'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع الملف غير مدعوم للأيقونات'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB للصور العادية
    fieldSize: 50 * 1024 * 1024, // حد حجم الحقل
    fields: 20, // عدد الحقول المسموح
    files: 10 // عدد الملفات المسموح
  },
});

// إعداد multer خاص بالأيقونات
const iconUpload = multer({
  storage: storage,
  fileFilter: iconFileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB للأيقونات (زيادة للجودة العالية)
    fieldSize: 5 * 1024 * 1024,
    fields: 10,
    files: 5
  },
});

// رفع صورة واحدة
router.post('/image', upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'لم يتم رفع أي صورة' });
    }

    // إنشاء رابط الصورة الكامل
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrl = `${baseUrl}/uploads/${req.file.filename}`;

    res.json({
      success: true,
      url: imageUrl,
      filename: req.file.filename,
      size: req.file.size,
    });
  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء رفع الصورة' });
  }
});

// رفع عدة صور
router.post('/images', upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'لم يتم رفع أي صور' });
    }

    // إنشاء رابط الصورة الكامل
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const imageUrls = req.files.map((file) => ({
      url: `${baseUrl}/uploads/${file.filename}`,
      filename: file.filename,
      size: file.size,
    }));

    res.json({
      success: true,
      images: imageUrls,
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء رفع الصور' });
  }
});

// رفع أيقونة (favicon, apple-touch-icon, og-image)
router.post('/icon', iconUpload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'لم يتم رفع أي ملف'
      });
    }

    const { type } = req.body;
    const allowedTypes = ['favicon', 'appleTouchIcon', 'ogImage'];
    
    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'نوع الأيقونة غير مدعوم'
      });
    }

    // Generate appropriate filename based on type
    let filename = req.file.filename;
    const ext = path.extname(req.file.originalname);
    
    switch (type) {
      case 'favicon':
        filename = `favicon-${Date.now()}${ext}`;
        break;
      case 'appleTouchIcon':
        filename = `apple-touch-icon-${Date.now()}${ext}`;
        break;
      case 'ogImage':
        filename = `og-image-${Date.now()}${ext}`;
        break;
    }

    // Rename the file
    const oldPath = req.file.path;
    const newPath = path.join(path.dirname(oldPath), filename);
    
    try {
      fs.renameSync(oldPath, newPath);
    } catch (renameError) {
      console.error('Error renaming file:', renameError);
      // If rename fails, use original filename
      filename = req.file.filename;
    }

    // إنشاء رابط الأيقونة الكامل
    const baseUrl = process.env.API_URL || `${req.protocol}://${req.get('host')}`;
    const iconUrl = `${baseUrl}/uploads/${filename}`;
    
    res.json({
      success: true,
      url: iconUrl,
      type: type,
      filename: filename,
      size: req.file.size,
      message: 'تم رفع الأيقونة بنجاح'
    });
  } catch (error) {
    console.error('Error uploading icon:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في رفع الأيقونة'
    });
  }
});

// حذف صورة
router.delete('/image/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadsDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true, message: 'تم حذف الصورة بنجاح' });
    } else {
      res.status(404).json({ message: 'الصورة غير موجودة' });
    }
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حذف الصورة' });
  }
});

// معالجة أخطاء multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(413).json({ 
          success: false,
          message: 'حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت للصور العادية و 5 ميجابايت للأيقونات',
          code: 'FILE_TOO_LARGE'
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({ 
          success: false,
          message: 'عدد الملفات كبير جداً. الحد الأقصى 10 ملفات',
          code: 'TOO_MANY_FILES'
        });
      case 'LIMIT_FIELD_COUNT':
        return res.status(400).json({ 
          success: false,
          message: 'عدد الحقول كبير جداً',
          code: 'TOO_MANY_FIELDS'
        });
      default:
        return res.status(400).json({ 
          success: false,
          message: `خطأ في رفع الملف: ${error.message}`,
          code: error.code
        });
    }
  }
  
  if (error) {
    return res.status(400).json({ 
      success: false,
      message: error.message,
      code: 'UPLOAD_ERROR'
    });
  }
  
  next();
});

export default router;
