import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll, trackProblems } from './helpers';

test.describe('PR13 – IzyOrder Gästesuche ohne freigegebene Restaurants', () => {
  test('zeigt ehrlichen Leerzustand statt fiktiver Partner und lässt Navigation geschlossen', async ({
    page,
  }) => {
    const response = await page.goto('/bestellen/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Dein Restaurant.');
    await expect(page.locator('[data-finder-count]')).toHaveText('0 Restaurants');
    await expect(page.locator('[data-finder-results] > li')).toHaveCount(0);
    await expect(page.locator('[data-finder-empty]')).toBeVisible();
    await expect(page.getByRole('link', { name: /Zur Suche/ })).toHaveAttribute('href', '#suche');
    await expect(
      page.getByText(/Die Restaurantsuche ist im Aufbau. Bestellungen sind noch nicht möglich/),
    ).toBeVisible();

    for (const fictional of [
      'Pizzeria Lindenhof',
      'Dürüm am Hirschengraben',
      'Altstadt Burgerstube',
    ]) {
      await expect(page.getByText(fictional)).toHaveCount(0);
    }
    await expect(page.locator('a[href^="https://takeaway-demo-"]')).toHaveCount(0);
    await expect(page.getByText('KONZEPT', { exact: true })).toHaveCount(0);
    await expect(page.getByText(/Vorschau · ohne Bestellfunktion/)).toHaveCount(0);
    await page.getByRole('link', { name: /Zur Suche/ }).click();
    await expect(page).toHaveURL(/#suche$/);
    await page.goto('/');
    await expect(page.locator('a[href="/bestellen/"]')).toHaveCount(0);
  });

  test('sucht Ort, Küche und PLZ ohne erfundene Ergebnisse', async ({ page }) => {
    await page.goto('/bestellen/');
    const search = page.getByRole('searchbox', { name: /Restaurant, Küche, Ort oder PLZ/ });
    await search.fill('Pizza 6010');
    await page.getByRole('button', { name: 'Suchen' }).click();
    await expect(page.locator('[data-finder-place]')).toHaveValue('Kriens');
    await expect(page.locator('[data-finder-heading]')).toContainText('Kriens');
    await expect(page.locator('[data-finder-count]')).toHaveText('0 Restaurants');

    await page.locator('[data-finder-place]').selectOption('Meggen');
    await expect(search).toHaveValue('');
    await expect(page.locator('[data-finder-heading]')).toContainText('Meggen');

    await page.getByRole('button', { name: 'Pizza' }).click();
    await expect(page.getByRole('button', { name: 'Pizza' })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByRole('button', { name: 'Alle', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Alle', exact: true })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
  });

  test('unbekannte PLZ zeigt Warnung ohne alte Ortsresultate', async ({ page }) => {
    await page.goto('/bestellen/');
    const search = page.getByRole('searchbox', { name: /Restaurant, Küche, Ort oder PLZ/ });
    await search.fill('9999');
    await search.press('Enter');
    await expect(page.locator('[data-finder-empty-title]')).toContainText('PLZ');
    await expect(page.locator('[data-finder-count]')).toHaveText('0 Restaurants');

    await page.getByRole('radio', { name: 'Liefern lassen' }).check();
    await expect(page.locator('[data-finder-fallback]')).toHaveCount(0);
    await expect(page.locator('[data-finder-pickup]')).toBeHidden();
    await expect(page.locator('[data-finder-empty-title]')).toContainText('PLZ');

    await page.locator('[data-finder-place]').selectOption('Horw');
    await expect(page.locator('[data-finder-empty-title]')).toContainText('Noch keine Restaurants');
    await expect(page.locator('[data-finder-heading]')).toContainText('Horw');
  });

  test('wechselt zwischen Lieferung und Abholung, ohne falsche Angebote zu zeigen', async ({
    page,
  }) => {
    await page.goto('/bestellen/');
    await page.getByRole('radio', { name: 'Liefern lassen' }).check();
    await expect(page.locator('[data-finder-heading]')).toContainText('Lieferung nach Luzern');
    await expect(page.locator('[data-finder-pickup]')).toBeVisible();
    await page.locator('[data-finder-pickup]').click();
    await expect(page.getByRole('radio', { name: 'Abholen' })).toBeChecked();
    await expect(page.locator('[data-finder-heading]')).toContainText('Abholen');
    await expect(page.locator('[data-finder-results] > li')).toHaveCount(0);
  });

  test('verwendet weder Forms noch Datenversand und bleibt noindex', async ({ page }) => {
    const nonGet: string[] = [];
    page.on('request', (request) => {
      if (request.method() !== 'GET') nonGet.push(request.url());
    });
    const response = await page.goto('/bestellen/');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
    await page.getByRole('button', { name: 'Burger' }).click();
    await page.getByRole('searchbox', { name: /Restaurant, Küche, Ort oder PLZ/ }).fill('6004');
    await page.getByRole('button', { name: 'Suchen' }).click();
    expect(nonGet).toEqual([]);
    await expect(page.locator('form, iframe, [data-netlify]')).toHaveCount(0);
  });

  test('zeigt auch ohne JavaScript den statischen Anfangszustand', async ({ browser }) => {
    const context = await browser.newContext({
      baseURL: 'http://localhost:4173',
      javaScriptEnabled: false,
    });
    const page = await context.newPage();
    await page.goto('/bestellen/');
    await expect(page.locator('[data-finder-count]')).toHaveText('0 Restaurants');
    await expect(page.locator('[data-finder-empty]')).toBeVisible();
    await expect(page.getByText(/Zum Suchen und Filtern benötigst du JavaScript/)).toBeVisible();
    await context.close();
  });

  for (const width of [375, 768, 1440]) {
    test(`bei ${width} px: zugänglich und ohne horizontalen Scroll`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const problems = await trackProblems(page);
      await page.goto('/bestellen/');
      await expectNoHorizontalScroll(page);
      await expectNoA11yViolations(page);
      expect(await problems()).toEqual([]);
      if (testInfo.project.name === 'desktop') {
        await page.screenshot({
          path: testInfo.outputPath(`b2c-finder-${width}px.png`),
          fullPage: true,
          animations: 'disabled',
        });
      }
    });
  }
});
