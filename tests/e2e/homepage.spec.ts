import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll, trackProblems } from './helpers';

test.describe('IzyOrder B2B-Homepage – ehrliche Produktkommunikation', () => {
  test('zeigt Nutzen, Entwicklungsstand und Zahlungsgebühren-Hinweis', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ihr Bestellshop.');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Ohne Plattform');
    await expect(page.getByText('0 %', { exact: true }).first()).toBeVisible();
    await expect(page.locator('.proof-strip__disclaimer')).toContainText(
      'Gebühren externer Zahlungsanbieter können zusätzlich anfallen',
    );
    await expect(page.getByText(/In Entwicklung · Demo und Pilotanfragen folgen/)).toBeVisible();
    await expect(page.getByText(/Schematische Produktidee/)).toBeVisible();
  });

  test('verlinkt nur reale Seiten und Sprungziele, keine Schein-Demo', async ({ page }) => {
    await page.goto('/');
    for (const id of ['funktionen', 'ablauf', 'fragen']) {
      await expect(page.locator(`#${id}`)).toHaveCount(1);
    }
    await page.getByRole('link', { name: /So funktioniert/ }).click();
    await expect(page).toHaveURL(/#ablauf$/);
    await expect(
      page.getByRole('heading', { name: 'Drei Schritte. Ein direkter Bestellkanal.' }),
    ).toBeVisible();
    await expect(page.locator('a[href="/demo/"], a[href="/pilotplatz/"]')).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Pilotplatz anfragen' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: 'Live-Demo ansehen' })).toHaveCount(0);
  });

  test('FAQ ist mit Tastatur und ohne JavaScript bedienbar', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      baseURL: 'http://localhost:4173',
    });
    const page = await context.newPage();
    await page.goto('/');
    const item = page.locator('#fragen details').first();
    await expect(item).not.toHaveAttribute('open');
    await item.locator('summary').focus();
    await page.keyboard.press('Enter');
    await expect(item).toHaveAttribute('open', '');
    await expect(item).toContainText('Software-Abonnements');
    await context.close();
  });

  for (const width of [375, 768, 1440]) {
    test(`bei ${width} px: keine Überläufe, CSP- oder Accessibility-Probleme`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const problems = await trackProblems(page);
      await page.goto('/');
      await expectNoHorizontalScroll(page);
      await expectNoA11yViolations(page);
      expect(await problems()).toEqual([]);
      if (testInfo.project.name === 'desktop') {
        await page.screenshot({
          path: testInfo.outputPath(`homepage-${width}px.png`),
          fullPage: true,
          animations: 'disabled',
        });
      }
    });
  }

  test('keine Drittanbieter-Ressourcen oder JavaScript auf der Homepage', async ({ page }) => {
    const requests: string[] = [];
    page.on('request', (r) => requests.push(r.url()));
    await page.goto('/');
    expect(requests.filter((u) => !u.startsWith('http://localhost:'))).toEqual([]);
    await expect(page.locator('script:not([type="application/ld+json"])')).toHaveCount(0);
  });
});
