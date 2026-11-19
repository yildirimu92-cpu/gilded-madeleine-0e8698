import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll, trackProblems } from './helpers';

test.describe('PR15 – Premium-Tarifstudie ohne Verkaufsfreigabe', () => {
  test('zeigt die geplanten Tarife mit Schweizer Preisformatierung', async ({ page }) => {
    const response = await page.goto('/intern/preise/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Einfach kalkuliert.');
    await expect(page.locator('[data-pricing-amount]')).toHaveText([
      'CHF 79.–',
      'CHF 149.–',
      'CHF 249.–',
    ]);
    await expect(page.getByText('Interner Entwurf')).toBeVisible();
    await expect(page.getByText('Keine öffentliche Offerte')).toBeVisible();
    await expect(page.getByText(/15 % Jahresrabatt – noch nicht freigegeben/)).toBeVisible();
    await expect(page.getByText(/tarifabhängige Funktionen.*noch offen/i).first()).toBeVisible();
    await expect(page.getByText('Noch nicht buchbar')).toHaveCount(3);
    await expect(page.locator('form, iframe')).toHaveCount(0);
  });

  test('wechselt ohne Seitenaufruf zwischen Monats- und Jahresmodell', async ({ page }) => {
    await page.goto('/intern/preise/');
    await page.getByRole('radio', { name: 'Jährlich' }).check();
    await expect(page.locator('[data-pricing-amount]')).toHaveText([
      'CHF 67.15',
      'CHF 126.65',
      'CHF 211.65',
    ]);
    await expect(page.locator('[data-pricing-period]').first()).toContainText(
      'Monatsdurchschnitt bei jährlicher Zahlung',
    );
    await expect(page.getByText('CHF 805.80')).toBeVisible();
    await expect(page.getByText('CHF 1’519.80')).toBeVisible();
    await expect(page.getByText('CHF 2’539.80')).toBeVisible();
    await page.getByRole('radio', { name: 'Monatlich' }).check();
    await expect(page.locator('[data-pricing-amount]')).toHaveText([
      'CHF 79.–',
      'CHF 149.–',
      'CHF 249.–',
    ]);
  });

  test('funktioniert ohne JavaScript als lesbare Tarifstudie', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: 'http://localhost:4173',
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto('/intern/preise/');
    await expect(page.locator('[data-pricing-amount]')).toHaveText([
      'CHF 79.–',
      'CHF 149.–',
      'CHF 249.–',
    ]);
    await expect(page.getByText(/Ohne JavaScript zeigt die Übersicht/)).toBeVisible();
    await expect(page.locator('[data-pricing-billing] input')).toBeHidden();
    await context.close();
  });

  test('bleibt dauerhaft noindex und aus der öffentlichen Navigation ausgeschlossen', async ({
    page,
  }) => {
    const requests: string[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET') requests.push(request.url());
    });
    const response = await page.goto('/intern/preise/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
    await page.getByRole('radio', { name: 'Jährlich' }).check();
    expect(requests).toEqual([]);
    await page.goto('/');
    await expect(page.locator('a[href="/intern/preise/"]')).toHaveCount(0);
  });

  for (const width of [375, 768, 1440]) {
    test(`bei ${width} px: kein Overflow, keine Accessibility- oder CSP-Verstösse`, async ({
      page,
    }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const problems = await trackProblems(page);
      await page.goto('/intern/preise/');
      await expectNoHorizontalScroll(page);
      await expectNoA11yViolations(page);
      expect(await problems()).toEqual([]);
      if (testInfo.project.name === 'desktop') {
        await page.screenshot({
          path: testInfo.outputPath(`pricing-study-${width}px.png`),
          fullPage: true,
          animations: 'disabled',
        });
      }
    });
  }
});
