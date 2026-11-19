/**
 * SEO-Hilfsfunktionen (rein, testbar). Grundsatz: nur belegbare Angaben.
 * Keine Firmenangaben (Rechtsform, Adresse, Telefon), kein Logo und keine Profile,
 * solange diese nicht freigegeben sind; kein OG-Bild bis zum finalen Motiv.
 */
import { brand } from '../config/brand';
import { defaultLocale, enabledLocales, localizedPath, locales, type Locale } from '../i18n/config';

export function fullTitle(title: string): string {
  return title.includes(brand.name) ? title : `${title} – ${brand.name}`;
}

export function canonicalUrl(pathname: string, site: string): string {
  return new URL(pathname, site).href;
}

/** hreflang-Alternativen aller aktiven Sprachen plus x-default (Standardsprache). */
export function alternateLinks(
  pathnameWithoutLocale: string,
  site: string,
): { hreflang: string; href: string }[] {
  const links: { hreflang: string; href: string }[] = enabledLocales().map((l) => ({
    hreflang: locales[l].lang,
    href: canonicalUrl(localizedPath(pathnameWithoutLocale, l), site),
  }));
  links.push({
    hreflang: 'x-default',
    href: canonicalUrl(localizedPath(pathnameWithoutLocale, defaultLocale), site),
  });
  return links;
}

export interface PageMeta {
  title: string;
  description: string;
  url: string;
  locale: Locale;
}

/** Strukturierte Daten: WebSite, Organization (nur Marke), WebPage. */
export function jsonLd(site: string, page: PageMeta): Record<string, unknown> {
  const root = new URL('/', site).href;
  const lang = locales[page.locale].lang;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${root}#website`,
        url: root,
        name: brand.name,
        inLanguage: lang,
        publisher: { '@id': `${root}#organization` },
      },
      {
        '@type': 'Organization',
        '@id': `${root}#organization`,
        name: brand.name,
        url: root,
        slogan: brand.claim,
      },
      {
        '@type': 'WebPage',
        '@id': `${page.url}#webpage`,
        url: page.url,
        name: page.title,
        description: page.description,
        inLanguage: lang,
        isPartOf: { '@id': `${root}#website` },
      },
    ],
  };
}

/** Sicher in <script type="application/ld+json"> einbettbar (kein </script>-Ausbruch). */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026');
}
