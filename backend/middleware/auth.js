import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'الرجاء تسجيل الدخول' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id || decoded.userId || decoded.id;
    
    // جلب بيانات المستخدم الكاملة من قاعدة البيانات
    const user = await User.findById(userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'المستخدم غير موجود أو غير مفعل' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'غير مصرح' });
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'الرجاء تسجيل الدخول' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded._id || decoded.userId || decoded.id;
    
    // جلب بيانات المستخدم الكاملة من قاعدة البيانات
    const user = await User.findById(userId).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ message: 'المستخدم غير موجود أو غير مفعل' });
    }
    
    // Support both 'admin' and 'ADMIN'
    const role = user.role?.toUpperCase();
    if (role !== 'ADMIN') {
      console.log('❌ Access denied. Role:', user.role);
      return res.status(403).json({ message: 'غير مصرح - مطلوب صلاحيات إدارية' });
    }
    
    console.log('✅ Admin access granted. Role:', user.role);
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'غير مصرح' });
  }
};
