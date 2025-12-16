export const formatPrice = (price, currency = 'SAR', locale = 'ar-SA') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
};

export const formatNumber = (number, locale = 'ar-SA') => {
  return new Intl.NumberFormat(locale).format(number);
};
