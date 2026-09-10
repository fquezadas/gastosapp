export function formatCLP(amount: number, withSuffix: boolean = false): string {
  const formatted = new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 0,
  }).format(amount);

  return withSuffix ? `$${formatted} CLP` : `$${formatted}`;
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Alias for compatibility
export const formatCOP = formatCLP;

export function formatNumberWithDots(val: string | number): string {
  const num = typeof val === 'number' ? val : parseInt(val.replace(/\D/g, ''), 10);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(num);
}
