# ADR 0005 – Indexierung standardmässig deaktiviert

- **Status:** Angenommen
- **Datum:** 2026-11-19

## Kontext

Vorschau-Websites (Deploy Previews, Branch Deploys) und die Produktion vor dem offiziellen Launch dürfen nicht in Suchmaschinen erscheinen. Ein versehentliches Freischalten muss ausgeschlossen sein.

## Entscheid

- Die Indexierung ist **nur** aktiv, wenn beide Bedingungen erfüllt sind:
  1. Netlify-Kontext `CONTEXT=production` und
  2. Umgebungsvariable `SITE_INDEXING=true`, die nur nach ausdrücklicher Freigabe gesetzt wird.
- In allen anderen Fällen:
  - `<meta name="robots" content="noindex, nofollow">` auf jeder Seite,
  - HTTP-Header `X-Robots-Tag: noindex, nofollow` für alle Pfade,
  - `robots.txt` ohne Sitemap-Verweis. Das Crawlen bleibt erlaubt, damit Suchmaschinen das `noindex` überhaupt sehen und Seiten nicht nur über ihre URL indexieren.
- `/prototyp/` ist unabhängig davon **immer** `noindex`.

## Konsequenzen

- Lokale Builds, CI-Builds und alle Vorschauen sind automatisch nicht indexierbar.
- Der Launch erfordert eine bewusste Konfigurationsänderung in Netlify und keine Codeänderung.
