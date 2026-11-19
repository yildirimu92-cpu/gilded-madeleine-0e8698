/**
 * Verbindliche Markenfarben (freigegeben, PR #3) und ergänzende Systemfarben.
 * Single Source of Truth für Dokumentation, Designvorschau und Tests.
 * Die CSS-Variablen in `src/styles/tokens.css` müssen exakt diesen Werten entsprechen
 * (geprüft durch tests/unit/design-tokens.test.ts).
 */

export interface ColorToken {
  /** CSS-Variable ohne `--`, z. B. `forest-950` */
  token: string;
  name: string;
  hex: `#${string}`;
  usage: string;
  /** Verbindliche Markenfarbe (true) oder ergänzende Systemfarbe (false) */
  brand: boolean;
}

export const brandColors = [
  {
    token: 'forest-950',
    name: 'Forest 950',
    hex: '#0F2E22',
    usage: 'Primärfarbe, Text, dunkle Flächen',
    brand: true,
  },
  {
    token: 'forest-800',
    name: 'Forest 800',
    hex: '#1A4D3A',
    usage: 'Sekundärflächen, Hover',
    brand: true,
  },
  {
    token: 'forest-600',
    name: 'Forest 600',
    hex: '#1E6B4F',
    usage: 'Links, Interaktion, Fokus',
    brand: true,
  },
  {
    token: 'mint-300',
    name: 'Mint 300',
    hex: '#9FE3C6',
    usage: 'Akzent – nur auf dunklen Flächen oder als Fläche',
    brand: true,
  },
  {
    token: 'mint-100',
    name: 'Mint 100',
    hex: '#E3F6EE',
    usage: 'Dezente Hintergründe, Erfolg',
    brand: true,
  },
  {
    token: 'sand-50',
    name: 'Sand 50',
    hex: '#F7F4EE',
    usage: 'Warmer Seitenhintergrund',
    brand: true,
  },
  {
    token: 'sand-100',
    name: 'Sand 100',
    hex: '#EFEAE1',
    usage: 'Flächen, Hover auf Hell',
    brand: true,
  },
  {
    token: 'sand-200',
    name: 'Sand 200',
    hex: '#E4DDD0',
    usage: 'Trennlinien, Rahmen',
    brand: true,
  },
  {
    token: 'sand-300',
    name: 'Sand 300',
    hex: '#CFC6B6',
    usage: 'Kräftige Rahmen, Sekundärtext auf Dunkel',
    brand: true,
  },
  { token: 'stone-600', name: 'Stone 600', hex: '#5C625E', usage: 'Sekundärtext', brand: true },
] as const satisfies readonly ColorToken[];

export const systemColors = [
  {
    token: 'white',
    name: 'Weiss',
    hex: '#FFFFFF',
    usage: 'Erhöhte Oberflächen (Karten, Felder)',
    brand: false,
  },
  {
    token: 'stone-500',
    name: 'Stone 500',
    hex: '#7C857F',
    usage: 'Rahmen von Eingabefeldern (≥ 3:1)',
    brand: false,
  },
  {
    token: 'amber-700',
    name: 'Amber 700',
    hex: '#8A4B00',
    usage: 'Warnung – Text und Icon',
    brand: false,
  },
  {
    token: 'amber-50',
    name: 'Amber 50',
    hex: '#FDF3E1',
    usage: 'Warnung – Hintergrund',
    brand: false,
  },
  {
    token: 'red-700',
    name: 'Red 700',
    hex: '#B42318',
    usage: 'Fehler – Text und Icon',
    brand: false,
  },
  { token: 'red-50', name: 'Red 50', hex: '#FDEDEB', usage: 'Fehler – Hintergrund', brand: false },
] as const satisfies readonly ColorToken[];

export const allColors: readonly ColorToken[] = [...brandColors, ...systemColors];

export type ColorTokenName =
  (typeof brandColors)[number]['token'] | (typeof systemColors)[number]['token'];

export function hexOf(token: ColorTokenName): string {
  const found = allColors.find((c) => c.token === token);
  if (!found) throw new Error(`Unbekannter Farb-Token: ${token}`);
  return found.hex;
}

