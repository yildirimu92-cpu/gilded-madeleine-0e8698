import { defaultLocale, type Locale } from './config';

const de = {
  'site.name': 'IzyOrder',
  'site.tagline': 'Online-Bestellsystem für die Schweizer Gastronomie',
  'nav.skip': 'Zum Inhalt springen',
  'home.title': 'Online-Bestellshop ohne Plattformprovision – IzyOrder',
  'home.description':
    'IzyOrder entwickelt einen Online-Bestellshop für Schweizer Restaurants und Takeaways: Direktbestellungen für Abholung und Lieferung, 0 % Plattformprovision. Gebühren von Zahlungsanbietern können anfallen.',
  'home.eyebrow': 'Für die Schweizer Gastronomie – in Entwicklung',
  'home.heading': 'Ihr Bestellshop. Ohne Plattformprovision.',
  'home.lead':
    'IzyOrder entsteht für Schweizer Restaurants und Takeaways: Online-Bestellungen für Abholung und Lieferung über den eigenen Shop.',
  'notFound.title': 'Seite nicht gefunden',
  'notFound.text': 'Die gewünschte Seite existiert nicht oder wurde verschoben.',
  'notFound.back': 'Zur Startseite',
  'footer.copyright': '© {year} IzyOrder',
} as const;

export type UiKey = keyof typeof de;

// Weitere Sprachen ergänzen ihr Wörterbuch hier; fehlende Texte fallen auf de-CH zurück.
const dictionaries: Partial<Record<Locale, Partial<Record<UiKey, string>>>> = { de };

export function t(key: UiKey, locale: Locale = defaultLocale): string {
  return dictionaries[locale]?.[key] ?? de[key];
}
