# ADR 0003 – Isolation von der Bestellplattform

- **Status:** Angenommen
- **Datum:** 2026-11-19

## Kontext

Die Marketing-Website und die Bestellplattform werden unabhängig voneinander entwickelt. Fehler oder Fehlkonfigurationen in der Website dürfen den Bestellbetrieb nie gefährden. Ausserdem dürfen keine produktiven Daten in ein öffentliches Marketing-Projekt gelangen.

## Entscheid

Es gelten die verbindlichen [Isolationsregeln](../richtlinien/isolationsregeln.md) R1–R7, insbesondere:

- keine Verbindung zu produktiven Bestell-, Zahlungs- oder Kundendaten,
- keine Plattform-Secrets im Repository oder in den Netlify-Variablen dieser Website,
- Integration ausschliesslich über ausgehende Links und gegebenenfalls einen freigegebenen öffentlichen Read-only-Feed,
- keine Änderungen an anderen Repositories (Bestellplattform, `finanzplanerCH`).

## Konsequenzen

- Für den B2C-Finder werden Restaurantdaten zunächst als statische, geprüfte Daten im Repository gepflegt.
- Ein späterer Feed erfordert einen eigenen ADR inklusive Datenschema und Freigabe.
- Jeder Pull Request bestätigt die Einhaltung der Regeln.
