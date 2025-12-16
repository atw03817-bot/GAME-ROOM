# ✅ إصلاح خطأ Addresses API

## المشكلة:
```
POST http://localhost:5001/api/addresses 500 (Internal Server Error)
```

## السبب:
الـ JWT token يحتوي على `userId` لكن الـ controller يبحث عن `req.user._id`

### في auth.js (إنشاء Token):
```javascript
const token = jwt.sign(
  { userId: user._id, role: user.role },  // ← userId
  process.env.JWT_SECRET,
  { expiresIn: '30d' }
);
```

### في addressController.js (استخدام):
```javascript
const addresses = await Address.find({ userId: req.user._id }); // ← يبحث عن _id
```

## الحل:
تحديث `auth` middleware لتحويل `userId` إلى `_id`:

```javascript
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
```

## الملفات المعدلة:
- ✅ `backend/middleware/auth.js`
  - تحديث `auth` middleware
  - تحديث `adminAuth` middleware
  - إضافة console.error للتشخيص

## الاختبار:

### 1. أعد تشغيل Backend:
```bash
cd mobile-store-vite/backend
# اضغط Ctrl+C لإيقاف السيرفر
npm start
```

### 2. سجل دخول مرة أخرى:
- افتح المتصفح
- سجل خروج ثم سجل دخول مرة أخرى
- أو امسح localStorage وسجل دخول

### 3. جرب إضافة عنوان:
- اذهب إلى صفحة Checkout
- اضغط "إضافة عنوان جديد"
- املأ البيانات
- اضغط حفظ

### 4. تحقق من النتيجة:
- ✅ يجب أن يتم حفظ العنوان بنجاح
- ✅ لا أخطاء 500 في Console
- ✅ رسالة نجاح تظهر

## ملاحظات:

1. **التوافق:**
   - الكود الآن يدعم `_id`, `userId`, و `id`
   - يعمل مع أي شكل من أشكال الـ token

2. **التشخيص:**
   - تمت إضافة `console.error` لتسهيل التشخيص
   - يمكن رؤية الأخطاء في terminal الـ backend

3. **الأمان:**
   - لم يتم تغيير منطق الأمان
   - فقط تحسين التوافق مع شكل البيانات

## الأخطاء الأخرى المحتملة:

### إذا استمر الخطأ 500:
1. تحقق من terminal الـ backend للأخطاء
2. تأكد من أن MongoDB يعمل
3. تأكد من أن JWT_SECRET موجود في .env
4. جرب تسجيل دخول جديد

### إذا ظهر خطأ 401:
- المستخدم غير مسجل دخول
- الـ token منتهي الصلاحية
- سجل دخول مرة أخرى

### إذا ظهر خطأ 400:
- بيانات ناقصة في النموذج
- تحقق من جميع الحقول المطلوبة
