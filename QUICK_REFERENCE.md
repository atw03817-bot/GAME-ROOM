# ⚡ مرجع سريع - Quick Reference

## 📁 هيكل الملفات

### المشروع القديم (Next.js)
```
backend/
├── prisma/schema.prisma          → Models
├── src/
│   ├── controllers/              → Business Logic
│   ├── routes/                   → API Routes
│   ├── middleware/               → Auth, etc.
│   └── server.ts                 → Entry Point

frontend/
├── src/
│   ├── app/                      → Pages (App Router)
│   ├── components/               → UI Components
│   ├── contexts/                 → State Management
│   └── lib/                      → Utils
```

### المشروع الجديد (Vite)
```
backend/
├── models/                       → Mongoose Models
├── controllers/                  → Business Logic
├── routes/                       → Express Routes
├── middleware/                   → Auth, etc.
└── server.js                     → Entry Point

frontend/
├── src/
│   ├── pages/                    → Pages (React Router)
│   ├── components/               → UI Components
│   ├── store/                    → Zustand Stores
│   └── utils/                    → Utils
```

---

## 🔄 التحويلات السريعة

### Database
```javascript
// Prisma → Mongoose
prisma.user.findUnique({ where: { id } })
→ User.findById(id)

prisma.user.findMany({ where: { role: 'ADMIN' } })
→ User.find({ role: 'ADMIN' })

prisma.user.create({ data: {...} })
→ User.create({...})

prisma.user.update({ where: { id }, data: {...} })
→ User.findByIdAndUpdate(id, {...}, { new: true })

prisma.user.delete({ where: { id } })
→ User.findByIdAndDelete(id)
```

### Navigation
```javascript
// Next.js → React Router
import { useRouter } from 'next/navigation'
const router = useRouter()
router.push('/path')
→
import { useNavigate } from 'react-router-dom'
const navigate = useNavigate()
navigate('/path')
```

### i18n
```javascript
// next-intl → i18next
import { useTranslations } from 'next-intl'
const t = useTranslations('namespace')
t('key')
→
import { useTranslation } from 'react-i18next'
const { t } = useTranslation()
t('namespace.key')
```

### State
```javascript
// Context → Zustand
const { state, action } = useContext(MyContext)
→
const { state, action } = useMyStore()
```

### Env Variables
```javascript
// Next.js → Vite
process.env.NEXT_PUBLIC_API_URL
→
import.meta.env.VITE_API_URL
```

---

## 📦 Models Reference

### User
```javascript
{
  email: String (unique)
  phone: String (unique)
  password: String (hashed)
  name: String
  role: 'USER' | 'ADMIN'
  addresses: [Address]
  orders: [Order]
}
```

### Product
```javascript
{
  nameAr: String
  nameEn: String
  tagline: String
  descriptionAr: String
  descriptionEn: String
  price: Number
  originalPrice: Number
  brand: String
  category: String
  images: [String]
  colors: [String]
  storage: [String]
  quickFeatures: Object
  features: Object
  specifications: Object
  stock: Number
  condition: 'NEW' | 'REFURBISHED' | 'USED'
  warranty: String
  rating: Number
  reviewsCount: Number
}
```

### Order
```javascript
{
  userId: ObjectId
  items: [OrderItem]
  total: Number
  status: 'PENDING' | 'PROCESSING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED'
  shippingAddress: Object
  paymentMethod: String
  paymentStatus: 'PENDING' | 'COMPLETED' | 'FAILED'
  paymentIntentId: String
  transactionId: String
}
```

### Address
```javascript
{
  userId: ObjectId
  fullName: String
  phone: String
  city: String
  district: String
  street: String
  building: String
  postalCode: String
  isDefault: Boolean
}
```

---

