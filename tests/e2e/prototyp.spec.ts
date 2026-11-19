import { expect, test } from '@playwright/test';
import { trackProblems } from './helpers';

test.describe('Gesicherter Prototyp unter /prototyp/', () => {
  test('/prototyp leitet auf /prototyp/ weiter', async ({ request }) => {
    const response = await request.get('/prototyp', { maxRedirects: 0 });
    expect(response.status()).toBe(301);
    expect(response.headers()['location']).toBe('/prototyp/');
  });

  test('lädt ohne CSP-Verstösse und ist immer noindex', async ({ page }) => {
    const problems = await trackProblems(page);
    const response = await page.goto('/prototyp/');
    expect(response?.status()).toBe(200);
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex,nofollow',
    );
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Was möchtest du');
    // Base64-Schriften und -Bilder sind trotz CSP geladen.
    await expect.poll(() => page.evaluate(() => document.fonts.check('16px DM'))).toBe(true);
    const heroLoaded = await page
      .locator('.hero-visual img')
      .evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0);
    expect(heroLoaded).toBe(true);
    expect(await problems()).toEqual([]);
  });

  test('Suche, Filter, Liefermodus und Speisekarte funktionieren', async ({ page }) => {
    const problems = await trackProblems(page);
    await page.goto('/prototyp/');

    await expect(page.locator('#result-count')).toHaveText(/3 bestellbare Restaurants/);

    await page.getByRole('searchbox').fill('6010');
    await page.getByRole('button', { name: /Suchen/ }).click();
    await expect(page.getByRole('heading', { name: 'Ofenstube Kriens' })).toBeVisible();

    await page.getByRole('button', { name: 'Liefern lassen' }).click();
    await expect(page.locator('#results-title')).toHaveText('Essen liefern lassen in Kriens');

    await page.getByRole('button', { name: 'Abholen' }).click();
    await page.getByRole('button', { name: 'Luzern', exact: true }).click();
    await page.getByRole('button', { name: 'Kebab' }).click();
    await expect(page.locator('#cards article')).toHaveCount(1);

    await page.getByRole('button', { name: /Speisekarte ansehen/ }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading', { name: 'Dürüm am Hirschengraben' })).toBeVisible();
    await dialog.getByRole('button', { name: 'Schliessen' }).click();
    await expect(dialog).toBeHidden();

    expect(await problems()).toEqual([]);
  });
});
