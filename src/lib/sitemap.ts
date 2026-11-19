/**
 * Sitemap: nur ausdrücklich indexierbare Produktionsbuilds und freigegebene Seiten.
 * Geplante Navigationseinträge, Prototyp und interne Testseiten bleiben ausgeschlossen.
 * Keine Sitemap auf Branch-Deploys und vor der Launch-Freigabe (ADR 0005).
 */
import { allLiveHrefs } from '../config/navigation';
import { isIndexable, resolveSiteUrl, type BuildEnv } from './site-config';

const PRIVATE_PREFIXES = ['/intern/', '/styleguide/', '/prototyp/'];
const PRIVATE_ROUTES = new Set(['/404/', '/sitemap.xml', '/robots.txt']);

export function sitemapPaths(): string[] {
  const candidates = ['/', ...allLiveHrefs()];
  return [...new Set(candidates)]
    .filter((path) => path.startsWith('/') && !path.startsWith('//'))
    .filter((path) => !PRIVATE_ROUTES.has(path))
    .filter((path) => !PRIVATE_PREFIXES.some((prefix) => path.startsWith(prefix)))
    .sort();
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** null bedeutet: keine Sitemap erzeugen (Indexierung nicht freigegeben). */
export function sitemapXml(env: BuildEnv): string | null {
  if (!isIndexable(env)) return null;
  const site = resolveSiteUrl(env);
  const entries = sitemapPaths()
    .map((path) => `  <url><loc>${escapeXml(new URL(path, site).href)}</loc></url>`)
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
}
