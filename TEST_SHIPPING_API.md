# 🧪 اختبار Shipping API

## 📝 الـ Endpoints

### Public Routes (لا تحتاج Token)

#### 1. Get Shipping Providers
```http
GET http://localhost:5001/api/shipping/providers
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "smsa",
      "displayName": "سمسا - SMSA",
      "enabled": true,
      "testMode": true
    }
  ]
}
```

---

#### 2. Get Shipping Rates for City
```http
GET http://localhost:5001/api/shipping/rates/الرياض
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "providerId": {
        "_id": "...",
        "name": "smsa",
        "displayName": "سمسا - SMSA",
        "enabled": true
      },
      "city": "الرياض",
      "price": 25,
      "estimatedDays": 2
    }
  ]
}
```

---

#### 3. Calculate Shipping Cost
```http
POST http://localhost:5001/api/shipping/calculate
Content-Type: application/json

{
  "city": "الرياض",
  "providerId": "PROVIDER_ID",
  "weight": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "provider": {
      "id": "...",
      "name": "سمسا - SMSA"
    },
    "city": "الرياض",
    "cost": 25,
    "estimatedDays": 2,
    "weight": 3
  }
}
```

---

#### 4. Track Shipment
```http
GET http://localhost:5001/api/shipping/track/TRACKING_NUMBER
```

---

#### 5. Get All Cities
```http
GET http://localhost:5001/api/shipping/cities
```

**Response:**
```json
{
  "success": true,
  "data": [
    "الرياض",
    "جدة",
    "الدمام",
    "مكة المكرمة",
    "المدينة المنورة",
    ...
  ]
}
```

---

### Protected Routes (تحتاج Token)

#### 6. Get Shipment by Order
```http
GET http://localhost:5001/api/shipping/shipments/order/ORDER_ID
Authorization: Bearer YOUR_TOKEN
```

---

### Admin Routes (تحتاج Admin Token)

#### 7. Get All Providers (Including Disabled)
```http
GET http://localhost:5001/api/shipping/providers/all
Authorization: Bearer ADMIN_TOKEN
```

---

#### 8. Update Provider
```http
PUT http://localhost:5001/api/shipping/providers/PROVIDER_ID
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "displayName": "سمسا - SMSA (محدث)",
  "enabled": true,
  "apiKey": "your_api_key",
  "testMode": false
}
```

---

#### 9. Create Shipment
```http
POST http://localhost:5001/api/shipping/shipments
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "orderId": "ORDER_ID",
  "providerId": "PROVIDER_ID",
  "shippingCost": 25,
  "estimatedDelivery": "2024-12-15"
}
```

---

#### 10. Update Shipment Status
```http
PUT http://localhost:5001/api/shipping/shipments/SHIPMENT_ID/status
Authorization: Bearer ADMIN_TOKEN
Content-Type: application/json

{
  "status": "in_transit",
  "trackingNumber": "SMSA123456789"
}
```

---

## 🧪 اختبار بـ cURL

### 1. Get Providers
```bash
curl http://localhost:5001/api/shipping/providers
```

### 2. Get Rates for Riyadh
```bash
curl http://localhost:5001/api/shipping/rates/الرياض
```

### 3. Calculate Shipping
```bash
curl -X POST http://localhost:5001/api/shipping/calculate \
  -H "Content-Type: application/json" \
  -d '{
    "city": "الرياض",
    "providerId": "PROVIDER_ID",
    "weight": 3
  }'
```

### 4. Get All Cities
```bash
curl http://localhost:5001/api/shipping/cities
```

---

## 📊 البيانات التجريبية

### شركات الشحن:
1. **سمسا - SMSA** (enabled)
   - المدن الرئيسية: 25 ريال (2 يوم)
   - باقي المدن: 35 ريال (3 أيام)

2. **أرامكس - Aramex** (enabled)
   - المدن الرئيسية: 30 ريال (2 يوم)
   - باقي المدن: 40 ريال (4 أيام)

3. **ريدبكس - RedBox** (disabled)
   - المدن الرئيسية: 20 ريال (3 أيام)
   - باقي المدن: 30 ريال (5 أيام)

### المدن المتاحة (22 مدينة):
الرياض، جدة، مكة المكرمة، المدينة المنورة، الدمام، الخبر، الظهران، الطائف، تبوك، بريدة، خميس مشيط، حائل، نجران، جازان، ينبع، الأحساء، القطيف، الجبيل، أبها، عرعر، سكاكا، القريات

---

## 🎯 Features

✅ **3 شركات شحن** - SMSA, Aramex, RedBox
✅ **22 مدينة سعودية** - تغطية شاملة
✅ **66 سعر شحن** - لكل شركة ومدينة
✅ **حساب تلقائي** - حسب الوزن
✅ **تتبع الشحنات** - برقم التتبع
✅ **إدارة كاملة** - للأدمن

---

## 🔧 إضافة البيانات التجريبية

```bash
cd backend
node scripts/seedShipping.js
```

**Output:**
```
✅ MongoDB متصل
🗑️  تم حذف البيانات القديمة
✅ تم إنشاء شركات الشحن: 3
✅ تم إنشاء أسعار الشحن: 66

📊 الملخص:
- شركات الشحن: 3
- المدن: 22
- أسعار الشحن: 66

🎉 تم إضافة بيانات الشحن بنجاح!
```

---

**جاهز للاختبار! 🚀**
