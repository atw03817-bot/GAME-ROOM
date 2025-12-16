# ⚡ البدء السريع - Quick Start

## 🎯 في 5 دقائق

### 1️⃣ اقرأ هذه الملفات (بالترتيب)

```bash
# 1. الفهرس (دقيقة واحدة)
cat INDEX.md

# 2. نقطة البداية (3 دقائق)
cat START_HERE.md

# 3. المهام اليومية (دقيقة واحدة)
cat DAILY_TASKS.md
```

---

### 2️⃣ افهم الوضع الحالي

**✅ ما تم (35%):**
- Homepage Builder System
- Product Management (أساسي)
- Shopping Cart
- User Authentication
- Multi-language

**❌ ما تبقى (65%):**
- 10 Models ناقصة
- 6 Controllers ناقصة
- 4 Routes ناقصة
- 25 Components ناقصة
- 17 Pages ناقصة
- 25 Features ناقصة

---

### 3️⃣ ابدأ العمل (الآن!)

#### اليوم 1: Backend Models (الصباح)

```bash
cd mobile-store-vite/backend/models
```

**أنشئ هذه الملفات:**

##### 1. Address.js
```javascript
const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  street: { type: String, required: true },
  building: { type: String, required: true },
  postalCode: String,
  isDefault: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Address', addressSchema);
```

##### 2. PaymentIntent.js
```javascript
const mongoose = require('mongoose');

const paymentIntentSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'SAR' },
  provider: { type: String, required: true }, // tap, myfatoorah, cod
  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'],
    default: 'PENDING'
  },
  paymentUrl: String,
  transactionId: String,
  metadata: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('PaymentIntent', paymentIntentSchema);
```

##### 3. PaymentSettings.js
```javascript
const mongoose = require('mongoose');

const paymentSettingsSchema = new mongoose.Schema({
  provider: {
    type: String,
    required: true,
    unique: true,
    enum: ['tap', 'myfatoorah', 'tabby', 'cod']
  },
  enabled: { type: Boolean, default: false },
  config: mongoose.Schema.Types.Mixed // API keys, etc.
}, { timestamps: true });

module.exports = mongoose.model('PaymentSettings', paymentSettingsSchema);
```

**✅ Checklist:**
- [ ] أنشأت Address.js
- [ ] أنشأت PaymentIntent.js
- [ ] أنشأت PaymentSettings.js
- [ ] اختبرت الـ Models (require في server.js)

---

#### اليوم 1: Backend Models (المساء)

##### 4. ShippingProvider.js
```javascript
const mongoose = require('mongoose');

const shippingProviderSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // smsa, redbox, aramex
  displayName: { type: String, required: true }, // سمسا, ريدبكس, أرامكس
  enabled: { type: Boolean, default: false },
  apiKey: String,
  apiSecret: String,
  apiUrl: String,
  testMode: { type: Boolean, default: true },
  settings: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('ShippingProvider', shippingProviderSchema);
```

##### 5. ShippingRate.js
```javascript
const mongoose = require('mongoose');

const shippingRateSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingProvider',
    required: true
  },
  city: { type: String, required: true },
  price: { type: Number, required: true },
  estimatedDays: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ShippingRate', shippingRateSchema);
```

##### 6. Shipment.js
```javascript
const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShippingProvider',
    required: true
  },
  trackingNumber: String,
  status: {
    type: String,
    enum: ['pending', 'picked_up', 'in_transit', 'delivered', 'failed'],
    default: 'pending'
  },
  shippingCost: { type: Number, required: true },
  estimatedDelivery: Date,
  actualDelivery: Date,
  apiResponse: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('Shipment', shipmentSchema);
```

##### 7. StoreSettings.js
```javascript
const mongoose = require('mongoose');

const storeSettingsSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('StoreSettings', storeSettingsSchema);
```

**✅ Checklist:**
- [ ] أنشأت ShippingProvider.js
- [ ] أنشأت ShippingRate.js
- [ ] أنشأت Shipment.js
- [ ] أنشأت StoreSettings.js
- [ ] اختبرت جميع الـ Models
- [ ] Commit & Push

---

## 🎯 بعد اليوم 1

### ✅ ما أنجزته:
- 7 Models جديدة
- Backend أصبح أقوى
- جاهز لليوم 2

### ⏭️ اليوم 2:
- Controllers الناقصة
- Routes الناقصة

**راجع:** `DAILY_TASKS.md` - اليوم 2

---

## 📝 ملاحظات مهمة

### عند إنشاء Model:
1. ✅ استخدم `mongoose.Schema`
2. ✅ حدد الـ types بدقة
3. ✅ استخدم `required` للحقول المهمة
4. ✅ استخدم `default` للقيم الافتراضية
5. ✅ استخدم `enum` للخيارات المحددة
6. ✅ استخدم `{ timestamps: true }`
7. ✅ Export بـ `module.exports`

### عند الاختبار:
```javascript
// في server.js أو ملف اختبار
const Address = require('./models/Address');
const PaymentIntent = require('./models/PaymentIntent');
// ... الخ

console.log('Models loaded successfully!');
```

---

## 🔧 الأدوات المساعدة

### VS Code Extensions
- ES7+ React/Redux snippets
- MongoDB for VS Code
- Prettier
- ESLint

### Scripts مفيدة
```bash
# تشغيل Backend
cd backend && npm run dev

# تشغيل Frontend
cd frontend && npm run dev

# تشغيل الاثنين
npm run dev
```

---

## 📚 المراجع السريعة

### Mongoose
- [Schemas](https://mongoosejs.com/docs/guide.html)
- [Models](https://mongoosejs.com/docs/models.html)
- [Validation](https://mongoosejs.com/docs/validation.html)

### المشروع القديم
- `backend/prisma/schema.prisma` - للمرجع

---

## ✅ Checklist نهاية اليوم

- [ ] أنشأت 7 Models
- [ ] اختبرت الـ Models
- [ ] حدثت `PROGRESS.md`
- [ ] Commit & Push
- [ ] راجعت `DAILY_TASKS.md` - اليوم 2

---

## 🎉 مبروك!

**أنجزت اليوم 1! 🎊**

**غداً:** Controllers & Routes

**راجع:** `DAILY_TASKS.md` للتفاصيل

---

## 📞 الدعم

إذا واجهت مشكلة:
1. راجع `QUICK_REFERENCE.md`
2. راجع `MIGRATION_GUIDE.md`
3. شوف المشروع القديم
4. اسأل!

---

**يلا نكمل! 💪**
