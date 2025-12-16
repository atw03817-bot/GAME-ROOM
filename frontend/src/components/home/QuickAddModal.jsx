import { useState } from 'react';
import { createPortal } from 'react-dom';
import useCartStore from '../../store/useCartStore';

export default function QuickAddModal({ product, isOpen, onClose, onAddSuccess }) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedStorage, setSelectedStorage] = useState(product.storage?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!isOpen) return null;

  const handleAddToCart = () => {
    setIsAdding(true);
    
    try {
      const productToAdd = {
        ...product,
        selectedColor: selectedColor,
        selectedStorage: selectedStorage,
      };
      
      addItem(productToAdd, quantity);
      
      setTimeout(() => {
        setIsAdding(false);
        onClose();
        if (onAddSuccess) {
          onAddSuccess();
        }
      }, 300);
    } catch (error) {
      console.error('Error adding to cart:', error);
      setIsAdding(false);
    }
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-end md:items-center justify-center" dir="rtl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6">
          {/* Product Image & Info */}
          <div className="flex gap-4 mb-6">
            <img
              src={product.images?.[0] || 'https://placehold.co/100x100/e5e7eb/6b7280?text=No+Image'}
              alt={product.nameAr || product.name?.ar}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              {/* العلامة التجارية المطورة */}
              {product.brandInfo ? (
                <div className="flex items-center gap-2 mb-1">
                  {(product.brandInfo.displayType === 'image' || product.brandInfo.displayType === 'both') && product.brandInfo.image && (
                    <div className="w-10 h-6 flex items-center justify-center">
                      <img
                        src={product.brandInfo.image}
                        alt={product.brandInfo.text || product.brand}
                        className="max-w-full max-h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  {(product.brandInfo.displayType === 'text' || product.brandInfo.displayType === 'both') && (
                    <span className="text-xs text-primary-600 font-bold">
                      {product.brandInfo.text || product.brand}
                    </span>
                  )}
                </div>
              ) : (
                product.brand && (
                  <p className="text-xs text-primary-600 font-bold mb-1">{product.brand}</p>
                )
              )}
              
              <h3 className="text-base font-bold text-gray-900 mb-1 line-clamp-2">
                {product.nameAr || product.name?.ar}
              </h3>
              <p className="text-lg font-bold text-gray-900">
                {product.price.toLocaleString()} ريال
              </p>
            </div>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 ? (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-3">
                اللون
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, index) => (
                  <button
                    key={`${color}-${index}`}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedColor === color
                        ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-gray-50 p-3 rounded-lg text-center text-sm text-gray-600">
                لا توجد خيارات ألوان متاحة
              </div>
            </div>
          )}

          {/* Storage Selection */}
          {product.storage && product.storage.length > 0 ? (
            <div className="mb-6">
              <label className="block text-sm font-bold text-gray-900 mb-3">
                السعة
              </label>
              <div className="flex flex-wrap gap-2">
                {product.storage.map((storage, index) => (
                  <button
                    key={`${storage}-${index}`}
                    onClick={() => setSelectedStorage(storage)}
                    className={`px-4 py-2 rounded-lg border-2 transition-all ${
                      selectedStorage === storage
                        ? 'border-primary-600 bg-primary-50 text-primary-700 font-bold'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {storage}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-gray-50 p-3 rounded-lg text-center text-sm text-gray-600">
                لا توجد خيارات سعة متاحة
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-900 mb-3">
              الكمية
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-primary-500 flex items-center justify-center font-bold"
              >
                -
              </button>
              <span className="text-lg font-bold w-12 text-center">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border-2 border-gray-200 hover:border-primary-500 flex items-center justify-center font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAddToCart}
              disabled={isAdding}
              className="flex-1 bg-primary-600 text-white py-3 rounded-full font-bold hover:bg-primary-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isAdding ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري الإضافة...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  إضافة للسلة
                </>
              )}
            </button>
            <a
              href={`/products/${product._id}`}
              className="px-6 py-3 rounded-full border-2 border-gray-200 hover:border-primary-500 font-bold transition-all flex items-center justify-center"
            >
              عرض التفاصيل
            </a>
          </div>
        </div>
      </div>
    </div>
  );

  // استخدام Portal لرفع المودال خارج الـ DOM tree
  return createPortal(modalContent, document.body);
}
