import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { parse } from 'smol-toml';
import { describe, expect, it } from 'vitest';

type HeaderRule = { for: string; values: Record<string, string> };
type NetlifyConfig = {
  build: { command: string; publish: string; environment?: Record<string, string> };
  headers: HeaderRule[];
  redirects: { from: string; to: string; status: number }[];
};

const config = parse(readFileSync('netlify.toml', 'utf8')) as unknown as NetlifyConfig;
const rule = (path: string) => config.headers.find((h) => h.for === path)?.values ?? {};

describe('netlify.toml', () => {
  it('baut mit Astro nach dist/', () => {
    expect(config.build.command).toBe('npm run build');
    expect(config.build.publish).toBe('dist');
    expect(config.build.environment?.NODE_VERSION).toBe('22');
  });

  it('setzt SITE_INDEXING nicht im Repository (ADR 0005)', () => {
    expect(readFileSync('netlify.toml', 'utf8')).not.toMatch(/^\s*SITE_INDEXING\s*=/m);
  });

  it('HSTS ohne includeSubDomains/preload (Isolationsregel R4)', () => {
    const hsts = rule('/*')['Strict-Transport-Security'];
    expect(hsts).toMatch(/max-age=\d{8,}/);
    expect(hsts).not.toMatch(/includeSubDomains|preload/i);
  });

  it('setzt die Basis-Security-Header für alle Pfade', () => {
    const all = rule('/*');
    expect(all['X-Content-Type-Options']).toBe('nosniff');
    expect(all['X-Frame-Options']).toBe('DENY');
    expect(all['Referrer-Policy']).toBe('strict-origin-when-cross-origin');
    expect(all['Cross-Origin-Opener-Policy']).toBe('same-origin');
    expect(all['Permissions-Policy']).toContain('camera=()');
    expect(all['Content-Security-Policy']).toContain("frame-ancestors 'none'");
    // Die globale Policy darf Skripte/Styles nicht einschränken, sonst bricht der Prototyp.
    expect(all['Content-Security-Policy']).not.toMatch(/(default|script|style)-src/);
  });

  it('lockert die CSP nur für /prototyp/* und hält ihn noindex', () => {
    const proto = rule('/prototyp/*');
    expect(proto['Content-Security-Policy']).toContain("script-src 'unsafe-inline'");
    expect(proto['Content-Security-Policy']).toContain("connect-src 'none'");
    expect(proto['X-Robots-Tag']).toContain('noindex');
    const unsafeRules = config.headers.filter((h) =>
      h.values['Content-Security-Policy']?.includes('unsafe-inline'),
    );
    expect(unsafeRules.map((h) => h.for)).toEqual(['/prototyp/*']);
  });

  it('cached gehashte Build-Assets und versionierte Schriften langfristig', () => {
    expect(rule('/_astro/*')['Cache-Control']).toContain('immutable');
    expect(rule('/fonts/*')['Cache-Control']).toContain('immutable');
  });

  it('hält interne Seiten und Styleguide immer noindex', () => {
    expect(rule('/intern/*')['X-Robots-Tag']).toBe('noindex, nofollow');
    expect(rule('/styleguide/*')['X-Robots-Tag']).toBe('noindex, nofollow');
  });

  it('leitet /prototyp auf /prototyp/ weiter', () => {
    expect(config.redirects).toContainEqual({ from: '/prototyp', to: '/prototyp/', status: 301 });
  });
});

describe('Prototyp', () => {
  it('ist byte-identisch zum Original (Commit 74fae4f)', () => {
    const hash = createHash('sha256')
      .update(readFileSync('public/prototyp/index.html'))
      .digest('hex');
    expect(hash).toBe('4146c78defdcbd87d5d038df4dd6b3434b0beba9ea0224ec7ae83b2fdaa942e2');
  });
});
