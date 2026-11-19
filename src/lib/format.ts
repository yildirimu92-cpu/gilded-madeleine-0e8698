/** Formatierung nach Schweizer Konventionen (de-CH). */

/** Einheitlich typografischer Apostroph (U+2019), unabhängig von der ICU-Version. */
const apostrophe = (s: string) => s.replace(/['\u2019\u02BC]/g, '\u2019');

const chf = new Intl.NumberFormat('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const integer = new Intl.NumberFormat('de-CH', { maximumFractionDigits: 0 });

/** «1’249.50» – Apostroph als Tausendertrennzeichen, Punkt als Dezimaltrennzeichen. */
export function formatAmount(value: number): string {
  return apostrophe(chf.format(value));
}

/** «CHF 1’249.50» bzw. «CHF 79.–» für ganze Beträge (Schweizer Preisschreibweise). */
export function formatChf(value: number, { dash = true }: { dash?: boolean } = {}): string {
  if (dash && Number.isInteger(value)) return `CHF ${apostrophe(integer.format(value))}.–`;
  return `CHF ${formatAmount(value)}`;
}

/** «19.11.2026» */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Europe/Zurich',
  }).format(date);
}
