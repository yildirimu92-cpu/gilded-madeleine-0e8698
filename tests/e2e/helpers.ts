import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** Sammelt CSP-Verstösse und Konsolenfehler ab Seitenstart. */
export async function trackProblems(page: Page): Promise<() => Promise<string[]>> {
  const problems: string[] = [];
  page.on('console', (msg) => {
    // Der 404-Status des Dokuments selbst ist erwartet; fehlende Unterressourcen nicht.
    const isOwnDocument404 = /status of 404/.test(msg.text()) && msg.location().url === page.url();
    if (isOwnDocument404) return;
    if (msg.type() === 'error' || /content security policy/i.test(msg.text())) {
      problems.push(`console.${msg.type()}: ${msg.text()}`);
    }
  });
  page.on('pageerror', (err) => problems.push(`pageerror: ${err.message}`));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (e) => {
      console.error(`CSP-Verstoss: ${e.violatedDirective} ${e.blockedURI}`);
    });
  });
  return async () => problems;
}

export async function expectNoA11yViolations(page: Page): Promise<void> {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'])
    .analyze();
  const summary = results.violations.map(
    (v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`,
  );
  expect(summary).toEqual([]);
}

export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}
