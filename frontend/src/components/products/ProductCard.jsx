import { useState } from 'react';
import { Link } from 'react-router-dom';
import QuickAddModal from '../home/QuickAddModal';
import Toast from '../ui/Toast';
import Price from '../ui/Price';

export default function ProductCard({ product, viewMode = 'grid' }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showToast, setShowToast] = useState(false);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsModalOpen(true);
  };

  // List view for search results
  if (viewMode === 'list') {
    return (
      <>
        <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex gap-4">
            {/* Product Image */}
            <Link to={`/products/${product._id}`} className="flex-shrink-0">
              <div className="w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                {product.images && product.images[0] ? (
                  <img
                    src={product.images[0]}
                    alt={product.nameAr || product.name?.ar}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    📱
                  </div>
                )}
              </div>
            </Link>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
              <Link to={`/products/${product._id}`}>
                {/* Brand */}
                {product.brand && (
                  <div className="text-sm text-gray-600 mb-1">{product.brand}</div>
                )}
                
                {/* Title */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                  {product.nameAr || product.name?.ar}
                </h3>
                
                {/* Price */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-xl font-bold text-primary-600">
                    <Price value={product.price} currency="ريال" />
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <>
                      <span className="text-sm text-gray-400 line-through">
                        <Price value={product.originalPrice} currency="ريال" />
                      </span>
                      <span className="bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                      </span>
                    </>
                  )}
                </div>
              </Link>

              {/* Actions */}
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  قسّمها على 4 دفعات بدون فوائد
                </div>
                {product.stock > 0 ? (
                  <button
                    onClick={handleQuickAdd}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition text-sm"
                  >
                    إضافة للسلة
                  </button>
                ) : (
                  <div className="text-xs font-bold text-red-600 bg-red-50 px-3 py-2 rounded">
                    نفذت الكمية
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Add Modal */}
        <QuickAddModal
          product={{
            _id: product._id,
            nameAr: product.nameAr || product.name?.ar,
            brand: product.brand,
            brandInfo: product.brandInfo,
            price: product.price,
            images: product.images,
            colors: product.colors,
            storage: product.storage,
          }}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onAddSuccess={() => setShowToast(true)}
        />

        {/* Toast Notification */}
        {showToast && (
          <Toast
            message="✓ تم إضافة المنتج للسلة بنجاح"
            type="success"
            onClose={() => setShowToast(false)}
          />
        )}
      </>
    );
  }

  // Default grid view
  return (
    <>
      <div className="product-card">
        <Link to={`/products/${product._id}`}>
          <div className="product-card-image relative">
            {product.originalPrice && product.originalPrice > product.price && (
              <div className="absolute top-2 left-2 z-10">
                <span className="bg-red-500 text-white px-1.5 py-0.5 rounded text-[10px] font-bold shadow-md">
                  -{Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%
                </span>
              </div>
            )}
            {product.images && product.images[0] ? (
              <img
                src={product.images[0]}
                alt={product.nameAr || product.name?.ar}
              />
            ) : (
              <div className="text-6xl">📱</div>
            )}
          </div>
        </Link>
        <div className="product-card-content" dir="rtl">
          <Link to={`/products/${product._id}`}>
            {/* العلامة التجارية المطورة */}
            <div className="product-card-brand text-left">
              {product.brandInfo ? (
                <div className="flex items-center gap-2 justify-start">
                  {(product.brandInfo.displayType === 'image' || product.brandInfo.displayType === 'both') && product.brandInfo.image && (
                    <div className="w-12 h-7 flex items-center justify-center">
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
                    <span className="text-sm font-medium">
                      {product.brandInfo.text || product.brand}
                    </span>
                  )}
                </div>
              ) : (
                product.brand && <span className="text-sm font-medium">{product.brand}</span>
              )}
            </div>
            <h3 className="product-card-title">{product.nameAr || product.name?.ar}</h3>
          </Link>
          
          <div className="product-card-footer">
            <div className="product-card-price-wrapper">
              <span className="product-card-price"><Price value={product.price} currency="ريال" /></span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="product-card-old-price"><Price value={product.originalPrice} currency="ريال" /></span>
              )}
            </div>
            {product.stock > 0 ? (
              <button
                onClick={handleQuickAdd}
                className="product-card-add-btn"
                aria-label="إضافة للسلة"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
            ) : (
              <div className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-1 rounded whitespace-nowrap">
                نفذت الكمية
              </div>
            )}
          </div>
          
          {/* Payment Options - Tabby & Tamara */}
          <div style={{ 
            width: '100%',
            marginTop: '6px',
            paddingTop: '6px',
            borderTop: '1px solid #e5e7eb',
            textAlign: 'center'
          }}>
            <p style={{ 
              fontSize: '8px', 
              color: '#9ca3af',
              marginBottom: '4px',
              lineHeight: '1.2'
            }}>
              قسّمها على 4 دفعات بدون فوائد
            </p>
            <div style={{ 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}>
              <img 
                src="https://media.extra.com/i/aurora/tabby_new" 
                alt="Tabby"
                style={{ width: '45px', height: 'auto', display: 'block' }}
              />
              <span style={{ 
                color: '#d1d5db', 
                fontSize: '12px',
                fontWeight: 'bold'
              }}>|</span>
              <img 
                src="https://media.extra.com/i/aurora/tamaralogo_ar?fmt=auto&w=96" 
                alt="Tamara"
                style={{ width: '45px', height: 'auto', display: 'block' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal
        product={{
          _id: product._id,
          nameAr: product.nameAr || product.name?.ar,
          brand: product.brand,
          brandInfo: product.brandInfo,
          price: product.price,
          images: product.images,
          colors: product.colors,
          storage: product.storage,
        }}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddSuccess={() => setShowToast(true)}
      />

      {/* Toast Notification */}
      {showToast && (
        <Toast
          message="✓ تم إضافة المنتج للسلة بنجاح"
          type="success"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}
