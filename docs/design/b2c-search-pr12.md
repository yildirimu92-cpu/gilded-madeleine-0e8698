# PR #12 – Sichere B2C-Suche und Datenschema

**Status:** Technisches Fundament, kein Restaurantfinder und keine freigegebenen Gastronomiepartner. Die Integration in `/bestellen/` ist ausdrücklich PR #13 vorbehalten.

## Herkunft der Logik

Geprüft aus `public/prototyp/index.html`, der gesicherten **byte-identischen** B2C-Demo, und dem Audit `docs/audit/2026-11-prototyp-audit.md`:

- Normalisierung von Umlauten/Diakritika und alternativen Schreibweisen
- Suche über Ort, Postleitzahl, Restaurantname oder Küche
- Sieben Beispielorte und zwölf PLZ-Zuordnungen aus der Demo
- Modus Abholung/Lieferung mit freigegebenen Liefergebieten
- Küchenfilter und Rückfall von Lieferung auf Abholung
- Getrennte Ergebnisgruppen für freigegebene Einträge mit/ohne Bestelllink

**Bewusste Verbesserungen gegenüber der alten Demo:** Auch bei einer Textsuche wird niemals die Ortsgrenze oder das Liefergebiet umgangen. Unbekannte PLZ liefern keinen falschen Treffer im zuletzt gewählten Ort. Suchbegriffe bleiben im Liefermodus erhalten. HTML wird nicht mittels `innerHTML` aus ungeprüften Daten zusammengebaut.

## Dateien und Verantwortlichkeiten

| Datei | Zweck |
| --- | --- |
| `src/lib/restaurant-search.ts` | Reine Suchlogik, Normalisierung, Ortsauflösung, Küchen- und Liefergebietfilter |
| `src/data/restaurant-schema.ts` | Typen, Laufzeit-Validierung, HTTPS-Link-Prüfung und HTML-Escaping |
| `src/data/restaurants.ts` | Leerer Katalog: noch **keine** geprüften echten Partner |
| `tests/unit/restaurant-search.test.ts` | Tests für Suche, Grenzen, Datenmodell, Sicherheitsfälle |

## Veröffentlichungsgate

Ein öffentlich dargestelltes Restaurant muss folgenden Prüfprozess durchlaufen:

1. Betrieb ist echt und mit überprüfbarer öffentlicher Kontaktinformation identifiziert
2. Veröffentlichungsfreigabe und erforderliche Nutzungsrechte sind dokumentiert
3. Ort, Bestellarten, Liefergebiete, Bezeichnungen und Küche sind überprüft
4. Bestelllink ist ein tatsächlich freigegebenes, getestetes HTTPS-Ziel, **keine** Demo-Adresse
5. `listingStatus='approved'` und `verifiedAt` werden erst nach menschlicher Prüfung gesetzt
6. Verzeichnisdaten werden über `parseRestaurantListing` validiert; die Suche filtert `draft` immer heraus

**Wichtig:** Ein eingetragenes `approved`-Flag ist technisch kein Nachweis der tatsächlichen Einwilligung. GitHub-Review und verantwortliche Prüfung bleiben Pflicht.

Die zwölf Prototyp-Restaurants sind **frei erfunden** und werden nicht in den produktiven Restaurantkatalog kopiert. Alle synthetischen Fixtures bleiben ausschliesslich in Unit-Tests.

## Integrationsgrenzen

- Keine Änderungen an `public/prototyp/index.html` oder der isolierten Bestellplattform
- Kein Zugriff auf Gäste-, Zahlungs-, Bestell- oder Accountdaten
- Keine externe API, kein Authentifizierungs-Token, keine Tracking-Dienste
- Keine neuen öffentlichen Restaurantseiten oder Orts-SEO-Seiten
- Keine Änderungen an Header/Footer, `/bestellen/`, Indexierung oder Demo-CTA
- Keine HTML-Strings aus API-Daten in `innerHTML`; Astro `{text}` und sichere DOM-APIs nutzen
- Im späteren B2C-Interface ausschliesslich tatsächliche, geprüfte Partner als bestellbar bezeichnen
- Für eine spätere Read-only-API braucht es einen separaten ADR

## PR #13 – nächste Stufe

Die B2C-Oberfläche auf `/bestellen/` muss bei einem **leeren** Katalog einen ehrlichen Leerzustand anzeigen. Es darf kein Restaurant vorgespiegelt werden. UX für Ortswahl, PLZ, Abholen/Liefern, Küchenfilter, Ergebnisliste und Leerzustand testbar umsetzen, aber öffentliche Indexierung und Navigation erst nach Freigabe aktivieren.
