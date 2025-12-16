# 🔄 دليل التحويل من Next.js إلى Vite

## 📊 المقارنة السريعة

| الميزة | المشروع القديم (Next.js) | المشروع الجديد (Vite) |
|--------|-------------------------|---------------------|
| **Framework** | Next.js 14 | Vite + React 18 |
| **Database ORM** | Prisma | Mongoose |
| **Database** | MongoDB | MongoDB |
| **Styling** | Tailwind CSS | Tailwind CSS |
| **State Management** | Context API | Zustand |
| **i18n** | next-intl | i18next |
| **Routing** | App Router | React Router |
| **API** | API Routes | Express.js |
| **Language** | TypeScript | JavaScript |

---

## 🔧 التحويلات الأساسية

### 1. Database Queries

#### Prisma → Mongoose

**القديم (Prisma):**
```typescript
// Find one
const user = await prisma.user.findUnique({
  where: { id: userId }
});

// Find many
const products = await prisma.product.findMany({
  where: { category: 'phones' },
  include: { orderItems: true }
});

// Create
const product = await prisma.product.create({
  data: { name: 'iPhone', price: 5000 }
});

// Update
const updated = await prisma.product.update({
  where: { id },
  data: { price: 4500 }
});

// Delete
await prisma.product.delete({
  where: { id }
});
```

**الجديد (Mongoose):**
```javascript
// Find one
const user = await User.findById(userId);

// Find many with populate
const products = await Product.find({ category: 'phones' })
  .populate('orderItems');

// Create
const product = await Product.create({
  name: 'iPhone',
  price: 5000
});

// Update
const updated = await Product.findByIdAndUpdate(
  id,
  { price: 4500 },
  { new: true }
);

// Delete
await Product.findByIdAndDelete(id);
```

---

### 2. API Routes

#### Next.js API Routes → Express Routes

**القديم (Next.js):**
```typescript
// app/api/products/route.ts
export async function GET(request: Request) {
  const products = await prisma.product.findMany();
  return Response.json({ products });
}

export async function POST(request: Request) {
  const body = await request.json();
  const product = await prisma.product.create({ data: body });
  return Response.json({ product });
}
```

**الجديد (Express):**
```javascript
// backend/routes/products.js
const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
  const products = await Product.find();
  res.json({ products });
});

router.post('/', async (req, res) => {
  const product = await Product.create(req.body);
  res.json({ product });
});

module.exports = router;
```

---

### 3. Components

#### TypeScript → JavaScript

**القديم (TypeScript):**
```typescript
interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.price} SAR</p>
    </div>
  );
};

export default ProductCard;
```

**الجديد (JavaScript):**
```javascript
const ProductCard = ({ product }) => {
  return (
    <div className="product-card">
      <h3>{product.name}</h3>
      <p>{product.price} SAR</p>
    </div>
  );
};

export default ProductCard;
```

---

### 4. Navigation

#### Next.js Router → React Router

**القديم (Next.js):**
```typescript
import { useRouter } from 'next/navigation';

const Component = () => {
  const router = useRouter();
  
  const handleClick = () => {
    router.push('/products');
  };
  
  return <button onClick={handleClick}>Go</button>;
};
```

**الجديد (React Router):**
```javascript
import { useNavigate } from 'react-router-dom';

const Component = () => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate('/products');
  };
  
  return <button onClick={handleClick}>Go</button>;
};
```

---

### 5. i18n

#### next-intl → i18next

**القديم (next-intl):**
```typescript
import { useTranslations } from 'next-intl';

const Component = () => {
  const t = useTranslations('common');
  
  return <h1>{t('welcome')}</h1>;
};
```

**الجديد (i18next):**
```javascript
import { useTranslation } from 'react-i18next';

const Component = () => {
  const { t } = useTranslation();
  
  return <h1>{t('common.welcome')}</h1>;
};
```

---

### 6. State Management

#### Context API → Zustand

**القديم (Context):**
```typescript
// contexts/CartContext.tsx
const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  
  const addItem = (item) => {
    setCart([...cart, item]);
  };
  
  return (
    <CartContext.Provider value={{ cart, addItem }}>
      {children}
    </CartContext.Provider>
  );
};

// Usage
const { cart, addItem } = useContext(CartContext);
```

**الجديد (Zustand):**
```javascript
// store/useCartStore.js
import create from 'zustand';

export const useCartStore = create((set) => ({
  cart: [],
  addItem: (item) => set((state) => ({
    cart: [...state.cart, item]
  }))
}));

// Usage
const { cart, addItem } = useCartStore();
```

---

### 7. Environment Variables

**القديم (Next.js):**
```env
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000
DATABASE_URL=mongodb://...
```

