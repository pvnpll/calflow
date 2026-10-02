export { cn } from "cn"

export function formatNumber(n: number, decimals?: number): string {
  return n.toLocaleString(undefined, {
    minimumFractionDigits: decimals ?? 0,
    maximumFractionDigits: decimals ?? 0,
  });
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

export function toISODate(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getDateRange(period: '7d' | '30d' | '90d' | 'all'): { start: Date; end: Date } {
  const end = new Date();
  const start = new Date();
  switch (period) {
    case '7d':
      start.setDate(end.getDate() - 7);
      break;
    case '30d':
      start.setDate(end.getDate() - 30);
      break;
    case '90d':
      start.setDate(end.getDate() - 90);
      break;
    case 'all':
      start.setFullYear(2000); // Or appropriate start date
      break;
  }
  return { start, end };
}

export function estimateConfidenceLabel(confidence: string): string {
  switch (confidence) {
    case 'high': return 'High Confidence';
    case 'medium': return 'Medium Confidence';
    case 'low': return 'Low Confidence';
    default: return 'Unknown Confidence';
  }
}

export function calculatePercentage(current: number, target: number): number {
  if (target === 0) return 0;
  return Math.min(100, Math.round((current / target) * 100));
}
