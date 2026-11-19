# Lokale Entwicklung

Voraussetzung: Node.js 22 (siehe `.nvmrc`).

```bash
npm ci              # Abhängigkeiten gemäss Lockfile
npm run dev         # Entwicklungsserver (http://localhost:4321)
npm run build       # Produktionsbuild nach dist/
npm run preview     # dist/ mit den Netlify-Headern ausliefern (http://localhost:4173)
```

## Prüfungen

| Befehl | Prüft |
|---|---|
| `npm run format:check` | Formatierung (Prettier) |
| `npm run lint` | ESLint (TypeScript und Astro) |
| `npm run check` | Typprüfung (`astro check`) |
| `npm test` | Unit-Tests (Vitest): Indexierungslogik, `netlify.toml`, Integrität des Prototyps |
| `npm run test:e2e` | Playwright gegen `dist/` mit Netlify-Headern: Rendering, CSP, noindex, axe (WCAG 2.2 AA), Smartphone-Ansicht, Funktionen des Prototyps |
| `npm run verify` | Alles der Reihe nach, wie in der CI |

Vor dem ersten E2E-Lauf: `npx playwright install chromium`.

## Umgebungsvariablen

| Variable | Wirkung |
|---|---|
| `SITE_URL` | Basis-URL für Canonical-Links (sonst Netlify `URL` bzw. Fallback) |
| `SITE_INDEXING` | `true` aktiviert die Indexierung, **nur** wenn zugleich `CONTEXT=production`. Nur nach Freigabe setzen |
| `CONTEXT` | Wird von Netlify gesetzt (`production`, `deploy-preview`, `branch-deploy`) |

## Struktur

- `public/prototyp/index.html`: gesicherter Prototyp, **nicht bearbeiten** (der Unit-Test prüft den Hash)
- `src/lib/site-config.ts`: Indexierung, robots.txt, generierte `_headers`
- `src/components/Wordmark.astro`: einzige Stelle der Markendarstellung
- `src/i18n/`: Sprachkonfiguration und UI-Texte
- `scripts/serve-dist.mjs`: lokaler Server mit den Netlify-Headern und -Redirects
