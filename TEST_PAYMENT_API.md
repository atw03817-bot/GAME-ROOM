# 🧪 اختبار Payment API

## 📝 الـ Endpoints

### Public Routes

#### 1. Get Payment Methods
```http
GET http://localhost:5001/api/payments/methods
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "provider": "cod",
      "enabled": true
    }
  ]
}
```

---

### Protected Routes (تحتاج Token)

#### 2. Create Payment Intent
```http
POST http://localhost:5001/api/payments/intent
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "orderId": "ORDER_ID",
  "amount": 500,
  "provider": "cod"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "orderId": "ORDER_ID",
    "amount": 500,
    "provider": "cod",
    "status": "PENDING",
    "transactionId": "COD-ORDER_ID"
  },
  "message": "تم إنشاء نية الدفع بنجاح"
}
```

---

#### 3. Verify Payment
```http
POST http://localhost:5001/api/payments/verify
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "transactionId": "TAP-123456",
  "provider": "tap"
}
```

---

### Admin Routes (تحتاج Admin Token)

#### 4. Get All Payment Settings
```http
GET http://localhost:5001/api/payments/settings
Authorization: Bearer ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "provider": "cod",
      "enabled": true,
      "hasConfig": true
    },
    {
      "_id": "...",
      "provider": "tap",
      "enabled": false,
      "hasConfig": true
    }
  ]
}
```

---

#### 5. Get Single Payment Setting
```http
GET http://localhost:5001/api/payments/settings/tap
Authorization: Bearer ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "provider": "tap",
    "enabled": false,
    "config": {
      "displayName": "Tap Payment",
      "apiKey": "YOUR_TAP_API_KEY",
      "testMode": true
    }
  }
}
```

---

#### 6. Update Payment Settings
```http
PUT http://localhost:5001/api/payments/settings/tap
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "enabled": true,
  "config": {
    "displayName": "Tap Payment",
    "apiKey": "sk_test_YOUR_KEY",
    "secretKey": "YOUR_SECRET",
    "testMode": true,
    "webhookUrl": "https://yourdomain.com/api/payments/tap/callback"
  }
}
```

---

#### 7. Refund Payment
```http
POST http://localhost:5001/api/payments/refund
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "transactionId": "TAP-123456",
  "amount": 500,
  "reason": "طلب العميل"
}
```

---

### Callback Routes (من Payment Providers)

#### 8. Tap Callback
```http
POST http://localhost:5001/api/payments/tap/callback
Content-Type: application/json

{
  "tap_id": "chg_TS123456",
  "status": "CAPTURED",
  "order_id": "ORDER_ID"
}
```

---

#### 9. MyFatoorah Callback
```http
POST http://localhost:5001/api/payments/myfatoorah/callback
Content-Type: application/json

{
  "paymentId": "MF123456",
  "status": "SUCCESS",
  "orderId": "ORDER_ID"
}
```

---

## 🧪 اختبار بـ cURL

### 1. Get Payment Methods
```bash
curl http://localhost:5001/api/payments/methods
```

### 2. Create Payment Intent (COD)
```bash
curl -X POST http://localhost:5001/api/payments/intent \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "orderId": "ORDER_ID",
    "amount": 500,
    "provider": "cod"
  }'
```

### 3. Get Payment Settings (Admin)
```bash
curl http://localhost:5001/api/payments/settings \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 📊 طرق الدفع المتاحة

### 1. COD (الدفع عند الاستلام) ✅
- **الحالة:** مفعّل
- **الوصف:** ادفع نقداً عند استلام الطلب
- **رسوم إضافية:** 0 ريال

### 2. Tap Payment ⏸️
- **الحالة:** معطّل (يحتاج API Keys)
- **الوصف:** الدفع عبر بطاقة الائتمان
- **المميزات:** Visa, Mastercard, Mada

### 3. MyFatoorah ⏸️
- **الحالة:** معطّل (يحتاج API Keys)
- **الوصف:** بوابة دفع متعددة
- **المميزات:** جميع طرق الدفع

### 4. Tamara ⏸️
- **الحالة:** معطّل (يحتاج API Keys)
- **الوصف:** قسّط مشترياتك
- **المميزات:** 3 أو 4 دفعات

### 5. Tabby ⏸️
- **الحالة:** معطّل (يحتاج API Keys)
- **الوصف:** اشتري الآن وادفع لاحقاً
- **المميزات:** 4 دفعات بدون فوائد

---

## 🎯 Features

✅ **5 طرق دفع** - COD, Tap, MyFatoorah, Tamara, Tabby
✅ **Payment Intents** - نظام نوايا الدفع
✅ **Verification** - التحقق من الدفع
✅ **Callbacks** - معالجة callbacks من Providers
✅ **Refunds** - استرجاع المبالغ
✅ **Admin Management** - إدارة كاملة للإعدادات
✅ **Test Mode** - وضع الاختبار

---

## 🔧 إضافة البيانات التجريبية

```bash
cd backend
node scripts/seedPayments.js
```

**Output:**
```
✅ MongoDB متصل
🗑️  تم حذف البيانات القديمة
✅ تم إنشاء إعدادات الدفع: 5

📊 الملخص:
- طرق الدفع: 5
- المفعّل: COD فقط
- المعطّل: Tap, MyFatoorah, Tamara, Tabby

🎉 تم إضافة إعدادات الدفع بنجاح!
```

---

## 💡 ملاحظات

### لتفعيل Tap Payment:
1. سجل في https://tap.company
2. احصل على API Keys
3. حدّث الإعدادات عبر Admin API
4. فعّل الطريقة

### لتفعيل MyFatoorah:
1. سجل في https://myfatoorah.com
2. احصل على API Key
3. حدّث الإعدادات
4. فعّل الطريقة

---

**جاهز للاختبار! 🚀**
