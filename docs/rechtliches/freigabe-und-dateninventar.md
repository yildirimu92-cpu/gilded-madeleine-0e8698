# IzyOrder – Rechtliche Freigabe vor Veröffentlichung

**Status: offen – nur internes Arbeitsdokument im öffentlichen Repository, kein Rechtstext.**

Diese Liste ist eine Arbeitsgrundlage und ersetzt keine rechtliche Prüfung. Für PR #6 dürfen rechtliche Seiten erst erstellt und in der Navigation aktiviert werden, wenn die Angaben zum tatsächlichen Betreiber und die Datenbearbeitungen verifiziert sind. Niemals Muster- oder erfundene Angaben als fertiges Impressum bzw. als Datenschutzerklärung ausgeben.

## 1. Betreiberangaben – vom Projektinhaber zu bestätigen

**Geschäftsentscheidung vom 19.11.2026:** IzyOrder soll zu Beginn als **Einzelunternehmen (Einzelfirma)** betrieben werden. Dies ist die geplante Rechtsform, keine Bestätigung einer bereits erfolgten Gründung oder Handelsregistereintragung. Die Marke bleibt **IzyOrder**; die rechtlich korrekte Firmenbezeichnung inklusive Familienname und der tatsächliche Inhaber sind vor Veröffentlichung zu verifizieren.


- [x] Rechtsform für die Startphase entschieden: **Einzelunternehmen (geplant)**
- [ ] Tatsächlicher Inhaber und vollständige rechtliche Firmenbezeichnung (Familienname erforderlich) bestätigt
- [ ] Gründungsstatus und allfälliger Handelsregistereintrag geklärt
- [ ] Geschäfts- bzw. Zustelladresse
- [ ] Funktionierende geschäftliche E-Mail-Adresse und Kontaktweg
- [ ] UID, Handelsregister- und MWST-Status sowie weitere Identifikationsdaten, soweit vorhanden oder rechtlich erforderlich
- [ ] Zuständige Kontaktstelle für Datenschutzanfragen
- [ ] Veröffentlichungsberechtigung und Prüfung des Impressums durch verantwortliche Person

**Wichtig:** Hier keine nicht öffentlichen persönlichen Adressen oder Zugangsdaten ergänzen. Vertrauliche Angaben vor Veröffentlichung separat abstimmen. Beim Einzelunternehmen haftet die Inhaberin bzw. der Inhaber grundsätzlich persönlich; die gewählte Rechtsform sollte vor Aufnahme des produktiven Geschäftsbetriebs auch im Hinblick auf Zahlungsabwicklung, Datenschutz und Haftungsrisiken beurteilt werden.

Hinweise zur Rechtsform: [KMU-Portal – Einzelunternehmen](https://www.kmu.admin.ch/de/rechtsform-einzelunternehmen), [SECO – Onlinehandel](https://www.seco.admin.ch/de/onlinehandel), [ESTV – MWST](https://www.estv.admin.ch/de/mehrwertsteuer).

## 2. Tatsächliche Datenflüsse – getrennt je Produktbereich erfassen

Für jeden Vorgang: Zweck, Datenkategorien, Rechtsgrundlage soweit erforderlich, Empfänger/Auftragsbearbeiter, Land, Aufbewahrung/Löschung und Kontaktweg dokumentieren.

| Bereich | Zu klären | Status |
| --- | --- | --- |
| Marketingwebsite / Netlify | Server- und Zugriffslogs, Hosting, technische Sicherheitsfunktionen | ungeprüft |
| Kontakt- / Pilotanfrage | Felder, Netlify Forms, Spam-Schutz, E-Mail/CRM/Make, Speicherdauer | noch nicht aktiviert |
| Webanalyse / Cookies | Ob Tools, Cookies oder ähnliche Technologien überhaupt aktiv sind | ungeprüft |
| Demo | Welche Demo verlinkt wird und ob dort personenbezogene Daten anfallen | noch nicht freigegeben |
| Bestellplattform | Registrierung, Restaurant- und Gästedaten, Hosting, Auftragsbearbeiter | separat zu verifizieren |
| Zahlungen | Zahlungsanbieter, Zahlungsdaten, Datenschutzinfos Dritter | separat zu verifizieren |
| KI-Telefonie | Sprachanrufe, Transkription, allfällige Aufzeichnungen, Unterauftragnehmer, Auslandbezug | nicht als live bewerben |

Keine pauschalen Aussagen wie «100 % Schweizer Hosting», «keine Cookies» oder «keine Drittlandübermittlung» ohne überprüfbare Grundlage treffen.

## 3. Freigabe-Gates

- [ ] Rechtlicher Betreiber und Kontaktangaben bestätigt
- [ ] Dateninventar und tatsächliche Dienstleister verifiziert
- [ ] Rechtstexte fachlich geprüft, final abgenommen und versioniert
- [ ] Öffentliche Seiten /impressum/ und /datenschutz/ mit PublicLayout umgesetzt und gegen WCAG geprüft
- [ ] Rechtliche Links erst nach Seitenexistenz und Freigabe auf `live` setzen
- [ ] Keine Mustertexte, TODO-Platzhalter oder ungeprüften Aussagen in öffentlicher Navigation
- [ ] Sitemap nur für freigegebene indexierbare Produktionsseiten
- [ ] `SITE_INDEXING=true` weiterhin gesperrt bis separater Launch-Freigabe

## 4. Technischer Stand in diesem Draft-PR

Der Sitemap-Mechanismus ist vorbereitet, wird aber **ausschliesslich** bei `CONTEXT=production` und `SITE_INDEXING=true` aktiv. Vorher wird keine `sitemap.xml` erzeugt und `robots.txt` erhält keinen Sitemap-Verweis. Interne Seiten und der nicht freigegebene Prototyp bleiben ausgeschlossen.

**Noch nicht enthalten:** Rechtstexte, veröffentlichte Rechteseiten, Aktivierung der rechtlichen Footer-Links oder Freigabe der Indexierung.
