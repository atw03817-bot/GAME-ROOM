import { useTranslation } from 'react-i18next';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductsGrid from '../components/products/ProductsGrid';
import ProductFilters from '../components/products/ProductFilters';
import useScrollToTop from '../hooks/useScrollToTop';

function Products() {
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('');
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [selectedConditions, setSelectedConditions] = useState([]);

  // التمرير إلى أعلى الصفحة عند تحميل الصفحة
  useScrollToTop();

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    console.log('🔗 URL category parameter:', categoryFromUrl);
    if (categoryFromUrl) {
      console.log('✅ Setting selectedCategory to:', categoryFromUrl);
      setSelectedCategory(categoryFromUrl);
    } else {
      console.log('❌ No category in URL, clearing selectedCategory');
      setSelectedCategory('');
    }
  }, [searchParams]);

  console.log('📄 Products page state:', { selectedCategory, searchParams: searchParams.toString() });

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <h1 className="hidden md:block text-3xl font-bold mb-6">جميع المنتجات</h1>
        
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="hidden lg:block lg:w-64 flex-shrink-0">
            <ProductFilters 
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedConditions={selectedConditions}
              setSelectedConditions={setSelectedConditions}
            />
          </aside>
          
          <div className="flex-1">
            <ProductsGrid 
              selectedCategory={selectedCategory}
              priceRange={priceRange}
              selectedConditions={selectedConditions}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;
