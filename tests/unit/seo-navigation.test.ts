import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  allLiveHrefs,
  footerNavigation,
  legalNavigation,
  liveDemo,
  liveGroups,
  liveItems,
  mainNavigation,
  marketingCta,
  pilotCta,
  primaryCta,
} from '../../src/config/navigation';
import { enabledLocales, localizedPath, locales } from '../../src/i18n/config';
import {
  alternateLinks,
  canonicalUrl,
  fullTitle,
  jsonLd,
  serializeJsonLd,
} from '../../src/lib/seo';

const SITE = 'https://www.example.ch';

describe('Navigation', () => {
  const all = [...mainNavigation, ...footerNavigation.flatMap((g) => g.items), ...legalNavigation];

  it('enthält die geplanten Bereiche (Funktionen, Preise, Demo, Restaurantfinder, Rechtliches)', () => {
    const ids = new Set(all.map((i) => i.id));
    for (const id of ['funktionen', 'preise', 'demo', 'bestellen', 'impressum', 'datenschutz']) {
      expect(ids.has(id), id).toBe(true);
    }
  });

  it('keine Dummy-Ziele: kein «#», keine leeren oder javascript:-Links', () => {
    for (const item of all) {
      expect(item.href, item.id).toMatch(/^\/[a-z0-9-/]*$/);
    }
  });

  it('noch keine Seite ist live – öffentlich wird nichts verlinkt, was nicht existiert', () => {
    expect(allLiveHrefs()).toEqual([]);
    expect(liveItems(mainNavigation)).toEqual([]);
    expect(liveGroups(footerNavigation)).toEqual([]);
  });

  it('CTA «Live-Demo ansehen» ausgeblendet, solange keine Demo freigegeben ist', () => {
    expect(liveDemo.url).toBeNull();
    expect(primaryCta()).toBeNull();
  });

  it('gibt den Pilot-CTA erst mit allen Freigaben in der Produktion aus', () => {
    const approved = {
      CONTEXT: 'production',
      PILOT_LEADS_ENABLED: 'true',
      PILOT_PRIVACY_APPROVED: 'true',
      PILOT_PROCESSORS_APPROVED: 'true',
      PILOT_CONTACT_APPROVED: 'true',
    };
    const action = {
      label: 'Pilotplatz unverbindlich anfragen',
      href: '/pilot/',
      external: false,
    };
    expect(pilotCta(approved, true)).toEqual(action);
    expect(marketingCta(approved, true)).toEqual(action);
    expect(pilotCta(approved, false)).toBeNull();
    expect(marketingCta(approved, false)).toBeNull();
    for (const env of [
      { ...approved, CONTEXT: 'deploy-preview' },
      { ...approved, CONTEXT: 'ci' },
      { ...approved, PILOT_LEADS_ENABLED: 'false' },
      { ...approved, PILOT_CONTACT_APPROVED: 'false' },
      { ...approved, PILOT_PRIVACY_APPROVED: 'false' },
      { ...approved, PILOT_PROCESSORS_APPROVED: 'false' },
    ]) {
      expect(pilotCta(env, true)).toBeNull();
      expect(marketingCta(env, true)).toBeNull();
    }
  });

  it('jedes live-Ziel hat eine Seite in src/pages', () => {
    const pages = new Set<string>();
    const walk = (dir: string, base = '') => {
      for (const f of readdirSync(dir)) {
        const p = join(dir, f);
        if (statSync(p).isDirectory()) walk(p, `${base}/${f}`);
        else if (f === 'index.astro') pages.add(`${base}/`);
        else if (f.endsWith('.astro')) pages.add(`${base}/${f.replace('.astro', '')}/`);
      }
    };
    walk('src/pages');
    for (const href of allLiveHrefs()) expect(pages.has(href), href).toBe(true);
  });
});

describe('Sprachen', () => {
  it('Start nur mit de-CH, FR/IT/EN vorbereitet', () => {
    expect(enabledLocales()).toEqual(['de']);
    expect(locales.fr.prefix).toBe('/fr');
    expect(localizedPath('/preise/', 'fr')).toBe('/fr/preise/');
    expect(localizedPath('/preise/', 'de')).toBe('/preise/');
  });
});

describe('SEO', () => {
  it('Titel mit Marke, ohne Doppelung', () => {
    expect(fullTitle('Preise')).toBe('Preise – IzyOrder');
    expect(fullTitle('IzyOrder – Startseite')).toBe('IzyOrder – Startseite');
  });

  it('Canonical und hreflang (de-CH + x-default)', () => {
    expect(canonicalUrl('/preise/', SITE)).toBe('https://www.example.ch/preise/');
    expect(alternateLinks('/preise/', SITE)).toEqual([
      { hreflang: 'de-CH', href: 'https://www.example.ch/preise/' },
      { hreflang: 'x-default', href: 'https://www.example.ch/preise/' },
    ]);
  });

  it('JSON-LD: WebSite, Organization (nur Marke), WebPage – keine erfundenen Angaben', () => {
    const data = jsonLd(SITE, {
      title: 'Preise – IzyOrder',
      description: 'Beschreibung',
      url: `${SITE}/preise/`,
      locale: 'de',
    });
    const graph = data['@graph'] as Record<string, unknown>[];
    expect(graph.map((n) => n['@type'])).toEqual(['WebSite', 'Organization', 'WebPage']);
    const org = graph[1]!;
    expect(org).toEqual({
      '@type': 'Organization',
      '@id': `${SITE}/#organization`,
      name: 'IzyOrder',
      url: `${SITE}/`,
      slogan: 'Dein Restaurant. Deine Bestellungen.',
    });
    const json = JSON.stringify(data);
    for (const forbidden of [
      'address',
      'telephone',
      'email',
      'logo',
      'sameAs',
      'legalName',
      'contactPoint',
      'image',
      'founder',
      'aggregateRating',
      'review',
    ]) {
      expect(json, forbidden).not.toContain(`"${forbidden}"`);
    }
  });

  it('JSON-LD wird sicher serialisiert', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>&' });
    expect(out).not.toContain('<');
    expect(out).not.toContain('>');
    expect(JSON.parse(out)).toEqual({ name: '</script><script>alert(1)</script>&' });
  });

  it('kein OG-Bild referenziert, solange kein finales Motiv existiert', () => {
    const seo = readFileSync('src/components/Seo.astro', 'utf8');
    expect(seo).not.toMatch(/og:image|twitter:image/);
  });
});
