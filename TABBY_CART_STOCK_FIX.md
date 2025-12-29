# إصلاح مشكلة السلة والمخزون مع Tabby

## المشاكل التي تم إصلاحها:

### 1. السلة لا تُفرغ بعد الدفع ✅
- **المشكلة**: بعد نجاح الدفع مع Tabby، المنتجات تبقى في السلة
- **السبب**: OrderSuccess لا يتعرف على Tabby كـ provider
- **الحل**: إضافة معالجة خاصة لـ Tabby في OrderSuccess.jsx

### 2. الطلب لا يظهر في لوحة الإدارة ✅
- **المشكلة**: الطلبات المدفوعة عبر Tabby لا تظهر في لوحة الإدارة
- **السبب**: Webhook لا يحدث حالة الطلب بشكل صحيح
- **الحل**: تحسين handleTabbyWebhook في paymentController.js

### 3. المخزون لا يتم تحديثه ✅
- **المشكلة**: المخزون لا ينقص بعد الدفع الناجح
- **السبب**: Webhook لا يحدث المخزون
- **الحل**: إضافة دالة updateOrderStock وربطها بالـ webhook

### 4. روابط الإرجاع غير صحيحة ✅
- **المشكلة**: روابط success/failure لا تحتوي على معلومات كافية
- **الحل**: إضافة provider=tabby و orderId في الروابط

## الملفات المحدثة:

### 1. backend/controllers/paymentController.js
```javascript
// إضافة دالة تحديث المخزون
async function updateOrderStock(order) {
  // تحديث مخزون المنتجات وزيادة المبيعات
}

// تحسين handleTabbyWebhook
- إضافة تحديث المخزون للدفعات المؤكدة
- إضافة status history entries
- إضافة timestamps للأحداث المختلفة
```

### 2. frontend/src/pages/OrderSuccess.jsx
```javascript
// إضافة معالجة Tabby
else if (provider === 'tabby' && orderIdFromQuery) {
  setPaymentStatus('success');
  clearCart(); // تفريغ السلة
  localStorage.removeItem('pendingOrderId');
  localStorage.removeItem('pendingCart');
  localStorage.removeItem('tabbySessionId');
  fetchOrder(orderIdFromQuery);
}
```

### 3. backend/services/tabbyPaymentService.js
```javascript
// تحديث merchant URLs
merchant_urls: {
  success: `${FRONTEND_URL}/order-success?provider=tabby&orderId=${orderId}`,
  cancel: `${FRONTEND_URL}/checkout?cancelled=true`,
  failure: `${FRONTEND_URL}/order-failed?orderId=${orderId}`
}
```

### 4. backend/controllers/paymentController.js (createTabbyCheckout)
```javascript
// تحديث روابط الإرجاع
successUrl: `${process.env.FRONTEND_URL}/order-success?provider=tabby&orderId=${order._id}`,
```

## ملف الاختبار الجديد:

**TEST_TABBY_WEBHOOK.html** - لاختبار الـ webhook يدوياً

## تدفق العمل الصحيح الآن:

1. **إنشاء الطلب**: يتم إنشاء الطلب بحالة `draft`
2. **الدفع**: المستخدم يدفع عبر Tabby
3. **Webhook**: Tabby ترسل webhook عند نجاح الدفع
4. **تحديث الطلب**: 
   - حالة الطلب → `confirmed`
   - حالة الدفع → `paid`
   - تحديث المخزون
   - إضافة سجل في تاريخ الحالة
5. **الإرجاع**: المستخدم يُرجع لصفحة النجاح مع `provider=tabby`
6. **تفريغ السلة**: السلة تُفرغ تلقائياً

## للاختبار:

1. افتح `TEST_TABBY_WEBHOOK.html`
2. أدخل معرف طلب موجود
3. أدخل معرف دفع وهمي
4. اختر `payment_captured`
5. اضغط "إرسال Webhook"
6. تحقق من حالة الطلب

## النتيجة المتوقعة:

- ✅ السلة تُفرغ بعد الدفع الناجح
- ✅ الطلب يظهر في لوحة الإدارة بحالة مؤكدة
- ✅ المخزون ينقص بالكمية المطلوبة
- ✅ المبيعات تزيد للمنتجات
- ✅ تاريخ الحالة يُسجل بشكل صحيح

## ملاحظات مهمة:

- تأكد من أن webhook URL مُسجل في إعدادات Tabby
- في البيئة الإنتاجية، استخدم HTTPS للـ webhook
- الـ webhook يجب أن يكون متاح للوصول العام (لا localhost)