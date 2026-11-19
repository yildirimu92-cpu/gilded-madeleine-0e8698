# Audit des bestehenden Prototyps

- **Stand:** November 2026
- **Gegenstand:** `index.html` (einzige Datei im Repository, Commit `74fae4f`, „Initial commit via Netlify“)
- **Status:** Freigegeben durch die Projektleitung

## Methodik

- Vollständige Code-Durchsicht der Datei.
- Lokales Rendering in Chromium (Playwright) bei 375 px, 768 px und 1440 px.
- Automatisierter Accessibility-Test mit axe-core 4.10 (Regelsätze WCAG 2.0/2.1 A und AA sowie Best Practices), inklusive geöffnetem Dialog.
- Messung der Touch-Ziele und der eingebetteten Assets.

**Nicht geprüft:** Die HTTP-Antwort-Header der Live-Website (`gilded-madeleine-0e8698.netlify.app`) konnten aus der Analyseumgebung nicht abgerufen werden. Im Repository existiert keine Header-Konfiguration (`netlify.toml`, `_headers`).

## 1. Bestandsaufnahme

| Punkt | Befund |
|---|---|
| Umfang | Eine Datei (`index.html`), kein Build, kein Framework, keine Abhängigkeiten |
| Grösse | **605 KB**, davon **ca. 584 KB (96 %) Base64-Daten**: drei Schriftdateien und vier WebP-Bilder. Eigentlicher Code ca. 21 KB |
| Daten | 12 fiktive Restaurants, 7 Orte und eine PLZ-Zuordnung (Region Luzern) fest im JavaScript |
| Charakter | Ausdrücklich als Designentwurf gekennzeichnet (`noindex,nofollow`, Hinweise „Beispieldaten“ und „simuliert“) |

### Eingebettete Assets

| Asset | Grösse (dekodiert) |
|---|---|
| Schrift „DM“ (DM Sans, variabel) | 36 KB |
| Schrift „Instrument“ (Instrument Serif, normal) | 21 KB |
| Schrift „Instrument“ (Instrument Serif, kursiv) | 22 KB |
| Hero-Bild (Pizza) | 199 KB |
| Kartenbilder Pizza, Kebab, Burger | 55 KB, 52 KB, 43 KB |

## 2. Vorhandene Funktionen

1. **Suche** nach Ort, PLZ oder Restaurant. Die Suche normalisiert Umlaute und Diakritika und ordnet PLZ einem Ort zu.
2. **Umschalter Abholen / Liefern lassen** mit Filter nach Liefergebiet. Ist keine Lieferung möglich, bietet die Seite Abholung an.
3. **Ortsauswahl per Schnellklick** und **Filter nach Küche** (Pizza, Kebab, Burger).
4. **Restaurantkarten** mit Zubereitungs- oder Lieferzeit, Liefergebühr, Mindestbestellwert und Hinweisen („Gleicher Preis wie vor Ort“, „Kurierpartner“, „Restaurant liefert selbst“).
5. **Speisekarte als Dialog**. Für ein Beispielrestaurant gibt es einen Link zur externen Bestelldemo `takeaway-demo-lindenhof.netlify.app`.
6. **„Restaurant wünschen“** für noch nicht angeschlossene Betriebe. Das Formular ist simuliert, es werden keine Daten gespeichert.
7. **„Für Restaurants“**: nur ein Dialog mit einem Satz und einem Link zum Prototyp. Inhalte für Restaurantbetreiber fehlen praktisch ganz.

## 3. Design

- Farbwelt Rost, Creme und Braun. Instrument Serif für Headlines, DM Sans für Fliesstext.
- Die Gestaltung ist hochwertig umgesetzt, wirkt aber wie eine Gastronomie-Seite für Endkunden und nicht wie ein B2B-SaaS-Auftritt.
- Sie passt nicht zur neuen Markenrichtung (Dunkelgrün, Mint, warme Neutraltöne).
- Die Marke wird uneinheitlich geschrieben: „IZY Order“, „izyorder.“, „IZY“. Ab sofort gilt verbindlich **IzyOrder** (siehe [Inhaltsregeln](../richtlinien/inhaltsregeln.md)).

## 4. Technische Bewertung

| Bereich | Bewertung | Befund |
|---|---|---|
| Struktur | Schwach | Eine Datei, in der Daten, Logik und Darstellung vermischt sind. Keine URLs pro Ort oder Restaurant. Das Statusfeld `state.route` ist ungenutzt |
| Performance | Mittel bis schwach | Ca. 130 KB Base64-Schriften im `<head>` blockieren das erste Rendern. Assets sind nicht separat cachebar und durch die Base64-Kodierung ca. 33 % grösser. Kein `srcset`, kein Favicon |
| Responsiveness | Gut | Kein horizontales Scrollen bei 375, 768 und 1440 px. Der Platzhaltertext im Suchfeld wird auf dem Smartphone abgeschnitten |
| Accessibility | Gut | axe-core findet **keine Verstösse** (Seite und Dialog). Vorhanden sind `aria-pressed`, `aria-live`, sichtbare Fokusrahmen, natives `<dialog>` und `prefers-reduced-motion`. **Lücke:** Die Orts-Buttons sind nur 21 px hoch, WCAG 2.2 (Kriterium 2.5.8) verlangt mindestens 24 px |
| SEO | Ungenügend (bewusst) | `noindex,nofollow`. Es fehlen Canonical, Open Graph, strukturierte Daten, Sitemap und `robots.txt`. Alle Inhalte werden clientseitig erzeugt |
| Sicherheit | Heute unkritisch, später riskant | Die Seite baut HTML per `innerHTML` aus Zeichenketten zusammen, ohne Escaping. Mit echten Daten aus einer API entstünde eine **XSS-Lücke**. Inline-Script und Inline-Styles verhindern eine strikte Content Security Policy |
| Recht (CH) | Fehlt | Kein Impressum, keine Datenschutzerklärung nach revDSG. Beides ist spätestens bei echter Datenerfassung erforderlich |

## 5. Wiederverwendung

| Element | Vorgehen |
|---|---|
| Suchlogik (`placeFrom`, `normal`, PLZ-Zuordnung, Fallback auf Abholung) | Als TypeScript-Modul mit Unit-Tests übernehmen |
| UX-Muster (Umschalter für die Bestellart, Hinweis bei fehlenden Treffern, „Restaurant wünschen“) | Konzeptionell übernehmen |
| Accessibility-Grundlagen (Dialog, ARIA-Zustände, Fokusführung) | Übernehmen |
| Datenmodell Restaurant | In ein validiertes Schema überführen |
| Bilder | Extrahieren und responsiv ausliefern, falls weiterverwendet |
| Fiktive Restaurantdaten | **Nicht** als reale Partner verwenden oder indexieren (siehe Inhaltsregeln) |
| Schriften und Farbwelt | Durch die neue Markenidentität ersetzen (Inter, Dunkelgrün, Mint) |

## 6. Konsequenzen

Der Prototyp wird unverändert unter `/prototyp` gesichert (siehe [ADR 0004](../adr/0004-routing-bestellen-und-prototyp.md)). Die neue Website wird in Astro neu aufgebaut. Die wiederverwendbaren Elemente werden schrittweise gemäss [Entwicklungsplan](../entwicklungsplan.md) übernommen.
