/**
 * Humanize a micronutrient key like "vitamin_b12_mcg", "iron mg: 2.8" or "iron_mg"
 * into { label, unit } for clean display.
 */
export function formatMicroKey(rawKey: string): { label: string; unit: string } {
  let key = rawKey.trim().toLowerCase().replace(/[:]+/g, ' ').replace(/[-]+/g, '_').replace(/\s+/g, '_');

  const unitMatch = key.match(/_?(mcg|mg|g|iu|µg)$/);
  const unit = unitMatch ? unitMatch[1].replace('µg', 'mcg') : '';
  if (unitMatch) key = key.slice(0, -unitMatch[0].length).replace(/_+$/, '');

  const label = key
    .split('_')
    .filter(Boolean)
    .map((w) => {
      if (/^b\d+$/.test(w)) return w.toUpperCase(); // b12 -> B12
      if (/^b\d/.test(w)) return w.toUpperCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    })
    .join(' ')
    .replace(/\bB(\d+)/g, 'B$1')
    .replace('Pantothenic Acid', 'Pantothenic acid')
    .replace('Vitamin C Mg', 'Vitamin C')
    .trim();

  return { label: label || rawKey, unit };
}

export function formatMicroValue(value: unknown): string {
  const num = Number(value);
  if (Number.isNaN(num)) return String(value ?? '—');
  return Number.isInteger(num) ? String(num) : String(Math.round(num * 10) / 10);
}
