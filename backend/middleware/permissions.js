// نظام الصلاحيات والأدوار
export const rolePermissions = {
  customer: [],
  technician: [
    'maintenance_view',
    'maintenance_create',
    'maintenance_edit'
  ],
  manager: [
    'maintenance_view',
    'maintenance_create', 
    'maintenance_edit',
    'maintenance_delete',
    'products_view',
    'orders_view',
    'users_view',
    'analytics_view'
  ],
  admin: [
    'maintenance_view',
    'maintenance_create', 
    'maintenance_edit',
    'maintenance_delete',
    'products_view',
    'products_manage',
    'orders_view',
    'orders_manage',
    'users_view',
    'users_manage',
    'analytics_view',
    'settings_manage'
  ]
};

// التحقق من الصلاحية
export const checkPermission = (requiredPermission) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'يجب تسجيل الدخول أولاً'
        });
      }

      // الأدمن له كل الصلاحيات (دعم كل من admin و ADMIN)
      const userRole = user.role?.toLowerCase();
      if (userRole === 'admin') {
        return next();
      }

      // التحقق من الصلاحيات المخصصة للمستخدم
      const userPermissions = user.permissions || [];
      const rolePermissions_list = rolePermissions[userRole] || [];
      const allPermissions = [...userPermissions, ...rolePermissions_list];

      if (allPermissions.includes(requiredPermission)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذا المورد'
      });

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من الصلاحيات'
      });
    }
  };
};

// التحقق من الدور
export const checkRole = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'يجب تسجيل الدخول أولاً'
        });
      }

      // تحويل الأدوار المسموحة إلى lowercase للمقارنة
      const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());
      const userRole = user.role?.toLowerCase();

      if (normalizedAllowedRoles.includes(userRole)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذا القسم'
      });

    } catch (error) {
      console.error('Role check error:', error);
      return res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من الدور'
      });
    }
  };
};

// التحقق من القسم
export const checkDepartment = (allowedDepartments) => {
  return (req, res, next) => {
    try {
      const user = req.user;
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'يجب تسجيل الدخول أولاً'
        });
      }

      // الأدمن له الوصول لكل الأقسام
      const userRole = user.role?.toLowerCase();
      if (userRole === 'admin') {
        return next();
      }

      if (allowedDepartments.includes(user.department)) {
        return next();
      }

      return res.status(403).json({
        success: false,
        message: 'ليس لديك صلاحية للوصول لهذا القسم'
      });

    } catch (error) {
      console.error('Department check error:', error);
      return res.status(500).json({
        success: false,
        message: 'خطأ في التحقق من القسم'
      });
    }
  };
};

// دالة مساعدة للحصول على صلاحيات المستخدم
export const getUserPermissions = (user) => {
  const userPermissions = user.permissions || [];
  const rolePermissions_list = rolePermissions[user.role] || [];
  return [...new Set([...userPermissions, ...rolePermissions_list])];
};