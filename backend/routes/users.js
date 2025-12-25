import express from 'express';
import * as userController from '../controllers/userController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import { checkPermission, checkRole } from '../middleware/permissions.js';

const router = express.Router();

// جلب الأدوار والصلاحيات المتاحة (للإدارة)
router.get('/roles-permissions', auth, checkRole(['admin', 'manager']), userController.getRolesAndPermissions);

// إحصائيات المستخدمين
router.get('/stats', auth, checkPermission('users_view'), userController.getUserStats);

// جلب جميع المستخدمين
router.get('/', auth, checkPermission('users_view'), userController.getAllUsers);

// إنشاء مستخدم جديد
router.post('/', auth, checkPermission('users_manage'), userController.createUser);

// جلب مستخدم واحد
router.get('/:id', auth, checkPermission('users_view'), userController.getUser);

// تحديث مستخدم
router.put('/:id', auth, checkPermission('users_manage'), userController.updateUser);

// تغيير كلمة المرور
router.patch('/:id/password', auth, checkPermission('users_manage'), userController.changePassword);

// حذف مستخدم
router.delete('/:id', auth, checkPermission('users_manage'), userController.deleteUser);

export default router;