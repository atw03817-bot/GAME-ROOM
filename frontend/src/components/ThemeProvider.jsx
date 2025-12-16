import { useEffect, useState } from 'react';
import api from '../utils/api';

function ThemeProvider({ children }) {
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    fetchAndApplyTheme();
  }, []);

  const fetchAndApplyTheme = async () => {
    try {
      const response = await api.get('/theme');
      if (response.data.success && response.data.data.theme) {
        applyTheme(response.data.data.theme);
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setThemeLoaded(true);
    }
  };

  const applyTheme = (theme) => {
    const root = document.documentElement;
    
    // Apply colors
    if (theme.colors) {
      root.style.setProperty('--color-primary', theme.colors.primary || '#a855f7');
      root.style.setProperty('--color-primary-hover', theme.colors.primaryHover || '#9333ea');
      root.style.setProperty('--color-secondary', theme.colors.secondary || '#6b7280');
      root.style.setProperty('--color-accent', theme.colors.accent || '#f59e0b');
      root.style.setProperty('--color-success', theme.colors.success || '#10b981');
      root.style.setProperty('--color-warning', theme.colors.warning || '#f59e0b');
      root.style.setProperty('--color-error', theme.colors.error || '#ef4444');
      root.style.setProperty('--color-background', theme.colors.background || '#ffffff');
      root.style.setProperty('--color-surface', theme.colors.surface || '#f8fafc');
      root.style.setProperty('--color-text-primary', theme.colors.textPrimary || '#1f2937');
      root.style.setProperty('--color-text-secondary', theme.colors.textSecondary || '#6b7280');
    }

    // Apply fonts
    if (theme.fonts) {
      if (theme.fonts.primary) {
        root.style.setProperty('--font-primary', `${theme.fonts.primary}, Cairo, Tajawal, Arial, sans-serif`);
        document.body.style.fontFamily = `${theme.fonts.primary}, Cairo, Tajawal, Arial, sans-serif`;
      }
      if (theme.fonts.secondary) {
        root.style.setProperty('--font-secondary', `${theme.fonts.secondary}, Inter, system-ui, sans-serif`);
      }
      if (theme.fonts.size) {
        root.style.setProperty('--font-size-base', theme.fonts.size.base || '16px');
        root.style.setProperty('--font-size-small', theme.fonts.size.small || '14px');
        root.style.setProperty('--font-size-large', theme.fonts.size.large || '18px');
        root.style.setProperty('--font-size-heading', theme.fonts.size.heading || '24px');
        document.body.style.fontSize = theme.fonts.size.base || '16px';
      }
    }

    // Apply layout
    if (theme.layout) {
      root.style.setProperty('--border-radius', theme.layout.borderRadius || '12px');
      root.style.setProperty('--spacing', theme.layout.spacing || '16px');
      root.style.setProperty('--container-width', theme.layout.containerWidth || '1200px');
    }

    // Apply effects
    if (theme.effects) {
      root.style.setProperty('--animations-enabled', theme.effects.animations ? '1' : '0');
      root.style.setProperty('--shadows-enabled', theme.effects.shadows ? '1' : '0');
      root.style.setProperty('--gradients-enabled', theme.effects.gradients ? '1' : '0');
    }

    // Update Tailwind CSS custom properties
    updateTailwindColors(theme.colors);
  };

  const updateTailwindColors = (colors) => {
    if (!colors) return;

    // Update CSS custom properties for Tailwind
    const style = document.createElement('style');
    style.textContent = `
      :root {
        --tw-color-primary-50: ${lightenColor(colors.primary, 95)};
        --tw-color-primary-100: ${lightenColor(colors.primary, 90)};
        --tw-color-primary-200: ${lightenColor(colors.primary, 80)};
        --tw-color-primary-300: ${lightenColor(colors.primary, 70)};
        --tw-color-primary-400: ${lightenColor(colors.primary, 60)};
        --tw-color-primary-500: ${colors.primary};
        --tw-color-primary-600: ${colors.primaryHover || darkenColor(colors.primary, 10)};
        --tw-color-primary-700: ${darkenColor(colors.primary, 20)};
        --tw-color-primary-800: ${darkenColor(colors.primary, 30)};
        --tw-color-primary-900: ${darkenColor(colors.primary, 40)};
      }
      
      /* Primary Colors */
      .bg-primary-500 { background-color: ${colors.primary} !important; }
      .bg-primary-600 { background-color: ${colors.primaryHover || darkenColor(colors.primary, 10)} !important; }
      .bg-primary-700 { background-color: ${darkenColor(colors.primary, 20)} !important; }
      .text-primary-600 { color: ${colors.primaryHover || darkenColor(colors.primary, 10)} !important; }
      .text-primary-500 { color: ${colors.primary} !important; }
      .border-primary-600 { border-color: ${colors.primaryHover || darkenColor(colors.primary, 10)} !important; }
      .border-primary-500 { border-color: ${colors.primary} !important; }
      
      /* Hover States */
      .hover\\:bg-primary-600:hover { background-color: ${colors.primaryHover || darkenColor(colors.primary, 10)} !important; }
      .hover\\:bg-primary-700:hover { background-color: ${darkenColor(colors.primary, 20)} !important; }
      .hover\\:text-primary-600:hover { color: ${colors.primaryHover || darkenColor(colors.primary, 10)} !important; }
      .hover\\:text-primary-400:hover { color: ${lightenColor(colors.primary, 20)} !important; }
      
      /* Focus States */
      .focus\\:ring-primary-500:focus { --tw-ring-color: ${colors.primary} !important; }
      .focus\\:ring-primary-300:focus { --tw-ring-color: ${lightenColor(colors.primary, 40)} !important; }
      .focus\\:border-primary-500:focus { border-color: ${colors.primary} !important; }
      
      /* Background Colors */
      body { 
        background-color: ${colors.background} !important; 
        font-family: var(--font-primary) !important;
        font-size: var(--font-size-base) !important;
      }
      .bg-white { background-color: ${colors.surface} !important; }
      .bg-gray-50 { background-color: ${colors.surface} !important; }
      .bg-gray-100 { background-color: ${lightenColor(colors.surface, 30)} !important; }
      .bg-gray-200 { background-color: ${lightenColor(colors.surface, 20)} !important; }
      
      /* Main background */
      #root { background-color: ${colors.background} !important; }
      main { background-color: ${colors.background} !important; }
      
      /* Text Colors */
      .text-gray-800 { color: ${colors.textPrimary} !important; }
      .text-gray-900 { color: ${colors.textPrimary} !important; }
      .text-gray-600 { color: ${colors.textSecondary} !important; }
      .text-gray-700 { color: ${colors.textSecondary} !important; }
      
      /* Product Cards */
      .product-card { background-color: ${colors.surface} !important; }
      .product-card:hover { box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1) !important; }
      
      /* Success, Warning, Error Colors */
      .bg-green-100 { background-color: ${lightenColor(colors.success, 80)} !important; }
      .text-green-700 { color: ${darkenColor(colors.success, 20)} !important; }
      .bg-red-100 { background-color: ${lightenColor(colors.error, 80)} !important; }
      .text-red-700 { color: ${darkenColor(colors.error, 20)} !important; }
      .bg-yellow-100 { background-color: ${lightenColor(colors.warning, 80)} !important; }
      .text-yellow-700 { color: ${darkenColor(colors.warning, 20)} !important; }
    `;
    
    // Remove existing theme style if any
    const existingStyle = document.getElementById('dynamic-theme');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    style.id = 'dynamic-theme';
    document.head.appendChild(style);
  };

  // Helper functions for color manipulation
  const lightenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
      (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
      (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
  };

  const darkenColor = (color, percent) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R > 255 ? 255 : R < 0 ? 0 : R) * 0x10000 +
      (G > 255 ? 255 : G < 0 ? 0 : G) * 0x100 +
      (B > 255 ? 255 : B < 0 ? 0 : B)).toString(16).slice(1);
  };

  // Show loading until theme is applied
  if (!themeLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return children;
}

export default ThemeProvider;