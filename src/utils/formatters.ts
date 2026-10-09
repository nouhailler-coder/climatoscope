/**
 * ClimatOSCOPE — Scientific Formatters
 */

export function formatScientificValue(val: number | null | undefined, unit: string = '', decimals: number = 2): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const formatted = val.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return unit ? `${formatted} ${unit}` : formatted;
}

export function formatAnomaly(val: number | null | undefined): string {
  if (val === null || val === undefined || isNaN(val)) return '—';
  const prefix = val > 0 ? '+' : '';
  return `${prefix}${val.toFixed(2)} °C`;
}

export function formatYearOrMonth(timestamp: string): string {
  if (!timestamp) return '';
  if (timestamp.length === 4) return timestamp;
  if (timestamp.length === 7) {
    const [year, month] = timestamp.split('-');
    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    const mIdx = parseInt(month, 10) - 1;
    return `${monthNames[mIdx] || month} ${year}`;
  }
  return timestamp;
}
