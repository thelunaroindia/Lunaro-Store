import type { Money } from './types';

export function formatMoney(money: Money | null | undefined): string {
  if (!money) return '';
  const amount = Number(money.amount);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: money.currencyCode || 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(0)}`;
  }
}

// For amounts a customer has to pay or has paid, where rounding would misstate them.
export function formatExactMoney(money: Money): string {
  const amount = Number(money.amount);
  const digits = Number.isInteger(amount) ? 0 : 2;
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: money.currencyCode || 'INR',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(amount);
  } catch {
    return `₹${amount.toFixed(digits)}`;
  }
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
