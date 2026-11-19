import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll, trackProblems } from './helpers';

test.describe('PR11 – interaktiver Provisionsrechner', () => {
  test('zeigt das ehrliche Beispiel mit Gebühren und Begrenzungen', async ({ page }) => {
    const response = await page.goto('/provisionsrechner/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Weniger Provision? Rechnen Sie selbst.',
    );
    await expect(page.locator('[data-calc-monthly]')).toHaveText('CHF 129.40');
    await expect(page.locator('[data-calc-annual]')).toHaveText('CHF 1’552.80');
    await expect(page.locator('[data-calc-orders]')).toHaveText('60');
    await expect(page.locator('[data-calc-payment]')).toContainText('CHF 63.60');
    await expect(page.locator('[data-calc-subscription]')).toContainText('CHF 149');
    await expect(page.locator('[data-calc-break-even]')).toContainText('Ab 33');
    await expect(page.getByText(/keine verifizierten Anbieterpreise/)).toBeVisible();
    await expect(page.getByText(/Keine.*Prognose|keine.*prognose/i).first()).toBeVisible();
  });

  test('berechnet neue Eingaben sofort und kann sie zurücksetzen', async ({ page }) => {
    await page.goto('/provisionsrechner/');
    await page.locator('[data-field="redirectedPercent"]').fill('0');
    await expect(page.locator('[data-calc-monthly]')).toHaveText('CHF 149.–');
    await expect(page.locator('[data-calc-result-label]')).toContainText('Mehrkosten');
    await expect(page.locator('[data-calc-orders]')).toHaveText('0');

    await page.locator('[data-field="redirectedPercent"]').fill('30');
    await page.locator('[data-field="planId"]').selectOption('starter');
    await expect(page.locator('[data-calc-monthly]')).toHaveText('CHF 199.40');
    await expect(page.locator('[data-calc-subscription]')).toContainText('CHF 79.–');

    await page.getByRole('button', { name: 'Zurücksetzen' }).click();
    await expect(page.locator('[data-calc-monthly]')).toHaveText('CHF 129.40');
    await expect(page.locator('[data-field="planId"]')).toHaveValue('professional');
  });

  test('erklärt negative Ergebnisse, wenn angenommene Plattformprovision null ist', async ({
    page,
  }) => {
    await page.goto('/provisionsrechner/');
    await page.locator('[data-field="marketplaceCommissionPercent"]').fill('0');
    await expect(page.locator('[data-calc-monthly]')).toHaveText('CHF 212.60');
    await expect(page.locator('[data-calc-result-label]')).toContainText('Mehrkosten');
    await expect(page.locator('[data-calc-break-even]')).toContainText('nicht erreichbar');
  });

  test('zeigt Fehler bei ungültigen Eingaben statt erfundener Ergebnisse', async ({ page }) => {
    await page.goto('/provisionsrechner/');
    const basket = page.locator('[data-field="averageBasketCHF"]');
    await basket.fill('');
    await expect(page.locator('[data-calc-error]')).toBeVisible();
    await expect(page.locator('[data-calc-monthly]')).toHaveText('CHF 129.40');
    await basket.fill('38');
    await expect(page.locator('[data-calc-error]')).toBeHidden();
  });

  test('läuft ohne JS als unveränderte Beispielrechnung und ohne Netzwerk-Formular', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      baseURL: 'http://localhost:4173',
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto('/provisionsrechner/');
    await expect(page.locator('[data-calc-monthly]')).toHaveText('CHF 129.40');
    await expect(
      page.getByText(/Ohne JavaScript wird das unveränderte Rechenbeispiel/),
    ).toBeVisible();
    await expect(page.locator('form, iframe')).toHaveCount(0);
    await context.close();
  });

  test('ist unindexiert, nicht in Navigation und übermittelt keine Eingaben', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET') requests.push(`${request.method()} ${request.url()}`);
    });
    const response = await page.goto('/provisionsrechner/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
    await page.locator('[data-field="averageBasketCHF"]').fill('42');
    await expect(page.locator('[data-calc-monthly]')).not.toHaveText('CHF 129.40');
    expect(requests).toEqual([]);
    await page.goto('/');
    await expect(page.locator('a[href="/provisionsrechner/"]')).toHaveCount(0);
  });

  for (const width of [375, 768, 1440]) {
    test(`bei ${width} px: kein Overflow, keine Accessibility- oder CSP-Verstösse`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const problems = await trackProblems(page);
      await page.goto('/provisionsrechner/');
      await expectNoHorizontalScroll(page);
      await expectNoA11yViolations(page);
      expect(await problems()).toEqual([]);
      if (testInfo.project.name === 'desktop') {
        await page.screenshot({
          path: testInfo.outputPath(`commission-calculator-${width}px.png`),
          fullPage: true,
          animations: 'disabled',
        });
      }
    });
  }
});