```typescript
// Usage
const apiUrl = process.env.NEXT_PUBLIC_API_URL;
```

**الجديد (Vite):**
```env
# .env
VITE_API_URL=http://localhost:5000
DATABASE_URL=mongodb://...
```

```javascript
// Usage
const apiUrl = import.meta.env.VITE_API_URL;
```

---

### 8. Image Handling

**القديم (Next.js):**
```typescript
import Image from 'next/image';

<Image
  src="/product.jpg"
  alt="Product"
  width={300}
  height={300}
/>
```

**الجديد (Vite):**
```javascript
<img
  src="/product.jpg"
  alt="Product"
  className="w-[300px] h-[300px]"
/>
```

---

### 9. Metadata

**القديم (Next.js):**
```typescript
// app/products/[id]/page.tsx
export async function generateMetadata({ params }) {
  return {
    title: 'Product Name',
    description: 'Product description'
  };
}
```

**الجديد (Vite):**
```javascript
// Use react-helmet or similar
import { Helmet } from 'react-helmet';

<Helmet>
  <title>Product Name</title>
  <meta name="description" content="Product description" />
</Helmet>
```

---

### 10. File Structure

**القديم (Next.js):**
```
frontend/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── products/
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   └── api/
│   │       └── products/
│   │           └── route.ts
│   ├── components/
│   └── lib/
```

**الجديد (Vite):**
```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Products.jsx
│   │   └── ProductDetail.jsx
│   ├── components/
│   ├── store/
│   └── utils/
backend/
├── routes/
├── controllers/
├── models/
└── server.js
```

---

## 🎯 خطوات التحويل

### لكل ملف:

1. **افتح الملف القديم** (TypeScript)
2. **احذف الـ types** (interfaces, types)
3. **حول Prisma → Mongoose**
4. **حول next/navigation → react-router-dom**
5. **حول next-intl → i18next**
6. **احفظ كـ .jsx** بدلاً من .tsx

### مثال كامل:

**القديم:**
```typescript
// frontend/src/app/products/page.tsx
import { useTranslations } from 'next-intl';

interface Product {
  id: string;
  name: string;
  price: number;
}

export default function ProductsPage() {
  const t = useTranslations('products');
  const [products, setProducts] = useState<Product[]>([]);
  
  useEffect(() => {
    fetch('/api/products')
      .then(res => res.json())
      .then(data => setProducts(data.products));
  }, []);
  
  return (
    <div>
      <h1>{t('title')}</h1>
      {products.map(product => (
        <div key={product.id}>{product.name}</div>
      ))}
    </div>
  );
}
```

**الجديد:**
```javascript
// frontend/src/pages/Products.jsx
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function ProductsPage() {
  const { t } = useTranslation();
  const [products, setProducts] = useState([]);
  
  useEffect(() => {
    api.get('/products')
      .then(res => setProducts(res.data.products));
  }, []);
  
  return (
    <div>
      <h1>{t('products.title')}</h1>
      {products.map(product => (
        <div key={product._id}>{product.name}</div>
      ))}
    </div>
  );
}
```

---

## ⚠️ ملاحظات مهمة

### 1. IDs
- **Prisma:** `id: string`
- **Mongoose:** `_id: ObjectId` (يظهر كـ string في JSON)

### 2. Relations
- **Prisma:** `include: { relation: true }`
- **Mongoose:** `.populate('relation')`

### 3. Timestamps
- **Prisma:** `createdAt`, `updatedAt` (تلقائي)
- **Mongoose:** `{ timestamps: true }` في Schema

### 4. Validation
- **Prisma:** في Schema
- **Mongoose:** في Schema + express-validator في Routes

### 5. Transactions
- **Prisma:** `prisma.$transaction()`
- **Mongoose:** `session.startTransaction()`

---

## 🚀 نصائح للتحويل السريع

1. **ابدأ بالـ Models** - الأساس
2. **ثم Controllers** - المنطق
3. **ثم Routes** - الـ API
4. **أخيراً Frontend** - الواجهة

5. **اختبر كل جزء** قبل الانتقال للتالي

6. **استخدم Git** - commit بعد كل ميزة

7. **راجع المشروع القديم** - لا تخترع من جديد

---

## 📚 مراجع مفيدة

- [Mongoose vs Prisma](https://www.prisma.io/docs/concepts/more/comparisons/prisma-and-mongoose)
- [Next.js to Vite Migration](https://vitejs.dev/guide/migration.html)
- [React Router v6](https://reactrouter.com/en/main)
- [Zustand Guide](https://github.com/pmndrs/zustand)

---

**جاهز للتحويل! 🔄**
