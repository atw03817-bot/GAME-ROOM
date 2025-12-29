# 📊 نقل قاعدة البيانات من المحلي إلى MongoDB Atlas

## 1️⃣ تصدير البيانات المحلية

```bash
# تصدير كامل قاعدة البيانات
mongodump --db mobile-store --out ./backup

# أو تصدير مجموعة واحدة
mongoexport --db mobile-store --collection products --out products.json
mongoexport --db mobile-store --collection users --out users.json
mongoexport --db mobile-store --collection orders --out orders.json
```

## 2️⃣ استيراد البيانات إلى Atlas

```bash
# استيراد كامل
mongorestore --uri "mongodb+srv://username:password@cluster0.abc123.mongodb.net/gameroom-store" ./backup/mobile-store

# أو استيراد مجموعة واحدة
mongoimport --uri "mongodb+srv://username:password@cluster0.abc123.mongodb.net/gameroom-store" --collection products --file products.json
```

## 3️⃣ إعداد MongoDB Atlas

### خطوات الإعداد:
1. **إنشاء حساب:** https://www.mongodb.com/atlas
2. **إنشاء Cluster مجاني**
3. **إنشاء Database User:**
   - Username: `gameroom-user`
   - Password: `strong-password-123`
4. **Network Access:**
   - Add IP: `0.0.0.0/0` (للسماح لكل الـ IPs)
5. **الحصول على Connection String**

### Connection String مثال:
```
mongodb+srv://gameroom-user:strong-password-123@cluster0.abc123.mongodb.net/gameroom-store?retryWrites=true&w=majority
```

## 4️⃣ تحديث متغيرات البيئة

### في AWS:
```bash
MONGODB_URI=mongodb+srv://gameroom-user:strong-password-123@cluster0.abc123.mongodb.net/gameroom-store?retryWrites=true&w=majority
```

### للاختبار المحلي:
```bash
# يمكنك استخدام نفس الرابط محلياً للاختبار
MONGODB_URI=mongodb+srv://gameroom-user:strong-password-123@cluster0.abc123.mongodb.net/gameroom-store?retryWrites=true&w=majority
```

## 5️⃣ اختبار الاتصال

```javascript
// في backend، أنشئ ملف test-connection.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ اتصال ناجح بقاعدة البيانات');
    
    // اختبار قراءة البيانات
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📊 المجموعات الموجودة:', collections.map(c => c.name));
    
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في الاتصال:', error);
    process.exit(1);
  }
};

testConnection();
```

```bash
# تشغيل الاختبار
node test-connection.js
```

## 🔒 نصائح الأمان

1. **لا تشارك Connection String علناً**
2. **استخدم متغيرات البيئة دائماً**
3. **أنشئ users منفصلين لكل بيئة (development/production)**
4. **فعّل IP Whitelist في الإنتاج**
5. **استخدم كلمات مرور قوية**

## 📈 مراقبة الأداء

- **Atlas Dashboard:** مراقبة الاستخدام والأداء
- **Alerts:** تنبيهات عند الوصول للحدود
- **Backup:** نسخ احتياطية تلقائية

## 💰 التكلفة

- **المستوى المجاني:** 512MB تخزين
- **إذا احتجت أكثر:** خطط مدفوعة تبدأ من $9/شهر