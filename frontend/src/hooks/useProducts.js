import { useState, useEffect } from 'react';
import api from '../utils/api';

export function useProducts(filters = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    console.log('🔄 useProducts effect triggered with filters:', filters);
    fetchProducts();
  }, [filters.category, filters.minPrice, filters.maxPrice]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {
        limit: 1000 // جلب جميع المنتجات
      };
      
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;

      console.log('🔍 Fetching products with params:', params);
      console.log('📂 Category filter:', filters.category);

      const { data } = await api.get('/products', { params });
      let productsList = Array.isArray(data) ? data : (data.products || []);
      
      console.log(`📦 Received ${productsList.length} products from API`);
      
      // فلترة إضافية قوية في الفرونت إند للتأكد
      if (filters.category) {
        const originalCount = productsList.length;
        productsList = productsList.filter(product => {
          // فلترة متعددة المستويات
          const categoryMatch = 
            product.category === filters.category || // ObjectId match
            product.category?._id === filters.category || // Populated category match
            product.category?.slug === filters.category || // Slug match
            product.categoryName === filters.category; // Name match
          
          return categoryMatch;
        });
        
        console.log(`🔍 Frontend filtering: ${originalCount} → ${productsList.length} products`);
        console.log('🏷️ Category filter applied:', filters.category);
        console.log('📊 Sample filtered products:', productsList.slice(0, 3).map(p => ({ 
          name: p.nameAr, 
          category: p.category,
          categoryId: p.category?._id,
          categorySlug: p.category?.slug
        })));
      }
      
      // تحويل البيانات للصيغة المطلوبة
      const formattedProducts = productsList.map(p => ({
        id: p._id,
        _id: p._id,
        nameAr: p.nameAr || p.name?.ar,
        nameEn: p.nameEn || p.name?.en,
        brand: p.brand,
        price: p.price,
        originalPrice: p.originalPrice,
        images: p.images,
        colors: p.colors,
        storage: p.storage,
        condition: 'new', // افتراضي
        ...p
      }));
      
      setProducts(formattedProducts);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('حدث خطأ في تحميل المنتجات');
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
}
