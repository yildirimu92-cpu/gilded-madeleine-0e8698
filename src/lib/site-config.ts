/**
 * Zentrale Build-Konfiguration der Website.
 *
 * Indexierung (ADR 0005): nur aktiv, wenn Netlify-Kontext `production`
 * UND `SITE_INDEXING=true`. In allen anderen Fällen gilt `noindex`.
 */

export const FALLBACK_SITE_URL = 'https://gilded-madeleine-0e8698.netlify.app';

export type BuildEnv = Readonly<Record<string, string | undefined>>;

export function isIndexable(env: BuildEnv): boolean {
  return env.CONTEXT === 'production' && env.SITE_INDEXING === 'true';
}

export function resolveSiteUrl(env: BuildEnv): string {
  const candidate = env.SITE_URL || env.URL || FALLBACK_SITE_URL;
  const url = new URL(candidate);
  if (url.protocol !== 'https:' && url.hostname !== 'localhost') {
    throw new Error(`SITE_URL muss https verwenden: ${candidate}`);
  }
  return url.origin;
}

export const ROBOTS_NOINDEX = 'noindex, nofollow';

export function robotsTxt(): string {
  // Crawlen bleibt immer erlaubt, damit Suchmaschinen das noindex (Meta/Header) sehen.
  // Auch /prototyp/ wird bewusst nicht gesperrt, sondern ist immer noindex (ADR 0005).
  // Der Sitemap-Verweis folgt mit der Sitemap (Entwicklungsplan, PR „Rechtliches“).
  return 'User-agent: *\nAllow: /\n';
}

/** Inhalt der generierten Netlify-Datei `_headers` (nur für nicht indexierbare Builds). */
export function generatedHeaders(env: BuildEnv): string {
  if (isIndexable(env)) return '';
  return `/*\n  X-Robots-Tag: ${ROBOTS_NOINDEX}\n`;
}