## 🛣️ API Routes Reference

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/password
```

### Products
```
GET    /api/products
GET    /api/products/:id
POST   /api/products          (Admin)
PUT    /api/products/:id      (Admin)
DELETE /api/products/:id      (Admin)
```

### Orders
```
GET    /api/orders            (User: own orders)
GET    /api/orders/all        (Admin: all orders)
GET    /api/orders/:id
POST   /api/orders
PUT    /api/orders/:id/status (Admin)
```

### Addresses
```
GET    /api/addresses
GET    /api/addresses/:id
POST   /api/addresses
PUT    /api/addresses/:id
DELETE /api/addresses/:id
PUT    /api/addresses/:id/default
```

### Shipping
```
GET    /api/shipping/providers
PUT    /api/shipping/providers/:id  (Admin)
GET    /api/shipping/rates
POST   /api/shipping/calculate
POST   /api/shipping/shipments
GET    /api/shipping/track/:id
```

### Payments
```
GET    /api/payments/settings       (Admin)
PUT    /api/payments/settings       (Admin)
POST   /api/payments/intent
POST   /api/payments/verify
POST   /api/payments/callback/tap
POST   /api/payments/callback/myfatoorah
```

### Homepage
```
GET    /api/homepage/config
PUT    /api/homepage/config         (Admin)
POST   /api/homepage/sections       (Admin)
PUT    /api/homepage/sections/:id   (Admin)
DELETE /api/homepage/sections/:id   (Admin)
PUT    /api/homepage/sections/reorder (Admin)
```

---

## 🎨 Component Patterns

### Basic Component
```javascript
const MyComponent = ({ prop1, prop2 }) => {
  const [state, setState] = useState(initialValue);
  
  useEffect(() => {
    // Side effects
  }, [dependencies]);
  
  const handleAction = () => {
    // Handler logic
  };
  
  return (
    <div>
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

### Component with API
```javascript
import { useState, useEffect } from 'react';
import api from '../utils/api';

const MyComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/endpoint');
        setData(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {data.map(item => (
        <div key={item._id}>{item.name}</div>
      ))}
    </div>
  );
};

export default MyComponent;
```

### Component with Store
```javascript
import { useCartStore } from '../store/useCartStore';

const MyComponent = () => {
  const { cart, addItem, removeItem } = useCartStore();
  
  return (
    <div>
      <p>Items: {cart.length}</p>
      <button onClick={() => addItem(item)}>Add</button>
    </div>
  );
};

export default MyComponent;
```

---

## 🔧 Utility Functions

### API Client
```javascript
// utils/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

### Format Price
```javascript
// utils/formatPrice.js
export const formatPrice = (price, currency = 'SAR') => {
  return new Intl.NumberFormat('ar-SA', {
    style: 'currency',
    currency: currency,
  }).format(price);
};
```

### Format Date
```javascript
// utils/formatDate.js
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('ar-SA', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};
```

---

## 🎯 Common Tasks

### إضافة Model جديد
1. إنشاء `backend/models/ModelName.js`
2. تعريف Schema
3. Export Model
4. استخدام في Controller

### إضافة API Route جديد
1. إنشاء `backend/routes/routeName.js`
2. تعريف Routes
3. ربط بـ Controller
4. إضافة في `server.js`

### إضافة Page جديدة
1. إنشاء `frontend/src/pages/PageName.jsx`
2. إضافة Route في `App.jsx`
3. إضافة Link في Navbar

### إضافة Component جديد
1. إنشاء `frontend/src/components/ComponentName.jsx`
2. استخدام في Page أو Component آخر

### إضافة Store جديد
1. إنشاء `frontend/src/store/useStoreName.js`
2. تعريف State & Actions
3. استخدام في Components

---

## 🐛 Debugging

### Backend Errors
```javascript
// في Controller
try {
  // Code
} catch (error) {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    message: error.message
  });
}
```

### Frontend Errors
```javascript
// في Component
try {
  // Code
} catch (error) {
  console.error('Error:', error);
  toast.error(error.message);
}
```

### Check API Response
```javascript
// في Browser Console
const res = await fetch('http://localhost:5000/api/products');
const data = await res.json();
console.log(data);
```

---

## 📝 Git Commands

```bash
# Status
git status

# Add files
git add .

# Commit
git commit -m "feat: add feature name"

# Push
git push origin main

# Pull
git pull origin main

# Create branch
git checkout -b feature-name

# Switch branch
git checkout main
```

---

## 🚀 Run Commands

```bash
# Install dependencies
npm install

# Run both (from root)
npm run dev

# Run backend only
cd backend && npm run dev

# Run frontend only
cd frontend && npm run dev

# Seed database
cd backend && node scripts/seedHomepage.js

# Build frontend
cd frontend && npm run build
```

---

## 📚 مراجع سريعة

- **Mongoose:** https://mongoosejs.com/docs/guide.html
- **Express:** https://expressjs.com/en/guide/routing.html
- **React Router:** https://reactrouter.com/en/main
- **Zustand:** https://github.com/pmndrs/zustand
- **i18next:** https://www.i18next.com/
- **Tailwind:** https://tailwindcss.com/docs

---

**احفظ هذا الملف للرجوع السريع! 📌**
