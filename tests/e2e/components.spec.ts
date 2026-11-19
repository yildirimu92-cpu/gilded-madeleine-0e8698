import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll, trackProblems } from './helpers';

const PAGE = '/styleguide/';

for (const width of [375, 768, 1440]) {
  test.describe(`Styleguide bei ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } });

    test('ohne CSP-Verstösse, ohne Überlauf, axe 0 Verstösse', async ({ page }) => {
      const problems = await trackProblems(page);
      expect((await page.goto(PAGE))?.status()).toBe(200);
      await expectNoHorizontalScroll(page);
      await expectNoA11yViolations(page);
      expect(await problems()).toEqual([]);
    });
  });
}

test('Styleguide ist dauerhaft noindex', async ({ page }) => {
  const res = await page.goto(PAGE);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  expect(res?.headers()['x-robots-tag']).toContain('noindex');
});

test('öffentliche Seiten verlinken weder Styleguide noch interne Vorschau', async ({ page }) => {
  for (const path of ['/', '/gibt-es-nicht']) {
    await page.goto(path);
    await expect(page.locator('a[href*="styleguide"], a[href*="/intern/"]')).toHaveCount(0);
  }
});

test('Styleguide bleibt auch bei freigegebener Indexierung noindex (Seo-Komponente)', async ({
  page,
}) => {
  await page.goto(PAGE);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
});

test('Startseite lädt kein JavaScript', async ({ page }) => {
  const scripts: string[] = [];
  page.on('request', (r) => r.resourceType() === 'script' && scripts.push(r.url()));
  await page.goto('/');
  expect(scripts).toEqual([]);
  expect(await page.locator('script').count()).toBe(0);
});

test.describe('Buttons und Links', () => {
  test('Laden und Deaktiviert sind korrekt ausgezeichnet', async ({ page }) => {
    await page.goto(PAGE);
    const loading = page.locator('#buttons .btn.is-loading').first();
    await expect(loading).toHaveAttribute('aria-busy', 'true');
    await expect(loading).toHaveAccessibleName(/Speichern.*Wird geladen/);
    const disabled = page.locator('#buttons button:disabled').first();
    await expect(disabled).toBeDisabled();
  });

  test('externe Links öffnen sicher in neuem Tab mit Hinweis', async ({ page }) => {
    await page.goto(PAGE);
    const ext = page.locator('#links a[href^="https://"]').first();
    await expect(ext).toHaveAttribute('target', '_blank');
    await expect(ext).toHaveAttribute('rel', 'noopener noreferrer');
    await expect(ext).toHaveAccessibleName(/externer Link, öffnet in neuem Tab/);
    await expect(page.locator('#links [aria-current="page"]')).toHaveCount(1);
  });

  test('interaktive Karte: ein Tab-Stopp mit sichtbarem Fokus auf der Karte', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Tastatur nur Desktop');
    await page.goto(PAGE);
    const link = page.locator('.card--interactive .card__link');
    await link.focus();
    await page.keyboard.press('Shift+Tab');
    await page.keyboard.press('Tab');
    await expect(link).toBeFocused();
    const outline = await page
      .locator('.card--interactive')
      .evaluate((el) => getComputedStyle(el).outlineStyle);
    expect(outline).toBe('solid');
  });
});

test.describe('Touch-Ziele (mobil)', () => {
  test('Bedienelemente mindestens 44 × 44 px auf Touch-Geräten', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'nur Touch-Gerät');
    await page.goto(PAGE);
    const sizes = await page
      .locator(
        'main .btn, main .link--standalone, main .link--nav, .segmented__label, .dialog__close, .sg-toc a',
      )
      .evaluateAll((els) =>
        els
          .filter((el) => (el as HTMLElement).offsetParent !== null)
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              text: (el.textContent ?? '').trim().slice(0, 30),
              h: Math.round(r.height),
              w: Math.round(r.width),
            };
          }),
      );
    expect(sizes.length).toBeGreaterThan(20);
    expect(sizes.filter((s) => s.h < 44)).toEqual([]);
    expect(sizes.filter((s) => s.w < 44)).toEqual([]);
  });
});

async function submitDemo(page: Page) {
  await page
    .locator('#formular form')
    .getByRole('button', { name: /Absenden/ })
    .click();
}

test.describe('Formular', () => {
  test('Fehler direkt am Feld, Fokus auf erstes fehlerhaftes Feld', async ({ page }) => {
    await page.goto(PAGE);
    await submitDemo(page);
    const name = page.locator('#f-name');
    await expect(name).toBeFocused();
    for (const id of ['name', 'betrieb', 'email', 'betriebsart']) {
      const field = page.locator(`#f-${id}`);
      await expect(field).toHaveAttribute('aria-invalid', 'true');
      await expect(field).toHaveAttribute('aria-describedby', new RegExp(`f-${id}-error`));
      await expect(page.locator(`#f-${id}-error`)).toBeVisible();
    }
    await expect(page.locator('#f-telefon')).not.toHaveAttribute('aria-invalid', 'true');
    await expect(page.locator('#formular [data-form-status]')).toHaveText(
      '4 Felder benötigen Ihre Aufmerksamkeit.',
    );
  });

  test('Validierung live nach Korrektur, Schweizer Telefonnummer', async ({ page }) => {
    await page.goto(PAGE);
    const email = page.locator('#f-email');
    await email.fill('name@');
    await email.blur();
    await expect(page.locator('#f-email-error')).toContainText('gültige E-Mail-Adresse');
    await email.fill('name@beispiel.ch');
    await expect(page.locator('#f-email-error')).toBeHidden();
    await expect(email).not.toHaveAttribute('aria-invalid', 'true');
    await expect(email).toHaveAttribute('aria-describedby', 'f-email-hint');

    const tel = page.locator('#f-telefon');
    await tel.fill('123');
    await tel.blur();
    await expect(page.locator('#f-telefon-error')).toContainText('Schweizer Telefonnummer');
    await tel.fill('041 123 45 67');
    await expect(page.locator('#f-telefon-error')).toBeHidden();
  });

  test('gültige Eingaben: Demo sendet nichts', async ({ page }) => {
    const posts: string[] = [];
    page.on('request', (r) => r.method() !== 'GET' && posts.push(r.url()));
    await page.goto(PAGE);
    await page.locator('#f-name').fill('Alex Muster');
    await page.locator('#f-betrieb').fill('Beispielbetrieb');
    await page.locator('#f-email').fill('alex@beispiel.ch');
    await page.locator('#f-betriebsart').selectOption('takeaway');
    await submitDemo(page);
    await expect(page.locator('#formular [data-form-status]')).toContainText(
      'keine Daten gesendet',
    );
    expect(page.url()).toMatch(/\/styleguide\/$/);
    expect(posts).toEqual([]);
  });
});

