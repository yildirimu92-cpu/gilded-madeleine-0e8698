import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  allColors,
  approvedPairs,
  brandColors,
  forbiddenTextPairs,
  hexOf,
} from '../../src/design/palette';
import { contrastRatio } from '../../src/lib/contrast';

const tokensCss = readFileSync('src/styles/tokens.css', 'utf8');

function cssVar(name: string, css = tokensCss): string | undefined {
  return new RegExp(`--${name}:\\s*([^;]+);`).exec(css)?.[1]?.trim();
}

describe('Markenfarben (verbindlich)', () => {
  it('entsprechen exakt der Freigabe', () => {
    expect(Object.fromEntries(brandColors.map((c) => [c.token, c.hex]))).toEqual({
      'forest-950': '#0F2E22',
      'forest-800': '#1A4D3A',
      'forest-600': '#1E6B4F',
      'mint-300': '#9FE3C6',
      'mint-100': '#E3F6EE',
      'sand-50': '#F7F4EE',
      'sand-100': '#EFEAE1',
      'sand-200': '#E4DDD0',
      'sand-300': '#CFC6B6',
      'stone-600': '#5C625E',
    });
  });

  it.each(allColors.map((c) => [c.token, c.hex]))('tokens.css --%s = %s', (token, hex) => {
    expect(cssVar(token)?.toLowerCase()).toBe(hex.toLowerCase());
  });
});

describe('Kontraste (WCAG 2.2 AA)', () => {
  it.each(approvedPairs.map((p) => [p.use, p.fg, p.bg, p.min] as const))(
    '%s: %s auf %s ≥ %s:1',
    (_use, fg, bg, min) => {
      expect(contrastRatio(hexOf(fg), hexOf(bg))).toBeGreaterThanOrEqual(min);
    },
  );

  it.each(forbiddenTextPairs.map((p) => [p.fg, p.bg] as const))(
    'unzulässig als Text: %s auf %s (< 4.5:1)',
    (fg, bg) => {
      expect(contrastRatio(hexOf(fg), hexOf(bg))).toBeLessThan(4.5);
    },
  );
});

describe('Semantische Tokens', () => {
  const rootBlock = tokensCss.slice(
    tokensCss.indexOf(':root {'),
    tokensCss.indexOf('.surface-inverse'),
  );

  it('Text- und Linkfarben auf Hell verwenden nie Mint', () => {
    for (const name of [
      'color-text',
      'color-text-muted',
      'color-heading',
      'color-link',
      'color-link-hover',
      'color-focus',
    ]) {
      expect(cssVar(name, rootBlock), name).not.toMatch(/mint/);
    }
  });

  it('definiert Text, Hintergrund, Oberflächen, Rahmen, Fokus und Status', () => {
    for (const name of [
      'color-bg',
      'color-surface',
      'color-surface-inverse',
      'color-text',
      'color-text-muted',
      'color-border',
      'color-border-control',
      'color-focus',
      'color-success',
      'color-success-bg',
      'color-warning',
      'color-warning-bg',
      'color-error',
      'color-error-bg',
    ]) {
      expect(cssVar(name, rootBlock), name).toBeTruthy();
    }
  });

  it('Inverse Fläche stellt Text, Links und Fokus auf helle Werte um', () => {
    const inverse = tokensCss.slice(tokensCss.indexOf('.surface-inverse'));
    expect(cssVar('color-text', inverse)).toBe('var(--sand-50)');
    expect(cssVar('color-link', inverse)).toBe('var(--mint-300)');
    expect(cssVar('color-focus', inverse)).toBe('var(--mint-300)');
  });

  it('schaltet Bewegung bei prefers-reduced-motion ab', () => {
    const reduced = tokensCss.slice(tokensCss.indexOf('prefers-reduced-motion: reduce'));
    for (const d of ['duration-instant', 'duration-fast', 'duration-base', 'duration-slow']) {
      expect(cssVar(d, reduced)).toBe('0ms');
    }
  });

  it('komponentenseitig keine Primitive für Textfarben auf Hell (ausser Designvorschau)', () => {
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = `${dir}/${entry.name}`;
        if (entry.isDirectory()) walk(path);
        else if (/\.(astro|css)$/.test(entry.name) && !path.includes('/intern/')) {
          const src = readFileSync(path, 'utf8');
          if (/(?<!-)color:\s*var\(--mint-(300|100)\)/.test(src)) offenders.push(path);
        }
      }
    };
    walk('src');
    expect(offenders).toEqual([]);
  });
});

describe('Schrift Inter (selbst gehostet)', () => {
  const dir = 'public/fonts/inter/v20';

  it('liegt mit OFL-Lizenz im Repository', () => {
    expect(existsSync(`${dir}/OFL.txt`)).toBe(true);
    expect(readFileSync(`${dir}/OFL.txt`, 'utf8')).toContain('SIL OPEN FONT LICENSE Version 1.1');
    for (const f of [
      'inter-latin-opsz-normal.woff2',
      'inter-latin-ext-opsz-normal.woff2',
      'inter-latin-opsz-italic.woff2',
      'inter-latin-ext-opsz-italic.woff2',
    ]) {
      const bytes = readFileSync(`${dir}/${f}`);
      expect(bytes.subarray(0, 4).toString('latin1'), f).toBe('wOF2');
    }
  });

  it('@font-face verweist nur auf eigene Dateien (keine Google Fonts)', () => {
    const fonts = readFileSync('src/styles/fonts.css', 'utf8');
    const urls = [...fonts.matchAll(/url\('([^']+)'\)/g)].map((m) => m[1]);
    expect(urls.length).toBe(4);
    for (const u of urls) {
      expect(u).toMatch(/^\/fonts\/inter\/v20\/[\w-]+\.woff2$/);
      expect(existsSync(`public${u}`)).toBe(true);
    }
  });

  it('nirgends im Quellcode Google-Fonts-Anfragen', () => {
    const hits: string[] = [];
    const walk = (d: string) => {
      for (const e of readdirSync(d, { withFileTypes: true })) {
        const p = `${d}/${e.name}`;
        if (e.isDirectory()) walk(p);
        else if (/googleapis|gstatic/.test(readFileSync(p, 'utf8'))) hits.push(p);
      }
    };
    walk('src');
    expect(hits).toEqual([]);
  });
});
