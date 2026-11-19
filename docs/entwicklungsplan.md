# Entwicklungsplan

- **Status:** Verbindlich (freigegeben November 2026). Die Reihenfolge kann nach Absprache angepasst werden.

## Arbeitsweise

- Jeder Schritt ist ein **eigener, kleiner Pull Request** mit grüner CI und Abnahmebericht.
- **Kein Merge und kein Produktionsdeployment** ohne Freigabe der Projektleitung.
- Aussagen zu Preisen, Leistungen und Referenzen werden im Pull Request gesondert zur Freigabe aufgeführt.

## Pull Requests

| Nr. | Titel | Inhalt | Status |
|---|---|---|---|
| 1 | Dokumentation | Audit, Zielarchitektur, ADRs, Isolations- und Inhaltsregeln | Erledigt (#1) |
| 2 | Grundgerüst | Astro und TypeScript, `netlify.toml` mit Security-Headern, Indexierungssteuerung, CI, Prototyp unter `/prototyp/`, Platzhalter `/`, 404 | Erledigt (#2) |
| 3 | Markenkit und Tokens | Farben, Typografie (Inter selbst gehostet), Abstände, Radien, Schatten, Bewegung. Globaler Basisstil, Wortmarke, Logo-Integrationspunkt, Designvorschau `/intern/design/` | Erledigt (#3) |
| 4 | Basiskomponenten | Button, Link, Container, Section, Card, Badge, Tag, Formularfelder (Text, E-Mail, Telefon, Select), Segmented Control, Dialog. Interne Seite `/styleguide/` (noindex). Lighthouse-Budgets in der CI | Erledigt (#4) |
| 5 | Layout und SEO-Kopf | Header (sticky, Mobile-Menü), Footer, zentrales PublicLayout, Navigation mit Status planned/live, SEO-Komponente (Canonical, hreflang, Open Graph, Twitter/X, JSON-LD). Favicon erst mit dem finalen Logo | In Review (#5) |
| 6 | Rechtliches | Impressum, Datenschutzerklärung (Inhalte durch die Projektleitung bzw. Rechtsberatung), Sitemap | Geplant |
| 7 | B2B-Startseite | Hero mit „Live-Demo ansehen“ und „Pilotplatz anfragen“, Nutzen, Funktionen im Überblick, Ablauf, FAQ | Geplant |
| 8 | Preise | Tarife aus einer zentralen Datenquelle, exkl. MWST, Jahresrabatt 15 %. **Leistungen und Setup-Gebühren vor Veröffentlichung freigeben** | Geplant, Freigabe der Inhalte nötig |
| 9 | Live-Demo und Pilotplatz | Seite `/demo`, Netlify Forms (Honeypot, Einwilligung), Erfolgsseite. Formularschema für spätere Make- bzw. CRM-Anbindung | Geplant, Aktivierung von Netlify Forms nötig |
| 10 | Funktionsseiten | Online-Shop, Abholung und Lieferung, Verwaltung. KI-Telefonassistenz als „geplant“ | Geplant |
| 11 | Provisionsrechner | Interaktiv, transparente Annahmen, ohne Garantieversprechen, mit Unit-Tests | Geplant |
| 12 | B2C-Logik | Suchlogik aus dem Prototyp als getestetes TypeScript-Modul, Datenschema, Escaping | Geplant |
| 13 | B2C-Oberfläche | `/bestellen` mit Suche. Ortsseiten nur für reale, freigegebene Restaurants | Geplant |
| 14 | Launch-Vorbereitung | Domain, Redirects, finale Prüfung, `SITE_INDEXING=true` | **Separate Freigabe** |

## Später

- Sprachversionen FR, IT und EN
- Seite zur KI-Telefonassistenz (sobald verfügbar)
- Referenzen und Fallstudien (nur mit belegter Freigabe)
- „Restaurant wünschen“ mit Double-Opt-in
- Öffentlicher Read-only-Restaurantfeed (eigener ADR)
