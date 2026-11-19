import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll, trackProblems } from './helpers';

test.describe('PR9: Demo- und Pilotseiten bleiben bis zur Freigabe inaktiv', () => {
  test('Pilotseite hat keinen aktiven Formversand und keine aktive Datenschutzerklärung', async ({
    page,
  }) => {
    const response = await page.goto('/pilot/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText(
      'Gestalten Sie den nächsten Schritt mit.',
    );
    await expect(page.getByText(/Pilotanfragen sind noch nicht geöffnet/)).toBeVisible();
    await expect(page.locator('form')).toHaveCount(0);
    await expect(page.locator('[data-netlify]')).toHaveCount(0);
    await expect(page.locator('input[name="form-name"]')).toHaveCount(0);
    await expect(page.locator('a[href="/datenschutz/"]')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
  });

  test('Demoseite zeigt erst nach Freigabe einen Demo-Link', async ({ page }) => {
    const response = await page.goto('/demo/');
    expect(response?.status()).toBe(200);
    await expect(page.getByText(/Die Demo ist noch nicht freigegeben/)).toBeVisible();
    await expect(page.locator('a[href^="https://"]')).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });

  test('Formvorschau darf ohne JavaScript unter keinen Umständen Daten versenden', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: 'http://localhost:4173',
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    const posts: string[] = [];
    page.on('request', (request) => {
      if (request.method() === 'POST') posts.push(request.url());
    });
    const response = await page.goto('/intern/pilot/');
    expect(response?.status()).toBe(200);
    const form = page.locator('form');
    await expect(form).toHaveAttribute('method', 'dialog');
    await expect(form).not.toHaveAttribute('action');
    await expect(form).not.toHaveAttribute('data-netlify');
    await expect(page.locator('input[name="form-name"]')).toHaveCount(0);

    await page.locator('input[name="kontakt_name"]').fill('Test Person');
    await page.locator('input[name="betrieb_name"]').fill('Fiktives Testrestaurant');
    await page.locator('input[name="email"]').fill('test@example.invalid');
    await page.locator('input[name="ort"]').fill('Luzern');
    await page.locator('select[name="betriebsart"]').selectOption('takeaway');
    await expect(page.getByRole('button', { name: 'Anfrage noch nicht verfügbar' })).toBeDisabled();
    await page.locator('input[name="email"]').press('Enter');
    expect(posts).toEqual([]);
    await expect(page).toHaveURL(/\/intern\/pilot\/?$/);
    await context.close();
  });

  test('öffentliche Navigation enthält vor Freigabe keine Demo- oder Pilot-CTA', async ({
    page,
  }) => {
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Pilotplatz anfragen' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Live-Demo ansehen' })).toHaveCount(0);
    await expect(page.locator('a[href="/pilot/"], a[href="/demo/"]')).toHaveCount(0);
  });

  for (const path of ['/intern/pilot/', '/pilot/', '/demo/', '/pilot/danke/']) {
    test(`${path}: zugänglich und ohne horizontales Scrollen`, async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 820 });
      const errors = await trackProblems(page);
      await page.goto(path);
      await expectNoHorizontalScroll(page);
      await expectNoA11yViolations(page);
      expect(await errors()).toEqual([]);
    });
  }
});
