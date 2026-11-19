# Markenassets – Integrationspunkt Logo

**Status: ausstehend.** Das IO-Monogramm liegt erst als visuelle Markenstudie vor. Hier wird **keine** angenäherte oder nachgezeichnete Version abgelegt (ADR 0010).

## Nach Freigabe ablegen

| Datei | Inhalt |
|---|---|
| `izyorder-lockup.svg` | Monogramm und Wortmarke, für helle Flächen |
| `izyorder-lockup-inverse.svg` | Monogramm und Wortmarke, für Forest 950 |
| `izyorder-monogram.svg` | IO-Monogramm allein (z. B. Favicon, App-Icon) |
| `izyorder-monogram-inverse.svg` | IO-Monogramm für dunkle Flächen |

## Anforderungen an die SVG-Dateien

- Vektordaten ohne eingebettete Rastergrafiken, Schriften als Pfade
- `viewBox` gesetzt, **keine** festen `width`/`height`-Attribute
- Keine `<script>`-, `<style>`- oder `style="…"`-Elemente bzw. -Attribute (CSP). Farben als `fill`-Attribute
- Nur Markenfarben: Forest 950 `#0F2E22`, Mint 300 `#9FE3C6`, Sand 50 `#F7F4EE`
- Optimiert (z. B. mit SVGO), keine Editor-Metadaten

## Aktivierung

1. Dateien hier ablegen.
2. In `src/config/brand.ts` `logo.status` auf `'final'` setzen.
3. `npm run verify` ausführen und die Designvorschau `/intern/design/` prüfen.

Alle Verwendungsstellen nutzen `src/components/brand/Logo.astro` und müssen nicht angepasst werden.
