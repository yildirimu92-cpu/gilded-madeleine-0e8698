# IzyOrder – Tarifmodell und öffentliche Preisfreigabe

**Status: Intern und nicht freigegeben.** Die Vorschau unter `/intern/preise/` ist nicht indexierbar, jedoch über ihre URL öffentlich erreichbar. Dies ist kein geschützter Bereich. Keine geheimen Einkaufs-, Kunden- oder Vertragsdaten einstellen.

## Datenquelle

`src/config/pricing.ts` enthält die einzigen Monats-Tarifbeträge für den Entwurf:

| Tarif | CHF/Monat (exkl. MWST) | Bei 15 % Jahresrabatt: CHF/Jahr (exkl. MWST) | Monatlich äquivalent |
| --- | ---: | ---: | ---: |
| Starter | 79 | 805.80 | 67.15 |
| Professional | 149 | 1'519.80 | 126.65 |
| Business | 249 | 2'539.80 | 211.65 |

**Alle Jahresbeträge sind unverbindliche Beispielrechnungen.** Es wurde kein Vertragsangebot veröffentlicht. Abrechnungsbeginn, Leistungsumfang, Setup-Gebühren und genaue Jahresbedingungen sind noch nicht entschieden.

Der Code rechnet in Rappen, bevor er Ergebnisse in CHF ausgibt.

## Freigaben für die öffentliche Seite `/preise/`

- [ ] Leistungen von Starter, Professional und Business verbindlich definiert und technisch belegbar
- [ ] Leistungsgrenzen und allfällige Fair-Use-Regeln bestätigt
- [ ] Gültigkeit und Vertragsbedingungen des 15-%-Jahresrabatts bestätigt
- [ ] Kündigungs- und Verlängerungsbedingungen durch fachlich Verantwortliche geprüft
- [ ] Setup-Konditionen und optionaler Einrichtungsservice festgelegt
- [ ] Beginn der Abrechnung ab Live-Schaltung vertraglich geprüft
- [ ] Zahlungsanbietergebühren separat, deutlich und korrekt ausgewiesen
- [ ] Keine Vermischung mit der separat geplanten KI-Telefonassistenz
- [ ] Rechtliches (Impressum/Datenschutz) vor kommerziellem Launch veröffentlicht
- [ ] Aktivierung von Produktseiten, Preisseite und CTAs erst nach Freigabe

Der öffentlich zugängliche Restaurantfinder und die Bestellplattform sind **nicht Teil dieses PRs**.

## Strategische Abnahme

Empfohlene Differenzierung: Starter = einfacher Direktbestellshop, Professional = Wachstumsoption für regelmässige Bestellungen, Business = Betriebsabläufe und höhere Anforderungen. Das sind **Positionierungsideen**, keine bestätigten technischen Tarifmerkmale oder Leistungsgrenzen.

Keine Behauptung von unbegrenzten Bestellungen, Schweizer Hosting, automatischen Integrationen oder bestehenden Kunden ohne technische Prüfung.
