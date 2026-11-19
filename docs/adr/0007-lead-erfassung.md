# ADR 0007 – Lead-Erfassung über Netlify Forms

- **Status:** Angenommen
- **Datum:** 2026-11-19

## Kontext

Die primären Conversions sind „Live-Demo ansehen“ und „Pilotplatz anfragen“. Leads sollen sofort erfasst werden können, ohne eigenes Backend und ohne Verbindung zur Bestellplattform.

## Entscheid

- Formulare nutzen **Netlify Forms** (statische HTML-Formulare mit `data-netlify="true"`), mit Honeypot-Feld und serverseitiger Spam-Filterung durch Netlify.
- Erfasst werden nur notwendige Felder. Die Datenschutzerklärung ist verlinkt, die Einwilligung wird eingeholt, wo sie erforderlich ist.
- Benachrichtigungen per E-Mail werden in Netlify konfiguriert.
- **Vorbereitung CRM:** Das Formularschema (Feldnamen, Formularnamen) wird stabil und dokumentiert gehalten, damit später eine Weiterleitung per Netlify-Webhook an Make oder ein CRM möglich ist. Die Weiterleitung führt ausschliesslich in Vertriebssysteme (Isolationsregel R2).
- Netlify Forms ist im Projekt derzeit **nicht aktiviert**. Die Aktivierung erfolgt mit dem Formular-PR und nach Freigabe.

## Konsequenzen

- Kein eigenes Backend und keine eigenen Secrets nötig.
- Die Aufbewahrung der Daten liegt bei Netlify. Das muss in der Datenschutzerklärung beschrieben werden (Datenbearbeitung durch einen US-Anbieter).
