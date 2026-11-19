import { defineConfig } from 'astro/config';
import { noindexHeaders } from './src/lib/noindex-integration';
import { resolveSiteUrl } from './src/lib/site-config';

const env = process.env;

export default defineConfig({
  site: resolveSiteUrl(env),
  output: 'static',
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
    // Keine Inline-Styles: hält die CSP schlank und Assets cachebar.
    inlineStylesheets: 'never',
  },
  // Kein Shiki: dessen Inline-Styles wären mit der CSP nicht vereinbar.
  markdown: { syntaxHighlight: false },
  i18n: {
    locales: ['de'],
    defaultLocale: 'de',
    routing: { prefixDefaultLocale: false },
  },
  security: {
    // Astro ergänzt script-src/style-src mit Hashes und liefert die Policy als <meta>.
    // Header-Direktiven (frame-ancestors usw.) stehen in netlify.toml (ADR 0002).
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
    },
  },
  integrations: [noindexHeaders(env)],
});
