# Isolationsregeln

- **Status:** Verbindlich (freigegeben November 2026)
- **Gilt für:** alle Beiträge zu diesem Repository, auch durch Automatisierungen und KI-Agenten

Die Marketing-Website ist ein **eigenständiges Projekt**. Sie darf die IzyOrder-Bestellplattform weder technisch noch organisatorisch beeinträchtigen.

## R1 – Keine Verbindung zu produktiven Daten

1. Dieses Repository greift **nicht** auf produktive Bestell-, Zahlungs-, Kunden- oder Restaurantdaten zu, weder lesend noch schreibend.
2. Es gibt keine Datenbankverbindungen, Service-Keys oder Admin-Tokens der Bestellplattform, zum Beispiel für Supabase, Zahlungsanbieter oder Plattform-APIs.
3. Eine spätere Anbindung an Restaurantdaten ist nur zulässig über einen **öffentlichen, nur lesenden Datenfeed**, der:
   - von der Plattform ausdrücklich zur Veröffentlichung freigegeben ist,
   - nur Daten enthält, die ohnehin öffentlich sind (Name, Ort, Küche, Shop-URL),
   - ohne Zugangsdaten abrufbar ist,
   - vor der Integration als eigener Architekturentscheid freigegeben wird.

## R2 – Keine schreibenden Zugriffe auf die Plattform

1. Formulare dieser Website (Demo-Anfrage, Pilotplatz, Restaurant wünschen) schreiben **nie** in Systeme der Bestellplattform.
2. Leads gehen zunächst an **Netlify Forms**. Eine spätere Weiterleitung an Make oder ein CRM erfolgt ausschliesslich in Vertriebssysteme, nicht in die Plattform.

## R3 – Verbindung nur über Links

1. Die Website verlinkt auf die Plattform (Login, Restaurant-Shops, Demo-Shop) ausschliesslich über **normale ausgehende Links**.
2. Es gibt kein Einbetten von Plattformfunktionen per iframe oder Script, sofern nicht separat freigegeben.

## R4 – Getrennte Infrastruktur

1. Eigenes Netlify-Projekt, eigene Umgebungsvariablen, eigene Domains bzw. Pfade.
2. Security-Header (insbesondere HSTS, CSP und Cookies) gelten nur für die Hosts dieser Website. Sie dürfen **keine Subdomains** der Plattform einschränken. Deshalb gilt HSTS vorerst ohne `includeSubDomains` und ohne `preload`, und es werden keine Cookies mit Domain-Attribut für `*.izyorder.ch` gesetzt.
3. DNS-Änderungen an der Hauptdomain werden nur mit ausdrücklicher Freigabe und nach Abstimmung mit dem Plattformbetrieb vorgenommen.

## R5 – Keine Änderungen an anderen Repositories

1. Arbeiten im Rahmen dieses Projekts verändern **ausschliesslich** dieses Repository.
2. Ausdrücklich ausgeschlossen sind:
   - das Repository der IzyOrder-Bestellplattform,
   - das Repository `finanzplanerCH`,
   - produktive Plattformdienste (Datenbanken, Edge Functions, Zahlungs-Accounts, Automatisierungen).
3. Angebundene Werkzeuge (Netlify, Supabase, Make usw.) werden für dieses Projekt nur **lesend** und nur mit Rücksprache genutzt. Ausgenommen ist das Netlify-Projekt dieser Website nach ausdrücklicher Freigabe.

## R6 – Secrets

1. Es werden keine Secrets im Repository gespeichert.
2. Benötigte Konfiguration (z. B. ein späterer CRM-Webhook) wird als Netlify-Umgebungsvariable hinterlegt und dokumentiert, ohne ihren Wert zu nennen.
3. Clientseitig sichtbare Variablen (Präfix `PUBLIC_`) dürfen nie Zugangsdaten enthalten.

## R7 – Freigaben

| Aktion | Freigabe nötig |
|---|---|
| Pull Request erstellen | Nein (gemäss Entwicklungsplan) |
| Merge in `main` | **Ja**, durch die Projektleitung |
| Produktionsdeployment, Domainwechsel | **Ja** |
| Indexierung aktivieren (`SITE_INDEXING=true`) | **Ja** |
| Neue externe Dienste oder Datenquellen | **Ja**, als ADR |

## Prüfung

Jeder Pull Request bestätigt in seiner Beschreibung, dass die Regeln R1–R6 eingehalten sind.
