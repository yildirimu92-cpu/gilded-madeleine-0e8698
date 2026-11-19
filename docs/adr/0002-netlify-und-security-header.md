# ADR 0002 – Hosting auf Netlify und Security-Header

- **Status:** Angenommen
- **Datum:** 2026-11-19

## Kontext

Die bestehende Website läuft auf Netlify (`gilded-madeleine-0e8698`). Später kommen eine eigene Domain sowie Subdomains der Bestellplattform hinzu. Die Security-Header dürfen diese Subdomains nicht beeinträchtigen.

## Entscheid

- Hosting bleibt auf **Netlify**. Build-Einstellungen, Node-Version und Header werden in `netlify.toml` versioniert.
- Header für alle Pfade:
  - `Strict-Transport-Security: max-age=31536000`, **ohne** `includeSubDomains` und ohne `preload`, damit Plattform-Subdomains nicht vorzeitig gebunden werden. Eine Erweiterung erfordert einen eigenen ADR, der mit dem Plattformbetrieb abgestimmt ist.
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy`: deaktiviert Kamera, Mikrofon, Zahlungs-API, USB und weitere Schnittstellen. Geolocation bleibt für die eigene Herkunft erlaubt, für die spätere Standortsuche in `/bestellen`.
  - `Cross-Origin-Opener-Policy: same-origin`
  - `X-Frame-Options: DENY` sowie `frame-ancestors 'none'` in der CSP
- **Content Security Policy:**
  - Neue Website: streng (`default-src 'self'`, keine Inline-Skripte, `object-src 'none'`, `base-uri 'self'`, `form-action 'self'`).
  - `/prototyp/*`: eigene, gelockerte Policy (`'unsafe-inline'` für Script und Style, `data:` für Bilder und Schriften), weil der unveränderte Prototyp Inline-Code und Base64-Assets nutzt.
  - Neue externe Quellen (z. B. Analytics) werden nur per ADR ergänzt.
- Caching: Gehashte Build-Assets (`/_astro/*`) und Schriften erhalten `Cache-Control: public, max-age=31536000, immutable`.

## Konsequenzen

- Die Header sind testbar. Die CI prüft die Konfiguration und die E2E-Tests laufen mit diesen Headern.
- Für den Prototyp gilt bewusst ein schwächeres Schutzniveau. Das Risiko ist gering, weil die Seite statisch und ohne Datenerfassung ist und nicht indexiert wird.
- Netlify wendet bei mehreren passenden Pfadregeln alle Header an. Deshalb wird die CSP so definiert, dass für jeden Pfad genau eine Policy gilt.
