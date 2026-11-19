/**
 * Sprachkonfiguration (ADR 0006). Start mit de-CH; weitere Sprachen werden hier ergänzt
 * und erhalten ein URL-Präfix (/fr, /it, /en). Nur Sprachen mit `enabled: true` werden
 * als hreflang-Alternativen ausgegeben.
 */
export const locales = {
  de: { lang: 'de-CH', label: 'Deutsch', ogLocale: 'de_CH', prefix: '', enabled: true },
  fr: { lang: 'fr-CH', label: 'Français', ogLocale: 'fr_CH', prefix: '/fr', enabled: false },
  it: { lang: 'it-CH', label: 'Italiano', ogLocale: 'it_CH', prefix: '/it', enabled: false },
  en: { lang: 'en', label: 'English', ogLocale: 'en_GB', prefix: '/en', enabled: false },
} as const;

export type Locale = keyof typeof locales;

export const defaultLocale: Locale = 'de';

export function enabledLocales(): Locale[] {
  return (Object.keys(locales) as Locale[]).filter((l) => locales[l].enabled);
}

/** Pfad ohne Sprachpräfix → Pfad der gewünschten Sprache (z. B. /preise/ → /fr/preise/). */
export function localizedPath(path: string, locale: Locale): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${locales[locale].prefix}${clean}`;
}
