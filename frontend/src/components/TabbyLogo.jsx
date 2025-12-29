import React from 'react';

// Tabby Logo Component
const TabbyLogo = ({ size = 'medium', className = '' }) => {
  const sizeClasses = {
    small: 'h-6',
    medium: 'h-8',
    large: 'h-12'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src="/images/tabby-logo.png" 
        alt="Tabby" 
        className={`${sizeClasses[size]} object-contain`}
        onError={(e) => {
          // Fallback to text if image not found
          e.target.style.display = 'none';
          e.target.nextSibling.style.display = 'inline';
        }}
      />
      <span 
        className="text-purple-600 font-bold text-lg hidden"
        style={{ fontFamily: 'Arial, sans-serif' }}
      >
        tabby
      </span>
    </div>
  );
};

// Tabby Badge Component for Payment Methods
export const TabbyBadge = ({ className = '', size = 'medium' }) => {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <TabbyLogo size={size} />
    </div>
  );
};

// Tabby Payment Option Component
export const TabbyPaymentOption = ({ 
  selected = false, 
  onClick, 
  className = '',
  showDescription = true 
}) => {
  return (
    <div
      onClick={onClick}
      className={`border-2 rounded-lg p-4 cursor-pointer transition ${
        selected
          ? 'border-purple-500 bg-purple-50'
          : 'border-gray-200 hover:border-purple-300'
      } ${className}`}
    >
      <div className="flex items-center gap-4">
        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
          selected
            ? 'border-purple-500 bg-purple-500'
            : 'border-gray-400'
        }`}>
          {selected && (
            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </div>

        <div className="flex-shrink-0">
          <TabbyLogo size="small" />
        </div>

        <div className="flex-1">
          <h4 className="font-semibold text-gray-900">تابي</h4>
          {showDescription && (
            <p className="text-sm text-gray-600">ادفع على 4 دفعات - بدون فوائد</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TabbyLogo;