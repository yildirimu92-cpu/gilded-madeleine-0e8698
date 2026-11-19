# PR #13 – Premium-Gästesuche /bestellen/

**Status: Unverbindliche B2C-Vorschau.** Die Route ist direkt aufrufbar, aber dauerhaft `noindex` und bis zur separaten Launch-Freigabe nicht in der Hauptnavigation verlinkt.

## Was umgesetzt ist

- Neuer responsiver B2C-Auftritt mit der verbindlichen Markenlinie «Dein Restaurant. Deine Bestellungen.» (B2C-Sprache Du)
- Premium-Hero mit abstrakter IzyOrder-Illustration statt Platzhalter-Restaurantkarte; ein eindeutiger Hinweis auf noch nicht verfügbare Bestellungen und direkter Sprung zur Suche
- Keine mehrfachen «Demo»-/«Vorschau»-Hinweise im sichtbaren Suchbereich; der ehrliche Leerzustand und die Noindex-/Launch-Sperre bleiben bestehen
- Ortsauswahl, Freitextsuche nach Name/Küche/Ort/PLZ, Abholung/Lieferung per nativer Radio-Segmentsteuerung
- Küchenfilter Alle, Pizza, Kebab, Burger, Andere
- Übernahme des getesteten Suchkerns aus PR #12; unbekannte PLZ dürfen keine Ergebnisse des alten Ortes zeigen
- Transparenter Leerzustand: «Noch keine Restaurants verfügbar» solange kein Restaurant geprüft und freigegeben ist
- Bei Lieferung ohne Resultate: Wechsel zu Abholung; bei unbekannter PLZ keine irreführende Fallback-Zuordnung
- Keine unterstellte Partnerbeziehung und keine fiktiven Demo-Restaurants, Lieferzeiten, Sterne, Plattformgebühren oder Preise
- Rein lokale Filterfunktion ohne Formulare, personenbezogene Datenerfassung, Netzwerk-API oder Tracking
- SSR-Anfangszustand für Nutzer ohne JavaScript; JavaScript ergänzt Filtern und Suche
- Semantische Headings, Tastaturbedienung, Screenreader-Status, mobile Testbreiten
- Separate CSS-Datei nur für B2C-Komponenten, keine Änderung des bestehenden Prototyps oder der B2B-Homepage

## Sicherheits- und Veröffentlichungsgrenzen

1. `src/data/restaurants.ts` bleibt **leer**, bis echte Partner mit dokumentierter Freigabe vorhanden sind.
2. Daten werden durch `parseRestaurantListing` geprüft. Nur `listingStatus='approved'` erscheint.
3. In Astro-Templates werden Restaurantangaben escaped; in Browser-DOM ausschließlich `textContent` und `createElement` – kein `innerHTML` mit Fremddaten.
4. Keine Weiterleitung zu `/prototyp/` oder zur fremden Lindenhof-Testdemo.
5. Kein Button «Jetzt bestellen» ohne gültige, verifizierte HTTPS-URL des tatsächlichen Partners.
6. Keine echte Orts-/Lieferzusage. Die PLZ-Tabelle aus dem Prototyp ist **keine** amtliche, vollständige Zustellgebietsprüfung.
7. Die B2C-Seite bleibt explizit `noindex`, in Header/Footer `planned` und aus der Sitemap ausgeschlossen.
8. Neue öffentliche Ortsseiten sind bewusst **nicht** enthalten. Diese erfordern echte Partner und SEO-/Rechtsprüfung.
9. Keine Änderungen an der externen SaaS-Bestell-App, an `public/prototyp/`, an Demo/Pilotformular oder Netlify-Umgebungsvariablen.

## Vor einer öffentlichen Vermarktung

- [ ] Betreiberidentität, Impressum und Datenschutz rechtskonform veröffentlicht
- [ ] Restaurantpartner namentlich und mit Zustimmung verifiziert
- [ ] Produktivbestellung einschliesslich Zahlung, Abholung/Lieferung und Fehlerfällen end-to-end getestet
- [ ] Datenschutz / Datenverarbeitung / Aufbewahrung / Rollen verifiziert
- [ ] Lieferung nur dort als verfügbar gekennzeichnet, wo der Gastronomiebetrieb sie tatsächlich anbietet
- [ ] Liste und Bestelllinks von verantwortlicher Person abgenommen
- [ ] Responsive Screenshots und WCAG-Abnahme
- [ ] Freigabe zur Verlinkung im Header und zur Indexierung separat dokumentiert
- [ ] Keine Verschmelzung mit dem B2B-Produktkonfigurator ohne Routing-Review

## Strategisches Follow-up

Die technische Darstellung ist bereit, aber echte Restaurantprofile sind die entscheidende Voraussetzung, um aus einem Such-Frontend einen brauchbaren Bestellkanal zu machen. Nächste Phase sollte deshalb den Go-to-Market, Partner-Onboarding und reale Bestelltests priorisieren – nicht erfundene Kataloggrösse oder generische Ortsseiten.