test('Segmented Control: Pfeiltasten wechseln die Auswahl', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Tastatur nur Desktop');
  await page.goto(PAGE);
  const first = page.locator('input[name="bestellart"][value="abholung"]');
  await first.focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('input[name="bestellart"][value="lieferung"]')).toBeChecked();
  await expect(page.getByRole('group', { name: 'Bestellart' })).toBeVisible();
});

test.describe('Dialog', () => {
  test('Fokus im Dialog, Tab-Schleife, Escape, Fokus-Rückgabe', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Tastatur nur Desktop');
    await page.goto(PAGE);
    const trigger = page.getByRole('button', { name: 'Dialog öffnen' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    const dialog = page.getByRole('dialog', { name: 'Beispieldialog' });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAccessibleDescription('Kurzer Dialog mit Bestätigung.');
    await expect(dialog.getByRole('button', { name: 'Abbrechen' })).toBeFocused();
    expect(
      await page.evaluate(() => document.documentElement.classList.contains('has-dialog')),
    ).toBe(true);

    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    }
    await page.keyboard.press('Shift+Tab');
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);

    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
    // Das close-Ereignis (Scroll-Sperre aufheben) folgt asynchron auf das Schliessen.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.classList.contains('has-dialog')))
      .toBe(false);
  });

  test('Schliessen per Button und Hintergrund; nicht-schliessbarer Dialog bleibt offen', async ({
    page,
  }) => {
    await page.goto(PAGE);
    await page.getByRole('button', { name: 'Dialog öffnen' }).click();
    const info = page.getByRole('dialog', { name: 'Beispieldialog' });
    await info.getByRole('button', { name: 'Dialog schliessen' }).click();
    await expect(info).toBeHidden();

    await page.getByRole('button', { name: 'Dialog öffnen' }).click();
    await page.mouse.click(5, 5);
    await expect(info).toBeHidden();

    await page.getByRole('button', { name: 'Dialog mit Formular' }).click();
    const form = page.getByRole('dialog', { name: 'Dialog mit Formular' });
    await expect(form.getByLabel('E-Mail-Adresse')).toBeFocused();
    await page.mouse.click(5, 5);
    await expect(form).toBeVisible();
    await form.getByRole('button', { name: 'Prüfen (Demo)' }).click();
    await expect(form.locator('#f-dialog-email-error')).toBeVisible();
    await form.getByRole('button', { name: 'Abbrechen' }).click();
    await expect(form).toBeHidden();
  });

  test('Dialog besteht axe-Prüfung im geöffneten Zustand', async ({ page }) => {
    await page.goto(PAGE);
    await page.getByRole('button', { name: 'Dialog mit Formular' }).click();
    await expectNoA11yViolations(page);
  });
});
