# 🚀 تشغيل Tap Payment - خطوات سريعة

## ✅ تم الإصلاح:
- ❌ حذف `/api/api/` المكرر → ✅ `/api/`
- ❌ حذف الإعدادات القديمة من StoreSettings
- ✅ النظام الآن يستخدم PaymentSettings فقط

---

## 📝 خطوات التشغيل:

### 1. افتح صفحة الإعدادات
```
http://localhost:5173/admin/tap-payment-settings
```

### 2. أدخل مفاتيح Tap
احصل عليها من: https://dashboard.tap.company

**للتجربة:**
```
Secret Key: sk_test_XxXxXxXxXxXxXxXx
Public Key: pk_test_XxXxXxXxXxXxXxXx
```

**للإنتاج:**
```
Secret Key: sk_live_XxXxXxXxXxXxXxXx
Public Key: pk_live_XxXxXxXxXxXxXxXx
```

### 3. اختبر الاتصال
اضغط زر "اختبار الاتصال" للتأكد من صحة المفاتيح

### 4. فعّل Tap Payment
شغّل المفتاح واحفظ الإعدادات

### 5. أضف Webhook في Tap Dashboard
```
http://your-backend-url/api/payments/tap/webhook
```

---

## 🧪 اختبار سريع:

### بطاقة اختبار ناجحة:
```
رقم البطاقة: 4508750000000001
CVV: 100
تاريخ الانتهاء: 12/25
```

### خطوات الاختبار:
1. أضف منتج للسلة
2. اذهب للدفع
3. اختر Tap Payment
4. استخدم بطاقة الاختبار
5. تحقق من تحديث حالة الطلب

---

## 📊 API Endpoints:

```
GET    /api/payments/settings/tap      # جلب الإعدادات
PUT    /api/payments/settings/tap      # حفظ الإعدادات
POST   /api/payments/tap/charge        # إنشاء دفع
GET    /api/payments/tap/verify/:id    # التحقق
POST   /api/payments/tap/webhook       # Webhook
```

---

## ✅ النظام جاهز!

الآن يمكنك استخدام Tap Payment بشكل كامل ومستقل.
