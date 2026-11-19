# ADR 0009 – Qualitätssicherung und CI

- **Status:** Angenommen
- **Datum:** 2026-11-19

## Kontext

Die Website soll höchste Qualität in Sicherheit, SEO, Performance und Barrierefreiheit (WCAG 2.2 AA) erreichen. Das wird durch kleine Pull Requests und automatische Prüfungen sichergestellt.

## Entscheid

GitHub Actions führt bei jedem Pull Request aus:

1. `npm ci` mit fixiertem Lockfile und fixierter Node-Version (`.nvmrc`)
2. Formatprüfung (Prettier) und Linting (ESLint mit TypeScript- und Astro-Regeln)
3. Typprüfung (`astro check`)
4. Unit-Tests (Vitest), z. B. Indexierungslogik, Header-Konfiguration, später Such- und Rechnerlogik
5. Produktionsbuild
6. E2E-Tests (Playwright, Chromium) gegen den Build, **ausgeliefert mit den Headern aus `netlify.toml`**. Geprüft werden:
   - Rendering der Seiten,
   - Funktion des Prototyps,
   - keine CSP-Verstösse,
   - `noindex`,
   - Barrierefreiheit mit axe-core (WCAG 2.0/2.1/2.2 A und AA),
   - Smartphone-Ansicht ohne horizontales Scrollen.

Ab dem Designsystem-PR kommen Lighthouse-Budgets hinzu (Performance, Accessibility, Best Practices und SEO jeweils ≥ 95).

## Konsequenzen

- Pull Requests werden erst nach grüner CI zur Abnahme vorgelegt.
- Branch Protection für `main` (CI als Pflichtprüfung) wird empfohlen und von der Projektleitung in GitHub aktiviert.
