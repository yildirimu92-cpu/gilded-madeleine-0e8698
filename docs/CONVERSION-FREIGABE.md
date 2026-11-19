# IzyOrder – Pilot-Conversion und Freigabegates

Stand: 19.11.2026 · PR #17 (Website)

## Ziel und Funnel

Die Website soll Restaurantbetriebe schrittweise zu einer unverbindlichen Pilotanfrage führen, **ohne** vor der rechtskonformen Freigabe personenbezogene Kontaktdaten zu sammeln.

1. **Entdecken:** Startseite, Takeaway-Landingpage und später gezielte Zielgruppenseiten.
2. **Verstehen:** Funktionsübersicht und transparentes, nicht verbindliches Kostenbeispiel im Provisionsrechner.
3. **Entscheiden:** Freigegebene Demo ansehen oder Pilotphase unverbindlich anfragen.
4. **Qualifizieren:** Erst bei freigegebenem Pilotformular werden minimale B2B-Kontaktdaten über Netlify verarbeitet.
5. **Vertrieb:** Eine Pilotanfrage ist keine verbindliche Bestellung oder Abo-Buchung; der Folgeprozess wird ausserhalb dieses PR geregelt.

## Technische Umsetzung

- `pilotCta(env, privacyPageLive)` ist die **gemeinsame Freigabelogik** für CTA in Header, Homepage und Takeaway-Seite.
- `marketingCta(env, privacyPageLive)` verwendet zuerst einen freigegebenen Pilot-CTA, ansonsten die ausdrücklich freigegebene Live-Demo. Sind beide nicht freigegeben, erscheint kein globaler CTA.
- **Fail-closed:** Die Pilot-CTA erscheint ausschliesslich, wenn `CONTEXT=production`, `PILOT_LEADS_ENABLED=true`, `PILOT_PRIVACY_APPROVED=true`, `PILOT_PROCESSORS_APPROVED=true`, `PILOT_CONTACT_APPROVED=true` **und** der Datenschutzlink in der Navigation auf `live` steht.
- Ein URL-Aufruf von `/pilot/` allein aktiviert **keine** Kontaktaufnahme. Der serverseitige Freigabecheck auf der Pilotseite bleibt unverändert.
- Vorschauen und CI zeigen keine aktiven Pilot-CTAs, auch wenn im Test andere Umgebungsvariablen gesetzt werden.
- Keine Änderung an Netlify-Formularen, Datenspeicherung, Cookie-Technik, Werbepixeln, Tracking oder Analytics.

## Freigabepunkte vor echten Anfragen

| Gate | Nötige Entscheidung / Nachweis |
|---|---|
| Rechtsträger | Tatsächlicher Betreiber inkl. korrekter Geschäfts- und Kontaktangaben, auch bei Einzelfirma ohne Handelsregistereintrag |
| Rechtliche Angaben | Freigegebenes Impressum und Datenschutztext; Datenschutzseite öffentlich erreichbar und in der Navigation auf `live` |
| Datenbearbeitung | Netlify Forms inkl. Unterauftragsbearbeiter, Aufbewahrungsfristen, Zugriffsrechten und Anfragenbearbeitung geprüft |
| Inhaltliche Verantwortung | Tarif-/Produktversprechen, Abo-Bedingungen und Hinweis auf Entwicklungsstand redaktionell geprüft |
| Formularabnahme | Testanfrage in kontrollierter Umgebung, Empfang, Zuständigkeit, Löschprozess, Spam-Schutz |
| Aktivierung | Bewusste Setzung **aller** Produktionsfreigaben nach schriftlich dokumentierter Abnahme |
| SEO | `SITE_INDEXING` bleibt unabhängig: Pilotfreigabe ist **keine** Freigabe der allgemeinen Indexierung |

## Messkonzept – erst nach Datenschutzabnahme

Geplante KPIs, ohne dass dieser PR bereits Daten erfasst:

- qualifizierte Besucher der B2B-Zielgruppenseiten
- freiwillige Klicks auf die freigegebene Pilot-CTA
- abgeschlossene Pilotanfragen und manuell bestätigte qualifizierte Leads
- Erstgespräche, aktivierte Pilotrestaurants, später zahlende Abos

Attributions- und Analysetools müssen separat mit einer Datenschutz-/Einwilligungsprüfung freigegeben werden. **Keine** heimliche Datenerfassung, keine automatisch gesetzten Cookies.

## Nicht Bestandteil von PR #17

Öffentliche Preise, rechtliche Texte ohne geprüfte Angaben, tatsächliche Formularfreigabe, CRM-Integration, Tracking/Analytics, Suchmaschinenindexierung, Live-Demo, Merge oder produktives Deployment.
