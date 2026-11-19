# ADR 0011 – UI-Komponentenbibliothek und Performance-Budgets

- **Status:** Zur Freigabe (PR #4)
- **Datum:** 2026-11-19
- **Baut auf:** ADR 0001 (Astro, scoped CSS), ADR 0002 (CSP), ADR 0009 (QS), ADR 0010 (Designsystem)

## Kontext

Die Marketing-Website braucht wiederverwendbare, barrierefreie Bausteine für spätere Preiskarten, FAQ, Rechner und Lead-Formulare. Vorgaben dafür:
- keine schweren UI-Frameworks
- möglichst wenig JavaScript
- strenge CSP
- WCAG 2.2 AA

## Entscheid

1. **Astro-Komponenten mit scoped CSS** unter `src/components/ui/`. Sie verwenden ausschliesslich semantische Tokens. Ergänzt werden Komponenten-Tokens (Ebene 3: Kontrollhöhen, Touch-Ziel, Kartenabstand, Overlay), die nur aus bestehenden Werten abgeleitet sind.
2. **Native HTML-Elemente zuerst:**
   - `<button>` und `<a>` für Buttons und Links
   - `<select>` statt eines eigenen Dropdowns
   - Radio-Gruppe in `<fieldset>` für das Segmented Control (Pfeiltasten nativ)
   - `<dialog>` mit `showModal()` (Inert-Hintergrund und Escape nativ)
3. **JavaScript nur, wo nötig, und nur auf Seiten, die es verwenden:**
   - `Button`: Ladesperre (ca. 0.5 KB).
   - `Dialog`: Fokus beim Öffnen, Tab-Schleife, Fokus-Rückgabe, Scroll-Sperre, Hintergrund-Klick.
   - `Form`: progressive Validierung mit Meldungen direkt am Feld.
   - Astro liefert die Skripte inline mit SHA-256-Hash in der CSP aus (ca. 5 KB, nur `/styleguide/`). Seiten ohne diese Komponenten laden kein JavaScript (per Test geprüft).
4. **Validierungslogik als reine Funktionen** (`src/lib/validation.ts`), unit-getestet:
   - Meldungen B2B in der Sie-Form.
   - Schweizer Telefonnummern: `0XX …`, `+41`, `0041`, `+41 (0)…`.
5. **Touch-Ziele ≥ 44 × 44 px** auf Geräten mit grobem Zeiger (`pointer: coarse`):
   - kleine Buttons, Segmente und Tags werden dort vergrössert
   - eigenständige Links und der Schliessen-Button haben immer 44 px
6. **Lighthouse CI** (`lighthouserc.cjs`) auf `/`, `/styleguide/` und `/intern/design/`:
   - Profil: Mobilgerät mit simuliertem langsamem 4G, 3 Läufe.
   - Budgets:

     | Kennzahl | Budget |
     |---|---|
     | Performance | ≥ 95 |
     | Accessibility | 100 |
     | Best Practices | ≥ 95 |
     | FCP | ≤ 1.8 s |
     | LCP | ≤ 2.5 s |
     | CLS | ≤ 0.05 |
     | TBT | ≤ 100 ms |
     | JS | ≤ 30 KB |
     | CSS | ≤ 50 KB |
     | Schriften | ≤ 160 KB |
     | Gesamt | ≤ 350 KB |
     | Drittanbieter-Anfragen | 0 |

   - SEO wird bis zum Launch nicht bewertet, weil die Seiten bewusst `noindex` sind.
   - Berichte bleiben als CI-Artefakt und werden nicht an Dritte übermittelt.
7. **Robuste Zustände:**
   - Ladende Buttons sind per Capture-Sperre blockiert, ohne JavaScript `type="button"`.
   - Demo-Formulare verwenden `method="dialog"` (kein Versand auf HTML-Ebene).
   - Reset stellt den vollständigen Ausgangszustand her. Ein Regressionstest gibt es je Fall.
8. **Favicon:** leerer Platzhalter (`data:,`) bis zum freigegebenen IO-Monogramm. Das verhindert 404-Fehler. Ein Favicon wird nicht improvisiert.

## Verbindliche UI/UX-Entscheide (19.11.2026)

- Favicon erst mit dem finalen Logo.
- Eigenständige Text-Link-Buttons mit 44 px Touch-Ziel, Links im Fliesstext kompakt.
- Dialog-Fokus auf die erste ungefährliche Aktion, bei umfangreichen Textdialogen konfigurierbar auf den Titel (`initialFocus="title"`).
- `dismissible={false}` sperrt nur den Hintergrund-Klick. Escape und Schliessen-Schaltfläche bleiben aktiv.
- Validierung nach Benutzerinteraktion bzw. Absenden, danach live.
- Hervorgehobene Karten mit Mint-Akzent und dunklem Rahmen.
- FAQ-Akkordeon erst mit der B2B-Homepage, möglichst nativ (`<details>`).

## Konsequenzen

- Neue Seiten setzen sich aus diesen Bausteinen zusammen. Fehlende Bausteine (z. B. FAQ-Akkordeon) entstehen als eigene Komponente mit Tests.
- Änderungen an Komponenten werden über `/styleguide/` visuell abgenommen.
- Ein Überschreiten der Budgets lässt die CI scheitern.
