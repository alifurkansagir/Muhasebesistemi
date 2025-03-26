import { DATE_FORMAT_OPTIONS, DATE_FORMAT_SHORT_OPTIONS } from "../constants";

/**
 * Format a date to a localized string using Turkish locale
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('tr-TR', DATE_FORMAT_OPTIONS);
}

/**
 * Format a date to a short localized string (DD/MM/YYYY)
 */
export function formatDateShort(date: Date | string | null | undefined): string {
  if (!date) return "";
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('tr-TR', DATE_FORMAT_SHORT_OPTIONS);
}

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1;
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2;
  
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Calculate days left until a date
 */
export function daysLeft(date: Date | string): number {
  const targetDate = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  // Set hours to 0 to compare just the dates
  today.setHours(0, 0, 0, 0);
  targetDate.setHours(0, 0, 0, 0);
  
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Get start and end dates for a given period
 */
export function getDateRangeForPeriod(period: string): { startDate: Date, endDate: Date } {
  const endDate = new Date();
  const startDate = new Date();
  
  switch (period) {
    case '7days':
      startDate.setDate(endDate.getDate() - 7);
      break;
    case '30days':
      startDate.setDate(endDate.getDate() - 30);
      break;
    case '3months':
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case '6months':
      startDate.setMonth(endDate.getMonth() - 6);
      break;
    case '12months':
      startDate.setMonth(endDate.getMonth() - 12);
      break;
    case 'thisYear':
      startDate.setMonth(0, 1);
      startDate.setHours(0, 0, 0, 0);
      break;
    default:
      startDate.setMonth(endDate.getMonth() - 6);
  }
  
  return { startDate, endDate };
}

/**
 * Get month names for the last N months
 */
export function getLastNMonths(n: number): string[] {
  const months = [];
  const date = new Date();
  
  for (let i = 0; i < n; i++) {
    months.unshift(date.toLocaleDateString('tr-TR', { month: 'short' }));
    date.setMonth(date.getMonth() - 1);
  }
  
  return months;
}
