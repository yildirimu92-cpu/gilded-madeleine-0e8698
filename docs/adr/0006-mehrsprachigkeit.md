# ADR 0006 – Start in de-CH, Mehrsprachigkeit vorbereitet

- **Status:** Angenommen
- **Datum:** 2026-11-19

## Kontext

Der Schweizer Markt ist mehrsprachig. Zum Start wird nur Deutsch (de-CH) benötigt, FR, IT und EN sollen später ohne Umbau möglich sein.

## Entscheid

- Standardsprache **de-CH**, ausgeliefert ohne Sprachpräfix (`/preise`).
- Weitere Sprachen erhalten später ein Präfix (`/fr/…`, `/it/…`, `/en/…`). Die Astro-i18n-Konfiguration ist von Beginn an gesetzt.
- UI-Texte stehen in typisierten Wörterbüchern (`src/i18n/`), nicht verstreut in Komponenten. Fehlende Übersetzungen fallen auf de-CH zurück.
- `lang`, `hreflang` und Canonical-URLs werden zentral im Basislayout erzeugt.
- Formatierungen (CHF, Zahlen, Daten) laufen über `Intl` mit der jeweiligen Locale.

## Konsequenzen

- Etwas mehr Struktur am Anfang, dafür kein späterer Umbau der Routen.
