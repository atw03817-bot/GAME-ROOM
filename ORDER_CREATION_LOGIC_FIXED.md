# إصلاح منطق إنشاء الطلبات

## المشكلة
كانت الطلبات تظهر في ملف العميل حتى لو كانت ملغية أو غير مدفوعة، حتى لو دخل العميل لصفحة الدفع وخرج بدون إكمال الدفع.

## الحل المطبق

### 1. تحديث منطق إنشاء الطلبات
- **الدفع عند الاستلام (COD)**: يتم إنشاء الطلب بحالة `pending` مباشرة
- **الدفع الإلكتروني (Tamara/Tap)**: يتم إنشاء الطلب بحالة `draft` أولاً

### 2. إضافة حقل `status` جديد في نموذج الطلب
```javascript
status: {
  type: String,
  enum: ['draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
  default: 'pending'
}
```

### 3. تحديث دالة `getMyOrders`
- تم إضافة فلتر لاستبعاد الطلبات المسودة من عرض العميل:
```javascript
let query = { 
  user: userId,
  status: { $ne: 'draft' } // استبعاد الطلبات المسودة
};
```

### 4. إضافة دالة `confirmOrder`
- تستدعى عند نجاح الدفع الإلكتروني
- تحول الطلب من `draft` إلى `pending`
- تحدث المخزون للمنتجات
- تنشئ شحنة مع RedBox إذا لزم الأمر

### 5. إضافة مسار API جديد
```javascript
POST /api/orders/:orderId/confirm
```

## النتيجة
- الطلبات غير المكتملة (draft) لا تظهر في ملف العميل
- فقط الطلبات المؤكدة والمدفوعة تظهر للعميل
- المخزون يتم تحديثه فقط عند تأكيد الدفع
- الشحنات تنشأ فقط للطلبات المؤكدة

## الملفات المحدثة
1. `backend/controllers/orderController.js` - إضافة دالة confirmOrder وتحديث getMyOrders
2. `backend/models/Order.js` - إضافة حقل status وpaymentData
3. `backend/routes/orders.js` - إضافة مسار confirmOrder

## الاستخدام
عند نجاح الدفع عبر Tamara أو Tap، يجب استدعاء:
```javascript
POST /api/orders/{orderId}/confirm
{
  "paymentData": { /* بيانات الدفع */ }
}
```