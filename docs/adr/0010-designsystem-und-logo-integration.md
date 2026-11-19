# ADR 0010 – Designsystem, Design-Tokens und Logo-Integrationspunkt

- **Status:** Angenommen (zur Freigabe in PR #3)
- **Datum:** 2026-11-19
- **Ergänzt:** ADR 0001 (komponentenbezogenes CSS), ADR 0008 (Wortmarke und Inter)

## Kontext

Die Markenrichtung ist freigegeben: Premium Swiss SaaS, Forest-Grün, Mint als Akzent, warme Sand-Flächen, Inter, Claim «Dein Restaurant. Deine Bestellungen.». Das IO-Monogramm liegt erst als visuelle Markenstudie vor, nicht als freigegebene Vektordatei.

## Entscheid

1. **Zwei Token-Ebenen in CSS Custom Properties** (`src/styles/tokens.css`):
   - *Primitive*: Markenfarben, Typografie-, Abstands-, Radius-, Schatten- und Bewegungsskalen.
   - *Semantik*: Text, Hintergrund, Oberflächen, Rahmen, Fokus, Aktionen, Erfolg, Warnung, Fehler.

   Komponenten verwenden nur semantische Tokens.
2. **Inverse Fläche** über `.surface-inverse` bzw. `[data-surface="inverse"]`: Die semantischen Tokens werden für Forest 950 umgestellt. Es gibt keinen automatischen Dark Mode (offene Designentscheidung).
3. **Farbwerte haben eine Quelle:** `src/design/palette.ts`. Ein Test stellt sicher, dass `tokens.css` exakt übereinstimmt und alle freigegebenen Text-/Hintergrund-Kombinationen WCAG 2.2 AA erfüllen.
4. **Mint ist nie Textfarbe auf hellen Flächen.** Ein Test prüft die semantischen Tokens und den Komponenten-Code.
5. **Ergänzende Systemfarben** (keine Markenfarben): Stone 500 für Rahmen von Eingabefeldern (≥ 3:1), Amber und Rot für Warnung und Fehler.
6. **Inter Variable** (Achsen opsz und wght), selbst gehostet unter `/fonts/inter/v20/` mit OFL-Lizenz:
   - Latin wird vorgeladen, Latin-Ext und Italic laden nur bei Bedarf (`unicode-range`).
   - `font-synthesis: none`, damit keine künstlichen Schnitte entstehen.
7. **Fluide Typografie** mit `clamp()` zwischen 375 und 1440 px. Der rem-Anteil bleibt, damit Zoom und Browser-Schriftgrösse wirken (WCAG 1.4.4).
8. **Logo-Integrationspunkt** `src/components/brand/Logo.astro` mit `brand.logo.status` (`src/config/brand.ts`):
   - Solange der Status `pending` ist, wird nur die typografische Wortmarke gerendert, das Monogramm gar nicht.
   - Es wird **kein** angenähertes Monogramm als Asset abgelegt.
   - Freigegebene SVGs kommen nach `src/assets/brand/`. Danach wird der Status auf `final` gesetzt.
9. **Interne Designvorschau** unter `/intern/design/`: immer `noindex` (Meta und Header für `/intern/*`), nicht verlinkt.

## Konsequenzen

- Neue Komponenten (PR #4) bauen ausschliesslich auf semantischen Tokens auf.
- Inline-`style`-Attribute sind wegen der CSP nicht möglich. Dynamische Farben werden als SVG-`fill` oder über Klassen umgesetzt.
- Die Schriftdateien liegen in versionierten Pfaden und werden ein Jahr gecacht. Ein Update bekommt einen neuen Pfad (z. B. `v21`).

## Verworfene Alternativen

- **Tailwind/UI-Frameworks:** gemäss Vorgabe keine zusätzlichen Bibliotheken.
- **Nachgezeichnetes IO-Monogramm als SVG:** würde ein nicht freigegebenes Markenasset in Umlauf bringen.
- **Google Fonts:** Drittanbieter-Anfragen, Datenschutz, CSP.
