import { describe, expect, it } from 'vitest';
import {
  FALLBACK_SITE_URL,
  generatedHeaders,
  isIndexable,
  resolveSiteUrl,
  robotsTxt,
} from '../../src/lib/site-config';

describe('isIndexable (ADR 0005)', () => {
  it.each([
    [{}, false],
    [{ CONTEXT: 'production' }, false],
    [{ SITE_INDEXING: 'true' }, false],
    [{ CONTEXT: 'deploy-preview', SITE_INDEXING: 'true' }, false],
    [{ CONTEXT: 'branch-deploy', SITE_INDEXING: 'true' }, false],
    [{ CONTEXT: 'production', SITE_INDEXING: '1' }, false],
    [{ CONTEXT: 'production', SITE_INDEXING: 'TRUE' }, false],
    [{ CONTEXT: 'production', SITE_INDEXING: 'true' }, true],
  ])('%j → %s', (env, expected) => {
    expect(isIndexable(env)).toBe(expected);
  });
});

describe('resolveSiteUrl', () => {
  it('nutzt SITE_URL vor URL und Fallback', () => {
    expect(resolveSiteUrl({ SITE_URL: 'https://a.example/', URL: 'https://b.example' })).toBe(
      'https://a.example',
    );
    expect(resolveSiteUrl({ URL: 'https://b.example' })).toBe('https://b.example');
    expect(resolveSiteUrl({})).toBe(FALLBACK_SITE_URL);
  });

  it('lehnt http ausserhalb von localhost ab', () => {
    expect(() => resolveSiteUrl({ SITE_URL: 'http://example.ch' })).toThrow();
    expect(resolveSiteUrl({ SITE_URL: 'http://localhost:4321' })).toBe('http://localhost:4321');
  });
});

describe('robots.txt und _headers', () => {
  it('Vorschau: robots.txt erlaubt Crawling, X-Robots-Tag noindex', () => {
    expect(robotsTxt()).toBe('User-agent: *\nAllow: /\n');
    expect(generatedHeaders({})).toContain('X-Robots-Tag: noindex, nofollow');
  });

  it('Freigegebene Produktion: kein X-Robots-Tag', () => {
    const env = { CONTEXT: 'production', SITE_INDEXING: 'true', URL: 'https://www.example.ch' };
    expect(generatedHeaders(env)).toBe('');
  });
});
