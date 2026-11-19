# ADR 0008 – Wortmarke IzyOrder und Schrift Inter

- **Status:** Angenommen
- **Datum:** 2026-11-19

## Kontext

Das finale Logo wird separat entwickelt. Bis dahin braucht die Website eine hochwertige, konsistente Markendarstellung. Der Prototyp nutzt verschiedene Schreibweisen und eine nicht passende Schriftwahl.

## Entscheid

- Markenname ausschliesslich **IzyOrder**.
- Übergangsweise eine **typografische Wortmarke** in Inter, umgesetzt als einzelne Komponente (`Wordmark`). Alle Stellen verwenden diese Komponente, damit das finale Logo an einer Stelle ersetzt werden kann.
- Schrift **Inter** (SIL Open Font License), **selbst gehostet** als WOFF2, variable Achse für Strichstärke, auf Latin bzw. Latin-Extended reduziert, `font-display: swap`, Preload für den Haupt-Schnitt. Kein Laden von Google Fonts oder anderen Drittanbietern.
- Markenrichtung Dunkelgrün, Mint und warme Neutraltöne. Die konkreten Tokens werden im Designsystem-PR festgelegt.

## Konsequenzen

- Keine Datenübermittlung an Schriftanbieter (datenschutzfreundlich, CSP bleibt bei `'self'`).
- Die Lizenzdatei von Inter wird mit den Schriftdateien im Repository abgelegt.