/**
 * Freigegebene Text-/Hintergrund-Kombinationen mit Mindestkontrast.
 * 4.5 = normaler Text (WCAG 1.4.3), 3 = grosser Text bzw. UI-Komponenten (1.4.3/1.4.11).
 */
export const approvedPairs: readonly {
  fg: ColorTokenName;
  bg: ColorTokenName;
  min: 4.5 | 3;
  use: string;
}[] = [
  { fg: 'forest-950', bg: 'sand-50', min: 4.5, use: 'Primärtext' },
  { fg: 'forest-950', bg: 'white', min: 4.5, use: 'Primärtext auf Karten' },
  { fg: 'forest-950', bg: 'sand-100', min: 4.5, use: 'Text auf Flächen' },
  { fg: 'forest-950', bg: 'mint-100', min: 4.5, use: 'Text auf Mint-Fläche' },
  { fg: 'forest-950', bg: 'mint-300', min: 4.5, use: 'Text auf Mint-Akzent (Badge)' },
  { fg: 'stone-600', bg: 'sand-50', min: 4.5, use: 'Sekundärtext' },
  { fg: 'stone-600', bg: 'sand-100', min: 4.5, use: 'Sekundärtext auf Flächen' },
  { fg: 'stone-600', bg: 'white', min: 4.5, use: 'Sekundärtext auf Karten' },
  { fg: 'forest-600', bg: 'sand-50', min: 4.5, use: 'Links' },
  { fg: 'forest-600', bg: 'white', min: 4.5, use: 'Links auf Karten' },
  { fg: 'forest-600', bg: 'mint-100', min: 4.5, use: 'Erfolgsmeldung' },
  { fg: 'sand-50', bg: 'forest-950', min: 4.5, use: 'Text auf Dunkel' },
  { fg: 'sand-50', bg: 'forest-800', min: 4.5, use: 'Text auf Sekundärfläche / Hover' },
  { fg: 'sand-300', bg: 'forest-950', min: 4.5, use: 'Sekundärtext auf Dunkel' },
  { fg: 'mint-300', bg: 'forest-950', min: 4.5, use: 'Akzent und Links auf Dunkel' },
  { fg: 'amber-700', bg: 'amber-50', min: 4.5, use: 'Warnung' },
  { fg: 'amber-700', bg: 'sand-50', min: 4.5, use: 'Warnung auf Seitenhintergrund' },
  { fg: 'red-700', bg: 'red-50', min: 4.5, use: 'Fehler' },
  { fg: 'red-700', bg: 'sand-50', min: 4.5, use: 'Fehler auf Seitenhintergrund' },
  { fg: 'red-700', bg: 'white', min: 4.5, use: 'Fehler in Formularen' },
  { fg: 'forest-600', bg: 'sand-50', min: 3, use: 'Fokusring' },
  { fg: 'mint-300', bg: 'forest-950', min: 3, use: 'Fokusring auf Dunkel' },
  { fg: 'stone-500', bg: 'sand-50', min: 3, use: 'Rahmen von Eingabefeldern' },
  { fg: 'stone-500', bg: 'white', min: 3, use: 'Rahmen von Eingabefeldern auf Weiss' },
];

/** Ausdrücklich unzulässige Kombinationen (Dokumentation und Regressionstest). */
export const forbiddenTextPairs: readonly {
  fg: ColorTokenName;
  bg: ColorTokenName;
  reason: string;
}[] = [
  { fg: 'mint-300', bg: 'sand-50', reason: 'Mint ist auf hellen Flächen kein Text (≈ 1.3:1)' },
  { fg: 'mint-300', bg: 'white', reason: 'Mint ist auf Weiss kein Text (≈ 1.5:1)' },
  { fg: 'mint-300', bg: 'mint-100', reason: 'Kein Kontrast' },
  { fg: 'stone-600', bg: 'sand-300', reason: 'Unter 4.5:1 – kein Fliesstext auf Sand 300' },
];
