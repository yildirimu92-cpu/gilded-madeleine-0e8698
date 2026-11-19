/**
 * Sprachkonfiguration (ADR 0006). Start mit de-CH; weitere Sprachen werden hier ergänzt
 * und erhalten ein URL-Präfix (/fr, /it, /en).
 */
export const locales = {
  de: { lang: 'de-CH', label: 'Deutsch', ogLocale: 'de_CH' },
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = 'de';
