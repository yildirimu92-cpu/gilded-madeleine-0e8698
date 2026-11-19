/**
 * PR #10 – redaktionelle Inhalte für die B2B-Funktionsseiten.
 * Alle Funktionen sind als Konzept / in Entwicklung beschrieben.
 * Keine Aussage über tatsächliche Produktivverfügbarkeit oder Tarifzugehörigkeit.
 */
export type FeatureSlug = 'online-bestellshop' | 'abholung-lieferung' | 'bestellverwaltung';

export interface Feature {
  slug: FeatureSlug;
  label: string;
  kicker: string;
  title: string;
  intro: string;
  pitch: string;
  icon: string;
  highlights: readonly { title: string; text: string }[];
  steps: readonly { title: string; description: string }[];
  disclaimer: string;
}

export const featurePages: readonly Feature[] = [
  {
    slug: 'online-bestellshop',
    label: 'Online-Bestellshop',
    kicker: 'Ihr direkter Bestellkanal',
    title: 'Ihre Speisekarte. Ihr Online-Shop.',
    intro:
      'Gäste sollen Ihre Gerichte über einen eigenen digitalen Bestellkanal auswählen und für Abholung oder Lieferung bestellen können – mit Ihrer Marke im Mittelpunkt.',
    pitch:
      'IzyOrder wird für Restaurants und Takeaways entwickelt, die Bestellungen direkt entgegennehmen möchten. Das Konzept setzt auf einen schlanken Bestellablauf und 0 % Plattformprovision; Kosten für Software und Zahlungsabwicklung sind davon getrennt.',
    icon: '01',
    highlights: [
      {
        title: 'Speisekarte präsentieren',
        text: 'Gerichte, Kategorien und Zusatzoptionen sollen sich im Shop verständlich darstellen und pflegen lassen.',
      },
      {
        title: 'Mobil bestellen',
        text: 'Der Bestellablauf wird für Smartphones entworfen, damit Gäste auch unterwegs einfach bestellen können.',
      },
      {
        title: 'Direkter Bestellkanal',
        text: 'Der digitale Shop soll unter der Marke des Gastronomiebetriebs genutzt werden können – unabhängig von der optionalen KI-Telefonassistenz.',
      },
    ],
    steps: [
      { title: 'Angebot einrichten', description: 'Gerichte und Kategorien für den Shop vorbereiten.' },
      { title: 'Gerichte auswählen', description: 'Gäste stellen ihre Bestellung über den digitalen Shop zusammen.' },
      { title: 'Bestellung empfangen', description: 'Die geplante Bestellverwaltung übernimmt den weiteren Ablauf im Betrieb.' },
    ],
    disclaimer:
      'Die dargestellten Funktionen befinden sich in Entwicklung. Zahlungsarten, Shop-Anpassungen und die technische Freigabe werden vor dem Marktstart geprüft.',
  },
  {
    slug: 'abholung-lieferung',
    label: 'Abholung & Lieferung',
    kicker: 'Zwei Bestellarten',
    title: 'Flexibel für Ihre Küche und Ihre Gäste.',
    intro:
      'Ein und derselbe Online-Bestellshop soll Abholungen und Lieferungen unterstützen – passend zu Öffnungszeiten, Angebot und Liefergebiet Ihres Betriebs.',
    pitch:
      'Wir gestalten die Konfiguration für den Gastronomiealltag: mit Abhol- und Lieferoptionen, planbaren Zeitfenstern sowie der Berücksichtigung von Mittagspause und Abendservice.',
    icon: '02',
    highlights: [
      {
        title: 'Abholung ermöglichen',
        text: 'Gäste sollen Bestellungen aufgeben und diese nach dem geplanten Ablauf im Restaurant abholen können.',
      },
      {
        title: 'Liefergebiet konfigurieren',
        text: 'Postleitzahlen und eine interaktive Kartenauswahl sind als Einstellmöglichkeiten vorgesehen; die Umsetzung ist noch nicht freigegeben.',
      },
      {
        title: 'Öffnungszeiten mit Pausen',
        text: 'Geteilte Öffnungszeiten für Mittags- und Abendservice sind Bestandteil des geplanten Konzepts.',
      },
    ],
    steps: [
      { title: 'Bestellarten wählen', description: 'Abholung und/oder Lieferung für den Betrieb festlegen.' },
      { title: 'Zeiten und Gebiet planen', description: 'Öffnungszeiten und geplante Lieferbereiche konfigurieren.' },
      { title: 'Bestellablauf prüfen', description: 'Die Gastansicht und die betrieblichen Abläufe vor der Aktivierung testen.' },
    ],
    disclaimer:
      'Liefergebietskarte, Zeitfenster und Betriebsregeln sind Produktanforderungen, keine bestätigten Live-Funktionen. Eigene Kurierdienste werden nicht automatisch von IzyOrder bereitgestellt.',
  },
  {
    slug: 'bestellverwaltung',
    label: 'Bestellverwaltung',
    kicker: 'Für Küche und Betrieb',
    title: 'Neue Bestellungen. Ein klarer Überblick.',
    intro:
      'Eingehende Direktbestellungen sollen in einer übersichtlichen Verwaltungsansicht ankommen – mit einem nachvollziehbaren Status für den weiteren Ablauf.',
    pitch:
      'IzyOrder wird als Arbeitswerkzeug für den Betrieb konzipiert. Restaurantinhaber und Küchenteams sollen sich auf die Bestellungen konzentrieren können statt zwischen unübersichtlichen Kanälen zu wechseln.',
    icon: '03',
    highlights: [
      {
        title: 'Bestellungen erkennen',
        text: 'Neue Bestellungen sollen mit relevanten Informationen für Abholung oder Lieferung sichtbar sein.',
      },
      {
        title: 'Status nachvollziehen',
        text: 'Geplante Zustände unterstützen die Bearbeitung vom Eingang bis zur Bereitstellung.',
      },
      {
        title: 'Auf Bedienbarkeit ausgelegt',
        text: 'Die Oberflächen werden für unterschiedliche Bildschirmgrössen und die Nutzung im Betriebsalltag entwickelt.',
      },
    ],
    steps: [
      { title: 'Bestellung geht ein', description: 'Eine Direktbestellung soll in der Bestellübersicht erscheinen.' },
      { title: 'Team verarbeitet sie', description: 'Küche und Betrieb bearbeiten die Bestellung im vorgesehenen Ablauf.' },
      { title: 'Status aktualisieren', description: 'Der Fortschritt soll für das Team nachvollziehbar bleiben.' },
    ],
    disclaimer:
      'Die abgebildeten Abläufe sind konzeptionell. Integrationen mit Just Eat, Uber Eats, Kassensystemen oder externen Lieferdiensten sind nicht Bestandteil eines freigegebenen V1-Leistungsversprechens.',
  },
];

export function featurePath(slug: FeatureSlug): string {
  return `/funktionen/${slug}/`;
}

export function featureBySlug(slug: FeatureSlug): Feature {
  const feature = featurePages.find((candidate) => candidate.slug === slug);
  if (!feature) throw new Error(`Fehlende Funktionsseite für: ${slug}`);
  return feature;
}

export const voiceFeature = {
  status: 'planned',
  title: 'KI-Telefonassistenz',
  text:
    'Eine telefonische KI-Unterstützung ist als eigenständige, optionale Erweiterung vorgesehen. Sie gehört nicht automatisch zum Online-Bestellshop und wird hier nicht als verfügbar beworben.',
} as const;
