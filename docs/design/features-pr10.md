# IzyOrder PR #10 – Premium-Funktionsseiten

**Status:** Entwurf zur inhaltlichen und visuellen Abnahme, keine Freigabe für öffentliche Vermarktung oder Indexierung.

## Seitenstruktur

| URL | Zweck | Freigabestatus |
| --- | --- | --- |
| `/funktionen/` | Übersicht der drei geplanten Funktionsbereiche und des 0-%-Provisionsmodells | Konzept, noindex |
| `/funktionen/online-bestellshop/` | Direktbestellshop, Speisekarte, mobile Bestellung | Konzept, noindex |
| `/funktionen/abholung-lieferung/` | Abholung, Liefergebiet und geteilte Öffnungszeiten | Konzept, noindex |
| `/funktionen/bestellverwaltung/` | Bestelleingang, Status und Bedienoberfläche | Konzept, noindex |

Alle Seiten nutzen `PublicLayout` sowie das bestehende Brand-/Designsystem. Die Detailseiten teilen `FeatureDetail.astro`, und alle Aussagen sind zentral in `src/config/features.ts` hinterlegt.

## Redaktionelle Grundsätze

- Formulierungen wie **«soll»**, **«geplant»** oder **«in Entwicklung»** vermeiden vorgezogene Produktversprechen.
- Keine eigenen Restaurants, Nutzerzahlen, produktiven Bestellungen, Testimonials oder Zertifikate erfinden.
- Keine irreführenden echten Product-Screenshots: jede statische Illustration bezeichnet sich als **Konzept**.
- **0 % Plattformprovision** bedeutet nicht, dass Software oder externe Zahlungsabwicklung kostenlos sind.
- Der Online-Bestellshop bleibt eigenständig; eine **KI-Telefonassistenz** ist nur als optionale, spätere Erweiterung erwähnt.
- Liefergebietskarte, geteilte Öffnungszeiten, Statusverarbeitung und Integration mit Drittplattformen sind nicht als bereits verfügbare Funktionen dargestellt.
- Es gibt nur Links zu tatsächlich gebauten Funktionsseiten und bereits existierenden Abschnittsankern. Keine aktiven Live-Demo- oder Pilot-CTA.
- Preise und Paket-Leistungen sind nicht Inhalt dieses PRs.

## Technische Regeln

- Alle neuen Seiten tragen explizit `noindex`, unabhängig von einem späteren globalen Indexierungs-Flag.
- Die globale Hauptnavigation zu `/funktionen/` bleibt `planned`, bis die Projektleitung Inhalt und Zeitpunkt separat freigibt.
- Keine neuen Drittanbieter, externen Bilder, Tracker oder Client-Skripte.
- Keine Änderung der Bestellplattform, des unveränderten Prototyps, der Formulare oder Sicherheitsheader.
- WCAG 2.2 AA, Tastaturnavigation und Breakpoints 375/768/1440 px mit Playwright und axe prüfen.
- CI lädt vollständige Screenshots der Funktionsübersicht und Unterseiten für die Designabnahme hoch.

## Vor der öffentlichen Freischaltung

- [ ] Screenshot-Abnahme und Textfreigabe der Projektleitung
- [ ] Tatsächlicher Funktionsumfang in der Bestellplattform per End-to-End-Test nachgewiesen
- [ ] Betreiberangaben, Impressum, Datenschutzerklärung und reale Datenflüsse geprüft
- [ ] Demo- und Anfragewege funktionsfähig und datenschutzrechtlich freigegeben
- [ ] Ggf. Paket-Zuordnung und alle Leistungsbeschränkungen bestätigt
- [ ] Hauptnavigation nach separater Freigabe von `planned` auf `live` stellen
- [ ] Explizite noindex-Flags erst im separaten Launch-PR nach Freigabe entfernen
- [ ] Keine Indexierung ohne separate Freigabe im Launch-PR #14
