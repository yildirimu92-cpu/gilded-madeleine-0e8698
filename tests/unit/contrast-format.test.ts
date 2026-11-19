import { describe, expect, it } from 'vitest';
import {
  contrastRatio,
  formatRatio,
  rateContrast,
  relativeLuminance,
} from '../../src/lib/contrast';
import { formatAmount, formatChf, formatDate } from '../../src/lib/format';

describe('contrast', () => {
  it('berechnet Referenzwerte korrekt', () => {
    expect(relativeLuminance('#000000')).toBe(0);
    expect(relativeLuminance('#FFFFFF')).toBeCloseTo(1, 5);
    expect(contrastRatio('#000000', '#FFFFFF')).toBeCloseTo(21, 5);
    expect(contrastRatio('#777777', '#FFFFFF')).toBeCloseTo(4.48, 2);
    expect(contrastRatio('#0F2E22', '#F7F4EE')).toBe(contrastRatio('#F7F4EE', '#0F2E22'));
  });

  it('bewertet und formatiert', () => {
    expect(rateContrast(7.1)).toBe('AAA');
    expect(rateContrast(4.5)).toBe('AA');
    expect(rateContrast(3.2)).toBe('AA gross');
    expect(rateContrast(2.9)).toBe('ungenügend');
    expect(formatRatio(4.4999)).toBe('4.49:1');
  });

  it('lehnt ungültige Farben ab', () => {
    expect(() => relativeLuminance('#abc')).toThrow();
  });
});

describe('format (de-CH)', () => {
  it('nutzt den typografischen Apostroph als Tausendertrennzeichen', () => {
    expect(formatAmount(1249.5)).toBe('1’249.50');
    expect(formatAmount(1234567)).toBe('1’234’567.00');
  });

  it('formatiert CHF nach Schweizer Konvention', () => {
    expect(formatChf(79)).toBe('CHF 79.–');
    expect(formatChf(1249)).toBe('CHF 1’249.–');
    expect(formatChf(18.9)).toBe('CHF 18.90');
    expect(formatChf(79, { dash: false })).toBe('CHF 79.00');
  });

  it('formatiert Datum in Zürcher Zeit', () => {
    expect(formatDate(new Date(Date.UTC(2026, 10, 19, 22, 30)))).toBe('19.11.2026');
    expect(formatDate(new Date(Date.UTC(2026, 11, 31, 23, 30)))).toBe('01.01.2027');
  });
});
