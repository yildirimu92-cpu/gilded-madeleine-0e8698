import { describe, expect, it } from 'vitest';
import { legalNavigation } from '../../src/config/navigation';
import { robotsTxt } from '../../src/lib/site-config';
import { sitemapPaths, sitemapXml } from '../../src/lib/sitemap';

const LIVE_ENV = {
  CONTEXT: 'production',
  SITE_INDEXING: 'true',
  SITE_URL: 'https://www.example.ch',
};

describe('Sitemap – Veröffentlichungsfreigabe', () => {
  it('erzeugt vor Launch und auf Preview-Branches keine Sitemap', () => {
    expect(sitemapXml({})).toBeNull();
    expect(sitemapXml({ CONTEXT: 'production' })).toBeNull();
    expect(sitemapXml({ SITE_INDEXING: 'true' })).toBeNull();
    expect(
      sitemapXml({ CONTEXT: 'deploy-preview', SITE_INDEXING: 'true' }),
    ).toBeNull();
  });

  it('enthält nur freigegebene öffentliche Ziele', () => {
    expect(sitemapPaths()).toEqual(['/']);
    const xml = sitemapXml(LIVE_ENV);
    expect(xml).not.toBeNull();
    expect(xml).toContain('<loc>https://www.example.ch/</loc>');
    expect(xml).not.toMatch(/\/intern\/|\/styleguide\/|\/prototyp\/|\/404\//);
    expect(xml).not.toMatch(/\/preise\/|\/funktionen\/|\/impressum\/|\/datenschutz\//);
    expect((xml?.match(/<url>/g) ?? []).length).toBe(1);
  });

  it('verweist erst nach Launch in robots.txt auf die Sitemap', () => {
    expect(robotsTxt()).toBe('User-agent: *\nAllow: /\n');
    expect(robotsTxt(LIVE_ENV)).toContain(
      'Sitemap: https://www.example.ch/sitemap.xml',
    );
    expect(robotsTxt({ CONTEXT: 'deploy-preview', SITE_INDEXING: 'true' })).not.toContain(
      'Sitemap:',
    );
  });

  it('rechtliche Navigation bleibt geplant und nicht öffentlich verlinkt', () => {
    expect(legalNavigation.map((item) => [item.id, item.status])).toEqual([
      ['impressum', 'planned'],
      ['datenschutz', 'planned'],
    ]);
  });
});
