# PR #9 – Live-Demo und Pilotanfrage: technisches Fundament

**Status:** Entwickelt als sicherer Entwurf. Keine produktive Kontaktaufnahme, kein Demo-Redirect, keine Indexierung.

## Architektur

- `src/config/lead.ts`: feste Feldnamen, Demo-Freigabe und produktives Aktivierungs-Gating.
- `src/components/marketing/PilotLeadForm.astro`: dasselbe Formular als **inertes Layoutmuster** und als späteres natives Netlify Form.
- `/demo/`: öffentliche, dauerhafte noindex-Seite; solange `demoUrl: null`, keine externe Demo verlinkt.
- `/pilot/`: noindex; zeigt standardmässig **kein Formular**.
- `/intern/pilot/`: nicht indexierbare, aber **ohne Login öffentlich erreichbare** Formularvorschau; kein Versand, keine Speicherung.
- `/pilot/danke/`: noindex; ein direkter URL-Aufruf gilt nicht als Beweis eines erfolgreichen Formularversands.

### Testpflicht vor Aktivierung

- [ ] Demo tatsächlich im Browser für Abholung, Lieferung, Einkauf und Mobile UX prüfen.
- [ ] Sicherstellen, dass die Demo nur fiktive Restaurants, Gästedaten und Bestellungen enthält.
- [ ] Eigentumsrechte, Demo-Impressum, Anbieterauftritt und Cookies/Datenflüsse der Demo verifizieren.
- [ ] Demo-URL explizit freigeben und `demoUrl` in **einem eigenen überprüften PR** setzen.
- [ ] Firmenname/Betreiber, geschäftliche Kontaktadresse, öffentlich erreichbare Datenschutzinformationen verifizieren.
- [ ] `/datenschutz/` tatsächlich veröffentlichen und in der rechtlichen Navigation auf `live` setzen.
- [ ] Netlify Forms aktivieren und Verantwortliche sowie Benachrichtigungen und Zugriffsrechte definieren.
- [ ] Auftragsbearbeitung, Hostingländer, Aufbewahrungs- und Löschfrist sowie Spam-Schutz mit tatsächlichen Netlify-Einstellungen abgleichen.
- [ ] Vor der Aktivierung bei Netlify eine Testeinreichung mit **synthetischen Daten** durchführen; prüfen, ob Netlify Form Detection, Einwilligung und Erfolgspfad funktionieren.
- [ ] Test des nativen Formulars **ohne JavaScript** und mit Tastatur durchführen.
- [ ] Schutz vor übermässiger Einsendung / Spam entsprechend der tatsächlichen Rate-Limits bewerten.
- [ ] Erst danach Demo und Lead-CTA zur Navigation hinzufügen und separate Freigabe zum Merge einholen.

## Sicherung des produktiven Netlify-Formulars

Nur ein Produktions-Build mit den vier **exakt** auf `true` gesetzten Variablen darf ein echtes Formular generieren, und nur wenn die Datenschutzerklärung in `legalNavigation` als `live` aktiv ist:

```
CONTEXT=production
PILOT_LEADS_ENABLED=true
PILOT_PRIVACY_APPROVED=true
PILOT_PROCESSORS_APPROVED=true
PILOT_CONTACT_APPROVED=true
```

**Diese Variablen nicht im Repository setzen.** Sie sind Freigabeschalter, kein Ersatz für ein rechtliches oder technisches Audit. In CI/Deploy-Previews und ohne vollständige Angaben gibt es im statischen HTML **keine Netlify-Formularverbindung**.

Das Formular ist natives HTML ohne JavaScript, mit stabiler `form-name`-Zuordnung, `POST`, Netlify-Honeypot und Pflichtbestätigung der Datenschutzhinweise. Die Bestätigung ist **keine Marketing-Einwilligung**. Es werden keine Newsletter- oder Tracking-Opt-ins vorgetäuscht.

**Hinweis:** Netlify Forms werden erst nach einer erfolgreichen Produktionserstellung und tatsächlicher Netlify-Formularerkennung als funktionsfähig betrachtet. Vorher ist die technische Vorlage kein bestätigter Produktivkanal.

## Erfasste Felder (erst nach Freigabe)

| Feldname | Zweck | Pflicht |
| --- | --- | --- |
| `kontakt_name` | Geschäftliche Kontaktperson | Ja |
| `betrieb_name` | Name des Gastronomiebetriebs | Ja |
| `email` | Antwortadresse | Ja |
| `telefon` | Alternative Erreichbarkeit | Nein |
| `ort` | Standort für regionales Pilotprogramm | Ja |
| `betriebsart` | Restaurant / Takeaway / Café / Sonstige | Ja |
| `datenschutz_kenntnisnahme` | Bestätigung der Datenschutzhinweise | Ja |

Kein automatischer Export zu Make oder einem CRM. Späteres Schema-Mapping, Berechtigungen, Geheimnisse und Sicherheitsprüfungen bleiben eine eigenständige Aufgabe.

### Testdaten

In E2E-Tests ausschliesslich erfundene Betriebe und `example.invalid` verwenden. Keine echten Kundeninformationen speichern oder in GitHub Actions-Logs ausgeben.
