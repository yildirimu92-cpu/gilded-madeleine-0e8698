/** Hilfsfunktionen für Links (rein, ohne DOM – testbar). */

const INTERNAL_HOSTS = new Set<string>();

/** Eigene Hosts (z. B. Produktionsdomain) registrieren, die nicht als extern gelten. */
export function registerInternalHost(host: string): void {
  INTERNAL_HOSTS.add(host.toLowerCase());
}

export function isExternalHref(href: string, siteOrigin?: string): boolean {
  if (/^(mailto|tel):/i.test(href)) return false;
  if (!/^[a-z][a-z\d+.-]*:\/\//i.test(href) && !href.startsWith('//')) return false;
  try {
    const url = new URL(href, siteOrigin ?? 'https://invalid.local');
    if (siteOrigin && url.origin === new URL(siteOrigin).origin) return false;
    return !INTERNAL_HOSTS.has(url.host.toLowerCase());
  } catch {
    return false;
  }
}

/** Sichere rel-Werte für externe Links in neuem Tab. */
export function externalRel(newTab: boolean): string | undefined {
  return newTab ? 'noopener noreferrer' : 'noopener';
}
