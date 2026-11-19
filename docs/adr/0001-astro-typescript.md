# ADR 0001 – Astro, TypeScript und komponentenbezogenes CSS

- **Status:** Angenommen
- **Datum:** 2026-11-19

## Kontext

Die Website soll SEO-stark, sehr schnell und mobil optimiert sein. Sie besteht überwiegend aus Inhalten und hat einzelne interaktive Elemente: Restaurantsuche, Provisionsrechner, Formulare. Der bisherige Prototyp ist eine einzelne HTML-Datei, die ihren gesamten Inhalt clientseitig rendert.

## Entscheid

- **Astro** mit statischer Ausgabe (`output: 'static'`).
- **TypeScript** im Modus `strict`. Typprüfung mit `astro check` in der CI.
- **Komponentenbezogenes CSS**: Styles in Astro-Komponenten (`<style>`, automatisch gescoped), globale Design-Tokens als CSS Custom Properties.
- Interaktive Teile werden als kleine Client-Skripte bzw. Inseln umgesetzt. Ein zusätzliches UI-Framework kommt nur bei nachgewiesenem Bedarf und mit eigenem ADR.

## Konsequenzen

- Seiten werden als vollständiges HTML ausgeliefert. Das ist gut für SEO, Performance und Barrierefreiheit.
- Ein Build-Schritt ist nötig (`npm run build` → `dist/`).
- Die Logik (Suche, Rechner) liegt in `src/lib/` als reines TypeScript und ist unabhängig vom Framework testbar.

## Verworfene Alternativen

- **Next.js / Nuxt**: für eine überwiegend statische Marketing-Website zu schwer, mehr JavaScript beim Client.
- **Reines HTML weiterführen**: nicht skalierbar, keine Komponenten, keine Typprüfung.
- **Tailwind CSS**: verworfen zugunsten eigener Tokens und scoped CSS, wie von der Projektleitung festgelegt.
