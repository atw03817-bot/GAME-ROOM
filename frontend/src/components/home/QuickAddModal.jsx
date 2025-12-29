import { useState } from 'react';
import { createPortal } from 'react-dom';
import useCartStore from '../../store/useCartStore';
import api from '../../utils/api';

export default function QuickAddModal({ product, isOpen, onClose, onAddSuccess }) {
  const addItem = useCartStore((state) => state.addItem);
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || '');
  const [selectedStorage, setSelectedStorage] = useState(product.storage?.[0] || '');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [customOptions, setCustomOptions] = useState({});

  if (!isOpen) return null;

  // إذا كان المنتج يحتوي على خيارات مخصصة، وجه المستخدم لصفحة المنتج
  const hasCustomOptions = product.customOptions && product.customOptions.length > 0;

  // للتأكد من وصول البيانات (يمكن حذف هذا لاحقاً)
  console.log('Product in QuickAddModal:', product);
  console.log('Has custom options:', hasCustomOptions);
  console.log('Custom options:', product.customOptions);

  // معالجة تغيير الخيارات المخصصة
  const handleCustomOptionChange = (optionName, value) => {
    setCustomOptions(prev => ({
      ...prev,
      [optionName]: value
    }));
  };

  // التحقق من صحة الخيارات المخصصة
  const validateCustomOptions = () => {
    if (!product?.customOptions) return true;
    
    for (const option of product.customOptions) {
      if (option.required) {
        const value = customOptions[option.name];
        if (value === undefined || value === null || value === '') {
          alert(`الرجاء ${option.type === 'checkbox' ? 'تحديد' : 'إدخال'} ${option.nameAr}`);
          return false;
        }
      }
    }
    return true;
  };

  // حساب السعر النهائي مع الإضافات
  const calculateFinalPrice = () => {
    const basePrice = parseFloat(product?.price || 0);
    const colorAddition = product?.colorPrices?.[selectedColor] || 0;
    const storageAddition = product?.storagePrices?.[selectedStorage] || 0;
    
    // حساب إضافات الخيارات المخصصة
    let customOptionsAddition = 0;
    if (product?.customOptions && Object.keys(customOptions).length > 0) {
      product.customOptions.forEach(option => {
        const selectedValue = customOptions[option.name];
        if (selectedValue !== undefined && selectedValue !== null && selectedValue !== '') {
          if (option.type === 'select' || option.type === 'radio') {
            const selectedOption = option.options?.find(opt => opt.value === selectedValue);
            if (selectedOption) {
              customOptionsAddition += parseFloat(selectedOption.price || 0);
            }
          } else if (option.type === 'checkbox') {
            if (selectedValue === true) {
              customOptionsAddition += parseFloat(option.basePrice || 0);
            }
          } else {
            customOptionsAddition += parseFloat(option.basePrice || 0);
          }
        }
      });
    }
    
    return basePrice + colorAddition + storageAddition + customOptionsAddition;
  };

  const handleAddToCart = async () => {
    // التحقق من صحة الخيارات المخصصة
    if (!validateCustomOptions()) {
      return;
    }

    setIsAdding(true);
    
    try {
      // حساب السعر النهائي مع الإضافات
      const finalPrice = calculateFinalPrice();
      const colorAddition = product?.colorPrices?.[selectedColor] || 0;
      const storageAddition = product?.storagePrices?.[selectedStorage] || 0;

      // إنشاء كائن الخيارات المحددة مع الأسعار
      const selectedOptions = {};
      
      if (selectedColor) {
        selectedOptions.color = {
          name: selectedColor,
          nameAr: selectedColor,
          value: selectedColor,
          price: colorAddition
        };
      }
      
      if (selectedStorage) {
        selectedOptions.storage = {
          name: selectedStorage,
          nameAr: selectedStorage,
          value: selectedStorage,
          price: storageAddition
        };
      }

      // إضافة الخيارات المخصصة
      if (product?.customOptions && Object.keys(customOptions).length > 0) {
        product.customOptions.forEach(option => {
          const selectedValue = customOptions[option.name];
          if (selectedValue !== undefined && selectedValue !== null && selectedValue !== '') {
            let optionPrice = 0;
            let displayValue = selectedValue;

            if (option.type === 'select' || option.type === 'radio') {
              const selectedOption = option.options?.find(opt => opt.value === selectedValue);
              if (selectedOption) {
                optionPrice = parseFloat(selectedOption.price || 0);
                displayValue = selectedOption.label || selectedValue;
              }
            } else if (option.type === 'checkbox') {
              if (selectedValue === true) {
                optionPrice = parseFloat(option.basePrice || 0);
                displayValue = 'نعم';
              } else {
                displayValue = 'لا';
              }
            } else {
              optionPrice = parseFloat(option.basePrice || 0);
            }

            selectedOptions[`custom_${option.name}`] = {
              name: option.name,
              nameAr: option.nameAr,
              value: selectedValue,
              displayValue: displayValue,
              price: optionPrice,
              type: option.type
            };
          }
        });
      }

      const productToAdd = {
        ...product,
        price: finalPrice, // السعر النهائي مع الإضافات
        originalPrice: product.price, // السعر الأساسي الأصلي
        selectedColor: selectedColor,
        selectedStorage: selectedStorage,
        customOptions: Object.keys(customOptions).length > 0 ? customOptions : undefined,
        selectedOptions: Object.keys(selectedOptions).length > 0 ? selectedOptions : undefined
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
      <div className="relative bg-[#111111] border border-[#C72C15] rounded-t-3xl md:rounded-2xl w-full md:max-w-lg max-h-[90vh] overflow-y-auto animate-slideUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 w-8 h-8 rounded-full bg-[#1a1a1a] border border-[#C72C15] hover:bg-gradient-to-r hover:from-[#E08713] hover:to-[#C72C15] flex items-center justify-center transition-colors text-white"
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
                    <span className="text-xs text-[#E08713] font-bold">
                      {product.brandInfo.text || product.brand}
                    </span>
                  )}
                </div>
              ) : (
                product.brand && (
                  <p className="text-xs text-[#E08713] font-bold mb-1">{product.brand}</p>
                )
              )}
              
              <h3 className="text-base font-bold text-white mb-1 line-clamp-2">
                {product.nameAr || product.name?.ar}
              </h3>
              <p className="text-lg font-bold text-[#991b1b]">
                {calculateFinalPrice().toLocaleString()} ريال
              </p>
            </div>
          </div>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 ? (
            <div className="mb-6">
              <label className="block text-sm font-bold text-white mb-3">
                اللون
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color, index) => {
                  const colorPrice = product?.colorPrices?.[color] || 0;
                  return (
                    <button
                      key={`${color}-${index}`}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedColor === color
                          ? 'border-[#E08713] bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white font-bold'
                          : 'border-[#C72C15] text-white hover:border-[#E08713]'
                      }`}
                    >
                      <div className="text-center">
                        <div>{color}</div>
                        {colorPrice > 0 && (
                          <div className="text-xs text-gray-300 mt-1">
                            +{colorPrice.toFixed(2)} ر.س
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-[#1a1a1a] border border-[#C72C15] p-3 rounded-lg text-center text-sm text-gray-300">
                لا توجد خيارات ألوان متاحة
              </div>
            </div>
          )}

          {/* Storage Selection */}
          {product.storage && product.storage.length > 0 ? (
            <div className="mb-6">
              <label className="block text-sm font-bold text-white mb-3">
                السعة
              </label>
              <div className="flex flex-wrap gap-2">
                {product.storage.map((storage, index) => {
                  const storagePrice = product?.storagePrices?.[storage] || 0;
                  return (
                    <button
                      key={`${storage}-${index}`}
                      onClick={() => setSelectedStorage(storage)}
                      className={`px-4 py-2 rounded-lg border-2 transition-all ${
                        selectedStorage === storage
                          ? 'border-[#E08713] bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white font-bold'
                          : 'border-[#C72C15] text-white hover:border-[#E08713]'
                      }`}
                    >
                      <div className="text-center">
                        <div>{storage}</div>
                        {storagePrice > 0 && (
                          <div className="text-xs text-gray-300 mt-1">
                            +{storagePrice.toFixed(2)} ر.س
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-6">
              <div className="bg-[#1a1a1a] border border-[#C72C15] p-3 rounded-lg text-center text-sm text-gray-300">
                لا توجد خيارات سعة متاحة
              </div>
            </div>
          )}

          {/* Custom Options Notice */}
          {hasCustomOptions && (
            <div className="mb-6 bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-blue-300 mb-1">خيارات إضافية متاحة</h4>
                  <p className="text-xs text-blue-400">
                    يمكنك تخصيص هذا المنتج بخيارات إضافية
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Custom Options */}
          {hasCustomOptions && (
            <div className="mb-6">
              <h3 className="text-sm font-bold text-white mb-3">خيارات التخصيص</h3>
              <div className="space-y-3 max-h-40 overflow-y-auto">
                {product.customOptions.map((option, index) => (
                  <div key={`${option.name}-${index}`} className="bg-[#1a1a1a] rounded-lg p-3 border border-[#C72C15]">
                    <label className="block text-xs font-semibold text-white mb-2">
                      {option.nameAr}
                      {option.required && <span className="text-red-400 mr-1">*</span>}
                    </label>
                    
                    {/* Text Input */}
                    {option.type === 'text' && (
                      <div>
                        <input
                          type="text"
                          placeholder={option.placeholder || `أدخل ${option.nameAr}`}
                          maxLength={option.maxLength}
                          value={customOptions[option.name] || ''}
                          onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-[#C72C15] bg-[#111111] text-white rounded focus:ring-1 focus:ring-[#E08713] focus:border-[#E08713] placeholder-gray-400"
                        />
                        {option.basePrice > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            إضافة: +{option.basePrice.toFixed(2)} ر.س
                          </p>
                        )}
                      </div>
                    )}

                    {/* Textarea */}
                    {option.type === 'textarea' && (
                      <div>
                        <textarea
                          placeholder={option.placeholder || `أدخل ${option.nameAr}`}
                          maxLength={option.maxLength}
                          rows={2}
                          value={customOptions[option.name] || ''}
                          onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-[#C72C15] bg-[#111111] text-white rounded focus:ring-1 focus:ring-[#E08713] focus:border-[#E08713] placeholder-gray-400"
                        />
                        {option.basePrice > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            إضافة: +{option.basePrice.toFixed(2)} ر.س
                          </p>
                        )}
                      </div>
                    )}

                    {/* Number Input */}
                    {option.type === 'number' && (
                      <div>
                        <input
                          type="number"
                          placeholder={option.placeholder || `أدخل ${option.nameAr}`}
                          min={option.minValue}
                          max={option.maxValue}
                          value={customOptions[option.name] || ''}
                          onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-[#C72C15] bg-[#111111] text-white rounded focus:ring-1 focus:ring-[#E08713] focus:border-[#E08713] placeholder-gray-400"
                        />
                        {option.basePrice > 0 && (
                          <p className="text-xs text-gray-400 mt-1">
                            إضافة: +{option.basePrice.toFixed(2)} ر.س
                          </p>
                        )}
                      </div>
                    )}

                    {/* Select Dropdown */}
                    {option.type === 'select' && (
                      <div>
                        <select
                          value={customOptions[option.name] || ''}
                          onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                          className="w-full px-2 py-1.5 text-sm border border-[#C72C15] bg-[#111111] text-white rounded focus:ring-1 focus:ring-[#E08713] focus:border-[#E08713]"
                        >
                          <option value="" className="bg-[#111111] text-white">اختر {option.nameAr}</option>
                          {option.options?.map((opt, optIndex) => (
                            <option key={`${opt.value}-${optIndex}`} value={opt.value} className="bg-[#111111] text-white">
                              {opt.label} {opt.price > 0 && `(+${opt.price.toFixed(2)} ر.س)`}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Radio Buttons */}
                    {option.type === 'radio' && (
                      <div className="space-y-1">
                        {option.options?.map((opt, optIndex) => (
                          <label key={`${opt.value}-${optIndex}`} className="flex items-center gap-2 cursor-pointer text-sm">
                            <input
                              type="radio"
                              name={option.name}
                              value={opt.value}
                              checked={customOptions[option.name] === opt.value}
                              onChange={(e) => handleCustomOptionChange(option.name, e.target.value)}
                              className="text-[#E08713] focus:ring-[#E08713] bg-[#111111] border-[#C72C15]"
                            />
                            <span className="text-white">
                              {opt.label}
                              {opt.price > 0 && (
                                <span className="text-gray-400 mr-1">(+{opt.price.toFixed(2)} ر.س)</span>
                              )}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Checkbox */}
                    {option.type === 'checkbox' && (
                      <div>
                        <label className="flex items-center gap-2 cursor-pointer text-sm">
                          <input
                            type="checkbox"
                            checked={customOptions[option.name] === true}
                            onChange={(e) => handleCustomOptionChange(option.name, e.target.checked)}
                            className="text-[#E08713] focus:ring-[#E08713] bg-[#111111] border-[#C72C15] rounded"
                          />
                          <span className="text-white">
                            {option.placeholder || `تفعيل ${option.nameAr}`}
                            {option.basePrice > 0 && (
                              <span className="text-gray-400 mr-1">(+{option.basePrice.toFixed(2)} ر.س)</span>
                            )}
                          </span>
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="mb-6">
            <label className="block text-sm font-bold text-white mb-3">
              الكمية
            </label>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-lg border-2 border-[#C72C15] bg-[#111111] text-white hover:bg-gradient-to-r hover:from-[#E08713] hover:to-[#C72C15] flex items-center justify-center font-bold transition-all"
              >
                -
              </button>
              <span className="text-lg font-bold w-12 text-center text-white bg-[#1a1a1a] border border-[#C72C15] rounded-lg py-2">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-lg border-2 border-[#C72C15] bg-[#111111] text-white hover:bg-gradient-to-r hover:from-[#E08713] hover:to-[#C72C15] flex items-center justify-center font-bold transition-all"
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
              className="flex-1 bg-gradient-to-r from-[#E08713] to-[#C72C15] text-white py-3 rounded-full font-bold hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
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
              className="px-6 py-3 rounded-full border-2 border-[#C72C15] text-white hover:bg-gradient-to-r hover:from-[#E08713] hover:to-[#C72C15] font-bold transition-all flex items-center justify-center"
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
