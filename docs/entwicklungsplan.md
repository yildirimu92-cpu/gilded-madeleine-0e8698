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
| 5 | Layout und SEO-Kopf | Header (sticky, Mobile-Menü), Footer, zentrales PublicLayout, Navigation mit Status planned/live, SEO-Komponente (Canonical, hreflang, Open Graph, Twitter/X, JSON-LD). Favicon erst mit dem finalen Logo | Erledigt (#5) |
| 6 | Rechtliches | Launch-gesteuerte Sitemap und Checkliste vorhanden; Impressum und Datenschutzerklärung benötigen weiterhin geprüfte Angaben | Technische Grundlagen erledigt (#6), Rechtsseiten offen |
| 7 | B2B-Startseite | Hero, Nutzen, Funktionsüberblick, Ablauf, FAQ; unfreigegebene Live-Demo- und Pilot-CTA weiterhin gesperrt | Homepage erledigt (#7), Conversion offen |
| 8 | Preise | Tarifdaten und interne Preisvorschau aus zentraler Datenquelle; Leistungen und Setup-Gebühren müssen vor öffentlicher Vermarktung freigegeben werden | Technische Vorschau erledigt (#8), öffentliche Preisseite offen |
| 9 | Live-Demo und Pilotplatz | Seiten `/demo` und `/pilot`, gesperrtes Formularschema, Honeypot, Erfolgsseite, Aktivierungsbedingungen für Netlify | Technisch vorbereitet (#9), Aktivierung offen |
| 10 | Funktionsseiten | Online-Shop, Abholung und Lieferung, Verwaltung. KI-Telefonassistenz als „geplant“ | Technisch erledigt (#10), Vermarktungsfreigabe offen |
| 11 | Provisionsrechner | Interaktiv, transparente Annahmen, ohne Garantieversprechen, mit Unit-Tests | Technisch erledigt (#11), öffentliche Vermarktung offen |
| 12 | B2C-Logik | Suchlogik aus dem Prototyp als getestetes TypeScript-Modul, Datenschema, Escaping | Technisch erledigt (#12), keine freigegebenen Restaurants |
| 13 | B2C-Oberfläche | `/bestellen/` mit Suche und ehrlichem Leerzustand. Ortsseiten nur für reale, freigegebene Restaurants | Technisch erledigt (#13), echte Partner und Aktivierung offen |
| 14 | B2C-UX-Polish | Premium-Hero und klarer Sucheinstieg ohne Scheinkatalog | Erledigt (#14) |
| 15 | Premium-Tarifstudie | Interne Monats-/Jahresansicht mit transparenten Grundlagen und offenen Geschäftsentscheiden | Erledigt (#15), weiterhin nicht für Verkauf freigegeben |
| 16 | Takeaway-Zielgruppenseite | `/fuer-takeaways/` mit branchenspezifischer Positionierung, Konzept-Ablauf, ehrlichem Kostenvergleich und FAQ | Erledigt (#16); vor Launch noindex, keine Kontakt-Datenerhebung |
| 17 | Pilot-Conversion-Gates | Freigegebene Pilotanfrage als zentraler CTA in Header und B2B-Zielgruppenseiten, bis dahin vollständig unterdrückt | In Review (#17); keine vorgezogene Lead-Erfassung |
| später | Launch-Vorbereitung | Domain, Redirects, Rechts- und SEO-Abnahme, `SITE_INDEXING=true` | **Nur nach separater Freigabe** |

## Später

- Sprachversionen FR, IT und EN
- Seite zur KI-Telefonassistenz (sobald verfügbar)
- Referenzen und Fallstudien (nur mit belegter Freigabe)
- „Restaurant wünschen“ mit Double-Opt-in
- Öffentlicher Read-only-Restaurantfeed (eigener ADR)
