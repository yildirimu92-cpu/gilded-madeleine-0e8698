/**
 * Lighthouse CI – Performance-Budgets (ADR 0009, PR #4).
 * Misst den Produktionsbuild über scripts/serve-dist.mjs (inkl. Netlify-Header, Kompression)
 * mit Lighthouse-Standardprofil: Mobilgerät, simuliertes langsames 4G.
 * SEO wird nicht bewertet: alle Seiten sind bis zum Launch bewusst noindex (ADR 0005).
 */
const base = 'http://localhost:4173';

module.exports = {
  ci: {
    collect: {
      startServerCommand: 'node scripts/serve-dist.mjs',
      startServerReadyPattern: 'Netlify-Headern',
      url: [`${base}/`, `${base}/styleguide/`, `${base}/intern/design/`],
      numberOfRuns: 3,
      settings: {
        chromeFlags: '--headless=new --no-sandbox',
        onlyCategories: ['performance', 'accessibility', 'best-practices'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.95 }],
        'categories:accessibility': ['error', { minScore: 1 }],
        'categories:best-practices': ['error', { minScore: 0.95 }],
        'first-contentful-paint': ['error', { maxNumericValue: 1800 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'total-blocking-time': ['error', { maxNumericValue: 100 }],
        'resource-summary:script:size': ['error', { maxNumericValue: 30000 }],
        'resource-summary:stylesheet:size': ['error', { maxNumericValue: 50000 }],
        'resource-summary:font:size': ['error', { maxNumericValue: 160000 }],
        'resource-summary:total:size': ['error', { maxNumericValue: 350000 }],
        'resource-summary:third-party:count': ['error', { maxNumericValue: 0 }],
      },
    },
    upload: {
      // Berichte bleiben lokal bzw. als CI-Artefakt – keine Übermittlung an Dritte.
      target: 'filesystem',
      outputDir: '.lighthouseci',
    },
  },
};
