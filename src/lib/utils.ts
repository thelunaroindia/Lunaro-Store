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

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}
