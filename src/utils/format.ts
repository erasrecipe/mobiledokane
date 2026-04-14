/**
 * Formats a number as BDT currency using the en-BD locale.
 * Standardizes comma placement and currency symbol for the Bangladesh market.
 */
export const formatPrice = (price: number): string => {
  if (!price) return 'Price Pending';
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    maximumFractionDigits: 0
  }).format(price);
};

/**
 * Ensures technical values have a consistent 'Pending' fallback
 */
export const formatTechValue = (value: string | undefined | null): string => {
  if (!value || value.trim() === '' || value === '—') {
    return 'Verified Data Pending';
  }
  return value;
};
