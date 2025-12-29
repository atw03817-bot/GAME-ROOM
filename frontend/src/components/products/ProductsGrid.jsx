import { useState, useMemo } from 'react';
import { useProducts } from '../../hooks/useProducts';
import ProductCard from './ProductCard';

export default function ProductsGrid({ selectedCategory, priceRange, selectedConditions }) {
  const [sortBy, setSortBy] = useState('newest');
  
  console.log('🎯 ProductsGrid props:', { selectedCategory, priceRange, selectedConditions });
  
  const { products: allProducts, loading, error } = useProducts({
    category: selectedCategory || undefined,
    minPrice: priceRange[0],
    maxPrice: priceRange[1],
  });

  console.log('📊 ProductsGrid state:', { 
    allProductsCount: allProducts?.length || 0, 
    loading, 
    error: !!error,
    selectedCategory 
  });

  const filteredProducts = useMemo(() => {
    if (!allProducts || !Array.isArray(allProducts)) return [];
    
    let filtered = allProducts.filter(product => {
      // فلترة الشروط
      if (selectedConditions.length > 0 && !selectedConditions.includes(product.condition)) {
        return false;
      }
      
      // فلترة إضافية للفئة (طبقة حماية إضافية)
      if (selectedCategory) {
        const categoryMatch = 
          product.category === selectedCategory ||
          product.category?._id === selectedCategory ||
          product.category?.slug === selectedCategory ||
          product.categoryName === selectedCategory;
        
        if (!categoryMatch) {
          console.log('🚫 Product filtered out:', product.nameAr, 'Category:', product.category);
          return false;
        }
      }
      
      return true;
    });
    
    console.log(`🎯 Final filtered products: ${filtered.length}/${allProducts.length}`);
    if (selectedCategory) {
      console.log('📂 Category filter active:', selectedCategory);
    }
    
    return filtered;
  }, [allProducts, selectedConditions, selectedCategory]);

  const sortedProducts = useMemo(() => {
    const products = [...filteredProducts];
    
    switch (sortBy) {
      case 'price-low':
        return products.sort((a, b) => a.price - b.price);
      case 'price-high':
        return products.sort((a, b) => b.price - a.price);
      case 'popular':
        return products;
      default:
        return products;
    }
  }, [filteredProducts, sortBy]);

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-12 h-12 border-4 border-[#E08713] border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-gray-300">جاري تحميل المنتجات...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-400 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2 bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white rounded-lg hover:opacity-90 transition"
        >
          إعادة المحاولة
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Sort Bar */}
      <div className="flex justify-between items-center mb-6">
        <p className="text-sm text-gray-300">عرض {sortedProducts.length} منتج</p>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-[#C72C15] bg-[#111111] text-white rounded-lg focus:ring-2 focus:ring-[#E08713] focus:border-transparent"
        >
          <option value="newest">الأحدث</option>
          <option value="price-low">السعر: الأقل</option>
          <option value="price-high">السعر: الأعلى</option>
          <option value="popular">الأكثر مبيعاً</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="grid-products">
        {sortedProducts.length === 0 ? (
          <div className="col-span-2 lg:col-span-4 text-center py-12">
            <p className="text-gray-400 text-lg">لا توجد منتجات تطابق الفلاتر المحددة</p>
          </div>
        ) : (
          sortedProducts.map((product) => (
            <ProductCard key={product._id} product={product} />
          ))
        )}
      </div>
    </div>
  );
}
