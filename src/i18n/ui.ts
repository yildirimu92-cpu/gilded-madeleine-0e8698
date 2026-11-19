import { defaultLocale, type Locale } from './config';

const de = {
  'site.name': 'IzyOrder',
  'site.tagline': 'Online-Bestellsystem für die Schweizer Gastronomie',
  'nav.skip': 'Zum Inhalt springen',
  'home.title': 'IzyOrder – Online-Bestellsystem für die Schweizer Gastronomie',
  'home.description':
    'IzyOrder ist das Online-Bestellsystem für Restaurants, Takeaways und Gastronomiebetriebe in der Schweiz. Die neue Website entsteht gerade.',
  'home.eyebrow': 'Neue Website in Arbeit',
  'home.heading': 'Online-Bestellungen für die Schweizer Gastronomie.',
  'home.lead':
    'Hier entsteht der neue Auftritt von IzyOrder – dem Bestellsystem für Restaurants, Takeaways und Gastronomiebetriebe.',
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
