# دليل إنشاء حساب المدير على السيرفر الحقيقي (Ubuntu)

## الطرق المتاحة لإنشاء حساب المدير

### الطريقة الأولى: استخدام Node.js Script (الأسهل)

1. **رفع ملف إنشاء المدير إلى السيرفر:**
```bash
# على السيرفر Ubuntu
cd /path/to/your/project
```

2. **إنشاء ملف create_admin_server.js:**
```bash
nano create_admin_server.js
```

3. **نسخ المحتوى التالي:**
```javascript
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

// تحميل متغيرات البيئة
dotenv.config();

// نموذج المستخدم المبسط
const userSchema = new mongoose.Schema({
  phone: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
  isActive: { type: Boolean, default: true },
  phoneVerified: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date }
});

const User = mongoose.model('User', userSchema);

const createAdmin = async () => {
  try {
    console.log('🔗 الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // بيانات المدير - غير هذه البيانات
    const adminData = {
      phone: '0501234567', // ضع رقم جوالك هنا
      password: 'Admin@123456', // ضع كلمة مرور قوية
      role: 'ADMIN'
    };

    console.log('📝 بيانات المدير:');
    console.log(`رقم الجوال: ${adminData.phone}`);
    console.log(`كلمة المرور: ${adminData.password}`);

    // التحقق من وجود المدير
    const existingUser = await User.findOne({ phone: adminData.phone });
    
    if (existingUser) {
      console.log('⚠️ يوجد مستخدم بنفس رقم الجوال');
      
      if (existingUser.role !== 'ADMIN') {
        existingUser.role = 'ADMIN';
        await existingUser.save();
        console.log('✅ تم تحديث دور المستخدم إلى مدير');
      } else {
        console.log('✅ المستخدم مدير بالفعل');
      }
      
      console.log('🔗 رابط تسجيل الدخول: https://www.ab-tw.com/login');
      return;
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // إنشاء المدير
    const admin = new User({
      phone: adminData.phone,
      password: hashedPassword,
      role: 'ADMIN',
      isActive: true,
      phoneVerified: true
    });

    await admin.save();

    console.log('🎉 تم إنشاء حساب المدير بنجاح!');
    console.log('');
    console.log('📋 معلومات تسجيل الدخول:');
    console.log(`رقم الجوال: ${adminData.phone}`);
    console.log(`كلمة المرور: ${adminData.password}`);
    console.log('');
    console.log('🔗 رابط تسجيل الدخول: https://www.ab-tw.com/login');
    console.log('');
    console.log('⚠️ تأكد من تغيير كلمة المرور بعد تسجيل الدخول');

  } catch (error) {
    console.error('❌ خطأ في إنشاء المدير:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 تم قطع الاتصال بقاعدة البيانات');
  }
};

createAdmin();
```

4. **تشغيل السكريبت:**
```bash
node create_admin_server.js
```

---

### الطريقة الثانية: استخدام API مباشرة

1. **إنشاء ملف test_api.sh:**
```bash
nano test_api.sh
```

2. **نسخ المحتوى التالي:**
```bash
#!/bin/bash

echo "🚀 إنشاء حساب مدير عبر API..."

# بيانات المدير - غير هذه البيانات
PHONE="0501234567"
PASSWORD="Admin@123456"

echo "📝 بيانات المدير:"
echo "رقم الجوال: $PHONE"
echo "كلمة المرور: $PASSWORD"
echo ""

# إرسال طلب إنشاء الحساب
response=$(curl -s -X POST https://www.ab-tw.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"phone\":\"$PHONE\",\"password\":\"$PASSWORD\"}")

echo "📡 استجابة السيرفر:"
echo "$response" | python3 -m json.tool 2>/dev/null || echo "$response"

echo ""
echo "🔗 رابط تسجيل الدخول: https://www.ab-tw.com/login"
```

3. **جعل الملف قابل للتنفيذ وتشغيله:**
```bash
chmod +x test_api.sh
./test_api.sh
```

---

### الطريقة الثالثة: استخدام curl مباشرة

```bash
curl -X POST https://www.ab-tw.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"phone":"0501234567","password":"Admin@123456"}'
```

---

## التحقق من نجاح العملية

### 1. اختبار تسجيل الدخول:
```bash
curl -X POST https://www.ab-tw.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"phone":"0501234567","password":"Admin@123456"}'
```

### 2. التحقق من الدور:
```bash
# بعد الحصول على token من تسجيل الدخول
curl -X GET https://www.ab-tw.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## حل المشاكل الشائعة

### إذا ظهر خطأ "command not found":
```bash
# تثبيت Node.js إذا لم يكن مثبت
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# تثبيت npm dependencies
npm install
```

### إذا ظهر خطأ في قاعدة البيانات:
```bash
# التحقق من حالة MongoDB
sudo systemctl status mongod

# إعادة تشغيل MongoDB إذا لزم الأمر
sudo systemctl restart mongod
```

### إذا ظهر خطأ في الاتصال:
```bash
# التحقق من أن السيرفر يعمل
curl https://www.ab-tw.com/api/health
```

---

## ملاحظات مهمة

1. **غير بيانات المدير:** لا تستخدم البيانات الافتراضية في الإنتاج
2. **كلمة مرور قوية:** استخدم كلمة مرور تحتوي على أحرف كبيرة وصغيرة وأرقام ورموز
3. **رقم جوال صحيح:** تأكد من أن رقم الجوال بالصيغة الصحيحة (05xxxxxxxx)
4. **أول مستخدم:** إذا كانت قاعدة البيانات فارغة، أول مستخدم سيصبح مدير تلقائياً
5. **النسخ الاحتياطي:** اعمل نسخة احتياطية من قاعدة البيانات قبل التعديل

---

## الخطوات التالية بعد إنشاء المدير

1. سجل دخول إلى لوحة الإدارة: https://www.ab-tw.com/admin
2. غير كلمة المرور من الإعدادات
3. أضف بيانات الاتصال والعنوان
4. راجع إعدادات المتجر
5. اختبر وظائف النظام

---

## روابط مفيدة

- **الموقع الرئيسي:** https://www.ab-tw.com
- **تسجيل الدخول:** https://www.ab-tw.com/login
- **لوحة الإدارة:** https://www.ab-tw.com/admin
- **اختبار API:** https://www.ab-tw.com/api/health