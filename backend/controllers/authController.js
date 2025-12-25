import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// دالة تنسيق رقم الجوال
const formatPhoneNumber = (phone) => {
  if (!phone) return phone;
  
  // إزالة المسافات والشرطات والأقواس
  let cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  
  // إزالة رمز الدولة إذا كان موجود
  if (cleanPhone.startsWith('+966')) {
    cleanPhone = cleanPhone.substring(4);
  } else if (cleanPhone.startsWith('966')) {
    cleanPhone = cleanPhone.substring(3);
  }
  
  // إضافة 0 في البداية إذا كان الرقم يبدأ بـ 5
  if (cleanPhone.startsWith('5') && cleanPhone.length === 9) {
    cleanPhone = '0' + cleanPhone;
  }
  
  return cleanPhone;
};

export const register = async (req, res) => {
  try {
    const { phone, password } = req.body;

    console.log('📝 Registration attempt:', { phone });

    // التحقق من وجود البيانات المطلوبة
    if (!phone || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'رقم الجوال وكلمة المرور مطلوبان' 
      });
    }

    // تنسيق رقم الجوال
    const formattedPhone = formatPhoneNumber(phone);
    
    // التحقق من صحة رقم الجوال
    if (!formattedPhone || !/^(05|5)[0-9]{8}$/.test(formattedPhone.replace(/[\s-]/g, ''))) {
      return res.status(400).json({ 
        success: false, 
        message: 'رقم الجوال يجب أن يكون رقم سعودي صحيح (مثال: 0501234567)' 
      });
    }

    // التحقق من طول كلمة المرور
    if (password.length < 6) {
      return res.status(400).json({ 
        success: false, 
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' 
      });
    }

    // التحقق من وجود المستخدم برقم الجوال
    const existingUser = await User.findOne({ phone: formattedPhone });

    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'رقم الجوال مستخدم بالفعل' 
      });
    }

    // التحقق من أول مستخدم (جعله مدير)
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    const user = new User({
      phone: formattedPhone,
      password: password, // بدون hash لأن الـ model يقوم بالـ hash
      role: isFirstUser ? 'admin' : 'customer',
    });

    await user.save();

    console.log('✅ User registered successfully:', formattedPhone);

    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.getDisplayName(),
        role: user.role,
      },
      message: 'تم إنشاء الحساب بنجاح'
    });
  } catch (error) {
    console.error('❌ Register error:', error);
    
    // التعامل مع أخطاء MongoDB المختلفة
    if (error.code === 11000) {
      // خطأ duplicate key
      if (error.keyPattern?.phone) {
        return res.status(400).json({ 
          success: false, 
          message: 'رقم الجوال مستخدم بالفعل' 
        });
      }
    }
    
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        success: false, 
        message: messages.join(', ') 
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

export const login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    console.log('🔍 Login attempt:', { phone, passwordLength: password?.length });

    // تنسيق رقم الجوال
    const formattedPhone = formatPhoneNumber(phone);
    
    if (!formattedPhone) {
      return res.status(400).json({ 
        success: false, 
        message: 'رقم الجوال مطلوب' 
      });
    }

    const user = await User.findOne({ phone: formattedPhone });

    console.log('👤 User found:', user ? 'YES' : 'NO');

    if (!user) {
      console.log('❌ User not found in database');
      return res.status(401).json({ 
        success: false, 
        message: 'رقم الجوال أو كلمة المرور غير صحيحة' 
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'الحساب غير مفعل. يرجى التواصل مع الإدارة' 
      });
    }

    console.log('🔐 Comparing passwords...');
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Password mismatch');
      return res.status(401).json({ 
        success: false, 
        message: 'رقم الجوال أو كلمة المرور غير صحيحة' 
      });
    }

    // تحديث آخر تسجيل دخول
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    console.log('✅ Login successful for:', formattedPhone);

    const token = jwt.sign(
      { _id: user._id.toString(), role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.getDisplayName(),
        role: user.role,
      },
      message: 'تم تسجيل الدخول بنجاح'
    });
  } catch (error) {
    console.error('❌ Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    // req.user هو الـ user object كامل من الـ auth middleware
    const user = req.user;

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'المستخدم غير موجود' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.getDisplayName(),
        role: user.role,
        permissions: user.permissions,
        department: user.department,
        phoneVerified: user.phoneVerified,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        name: name || undefined,
        updatedAt: new Date() 
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'المستخدم غير موجود' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user._id.toString(),
        phone: user.phone,
        name: user.getDisplayName(),
        role: user.role,
        permissions: user.permissions,
        department: user.department,
      },
      message: 'تم تحديث الملف الشخصي بنجاح'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'حدث خطأ في الخادم' 
    });
  }
};
