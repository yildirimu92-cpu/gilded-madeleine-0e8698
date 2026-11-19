/**
 * Regressionstests zu den Codex-Befunden in PR #4:
 * 1. Demo-Formular sendet ohne JavaScript nichts
 * 2. Ladende Buttons lösen keine Aktion aus (Maus, Enter, Leertaste)
 * 3. Formular-Reset stellt den Ausgangszustand vollständig her
 */
import { expect, test, type Page } from '@playwright/test';

const PAGE = '/styleguide/';

function trackNonGet(page: Page): string[] {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (r.method() !== 'GET') requests.push(`${r.method()} ${r.url()}`);
  });
  return requests;
}

test.describe('Befund 1: Demo-Formular ohne JavaScript', () => {
  test.use({ javaScriptEnabled: false, reducedMotion: 'reduce' });

  test('Absenden erzeugt keine POST-Anfrage und keine Navigation', async ({ page }) => {
    const requests = trackNonGet(page);
    await page.goto(PAGE);
    const form = page.locator('#formular form');
    await expect(form).toHaveAttribute('method', 'dialog');
    await expect(form).not.toHaveAttribute('action', /.+/);

    await page.fill('#f-name', 'Alex Muster');
    await page.fill('#f-betrieb', 'Beispielbetrieb');
    await page.fill('#f-email', 'alex@beispiel.ch');
    await page.fill('#f-telefon', '041 123 45 67');
    await page.selectOption('#f-betriebsart', 'takeaway');
    await form.getByRole('button', { name: /Absenden/ }).click();
    await page.locator('#f-email').press('Enter');
    await page.waitForTimeout(500);

    expect(requests).toEqual([]);
    expect(page.url()).toMatch(/\/styleguide\/$/);
  });

  test('alle Demo-Formulare der Seite sind ohne Versandziel', async ({ page }) => {
    await page.goto(PAGE);
    const methods = await page
      .locator('form[data-demo]')
      .evaluateAll((forms) =>
        forms.map((f) => [f.getAttribute('method'), f.getAttribute('action')]),
      );
    expect(methods.length).toBeGreaterThanOrEqual(3);
    for (const [method, action] of methods) {
      expect(method).toBe('dialog');
      expect(action).toBeNull();
    }
  });

  test('ladender Submit-Button sendet auch ohne JavaScript nicht', async ({ page }) => {
    const requests = trackNonGet(page);
    await page.goto(PAGE);
    const button = page.locator('#sg-loading-form button');
    await expect(button).toHaveAttribute('type', 'button');
    await button.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await page.waitForTimeout(300);
    expect(requests).toEqual([]);
  });
});

test.describe('Befund 2: Ladezustand verhindert Aktionen', () => {
  test('Submit-Button im Ladezustand: Maus, Enter und Leertaste lösen nichts aus', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Tastatur nur Desktop');
    const requests = trackNonGet(page);
    await page.goto(PAGE);
    const form = page.locator('#sg-loading-form');
    await form.evaluate((f) => {
      (window as unknown as { __submits: number }).__submits = 0;
      f.addEventListener('submit', () => (window as unknown as { __submits: number }).__submits++);
    });
    const button = form.getByRole('button');
    await expect(button).toHaveAttribute('aria-busy', 'true');
    await expect(button).toHaveAttribute('aria-disabled', 'true');

    await button.focus();
    await expect(button).toBeFocused();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await button.click({ force: true });
    await button.dispatchEvent('click');
    await page.waitForTimeout(300);

    expect(await page.evaluate(() => (window as unknown as { __submits: number }).__submits)).toBe(
      0,
    );
    await expect(form.locator('[data-form-status]')).toBeEmpty();
    expect(requests).toEqual([]);
  });

  test('Dialog-Auslöser im Ladezustand öffnet keinen Dialog', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Tastatur nur Desktop');
    await page.goto(PAGE);
    const trigger = page.locator('#buttons [data-dialog-open][aria-busy="true"]');
    await trigger.focus();
    await page.keyboard.press('Enter');
    await page.keyboard.press('Space');
    await page.waitForTimeout(200);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
    // bleibt fokussierbar (Screenreader erfassen den Ladezustand)
    await expect(trigger).toBeFocused();
    await trigger.click({ force: true });
    await trigger.dispatchEvent('click');
    await page.waitForTimeout(300);
    await expect(page.locator('dialog[open]')).toHaveCount(0);
  });

  test('gültiges Absenden: Button lädt, Doppel-Enter und Doppelklick zählen nur einmal', async ({
    page,
  }) => {
    await page.goto(PAGE);
    const form = page.locator('#formular form');
    await page.fill('#f-name', 'Alex Muster');
    await page.fill('#f-betrieb', 'Beispielbetrieb');
    await page.fill('#f-email', 'alex@beispiel.ch');
    await page.selectOption('#f-betriebsart', 'bar');

    const submit = form.getByRole('button', { name: /Absenden/ });
    await page.locator('#f-email').press('Enter');
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await page.locator('#f-email').press('Enter');
    await submit.click({ force: true });
    await submit.dispatchEvent('click');

    await expect(form).toHaveAttribute('data-submissions', '1');
    await expect(form.locator('[data-form-status]')).toContainText('keine Daten gesendet');
    await expect(submit).not.toHaveAttribute('aria-busy');
    await expect(form).toHaveAttribute('data-submissions', '1');
  });
});

