import React from 'react';

// Tamara Official Logo Component
// Using official Tamara logo from: https://cdn.prod.website-files.com/67c184892f7a84b971ff49d9/68931b49f2b77ac7495ae693_tamara-text-logo-black-ar.svg
const TamaraLogo = ({ 
  size = 'medium', 
  variant = 'default', 
  className = '',
  showText = true 
}) => {
  const sizes = {
    small: { width: 60, height: 24 },
    medium: { width: 80, height: 32 },
    large: { width: 100, height: 40 },
    xlarge: { width: 120, height: 48 }
  };

  const currentSize = sizes[size] || sizes.medium;

  return (
    <div className={`inline-flex items-center ${className}`}>
      {/* Tamara Official Logo - Using official SVG */}
      <img
        src="https://cdn.prod.website-files.com/67c184892f7a84b971ff49d9/68931b49f2b77ac7495ae693_tamara-text-logo-black-ar.svg"
        alt="تمارا - اشتري الآن وادفع لاحقاً"
        width={currentSize.width}
        height={currentSize.height}
        className="flex-shrink-0"
        style={{
          filter: variant === 'white' ? 'brightness(0) invert(1)' : 
                 variant === 'green' ? 'hue-rotate(120deg) saturate(1.2)' : 'none'
        }}
      />
    </div>
  );
};

// Tamara Badge Component for Payment Methods
export const TamaraBadge = ({ className = '', size = 'medium' }) => {
  return (
    <div className={`inline-flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-50 to-green-100 border border-green-200 rounded-lg ${className}`}>
      <TamaraLogo size={size} />
      <div className="text-right">
        <div className="text-xs text-gray-600">اشتري الآن وادفع لاحقاً</div>
      </div>
    </div>
  );
};

// Tamara Payment Option Component
export const TamaraPaymentOption = ({ 
  selected = false, 
  onClick, 
  className = '',
  amount = null,
  installments = null 
}) => {
  return (
    <div
      onClick={onClick}
      className={`
        relative p-4 border-2 rounded-lg cursor-pointer transition-all duration-200
        ${selected 
          ? 'border-green-500 bg-green-50 shadow-md' 
          : 'border-gray-200 bg-white hover:border-green-300 hover:bg-green-25'
        }
        ${className}
      `}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <TamaraLogo size="medium" />
          <div className="text-right">
            <div className="text-sm text-gray-600">
              {installments 
                ? `قسط على ${installments} دفعات بدون فوائد`
                : 'اشتري الآن وادفع لاحقاً'
              }
            </div>
            {amount && installments && (
              <div className="text-xs text-green-600 font-medium mt-1">
                {(amount / installments).toFixed(2)} ر.س شهرياً
              </div>
            )}
          </div>
        </div>
        
        {/* Radio Button */}
        <div className={`
          w-5 h-5 rounded-full border-2 flex items-center justify-center
          ${selected ? 'border-green-500 bg-green-500' : 'border-gray-300'}
        `}>
          {selected && (
            <div className="w-2 h-2 bg-white rounded-full"></div>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div className="flex items-center gap-1">
            <span className="text-green-500">✓</span>
            <span>بدون فوائد</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-500">✓</span>
            <span>موافقة فورية</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-500">✓</span>
            <span>آمن ومضمون</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-green-500">✓</span>
            <span>سهل الاستخدام</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TamaraLogo;