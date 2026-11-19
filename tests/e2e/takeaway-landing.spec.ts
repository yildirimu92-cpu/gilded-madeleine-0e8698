import { expect, test } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll, trackProblems } from './helpers';

test.describe('PR16 – Takeaway-Landingpage (vor Launch)', () => {
  test('zeigt echte Zielgruppenbotschaften ohne falsche Live-Versprechen', async ({
    page,
    request,
  }) => {
    const response = await page.goto('/fuer-takeaways/');
    expect(response?.status()).toBe(200);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'Ihr Takeaway.Ihr Bestellkanal.',
    );
    await expect(page.getByText(/Noch kein buchbares Angebot/)).toBeVisible();
    await expect(
      page.getByText('Schematische Konzeptillustration – keine produktive Shop-Oberfläche.'),
    ).toBeVisible();
    await expect(page.getByRole('heading', { name: /Wichtige Fragen/ })).toBeVisible();
    await expect(page.getByText(/keine garantierten Einsparungen/i)).toBeVisible();

    for (const target of ['/funktionen/', '/provisionsrechner/']) {
      await expect(page.locator(`a[href="${target}"]`).first()).toBeVisible();
      expect((await request.get(target)).status()).toBe(200);
    }
    await expect(page.locator('form, iframe, input, textarea')).toHaveCount(0);
    await expect(page.getByRole('link', { name: /Jetzt kaufen|Jetzt buchen/i })).toHaveCount(0);
  });

  test('FAQs sind per Tastatur bedienbar und erklären Geschäftsgrenzen', async ({ page }) => {
    await page.goto('/fuer-takeaways/');
    const firstQuestion = page.getByText('Muss ich bestehende Lieferplattformen kündigen?');
    await firstQuestion.focus();
    await page.keyboard.press('Enter');
    const faq = page.locator('.takeaway-faq__items details').first();
    await expect(faq.locator('p')).toContainText('Ein eigener Bestellkanal kann als zusätzliche');
    await expect(faq).toHaveAttribute('open', '');
  });

  test('bleibt noindex und wird nicht ungeprüft in die öffentliche Navigation aufgenommen', async ({
    page,
  }) => {
    const response = await page.goto('/fuer-takeaways/');
    await expect(page.locator('html')).toHaveAttribute('lang', 'de-CH');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(response?.headers()['x-robots-tag']).toContain('noindex');
    await page.goto('/');
    await expect(page.locator('header a[href="/fuer-takeaways/"]')).toHaveCount(0);
    await expect(page.locator('footer a[href="/fuer-takeaways/"]')).toHaveCount(0);
  });

  for (const width of [375, 390, 768, 1440]) {
    test(`bei ${width} px: keine Layout-, A11y- oder CSP-Probleme`, async ({ page }, testInfo) => {
      await page.setViewportSize({ width, height: 900 });
      const getProblems = await trackProblems(page);
      await page.goto('/fuer-takeaways/');
      await expectNoHorizontalScroll(page);
      await expectNoA11yViolations(page);
      expect(await getProblems()).toEqual([]);
      if (testInfo.project.name === 'desktop' && (width === 375 || width === 1440)) {
        await page.screenshot({
          path: testInfo.outputPath(`takeaway-landing-${width}px.png`),
          fullPage: true,
          animations: 'disabled',
        });
      }
    });
  }
});
