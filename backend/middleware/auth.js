import jwt from 'jsonwebtoken';

export const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'الرجاء تسجيل الدخول' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // تأكد من أن _id موجود (قد يكون userId في الـ token)
    req.user = {
      ...decoded,
      _id: decoded._id || decoded.userId || decoded.id
    };
    next();
  } catch (error) {
    console.error('Auth error:', error);
    res.status(401).json({ message: 'غير مصرح' });
  }
};

export const adminAuth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'الرجاء تسجيل الدخول' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Support both 'admin' and 'ADMIN'
    const role = decoded.role?.toUpperCase();
    if (role !== 'ADMIN') {
      console.log('❌ Access denied. Role:', decoded.role);
      return res.status(403).json({ message: 'غير مصرح - مطلوب صلاحيات إدارية' });
    }
    
    console.log('✅ Admin access granted. Role:', decoded.role);
    
    // تأكد من أن _id موجود (قد يكون userId في الـ token)
    req.user = {
      ...decoded,
      _id: decoded._id || decoded.userId || decoded.id
    };
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(401).json({ message: 'غير مصرح' });
  }
};
