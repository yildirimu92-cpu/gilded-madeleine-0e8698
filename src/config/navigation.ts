import { isPilotCollectionEnabled } from './lead';
import type { BuildEnv } from '../lib/site-config';

/**
 * Navigation und Footer-Struktur der öffentlichen Website (PR #5).
 *
 * Regeln:
 * - Nur Einträge mit `status: 'live'` werden öffentlich gerendert. Ein E2E-Test stellt
 *   sicher, dass jedes `live`-Ziel tatsächlich existiert (kein 404, kein href="#").
 * - Geplante Seiten bleiben `planned`, bis sie gebaut und freigegeben sind.
 * - Die Live-Demo-Adresse bleibt leer, bis eine Demo ausdrücklich freigegeben ist
 *   (Entscheid Projektleitung, 19.11.2026). Ohne Adresse wird kein CTA angezeigt.
 */

export type NavStatus = 'live' | 'planned';

export interface NavItem {
  id: string;
  label: string;
  href: string;
  status: NavStatus;
}

export interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
}

export interface Cta {
  label: string;
  href: string;
  external: boolean;
}

/** Hauptnavigation im Header (Reihenfolge = Anzeige). */
export const mainNavigation: NavItem[] = [
  { id: 'funktionen', label: 'Funktionen', href: '/funktionen/', status: 'planned' },
  { id: 'preise', label: 'Preise', href: '/preise/', status: 'planned' },
  { id: 'demo', label: 'Demo', href: '/demo/', status: 'planned' },
  { id: 'bestellen', label: 'Restaurant finden', href: '/bestellen/', status: 'planned' },
];

/** Footer-Gruppen. Rechtliche Seiten werden erst mit PR „Rechtliches“ aktiviert. */
export const footerNavigation: NavGroup[] = [
  {
    id: 'produkt',
    title: 'Produkt',
    items: [
      { id: 'funktionen', label: 'Funktionen', href: '/funktionen/', status: 'planned' },
      { id: 'preise', label: 'Preise', href: '/preise/', status: 'planned' },
      { id: 'demo', label: 'Live-Demo', href: '/demo/', status: 'planned' },
    ],
  },
  {
    id: 'gaeste',
    title: 'Für Gäste',
    items: [
      { id: 'bestellen', label: 'Restaurant finden', href: '/bestellen/', status: 'planned' },
    ],
  },
];

export const legalNavigation: NavItem[] = [
  { id: 'impressum', label: 'Impressum', href: '/impressum/', status: 'planned' },
  { id: 'datenschutz', label: 'Datenschutz', href: '/datenschutz/', status: 'planned' },
];

/**
 * Primärer CTA «Live-Demo ansehen». `url: null` = noch keine freigegebene Demo →
 * CTA wird nicht gerendert. Nach Freigabe hier die Adresse eintragen.
 */
export const liveDemo: { label: string; url: string | null } = {
  label: 'Live-Demo ansehen',
  url: null,
};

export function liveItems(items: NavItem[]): NavItem[] {
  return items.filter((i) => i.status === 'live');
}

export function liveGroups(groups: NavGroup[]): NavGroup[] {
  return groups.map((g) => ({ ...g, items: liveItems(g.items) })).filter((g) => g.items.length > 0);
}

export function primaryCta(): Cta | null {
  if (!liveDemo.url) return null;
  return { label: liveDemo.label, href: liveDemo.url, external: /^https?:\/\//.test(liveDemo.url) };
}

/**
 * Der Pilot-CTA wird erst im freigegebenen Produktionsbuild sichtbar.
 * Eine bloss existierende /pilot/-Seite oder das Setzen eines einzelnen Flags reicht nicht.
 * Previews und CI bleiben ohne aktive Lead-CTA.
 */
export function pilotCta(env: BuildEnv, privacyPageLive: boolean): Cta | null {
  if (!isPilotCollectionEnabled(env, privacyPageLive)) return null;
  return { label: 'Pilotplatz unverbindlich anfragen', href: '/pilot/', external: false };
}

/** Pilot hat nach Freigabe Vorrang; ansonsten gilt ausschliesslich die freigegebene Demo. */
export function marketingCta(env: BuildEnv, privacyPageLive: boolean): Cta | null {
  return pilotCta(env, privacyPageLive) ?? primaryCta();
}

/** Alle öffentlich verlinkten Ziele (für Tests). */
export function allLiveHrefs(): string[] {
  return [
    ...liveItems(mainNavigation),
    ...liveGroups(footerNavigation).flatMap((g) => g.items),
    ...liveItems(legalNavigation),
  ].map((i) => i.href);
}
