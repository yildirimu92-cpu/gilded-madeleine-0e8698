# PR #11 – IzyOrder Provisionsrechner

**Status:** Interaktiver, unverbindlicher Kostenvergleich als Draft. Keine Indexierung, keine öffentliche Navigation und keine Freigabe der Preise, Funktionen oder Demo.

## Grundmodell und begrenzter Aussagewert

Der Rechner untersucht **einen selbst gewählten Anteil der bisherigen Marktplatzbestellungen**, der künftig über einen eigenen Direktbestellshop eingehen könnte. **Keine** zusätzliche Nachfrage, keine konstante tatsächlich erzielbare Umlenkung und keine Umsatzsteigerung wird behauptet.

**Eingaben (reines Beispiel):**
- Bisher 200 Marktplatzbestellungen pro Monat
- Durchschnittlicher Warenkorb CHF 38
- Vergleichbare bestehende Plattformprovision 15 %
- Hypothetisch auf Direktbestellungen umgelenkte Bestellungen 30 %
- Angenommene direkte Zahlungsgebühr 2 % plus CHF 0.30 je Bestellung
- IzyOrder Professional CHF 149 pro Monat (Tarif **nicht** endgültig freigegeben)

**Berechnung:**
1. Umgeleitete Bestellungen = gerundete ganze Bestellungen aus Monatsmenge × Umlenkungsanteil.
2. Potenziell vermiedene Marktplatzprovision = umgeleitete Bestellungen × Warenkorb × bisheriger Provisionssatz.
3. Direkte Zahlungsgebühren = umgeleitete Bestellungen × Warenkorb × Zahlungsgebühr in % plus umgeleitete Bestellungen × fixe Zahlungsgebühr.
4. Monatliche Kostendifferenz = vermiedene Provision − direkte Zahlungsgebühren − IzyOrder-Monatsabo.
5. Jahresvergleich = Monatsergebnis × zwölf identische Monate; **ohne** einen bislang nicht freigegebenen Jahresrabatt.
6. Break-even: Mindestzahl umgeleiteter Aufträge, bei der die Differenz nicht mehr negativ wird, höchstens aber die eingegebene Zahl bisheriger Marktplatzbestellungen. Wenn das nicht erreichbar ist, wird **keine** fiktive Gewinnschwelle ausgegeben.

**Beispielrechnung:** 60 umgeleitete Bestellungen, CHF 2’280 Umsatzvolumen, CHF 342 wegfallende Marktplatzprovision, CHF 63.60 angenommene Zahlungsgebühren, CHF 149 Abo ⇒ CHF 129.40 rechnerischer Kostenvorteil pro Monat / CHF 1’552.80 für zwölf gleichbleibende Monate. Break-even ab 33 umgeleiteten Bestellungen (16.5 %).

Bei fehlender Verlagerung oder ungünstigen Gebühren kann das Ergebnis ausdrücklich **Mehrkosten** anzeigen. Die Eingaben sind weder Marktdaten noch zugesicherte Gebühren von Just Eat, Uber Eats, Stripe oder TWINT.

## Nicht abgedeckte Kosten und Risiken

- Transport und eigene Lieferpersonalkosten
- Marketing, Werbung, Kundenakquise, Rückgewinnung und Kundenkommunikation
- Setup, Schulung, Betrieb und Support, weitere Software- oder Integrationskosten
- Steuern, Zahlungsrückbuchungen, Retouren, Stornierungen, Gebühren über die gewählten Beispiele hinaus
- Saison, Angebotsmix, Preisunterschiede, Ausfälle, Steuern und Gewinnmargen
- Bestellungen, die sich tatsächlich verlagern lassen, und mögliche Vertragsbindungen mit Marktplätzen
- Zusätzliche Umsätze, ROI oder garantierte Gewinne

**Die Beispielzahlen sind frei gewählte Annahmen; sie repräsentieren keine marktüblichen Anbieterpreise.** Vor öffentlicher Kampagnenverwendung sind Produktumfang und Aussagen zu prüfen.

## Umsetzung / Sicherheit

- Route `/provisionsrechner/`: **explizit noindex** auch bei späterem produktiven Indexierungs-Flag.
- Nicht in Header, Footer oder Sitemap; bestehende Navigation bleibt unverändert.
- Reines lokales TypeScript und schlankes Browser-Script; **keine Daten an Server, Netlify Forms, Analytics oder externe APIs**.
- Kein Formular und kein automatischer Lead-CTA. Ohne JavaScript bleibt die Beispielrechnung vollständig lesbar.
- Neue zentrale Logik: `src/lib/commission-calculator.ts`, UI: `src/components/marketing/CommissionCalculator.astro`.
- Preise kommen aus `src/config/pricing.ts`, **kein kopierter oder abweichender Tarifpreis**.
- Unit-Tests prüfen Null- und Negativfälle, Rundung, Break-even und ungültige Eingaben.
- E2E prüft Interaktivität, Reset, Fehlermeldung, no-JS, keine POSTs, Noindex, WCAG 2.2 AA und Darstellung bei 375, 768 und 1440 px.
- CI-Screenshots als Artefakt vor Merge visuell abnehmen.

## Freigabekriterien

- [ ] GitHub-CI und Codex-Review ohne offene Befunde
- [ ] Desktop- und Mobile-Screenshots visuell geprüft
- [ ] Rechtliche Seiten und Datenschutzinformation geprüft, bevor der Rechner aktiv vermarktet oder zur Leadgewinnung verlinkt wird
- [ ] Tarife, Funktionsumfang, tatsächliche Zahlungsgebühren und Modellannahmen als unverbindlich gekennzeichnet
- [ ] Geplante öffentliche Navigation und Indexierung nur in eigenem freigegebenen Launch-PR
