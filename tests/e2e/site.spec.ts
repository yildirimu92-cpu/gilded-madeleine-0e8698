import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll, trackProblems } from './helpers';

test.describe('Startseite (Platzhalter)', () => {
  test('rendert Inhalt, Marke und Metadaten', async ({ page }) => {
    const problems = await trackProblems(page);
    const response = await page.goto('/');
    expect(response?.status()).toBe(200);

    await expect(page.locator('html')).toHaveAttribute('lang', 'de-CH');
    await expect(page).toHaveTitle(/IzyOrder/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByRole('banner').getByRole('link', { name: /IzyOrder/ })).toBeVisible();
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\//);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);

    expect(await problems()).toEqual([]);
  });

  test('ist nicht indexierbar (Meta und Header)', async ({ page }) => {
    const response = await page.goto('/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
  });

  test('liefert Security-Header und strikte CSP', async ({ page }) => {
    const response = await page.goto('/');
    const headers = response?.headers() ?? {};
    expect(headers['strict-transport-security']).toBe('max-age=31536000');
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");

    const metaCsp = await page
      .locator('meta[http-equiv="content-security-policy"]')
      .getAttribute('content');
    expect(metaCsp).toContain("default-src 'self'");
    expect(metaCsp).not.toContain('unsafe-inline');
    expect(metaCsp).not.toContain('unsafe-eval');
  });

  test('erfüllt WCAG 2.2 AA (axe) und scrollt nicht horizontal', async ({ page }) => {
    await page.goto('/');
    await expectNoA11yViolations(page);
    await expectNoHorizontalScroll(page);
  });

  test('Skip-Link führt zum Hauptinhalt', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Tastaturbedienung nur auf Desktop geprüft');
    await page.goto('/');
    await page.keyboard.press('Tab');
    const skip = page.getByRole('link', { name: 'Zum Inhalt springen' });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press('Enter');
    await expect(page.locator('#inhalt')).toBeFocused();
  });
});

test.describe('Fehlerseite und robots.txt', () => {
  test('unbekannte URL liefert 404 mit noindex', async ({ page }) => {
    const problems = await trackProblems(page);
    const response = await page.goto('/gibt-es-nicht');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Seite nicht gefunden');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    await expectNoA11yViolations(page);
    expect(await problems()).toEqual([]);
  });

  test('robots.txt erlaubt Crawling (noindex bleibt sichtbar)', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();
    expect(body).toContain('User-agent: *');
    expect(body).not.toContain('Sitemap:');
  });
});
