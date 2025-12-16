import React, { useEffect, useRef } from 'react';

export default function TamaraOfficialWidget({ 
  amount, 
  currency = 'SAR',
  country = 'SA',
  publicKey = '',
  inline = true,
  className = ''
}) {
  const widgetRef = useRef(null);

  useEffect(() => {
    // Make openTamaraInfo available globally for the fallback widget
    window.openTamaraInfo = () => {
      window.open(
        'https://cdn.tamara.co/widget-v2/tamara-widget.html?lang=ar&public_key=&country=SA&amount=350&inline_type=',
        'tamaraInfo',
        'width=800,height=600,scrollbars=yes,resizable=yes,toolbar=no,menubar=no,location=no,status=no'
      );
    };

    // Load Tamara Widget Script
    const loadTamaraWidget = () => {
      // Check if script already exists
      if (document.getElementById('tamara-widget-script')) {
        initializeWidget();
        return;
      }

      const script = document.createElement('script');
      script.id = 'tamara-widget-script';
      script.src = 'https://cdn.tamara.co/widget/tamara-widget.js';
      script.async = true;
      script.onload = initializeWidget;
      document.head.appendChild(script);
    };

    const initializeWidget = () => {
      if (window.TamaraWidgetV2 && widgetRef.current && amount) {
        // Clear previous widget
        widgetRef.current.innerHTML = '';

        try {
          window.TamaraWidgetV2.init({
            lang: 'ar',
            country: country,
            publicKey: publicKey || 'pk_test_123', // Use test key if no public key provided
            amount: {
              value: amount,
              currency: currency
            }
          });

          window.TamaraWidgetV2.renderSummary(widgetRef.current, {
            inline: inline
          });
        } catch (error) {
          console.error('Tamara Widget Error:', error);
          // Fallback to custom widget
          renderFallbackWidget();
        }
      } else {
        // Fallback if Tamara script fails to load
        renderFallbackWidget();
      }
    };

    const renderFallbackWidget = () => {
      if (widgetRef.current && amount >= 100 && amount <= 10000) {
        const installmentAmount = Math.ceil(amount / 3);
        const isMobile = window.innerWidth <= 640;
        
        widgetRef.current.innerHTML = `
          <div class="tamara-fallback-widget" style="
            display: flex;
            align-items: center;
            flex-wrap: wrap;
            gap: ${isMobile ? '6px' : '8px'};
            padding: ${isMobile ? '12px 16px' : '8px 12px'};
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
            border: 1px solid #bbf7d0;
            border-radius: 8px;
            font-size: ${isMobile ? '16px' : '14px'};
            color: #166534;
            line-height: 1.4;
          ">
            <img 
              src="https://f.nooncdn.com/s/app/com/noon/design-system/payment-methods-v2/tamara-ar.svg" 
              alt="Tamara"
              style="height: ${isMobile ? '20px' : '16px'}; width: auto; flex-shrink: 0;"
            />
            <span style="flex: 1; min-width: 200px;">
              أو قسمها على 3 دفعات بقيمة 
              <strong style="color: #7c3aed; font-size: ${isMobile ? '17px' : '14px'};">${installmentAmount} ر.س</strong>
            </span>
            <button 
              onclick="window.openTamaraInfo && window.openTamaraInfo()"
              style="
                color: #15803d; 
                text-decoration: underline; 
                font-weight: 600; 
                background: none; 
                border: none; 
                cursor: pointer;
                font-size: ${isMobile ? '14px' : '12px'};
                ${isMobile ? 'margin-top: 4px; display: block; width: 100%; text-align: right;' : ''}
              "
            >
              اعرف المزيد
            </button>
          </div>
        `;
      }
    };

    if (amount && amount >= 100 && amount <= 10000) {
      loadTamaraWidget();
    }

    // Cleanup function
    return () => {
      if (widgetRef.current) {
        widgetRef.current.innerHTML = '';
      }
    };
  }, [amount, currency, country, publicKey, inline]);

  // Don't render if amount is not eligible
  if (!amount || amount < 100 || amount > 10000) {
    return null;
  }

  return (
    <div className={className}>
      <div ref={widgetRef} id={`tamara-widget-${Math.random().toString(36).substring(2, 11)}`}></div>
    </div>
  );
}