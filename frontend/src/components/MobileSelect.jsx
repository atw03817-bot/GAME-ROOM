import React from 'react'
import '../styles/mobile-select-fix.css'

function MobileSelect({ 
  value, 
  onChange, 
  options = [], 
  placeholder = "اختر...", 
  required = false,
  className = "",
  disabled = false,
  ...props 
}) {
  return (
    <div className="relative w-full">
      <select
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
        className={`mobile-select w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white text-gray-900 ${className}`}
        style={{
          fontSize: '16px',
          WebkitAppearance: 'none',
          MozAppearance: 'none',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23374151' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'left 12px center',
          backgroundSize: '16px',
          paddingLeft: '40px',
          paddingRight: '12px'
        }}
        {...props}
      >
        {placeholder && (
          <option value="" disabled={required}>
            {placeholder}
          </option>
        )}
        {options.map((option, index) => (
          <option 
            key={option.value || index} 
            value={option.value || option}
            style={{
              padding: '12px 16px',
              fontSize: '16px',
              color: '#111827',
              backgroundColor: '#ffffff',
              direction: 'rtl',
              textAlign: 'right'
            }}
          >
            {option.label || option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default MobileSelect