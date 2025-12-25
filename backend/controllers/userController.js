import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { rolePermissions, getUserPermissions } from '../middleware/permissions.js';

// إنشاء مستخدم جديد (للإدارة)
export const createUser = async (req, res) => {
  try {
    const { phone, password, name, role, department, permissions } = req.body;

    console.log('Creating user with data:', { phone, name, role, department, permissions });

    // التحقق من البيانات المطلوبة
    if (!phone || !password || !name || !role) {
      return res.status(400).json({
        success: false,
        message: 'الرجاء إدخال جميع البيانات المطلوبة'
      });
    }

    // التحقق من وجود المستخدم
    const existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'رقم الجوال مستخدم بالفعل'
      });
    }

    // إنشاء المستخدم الجديد
    const userData = {
      phone,
      password,
      name,
      role,
      permissions: permissions || []
    };

    // إضافة القسم إذا كان موجود
    if (department && department.trim()) {
      userData.department = department.trim();
    }

    const user = new User(userData);
    await user.save();

    // إزالة كلمة المرور من الاستجابة
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      data: userResponse,
      message: 'تم إنشاء المستخدم بنجاح'
    });

  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في إنشاء المستخدم',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// جلب جميع المستخدمين
export const getAllUsers = async (req, res) => {
  try {
    const { role, department, page = 1, limit = 10 } = req.query;

    // بناء الفلتر
    let filter = {};
    if (role) filter.role = role;
    if (department) filter.department = department;

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(filter);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب المستخدمين'
    });
  }
};

// جلب مستخدم واحد
export const getUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // إضافة الصلاحيات المحسوبة
    const userWithPermissions = {
      ...user.toObject(),
      allPermissions: getUserPermissions(user)
    };

    res.json({
      success: true,
      data: userWithPermissions
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب بيانات المستخدم'
    });
  }
};

// تحديث مستخدم
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, role, department, permissions, isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // تحديث البيانات
    if (name) user.name = name;
    if (role) user.role = role;
    if (department !== undefined) user.department = department;
    if (permissions) user.permissions = permissions;
    if (isActive !== undefined) user.isActive = isActive;

    await user.save();

    const userResponse = user.toObject();
    delete userResponse.password;

    res.json({
      success: true,
      data: userResponse,
      message: 'تم تحديث بيانات المستخدم بنجاح'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث بيانات المستخدم'
    });
  }
};

// تغيير كلمة المرور
export const changePassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });

  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في تغيير كلمة المرور'
    });
  }
};

// حذف مستخدم
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'المستخدم غير موجود'
      });
    }

    // منع حذف الأدمن الأساسي
    if (user.role === 'admin' && user.phone === process.env.ADMIN_PHONE) {
      return res.status(400).json({
        success: false,
        message: 'لا يمكن حذف الأدمن الأساسي'
      });
    }

    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'تم حذف المستخدم بنجاح'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في حذف المستخدم'
    });
  }
};

// جلب الأدوار والصلاحيات المتاحة
export const getRolesAndPermissions = async (req, res) => {
  try {
    const roles = [
      { value: 'customer', label: 'عميل', description: 'عميل عادي' },
      { value: 'technician', label: 'فني صيانة', description: 'موظف صيانة' },
      { value: 'manager', label: 'مدير قسم', description: 'مدير قسم' },
      { value: 'admin', label: 'مدير عام', description: 'مدير عام للنظام' }
    ];

    const departments = [
      { value: 'maintenance', label: 'قسم الصيانة' },
      { value: 'sales', label: 'قسم المبيعات' },
      { value: 'warehouse', label: 'قسم المخازن' },
      { value: 'admin', label: 'الإدارة العامة' }
    ];

    const permissions = [
      { value: 'maintenance_view', label: 'عرض طلبات الصيانة' },
      { value: 'maintenance_create', label: 'إنشاء طلبات صيانة' },
      { value: 'maintenance_edit', label: 'تعديل طلبات الصيانة' },
      { value: 'maintenance_delete', label: 'حذف طلبات الصيانة' },
      { value: 'products_view', label: 'عرض المنتجات' },
      { value: 'products_manage', label: 'إدارة المنتجات' },
      { value: 'orders_view', label: 'عرض الطلبات' },
      { value: 'orders_manage', label: 'إدارة الطلبات' },
      { value: 'users_view', label: 'عرض المستخدمين' },
      { value: 'users_manage', label: 'إدارة المستخدمين' },
      { value: 'analytics_view', label: 'عرض التقارير' },
      { value: 'settings_manage', label: 'إدارة الإعدادات' }
    ];

    res.json({
      success: true,
      data: {
        roles,
        departments,
        permissions,
        rolePermissions
      }
    });

  } catch (error) {
    console.error('Error fetching roles and permissions:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الأدوار والصلاحيات'
    });
  }
};

// إحصائيات المستخدمين
export const getUserStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    
    const roleStats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    const departmentStats = await User.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        total: totalUsers,
        active: activeUsers,
        inactive: totalUsers - activeUsers,
        byRole: roleStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {}),
        byDepartment: departmentStats.reduce((acc, stat) => {
          acc[stat._id || 'غير محدد'] = stat.count;
          return acc;
        }, {})
      }
    });

  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب إحصائيات المستخدمين'
    });
  }
};