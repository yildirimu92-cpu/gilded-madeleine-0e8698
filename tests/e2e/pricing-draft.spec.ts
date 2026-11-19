import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll } from './helpers';

test.describe('Interne IzyOrder-Preisvorschau', () => {
  test('zeigt drei Tarife und kennzeichnet die Konditionen als nicht freigegeben', async ({
    page,
  }) => {
    const response = await page.goto('/intern/preise/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Einfach kalkuliert. Für Wachstum gedacht.',
    );
    for (const name of ['Starter', 'Professional', 'Business']) {
      await expect(page.getByRole('heading', { name })).toBeVisible();
    }
    for (const price of ['CHF 79', 'CHF 149', 'CHF 249']) {
      await expect(page.getByText(new RegExp(price))).toBeVisible();
    }
    await expect(page.getByText(/Interner Entwurf/)).toBeVisible();
    await expect(page.getByText(/Jahresrabatt.*noch nicht freigegeben/)).toBeVisible();
    await expect(page.getByText(/Externe Zahlungsgebühren/)).toBeVisible();
    await expect(page.getByRole('link', { name: /Jetzt kaufen|Buchen|Bestellen/ })).toHaveCount(0);
  });

  test('bleibt dauerhaft noindex und unverlinkt', async ({ page }) => {
    const response = await page.goto('/intern/preise/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
    await page.goto('/');
    await expect(page.locator('a[href="/intern/preise/"]')).toHaveCount(0);
    await expect(page.locator('a[href="/preise/"]')).toHaveCount(0);
  });

  for (const width of [375, 768, 1440]) {
    test(`bei ${width} px: lesbar und zugänglich`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/intern/preise/');
      await expectNoHorizontalScroll(page);
      await expectNoA11yViolations(page);
    });
  }
});
