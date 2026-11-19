# Inhaltsregeln

- **Status:** Verbindlich (freigegeben November 2026)

## Marke

1. Der Markenname lautet ausschliesslich **IzyOrder**: ein Wort, „I“ und „O“ gross. Varianten wie „IZY Order“, „Izy Order“, „izyorder“ oder „IZY“ werden nicht verwendet, auch nicht in Alt-Texten, Metadaten und Dateinamen sichtbarer Assets.
2. Bis zum finalen Logo wird eine **typografische Wortmarke** in Inter verwendet. Sie ist als einzelne Komponente umgesetzt und damit zentral austauschbar.
3. Markenrichtung: Premium Swiss SaaS, Dunkelgrün, Mint als Akzent, warme neutrale Flächen.
4. Das IO-Monogramm (minimalistische Swiss-Tech-Logorichtung) bleibt **ausstehend**. Ein unfertiges oder angenähertes SVG wird nicht integriert (ADR 0010).

## Sprache

1. Startsprache ist **Deutsch (de-CH)** mit Schweizer Rechtschreibung (ss statt ß, Apostroph als Tausendertrennzeichen: CHF 1'000).
2. Anrede (freigegeben 19.11.2026):
   - **B2B-Texte** (Website für Gastronomiebetriebe) verwenden **«Sie»**.
   - **B2C-Texte** (Restaurantfinder `/bestellen`, Gäste) verwenden **«Du»**.
   - Der Claim **«Dein Restaurant. Deine Bestellungen.»** ist eine **feste Markenformel**. Er wird in beiden Bereichen unverändert verwendet und nicht an die Anrede angepasst.
3. Alle Texte werden so aufgebaut, dass später FR, IT und EN ergänzt werden können (siehe [ADR 0006](../adr/0006-mehrsprachigkeit.md)).

## Preise und Geschäftsmodell

1. Die Tarife lauten **Starter CHF 79**, **Professional CHF 149** und **Business CHF 249** pro Monat, jeweils **exkl. MWST**. Der Hinweis „exkl. MWST“ steht immer sichtbar bei den Preisen.
2. Der vorgesehene Jahresrabatt beträgt **15 %**. Er wird erst nach Freigabe der konkreten Konditionen veröffentlicht.
3. Die Einrichtung kann der Betrieb grundsätzlich selbst vornehmen. Einrichtungsdienstleistungen sind **optional**.
4. **Vor der Veröffentlichung freizugeben:** die Leistungen je Tarif und allfällige Setup-Gebühren. Bis dahin werden sie nicht publiziert.
5. „0 % Plattformprovision“ wird immer klar von **Gebühren der Zahlungsanbieter** (z. B. Kartengebühren) getrennt. Formulierungen wie „keine Gebühren“ oder „kostenlos“ ohne diese Einschränkung sind unzulässig.
6. Preise und Tarifdaten werden später aus **einer zentralen Datenquelle** im Code gepflegt, nicht mehrfach im Text.

## Wahrheitsgehalt

1. **Keine fiktiven Restaurants als reale Partner.** Beispieldaten sind sichtbar als Beispiel gekennzeichnet und werden nicht indexiert.
2. **Keine unbelegten Aussagen** zu:
   - Datenstandorten oder Hosting-Regionen,
   - Referenzen, Kundenzahlen, Logos, Bewertungen, Testimonials,
   - Produktverfügbarkeit: Geplante Funktionen wie die KI-Telefonassistenz werden als „geplant“ bzw. „in Entwicklung“ gekennzeichnet,
   - Zertifizierungen oder Sicherheitsstandards.
3. **Provisionsrechner:** Annahmen (Umsatz, Provisionssatz, Tarif) sind transparent und veränderbar. Ergebnisse werden als Beispielrechnung formuliert, **nicht als garantierte Ersparnis**.

## Conversion

1. Primäre Aktionen: **„Live-Demo ansehen“** und **„Pilotplatz anfragen“**.
2. Formulare erfassen nur notwendige Daten, verlinken die Datenschutzerklärung und holen eine ausdrückliche Einwilligung ein, wo sie nötig ist.

## Freigabe

Neue oder geänderte Aussagen zu Preisen, Leistungen, Daten und Referenzen werden in der Beschreibung des Pull Requests gesondert aufgeführt und von der Projektleitung freigegeben.
