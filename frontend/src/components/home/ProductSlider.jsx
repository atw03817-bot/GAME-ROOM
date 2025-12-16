import { useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../products/ProductCard';

export default function ProductSlider({ title, subtitle, products }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (products.length === 0) return null;

  return (
    <section className="py-8 md:py-12 bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="text-center mb-3 md:mb-4">
            <h2 className="text-xl md:text-3xl font-bold text-gray-900 mb-1">
              {title}
            </h2>
            {subtitle && (
              <p className="text-gray-600 text-xs md:text-sm">
                {subtitle}
              </p>
            )}
          </div>
          {/* Navigation Arrows */}
          <div className="hidden md:flex gap-2 justify-center">
            <button
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full bg-white border border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full bg-white border border-gray-300 hover:border-primary-500 hover:bg-primary-50 transition-all flex items-center justify-center"
            >
              <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Products Slider */}
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {products.map((product) => (
            <div key={product._id} className="flex-shrink-0 w-[200px] md:w-[260px]">
              <ProductCard product={product} />
            </div>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-6">
          <Link
            to="/products"
            className="inline-block text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            عرض جميع المنتجات ←
          </Link>
        </div>
      </div>
    </section>
  );
}