test.describe('Befund 3: Formular-Reset', () => {
  test('Reset stellt Werte, Fehler, ARIA, Status und Touched-Zustand wieder her', async ({
    page,
  }) => {
    await page.goto(PAGE);
    const form = page.locator('#formular form');
    const snapshot = () =>
      form.evaluate((f) =>
        [
          ...f.querySelectorAll<HTMLInputElement | HTMLSelectElement>(
            '[data-field] input, [data-field] select',
          ),
        ].map((el) => ({
          id: el.id,
          value: el.value,
          invalid: el.getAttribute('aria-invalid'),
          describedby: el.getAttribute('aria-describedby'),
          errorHidden: (document.getElementById(`${el.id}-error`) as HTMLElement).hidden,
        })),
      );
    const initial = await snapshot();

    // Fehlerzustand herbeiführen und Werte eingeben
    await form.getByRole('button', { name: /Absenden/ }).click();
    await page.fill('#f-email', 'name@');
    await page.fill('#f-telefon', '123');
    await page.locator('#f-telefon').blur();
    await expect(page.locator('#f-telefon-error')).toBeVisible();
    await expect(form.locator('[data-form-status]')).not.toBeEmpty();

    await form.getByRole('button', { name: 'Zurücksetzen' }).click();

    await expect.poll(snapshot).toEqual(initial);
    await expect(form.locator('[data-form-status]')).toBeEmpty();
    await expect(form.locator('[data-field-error]:not([hidden])')).toHaveCount(0);
    await expect(form.locator('.field--invalid')).toHaveCount(0);

    // Touched-Verwaltung zurückgesetzt: leeres Feld verlassen erzeugt keinen Fehler mehr
    await page.locator('#f-name').focus();
    await page.locator('#f-name').blur();
    await expect(page.locator('#f-name-error')).toBeHidden();
    // Eingabe in zuvor berührtem Feld validiert nicht sofort live
    await page.fill('#f-email', 'x');
    await expect(page.locator('#f-email-error')).toBeHidden();
  });

  test('Reset während des Absendens beendet den Ladezustand', async ({ page }) => {
    await page.goto(PAGE);
    const form = page.locator('#formular form');
    await page.fill('#f-name', 'Alex Muster');
    await page.fill('#f-betrieb', 'Beispielbetrieb');
    await page.fill('#f-email', 'alex@beispiel.ch');
    await page.selectOption('#f-betriebsart', 'bar');
    const submit = form.getByRole('button', { name: /Absenden/ });
    await submit.click();
    await expect(submit).toHaveAttribute('aria-busy', 'true');
    await form.getByRole('button', { name: 'Zurücksetzen' }).click();
    await expect(submit).not.toHaveAttribute('aria-busy');
    await expect(form).not.toHaveAttribute('data-submitting');
    await expect(form.locator('[data-form-status]')).toBeEmpty();
    await page.waitForTimeout(1000);
    await expect(form.locator('[data-form-status]')).toBeEmpty();
  });
});

test.describe('Dialog-Optionen', () => {
  test('initialFocus="title": Titel fokussiert, Fokus bleibt im Dialog', async ({
    page,
    isMobile,
  }) => {
    test.skip(isMobile, 'Tastatur nur Desktop');
    await page.goto(PAGE);
    await page.getByRole('button', { name: 'Dialog mit längerem Text' }).click();
    const dialog = page.getByRole('dialog', { name: 'Dialog mit längerem Text' });
    await expect(dialog.getByRole('heading', { name: 'Dialog mit längerem Text' })).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    expect(await dialog.evaluate((d) => d.contains(document.activeElement))).toBe(true);
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
  });

  test('dismissible={false}: Hintergrund schliesst nicht, Escape und X schon', async ({ page }) => {
    await page.goto(PAGE);
    const open = () => page.getByRole('button', { name: 'Dialog mit Formular' }).click();
    const dialog = page.getByRole('dialog', { name: 'Dialog mit Formular' });
    await open();
    await page.mouse.click(5, 5);
    await expect(dialog).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await open();
    await dialog.getByRole('button', { name: 'Dialog schliessen' }).click();
    await expect(dialog).toBeHidden();
  });
});
