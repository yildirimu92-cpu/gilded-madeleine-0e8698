# Designsystem IzyOrder

- **Status:** Version 1.0, zur Freigabe in PR #3
- **Vorschau:** `/intern/design/` (nicht indexiert)
- **Entscheid:** [ADR 0010](../adr/0010-designsystem-und-logo-integration.md)

## Marke

| Element | Festlegung |
|---|---|
| Name | **IzyOrder**, keine anderen Schreibweisen |
| Claim | «Dein Restaurant. Deine Bestellungen.» (`brand.claim` in `src/config/brand.ts`) |
| Wortmarke | Inter, Gewicht 680, Laufweite −0.045 em, Komponente `Wordmark.astro` |
| Logo | IO-Monogramm **ausstehend**, Integrationspunkt `Logo.astro`, Ablage `src/assets/brand/` |
| Charakter | Präzise, modern, eigenständig, vertrauenswürdig, zugänglich. Kein Lieferdienst-Look |

## Dateien

| Datei | Inhalt |
|---|---|
| `src/styles/tokens.css` | Primitive und semantische Tokens, inverse Fläche, reduzierte Bewegung |
| `src/styles/fonts.css` | `@font-face` Inter (selbst gehostet) |
| `src/styles/base.css` | Reset, Links, Fokus, Auswahl, Skip-Link, reduzierte Bewegung |
| `src/styles/typography.css` | Hierarchie Display bis Overline, Zahlen, Schweizer Anführungszeichen |
| `src/styles/layout.css` | Container, Sektionen, Stack, Cluster, Raster |
| `src/design/palette.ts` | Farbwerte, freigegebene und unzulässige Kombinationen (Single Source of Truth) |
| `src/design/breakpoints.ts` | Breakpoints und Referenzbreiten für die Qualitätskontrolle |
| `src/lib/contrast.ts`, `src/lib/format.ts` | Kontrastberechnung, Formatierung nach de-CH |

## Farben

| Token | Wert | Rolle |
|---|---|---|
| `--forest-950` | #0F2E22 | Primärfarbe, Text, dunkle Flächen |
| `--forest-800` | #1A4D3A | Sekundärflächen, Hover |
| `--forest-600` | #1E6B4F | Links, Interaktion, Fokus |
| `--mint-300` | #9FE3C6 | Akzent, **nur** als Fläche auf Hell oder als Text/Akzent auf Dunkel |
| `--mint-100` | #E3F6EE | Dezente Hintergründe, Erfolg |
| `--sand-50` | #F7F4EE | Seitenhintergrund |
| `--sand-100` | #EFEAE1 | Flächen, Hover auf Hell |
| `--sand-200` | #E4DDD0 | Trennlinien |
| `--sand-300` | #CFC6B6 | Betonte Rahmen, Sekundärtext auf Dunkel |
| `--stone-600` | #5C625E | Sekundärtext |

Ergänzende Systemfarben (keine Markenfarben): Weiss, Stone 500 `#7C857F` (Rahmen von Eingabefeldern), Amber 700/50 (Warnung), Red 700/50 (Fehler).

### Kontrastregeln (WCAG 2.2 AA)

- Fliesstext ≥ 4.5:1, grosse Schrift sowie Fokusringe und Rahmen von Bedienelementen ≥ 3:1.
- Freigegebene Kombinationen stehen in `approvedPairs` (`palette.ts`). Jede wird automatisch getestet.
- **Mint 300 nie als Text auf Sand, Weiss oder Mint 100** (1.1 bis 1.5:1).
- Stone 600 nicht als Fliesstext auf Sand 300.

## Typografie

| Stil | 375 → 1440 px | Zeilenhöhe | Gewicht |
|---|---|---|---|
| Display | 44 → 84 | 1.04 | 660 |
| H1 | 36 → 60 | 1.04 | 660 |
| H2 | 30 → 44 | 1.12 | 660 |
| H3 | 24 → 32 | 1.12 | 600 |
| H4 | 20 → 24 | 1.3 | 600 |
| H5 | 18 → 20 | 1.3 | 600 |
| H6 | 16 → 17 | 1.3 | 600 |
| Body gross | 18 → 20 | 1.55 | 400 |
| Body | 16 → 17 | 1.6 | 400 |
| Body klein | 14 → 15 | 1.45 | 400 |
| Label | 14 | 1.3 | 520 |
| Caption | 13 | 1.4 | 400 |
| Overline | 12, Versalien, +0.09 em | 1.3 | 600 |

- Semantische Ebene (`h1`–`h6`) und visuelle Grösse (`.text-*`) sind getrennt.
- Zahlen: `.numeric`, `.price` und Tabellen nutzen tabellarische Ziffern.
- de-CH:
  - ss statt ß
  - Guillemets « » bzw. ‹ › (für `<q>` automatisch)
  - Apostroph ’ als Tausendertrennzeichen
  - CHF-Schreibweise `CHF 79.–` bzw. `CHF 18.90` (`formatChf`)
  - Silbentrennung im Fliesstext erst ab 10 Zeichen, nie in Labels und Captions

## Abstände und Layout

- Raster 4 px: `--space-1` (4) bis `--space-32` (128).
- Fluid:
  - `--gutter` 16 → 40
  - `--section-y` 64 → 128
  - `--section-y-sm` 40 → 80
  - `--grid-gap` 16 → 28
- Container: Prosa 672, md 896, lg 1152 (Standard), xl 1280 px.
- Breakpoints (min-width): sm 480, md 768, lg 1024, xl 1280, 2xl 1440. Raster mit 4 / 8 / 12 Spalten.
- Klassen: `.container`, `.section`, `.stack`, `.cluster`, `.grid`, `.grid-auto`.

## Form, Tiefe, Bewegung

- Radien: 4 / 6 / 10 / 16 / 24 px, `pill`. Bedienelemente nutzen 6, Karten 10–16, grosse Flächen 16–24.
- Schatten `xs` bis `lg`, Forest-getönt. Sie dienen nur der Ebenenbildung.
- Bewegung:
  - 80 / 140 / 220 / 360 ms
  - `--ease-standard`, `--ease-out`, `--ease-in`
  - Keine dekorativen Animationen.
  - `prefers-reduced-motion: reduce` setzt alle Dauern auf 0.

## Zustände

| Zustand | Auf Hell | Auf Forest 950 |
|---|---|---|
| Primäre Aktion | Forest 950 / Text Sand 50 | Mint 300 / Text Forest 950 |
| Hover | Forest 800 | Mint 100 |
| Active | Forest 950, 1 px nach unten | Mint 300, 1 px nach unten |
| Fokus | Ring 2 px Forest 600, Abstand 2 px | Ring 2 px Mint 300 |
| Deaktiviert | Sand 200 / Stone 600 | transparentes Sand / Sand 300 |
| Link | Forest 600, Hover Forest 800 | Mint 300, Hover Mint 100 |
