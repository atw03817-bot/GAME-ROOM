# 🧪 اختبار Address API

## 📝 الـ Endpoints

### 1. Get All Addresses
```http
GET http://localhost:5001/api/addresses
Authorization: Bearer YOUR_TOKEN
```

### 2. Get Single Address
```http
GET http://localhost:5001/api/addresses/:id
Authorization: Bearer YOUR_TOKEN
```

### 3. Create Address
```http
POST http://localhost:5001/api/addresses
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "fullName": "أحمد محمد",
  "phone": "0501234567",
  "city": "الرياض",
  "district": "النرجس",
  "street": "شارع الملك فهد",
  "building": "مبنى 123",
  "postalCode": "12345",
  "isDefault": true
}
```

### 4. Update Address
```http
PUT http://localhost:5001/api/addresses/:id
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "fullName": "أحمد محمد (محدث)",
  "phone": "0501234567",
  "city": "الرياض",
  "district": "النرجس",
  "street": "شارع الملك فهد",
  "building": "مبنى 456",
  "postalCode": "12345",
  "isDefault": true
}
```

### 5. Delete Address
```http
DELETE http://localhost:5001/api/addresses/:id
Authorization: Bearer YOUR_TOKEN
```

### 6. Set Default Address
```http
PUT http://localhost:5001/api/addresses/:id/default
Authorization: Bearer YOUR_TOKEN
```

---

## 🧪 اختبار بـ cURL

### 1. Register (للحصول على Token)
```bash
curl -X POST http://localhost:5001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "123456",
    "phone": "0501234567"
  }'
```

### 2. Create Address
```bash
curl -X POST http://localhost:5001/api/addresses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "fullName": "أحمد محمد",
    "phone": "0501234567",
    "city": "الرياض",
    "district": "النرجس",
    "street": "شارع الملك فهد",
    "building": "مبنى 123",
    "postalCode": "12345",
    "isDefault": true
  }'
```

### 3. Get All Addresses
```bash
curl -X GET http://localhost:5001/api/addresses \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ✅ Expected Responses

### Success Response (Create)
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "userId": "...",
    "fullName": "أحمد محمد",
    "phone": "0501234567",
    "city": "الرياض",
    "district": "النرجس",
    "street": "شارع الملك فهد",
    "building": "مبنى 123",
    "postalCode": "12345",
    "isDefault": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "تم إضافة العنوان بنجاح"
}
```

### Success Response (Get All)
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "fullName": "أحمد محمد",
      "phone": "0501234567",
      "city": "الرياض",
      "district": "النرجس",
      "street": "شارع الملك فهد",
      "building": "مبنى 123",
      "postalCode": "12345",
      "isDefault": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ]
}
```

### Error Response (Validation)
```json
{
  "success": false,
  "message": "جميع الحقول مطلوبة"
}
```

### Error Response (Not Found)
```json
{
  "success": false,
  "message": "العنوان غير موجود"
}
```

---

## 🎯 Features

✅ **Authentication Required** - جميع الـ endpoints تحتاج token
✅ **User Isolation** - كل مستخدم يشوف عناوينه فقط
✅ **Auto Default** - أول عنوان يصير default تلقائياً
✅ **Default Management** - عند تعيين عنوان default، الباقي يصير false
✅ **Smart Delete** - عند حذف default، عنوان ثاني يصير default
✅ **Validation** - التحقق من جميع الحقول المطلوبة
✅ **Sorting** - العناوين مرتبة (default أولاً، ثم الأحدث)

---

## 📊 Status

- ✅ Controller: addressController.js
- ✅ Routes: routes/addresses.js
- ✅ Model: models/Address.js
- ✅ Server: routes registered

**جاهز للاختبار! 🚀**
