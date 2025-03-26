import { CURRENCY_OPTIONS } from "../constants";

/**
 * Format a number as currency
 */
export function formatCurrency(amount: number, currencyCode: string = 'TRY'): string {
  // Find the currency symbol
  const currency = CURRENCY_OPTIONS.find(c => c.value === currencyCode);
  const symbol = currency?.symbol || '₺';
  
  // Format the amount with localized commas and decimals
  const formattedAmount = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
  
  return `${symbol}${formattedAmount}`;
}

/**
 * Format a number with sign (+ for positive, - for negative)
 */
export function formatCurrencyWithSign(amount: number, currencyCode: string = 'TRY'): string {
  // Find the currency symbol
  const currency = CURRENCY_OPTIONS.find(c => c.value === currencyCode);
  const symbol = currency?.symbol || '₺';
  
  // Format the amount with localized commas and decimals
  const formattedAmount = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Math.abs(amount));
  
  // Add the appropriate sign
  const sign = amount >= 0 ? '+' : '-';
  
  return `${sign}${symbol}${formattedAmount}`;
}

/**
 * Format a percentage
 */
export function formatPercentage(value: number): string {
  const formattedValue = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(Math.abs(value));
  
  return `${value >= 0 ? '+' : '-'}${formattedValue}%`;
}
