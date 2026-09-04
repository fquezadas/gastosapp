export function formatCLP(amount: number, withSuffix: boolean = false): string {
  const formatted = new Intl.NumberFormat('es-CL', {
    maximumFractionDigits: 0,
  }).format(amount);

  return withSuffix ? `$${formatted} CLP` : `$${formatted}`;
}

// Alias for compatibility
export const formatCOP = formatCLP;

export function formatNumberWithDots(val: string | number): string {
  const num = typeof val === 'number' ? val : parseInt(val.replace(/\D/g, ''), 10);
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('es-CL', { maximumFractionDigits: 0 }).format(num);
}
