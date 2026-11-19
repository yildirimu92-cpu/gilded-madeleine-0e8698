import { expect, test, type Page } from '@playwright/test';
import { expectNoA11yViolations, expectNoHorizontalScroll, trackProblems } from './helpers';

const PUBLIC = ['/', '/gibt-es-nicht'];

for (const width of [375, 768, 1440]) {
  test.describe(`Öffentliches Layout bei ${width} px`, () => {
    test.use({ viewport: { width, height: 900 } });

    for (const path of PUBLIC) {
      test(`${path}: Header, Footer, kein Überlauf, axe 0, keine CSP-Verstösse`, async ({
        page,
      }) => {
        const problems = await trackProblems(page);
        await page.goto(path);
        await expect(page.getByRole('banner')).toBeVisible();
        await expect(page.getByRole('contentinfo')).toBeVisible();
        await expect(
          page.getByRole('banner').getByRole('link', { name: /IzyOrder/ }),
        ).toHaveAttribute('href', '/');
        await expectNoHorizontalScroll(page);
        await expectNoA11yViolations(page);
        expect(await problems()).toEqual([]);
      });
    }
  });
}

async function internalHrefs(page: Page): Promise<string[]> {
  return page
    .locator('a[href]')
    .evaluateAll((links) =>
      links
        .map((a) => a.getAttribute('href') ?? '')
        .filter((h) => !/^(https?:|mailto:|tel:)/.test(h)),
    );
}

test.describe('Keine Scheinziele auf öffentlichen Seiten', () => {
  for (const path of PUBLIC) {
    test(`${path}: alle Links führen zu existierenden Seiten`, async ({ page, request }) => {
      await page.goto(path);
      const hrefs = await internalHrefs(page);
      expect(hrefs.length).toBeGreaterThan(0);
      for (const href of hrefs) {
        expect(href, 'kein Dummy-Link').not.toMatch(/^#?$|^javascript:/i);
        if (href.startsWith('#')) {
          expect(await page.locator(href).count(), href).toBe(1);
          continue;
        }
        const res = await request.get(href);
        expect(res.status(), href).toBe(200);
      }
      // Geplante Seiten werden noch nicht verlinkt
      await expect(
        page.locator(
          'a[href*="/funktionen"], a[href*="/preise"], a[href*="/demo"], a[href*="/bestellen"], a[href*="/impressum"], a[href*="/datenschutz"]',
        ),
      ).toHaveCount(0);
    });
  }

  test('ohne freigegebene Demo kein CTA «Live-Demo ansehen»', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('banner').getByText('Live-Demo ansehen')).toHaveCount(0);
  });

  test('Footer: Claim, aktuelles Jahr, keine Kontakt- oder Social-Media-Angaben', async ({
    page,
  }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer).toContainText('Dein Restaurant.');
    await expect(footer).toContainText('Deine Bestellungen.');
    await expect(footer.locator('[data-footer-year]')).toHaveText(String(new Date().getFullYear()));
    await expect(footer).toContainText(`© ${new Date().getFullYear()} IzyOrder`);
    await expect(
      footer.locator(
        'a[href^="mailto:"], a[href^="tel:"], a[href*="linkedin"], a[href*="instagram"], a[href*="facebook"]',
      ),
    ).toHaveCount(0);
  });

  test('Header bleibt beim Scrollen oben (sticky)', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 500 });
    await page.goto('/');
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(200);
    const top = await page
      .locator('[data-site-header]')
      .evaluate((el) => el.getBoundingClientRect().top);
    expect(top).toBe(0);
  });
});

