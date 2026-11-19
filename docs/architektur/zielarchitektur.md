# Zielarchitektur

- **Status:** Verbindlich (freigegeben November 2026)

## Grundsatz

Die IzyOrder-Website ist eine **statisch generierte Marketing-Website**. Sie ist organisatorisch und technisch unabhängig von der IzyOrder-Bestellplattform. Sie liest höchstens öffentlich freigegebene Daten und schreibt **nie** in Systeme der Plattform (siehe [Isolationsregeln](../richtlinien/isolationsregeln.md)).

## Systemgrenzen

```
┌──────────────────────────────────────────────┐      ┌──────────────────────────────┐
│ Marketing-Website (dieses Repository)        │      │ IzyOrder-Bestellplattform    │
│ Astro · TypeScript · Netlify                 │      │ (eigenes Repository)         │
│                                              │      │                              │
│  /               B2B-Startseite              │      │  Login / Dashboard           │
│  /funktionen/*   Funktionsseiten             │ Link │  Restaurant-Shops            │
│  /preise         Tarife                      │─────▶│  Demo-Shop                   │
│  /demo           Live-Demo / Pilotplatz      │      │                              │
│  /bestellen/*    B2C-Restaurantfinder        │      │  (später, optional)          │
│  /prototyp/      gesicherter Prototyp        │◀ ─ ─ │  öffentlicher Read-only-Feed │
│  /impressum, /datenschutz                    │ Build│  freigegebener Restaurants   │
└───────────────┬──────────────────────────────┘      └──────────────────────────────┘
                │ Formulare
                ▼
        Netlify Forms ──(später)──▶ Make / CRM (Vertrieb)
```

## Bausteine

| Baustein | Technologie | Bemerkung |
|---|---|---|
| Framework | Astro (statische Ausgabe) mit TypeScript `strict` | Zero-JS als Standard, interaktive Inseln nur bei Bedarf ([ADR 0001](../adr/0001-astro-typescript.md)) |
| Styling | Komponentenbezogenes CSS mit Design-Tokens als CSS Custom Properties | Keine CSS-Framework-Abhängigkeit |
| Schrift | Inter, selbst gehostet (WOFF2, Subset) | [ADR 0008](../adr/0008-marke-wortmarke-und-schrift.md) |
| Hosting | Netlify, Konfiguration versioniert in `netlify.toml` | [ADR 0002](../adr/0002-netlify-und-security-header.md) |
| Formulare | Netlify Forms | [ADR 0007](../adr/0007-lead-erfassung.md) |
| Indexierung | standardmässig `noindex`, Freigabe per Umgebungsvariable | [ADR 0005](../adr/0005-indexierungssteuerung.md) |
| Sprachen | de-CH, Struktur für FR, IT und EN vorbereitet | [ADR 0006](../adr/0006-mehrsprachigkeit.md) |
| Qualität | CI mit Typprüfung, Linting, Unit-Tests, E2E-Tests und Accessibility-Tests | [ADR 0009](../adr/0009-qualitaetssicherung.md) |

## Verzeichnisstruktur (Ziel)

```
/
├─ docs/                    Dokumentation, ADRs, Richtlinien
├─ public/
│  ├─ prototyp/             gesicherter Prototyp (unverändert)
│  └─ fonts/                Inter (ab Designsystem-PR)
├─ src/
│  ├─ components/           UI-Komponenten (je Komponente .astro + scoped CSS)
│  ├─ layouts/              Basislayout, Seitenlayouts
│  ├─ pages/                Routen
│  ├─ i18n/                 Sprachkonfiguration und UI-Texte
│  ├─ lib/                  reine TypeScript-Logik (z. B. Suche, Rechner, SEO)
│  ├─ content/ bzw. data/   Inhalte und Daten (Tarife, Orte, Beispieldaten)
│  └─ styles/               Tokens und globale Basisstile
├─ tests/
│  ├─ unit/                 Vitest
│  └─ e2e/                  Playwright inkl. axe
├─ netlify.toml
└─ .github/workflows/ci.yml
```

## Routing

| Pfad | Inhalt | Indexierbar nach Freigabe |
|---|---|---|
| `/` | B2B-Startseite | Ja |
| `/funktionen/…`, `/preise`, `/demo` | B2B-Seiten | Ja |
| `/bestellen` | B2C-Restaurantfinder | Ja, aber nur mit realen, freigegebenen Restaurants |
| `/bestellen/<ort>` | Ortsseiten | Nur bei realen Partnern |
| `/prototyp/` | Gesicherter Prototyp | **Nie** |
| `/impressum`, `/datenschutz` | Rechtliches | Ja |

## Sicherheitsarchitektur

- Statische Auslieferung ohne serverseitige Logik und ohne Sessions oder Cookies dieser Website.
- Security-Header in `netlify.toml`:
  - `Content-Security-Policy` (für die neue Website streng, für `/prototyp/` gezielt gelockert),
  - `Strict-Transport-Security` (ohne `includeSubDomains`),
  - `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
  - `Cross-Origin-Opener-Policy`, Schutz vor Framing.
- Kein clientseitiges Erzeugen von HTML aus unescapten Daten. Ausgaben laufen über Astro-Templates, die automatisch escapen.

## Domains

Die Produktionsdomain ist noch nicht festgelegt. Bis zur Freigabe läuft die Website unter `gilded-madeleine-0e8698.netlify.app`. Die Basis-URL ist konfigurierbar (`SITE_URL`). Bevorzugt wird ein Host für Marketing und `/bestellen`, die Plattform bleibt auf eigenen Hosts.
