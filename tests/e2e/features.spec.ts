import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll, trackProblems } from './helpers';

const details = [
  { path: '/funktionen/online-bestellshop/', title: 'Ihre Speisekarte. Ihr Online-Shop.' },
  { path: '/funktionen/abholung-lieferung/', title: 'Flexibel für Ihre Küche und Ihre Gäste.' },
  { path: '/funktionen/bestellverwaltung/', title: 'Neue Bestellungen. Ein klarer Überblick.' },
] as const;

test.describe('PR10 – B2B-Funktionsseiten, noch nicht freigegeben', () => {
  test('die Übersicht verlinkt nur existierende Funktionsseiten', async ({ page, request }) => {
    const response = await page.goto('/funktionen/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ein Bestellkanal');
    await expect(page.getByText('KI-Telefonassistenz')).toBeVisible();
    await expect(page.getByText(/optionale Erweiterung/)).toBeVisible();

    for (const detail of details) {
      const link = page.locator(`a[href="${detail.path}"]`);
      await expect(link).toHaveCount(1);
      const target = await request.get(detail.path);
      expect(target.status()).toBe(200);
    }

    await expect(page.locator('a[href="/pilot/"], a[href="/demo/"]')).toHaveCount(0);
  });

  for (const detail of details) {
    test(`${detail.path}: deklarierte Konzeptseite ohne Live-Versprechen`, async ({ page }) => {
      const response = await page.goto(detail.path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(detail.title);
      await expect(
        page.getByText('Illustration · keine freigegebene Produktoberfläche'),
      ).toBeVisible();
      await expect(page.getByText('Noch vor dem Marktstart.')).toBeVisible();
      await expect(page.getByRole('link', { name: /Zur Funktionsübersicht/ })).toHaveAttribute(
        'href',
        '/funktionen/',
      );
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow',
      );
      expect(response?.headers()['x-robots-tag']).toContain('noindex');
      await expect(page.locator('form, iframe')).toHaveCount(0);
    });
  }

  test('SEO bleibt aus, Navigation ist bis zur Freigabe unverändert', async ({ page }) => {
    const response = await page.goto('/funktionen/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de-CH');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
    await page.goto('/');
    await expect(page.locator('header a[href="/funktionen/"]')).toHaveCount(0);
    await expect(page.locator('footer a[href="/funktionen/"]')).toHaveCount(0);
  });

  for (const path of ['/funktionen/', ...details.map((detail) => detail.path)]) {
    for (const width of [375, 768, 1440]) {
      test(`${path} bei ${width} px: zugänglich, kein Overflow`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 900 });
        const problems = await trackProblems(page);
        await page.goto(path);
        await expectNoHorizontalScroll(page);
        await expectNoA11yViolations(page);
        expect(await problems()).toEqual([]);
        if (testInfo.project.name === 'desktop' && width !== 768) {
          const pageId = path === '/funktionen/' ? 'overview' : path.split('/')[2];
          await page.screenshot({
            path: testInfo.outputPath(`feature-${pageId}-${width}px.png`),
            fullPage: true,
            animations: 'disabled',
          });
        }
      });
    }
  }
});