test.describe('SEO-Ausgabe', () => {
  test('Startseite: Titel, Description, Canonical, hreflang, OG, Twitter, JSON-LD, noindex', async ({
    page,
  }) => {
    const res = await page.goto('/');
    await expect(page).toHaveTitle(/IzyOrder/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'de-CH');
    const canonical = await page.locator('link[rel="canonical"]').getAttribute('href');
    expect(canonical).toMatch(/^https:\/\/.+\/$/);
    await expect(page.locator('link[rel="alternate"][hreflang="de-CH"]')).toHaveAttribute(
      'href',
      canonical!,
    );
    await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
      'href',
      canonical!,
    );
    await expect(page.locator('meta[property="og:locale"]')).toHaveAttribute('content', 'de_CH');
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', canonical!);
    await expect(page.locator('meta[name="twitter:card"]')).toHaveAttribute('content', 'summary');
    await expect(page.locator('meta[property="og:image"], meta[name="twitter:image"]')).toHaveCount(
      0,
    );
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
    expect(res?.headers()['x-robots-tag']).toContain('noindex');

    const raw = await page.locator('script[type="application/ld+json"]').textContent();
    const data = JSON.parse(raw ?? '{}');
    const types = data['@graph'].map((n: { '@type': string }) => n['@type']);
    expect(types).toEqual(['WebSite', 'Organization', 'WebPage']);
    expect(data['@graph'][1].name).toBe('IzyOrder');
    expect(data['@graph'][2].url).toBe(canonical);
  });

  for (const path of ['/gibt-es-nicht', '/styleguide/', '/intern/design/']) {
    test(`${path}: noindex, ohne Canonical und ohne JSON-LD`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
        'content',
        'noindex, nofollow',
      );
      await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
      await expect(page.locator('script[type="application/ld+json"]')).toHaveCount(0);
    });
  }
});

test.describe('Mobile-Menü (Beispiel-Header im Styleguide)', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  const menu = (page: Page) => page.locator('#demo-header details.mnav');
  const toggle = (page: Page) => page.locator('#demo-header summary');

  test('geschlossen → geöffnet → Escape schliesst, Fokus zurück, ARIA-Zustände', async ({
    page,
  }) => {
    await page.goto('/styleguide/');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#demo-header-menu')).toBeHidden();
    await expect(page.locator('#demo-header .site-header__nav')).toBeHidden();

    await toggle(page).focus();
    await page.keyboard.press('Enter');
    await expect(menu(page)).toHaveAttribute('open', '');
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'true');
    const links = page.locator('#demo-header-menu a');
    await expect(links.first()).toBeVisible();
    await expect(page.locator('#demo-header-menu [aria-current="page"]')).toHaveText(/Karten/);

    await page.keyboard.press('Tab');
    await expect(links.first()).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(menu(page)).not.toHaveAttribute('open');
    await expect(toggle(page)).toBeFocused();
    await expect(toggle(page)).toHaveAttribute('aria-expanded', 'false');
  });

  test('Klick ausserhalb und Linkwahl schliessen das Menü', async ({ page }) => {
    await page.goto('/styleguide/');
    await toggle(page).click();
    await expect(menu(page)).toHaveAttribute('open', '');
    await page.locator('#sg-title').click({ force: true });
    await expect(menu(page)).not.toHaveAttribute('open');

    await toggle(page).click();
    await page.locator('#demo-header-menu a', { hasText: 'Dialog' }).click();
    await expect(menu(page)).not.toHaveAttribute('open');
    expect(page.url()).toMatch(/#dialog$/);
  });

  test('Touch-Ziele: Menü-Button und Menüeinträge mindestens 44 px', async ({ page }) => {
    await page.goto('/styleguide/');
    const t = await toggle(page).boundingBox();
    expect(t!.height).toBeGreaterThanOrEqual(44);
    expect(t!.width).toBeGreaterThanOrEqual(44);
    await toggle(page).click();
    const heights = await page
      .locator('#demo-header-menu a')
      .evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
    for (const h of heights) expect(h).toBeGreaterThanOrEqual(44);
  });

  test('geöffnetes Menü besteht axe-Prüfung', async ({ page }) => {
    await page.goto('/styleguide/');
    await toggle(page).click();
    await expectNoA11yViolations(page);
  });

  test('Wechsel auf Desktop-Breite schliesst das Menü und zeigt die Desktop-Navigation', async ({
    page,
  }) => {
    await page.goto('/styleguide/');
    await toggle(page).click();
    await expect(menu(page)).toHaveAttribute('open', '');
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(menu(page)).not.toHaveAttribute('open');
    await expect(menu(page)).toBeHidden();
    await expect(page.locator('#demo-header .site-header__nav')).toBeVisible();
    await expect(page.locator('#demo-header .site-header__cta')).toBeVisible();
  });
});

test.describe('Mobile-Menü ohne JavaScript', () => {
  test.use({ viewport: { width: 375, height: 812 }, javaScriptEnabled: false });

  test('öffnet und schliesst nativ (progressive Grundlage)', async ({ page }) => {
    await page.goto('/styleguide/');
    const summary = page.locator('#demo-header summary');
    await summary.click();
    await expect(page.locator('#demo-header-menu a').first()).toBeVisible();
    await summary.click();
    await expect(page.locator('#demo-header-menu')).toBeHidden();
  });
});
