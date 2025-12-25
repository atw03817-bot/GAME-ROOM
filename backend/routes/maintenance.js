import express from 'express';
import * as maintenanceController from '../controllers/maintenanceController.js';
import { auth, adminAuth } from '../middleware/auth.js';
import { checkPermission, checkDepartment } from '../middleware/permissions.js';

const router = express.Router();

// Routes للعملاء (بدون حماية للطلب الجديد)
router.post('/request', maintenanceController.createMaintenanceRequest);
router.get('/search/:query', maintenanceController.searchByDevice);

// Routes للعملاء المسجلين (محتاجة تسجيل دخول)
router.get('/customer/requests', auth, maintenanceController.getCustomerMaintenanceRequests);

// Routes للإدارة والفنيين (محمية بالصلاحيات)
// إنشاء طلب من الإدارة
router.post('/admin/request', auth, checkPermission('maintenance_create'), maintenanceController.createMaintenanceRequestAdmin);

// تعديل طلب (للطلبات المنشأة من الإدارة فقط)
router.put('/admin/:id', auth, checkPermission('maintenance_edit'), maintenanceController.updateMaintenanceRequestAdmin);

// جلب جميع الطلبات (للفنيين والإدارة)
router.get('/', auth, checkPermission('maintenance_view'), maintenanceController.getAllMaintenanceRequests);

// إحصائيات الصيانة
router.get('/stats', auth, checkPermission('maintenance_view'), maintenanceController.getMaintenanceStats);

// طلب واحد (للفنيين والإدارة)
router.get('/:id', auth, checkPermission('maintenance_view'), maintenanceController.getMaintenanceRequest);

// تحديث طلب (للفنيين والإدارة)
router.put('/:id', auth, checkPermission('maintenance_edit'), maintenanceController.updateMaintenanceRequest);

// تحديث بسيط (للملصق وغيره)
router.patch('/:id', maintenanceController.updateMaintenanceRequestSimple);

// تحديث الحالة (للفنيين والإدارة)
router.patch('/:id/status', auth, checkPermission('maintenance_edit'), maintenanceController.updateStatus);

// تحديث حالة الدفع (للإدارة فقط)
router.patch('/:id/payment-status', auth, checkPermission('maintenance_edit'), maintenanceController.updatePaymentStatus);

// تحديث حالة الشحن (للإدارة فقط)
router.patch('/:id/shipping-status', auth, checkPermission('maintenance_edit'), maintenanceController.updateShippingStatus);

// معالجة موافقة العميل (بدون حماية للعملاء)
router.patch('/:id/customer-approval', maintenanceController.handleCustomerApproval);

// إضافة تشخيص (للفنيين والإدارة)
router.post('/:id/diagnosis', auth, checkPermission('maintenance_edit'), maintenanceController.addDiagnosis);

// إنشاء رابط موافقة العميل (للفنيين والإدارة)
router.get('/:id/approval-link', auth, checkPermission('maintenance_view'), maintenanceController.generateApprovalLink);

// تعيين فني (للإدارة فقط)
router.post('/:id/assign-technician', auth, checkPermission('maintenance_edit'), maintenanceController.assignTechnician);

// حذف طلب (للإدارة فقط)
router.delete('/:id', auth, checkPermission('maintenance_delete'), maintenanceController.deleteMaintenanceRequest);

export default router;