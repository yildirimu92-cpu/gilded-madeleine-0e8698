import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll, trackProblems } from './helpers';

const PAGE = '/intern/design/';

for (const width of [375, 768, 1440]) {
  test.describe(`Designvorschau bei ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('rendert ohne CSP-Verstösse, ohne horizontales Scrollen, barrierefrei', async ({
      page,
    }) => {
      const problems = await trackProblems(page);
      const response = await page.goto(PAGE);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 2, name: 'Farben' })).toBeVisible();
      await expectNoHorizontalScroll(page);
      await expectNoA11yViolations(page);
      expect(await problems()).toEqual([]);
    });
  });
}

test.describe('Designvorschau', () => {
  test('ist nie indexierbar (Meta und Header)', async ({ page }) => {
    const response = await page.goto(PAGE);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  });

  test('lädt Inter ausschliesslich selbst gehostet', async ({ page }) => {
    const fontRequests: string[] = [];
    page.on('request', (r) => {
      if (r.resourceType() === 'font' || /fonts\.(googleapis|gstatic)/.test(r.url())) {
        fontRequests.push(
          new URL(r.url()).pathname +
            (new URL(r.url()).host.includes('localhost') ? '' : ' EXTERN'),
        );
      }
    });
    await page.goto(PAGE);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.fonts.check('600 16px Inter'))).toBe(true);
    const family = await page.locator('body').evaluate((el) => getComputedStyle(el).fontFamily);
    expect(family.startsWith('Inter')).toBe(true);
    expect(fontRequests.length).toBeGreaterThan(0);
    for (const r of fontRequests) expect(r).toMatch(/^\/fonts\/inter\/v20\/[\w-]+\.woff2$/);
  });

  test('zeigt die Marke korrekt und kein finales Logo-Asset', async ({ page }) => {
    await page.goto(PAGE);
    const marks = page.locator('.wordmark');
    expect(await marks.count()).toBeGreaterThan(3);
    for (const text of await marks.allTextContents()) expect(text).toBe('IzyOrder');
    await expect(page.locator('[data-logo-status="final"]')).toHaveCount(0);
    await expect(page.getByText('Integrationspunkt Logo – ausstehend')).toBeVisible();
  });

  test('Preise nutzen tabellarische Ziffern und Schweizer Format', async ({ page }) => {
    await page.goto(PAGE);
    const price = page.locator('.price').first();
    expect(await price.evaluate((el) => getComputedStyle(el).fontVariantNumeric)).toContain(
      'tabular-nums',
    );
    await expect(page.locator('.price', { hasText: 'CHF 1’249.50' })).toHaveCount(1);
  });

  test('Fokusring ist bei Tastaturbedienung sichtbar', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Tastaturbedienung nur auf Desktop');
    await page.goto(PAGE);
    const button = page.getByRole('button', { name: 'Interaktiv testen' }).first();
    await button.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(button).toBeFocused();
    const outline = await button.evaluate((el) => {
      const s = getComputedStyle(el);
      return { style: s.outlineStyle, width: parseFloat(s.outlineWidth), color: s.outlineColor };
    });
    expect(outline.style).toBe('solid');
    expect(outline.width).toBeGreaterThanOrEqual(2);
    expect(outline.color).toBe('rgb(30, 107, 79)');
  });

  test('respektiert prefers-reduced-motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(PAGE);
    await expect(page.getByText('Reduzierte Bewegung: aktiv', { exact: true })).toBeVisible();
    await expect(page.getByText('Reduzierte Bewegung: nicht aktiv')).toBeHidden();
    const duration = await page
      .locator('.ds-lift')
      .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
    expect(duration).toBeLessThanOrEqual(0.0001);

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect(page.getByText('Reduzierte Bewegung: nicht aktiv')).toBeVisible();
    const normal = await page
      .locator('.ds-lift')
      .evaluate((el) => parseFloat(getComputedStyle(el).transitionDuration));
    expect(normal).toBeGreaterThan(0.1);
  });
});
