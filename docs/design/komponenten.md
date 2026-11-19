# Komponentenbibliothek

- **Status:** Version 1.1, zur Freigabe in PR #4 (inkl. Korrekturen aus dem Codex-Review)
- **Vorschau:** `/styleguide/` (dauerhaft noindex, nicht verlinkt)
- **Entscheid:** [ADR 0011](../adr/0011-komponentenbibliothek.md)

Alle Komponenten liegen in `src/components/ui/` und verwenden ausschliesslich semantische Tokens aus `src/styles/tokens.css`.

## Übersicht

| Komponente | Wichtige Props | Barrierefreiheit |
|---|---|---|
| `Button` | `variant` primary/secondary/ghost/link · `size` sm/md/lg · `href` · `disabled` · `loading` · `iconStart`/`iconEnd` · `fullWidth` | `<button>` bzw. `<a>`. Ladezustand siehe unten. Deaktivierte Links erhalten `aria-disabled` und kein `href` |
| `Link` | `variant` inline/standalone/nav · `external` (automatisch erkannt) · `newTab` · `current` | Externe Links mit `rel="noopener noreferrer"`, Icon ↗ und Screenreader-Hinweis. `aria-current="page"` |
| `Container` | `size` prose/md/lg/xl · `as` | – |
| `Section` | `tone` default/subtle/accent/inverse · `spacing` md/sm/none · `labelledby`/`label` | `<section>` mit zugänglichem Namen |
| `Card` | `variant` neutral/interactive/featured · `title` · `href` · Slots `media`, `eyebrow`, `footer` | Interaktiv: ein Link im Titel, der die ganze Karte abdeckt (ein Tab-Stopp), Fokusring auf der Karte |
| `Badge` | `tone` neutral/accent/success/warning/error/inverse · `dot` | Nicht interaktiv. Bedeutung immer auch im Text |
| `Tag` | `href` (Link) · `pressed` (Umschalter) | `aria-pressed`, Touch-Ziel 44 px |
| `Form` | `demo` · alle `<form>`-Attribute | Statusregion (`role="status"`), Fokus auf das erste fehlerhafte Feld, Ladezustand beim Absenden, vollständiger Reset |
| `Input` | `type` text/email/tel · `label` · `hint` · `error` · `required` · `swissPhone` | Label, Hinweis und Fehler über `for` und `aria-describedby` verknüpft, `aria-invalid`. Passende `autocomplete`- und `inputmode`-Werte |
| `Select` | `options` · `placeholder` · `value` · `hint` · `error` | Natives `<select>` |
| `SegmentedControl` | `name` · `legend` · `options` · `value` · `fullWidth` | `<fieldset>`/`<legend>` mit Radio-Buttons, Pfeiltasten nativ |
| `Dialog` | `id` · `title` · `description` · `size` sm/md · `dismissible` · `initialFocus` action/title · Slot `footer` | `<dialog>` modal, `aria-labelledby`/`aria-describedby`, Anfangsfokus konfigurierbar, Tab-Schleife, Escape, Fokus-Rückgabe |
| `Icon`, `Spinner` | `name` · `size` · `label` | Dekorativ (`aria-hidden`), mit `label` als Bild mit Namen |

## Verwendung

```astro
<Button href="/demo" iconEnd="arrow-right">Live-Demo ansehen</Button>

<Button data-dialog-open="kontakt" aria-haspopup="dialog">Pilotplatz anfragen</Button>
<Dialog id="kontakt" title="Pilotplatz anfragen">…</Dialog>

<Form>
  <Input name="email" type="email" label="E-Mail-Adresse" required />
  <Input name="telefon" type="tel" label="Telefonnummer" swissPhone />
  <Button type="submit">Absenden</Button>
</Form>
```

## Layout (PR #5)

| Komponente | Zweck |
|---|---|
| `layouts/PublicLayout.astro` | Layout aller öffentlichen Seiten: Header und Footer aus `config/navigation.ts`, nur `live`-Einträge |
| `layout/SiteHeader.astro` | Wortmarke, Desktop-Navigation ab 1024 px, CTA (nur mit freigegebener Adresse), Mobile-Menü (`<details>`, progressiv). Props: `items`, `cta`, `currentPath`, `sticky`, `navLabel`, `id` |
| `layout/SiteFooter.astro` | Dunkle Markenfläche: Wortmarke, Claim, Navigationsgruppen, © Jahr, rechtliche Links (nur live). Props: `groups`, `legal`, `year`, `labelPrefix` |

**Neue Seite freischalten:**
1. Seite unter `src/pages/` anlegen.
2. In `src/config/navigation.ts` den Status des Eintrags auf `'live'` setzen.
3. Die Tests prüfen, dass das Ziel existiert.

**Live-Demo freischalten:** `liveDemo.url` mit der freigegebenen Adresse setzen.

## Verhalten im Detail

### Ladezustand (`Button loading`)

- `aria-busy="true"` und `aria-disabled="true"`. Der Button **bleibt fokussierbar**, damit Screenreader den Zustand erfassen. Die Beschriftung bleibt Teil des Namens („Speichern Wird geladen …“).
- **Keine Aktion möglich:** Eine Sperre in der Capture-Phase (`src/scripts/button-state.ts`) blockiert Mausklick, Enter, Leertaste und implizites Absenden, bevor andere Handler (z. B. Dialog-Auslöser) reagieren.
- **Auch ohne JavaScript:** Ladende Submit-Buttons werden als `type="button"` gerendert und können kein Formular absenden.
- **Zur Laufzeit:** `setButtonLoading(button, true | false)`. Das `Form`-Script setzt den Absende-Button bei gültigem Absenden automatisch in den Ladezustand und verhindert so doppelte Absendungen (zusätzlich gesperrt über `data-submitting`).

### Formulare (`Form`)

- **Validierung:** Ein Feld wird erst nach der ersten Interaktion (Verlassen des Feldes) bzw. beim Absenden geprüft, danach live bei jeder Eingabe.
- **Reset:** setzt Feldwerte (nativ), Fehlermeldungen, `aria-invalid`, `aria-describedby`, Statusmeldung, Touched-Verwaltung und Ladezustand vollständig zurück.
- **`demo`:** sendet **unter keinen Umständen** Daten. Auf HTML-Ebene gilt `method="dialog"` ohne `action`: Ausserhalb eines `<dialog>` löst Absenden weder eine Anfrage noch eine Navigation aus, auch ohne JavaScript. In Demo-Formularen keine Buttons mit `formaction`/`formmethod` verwenden.
- **Produktive Formulare** (ohne `demo`) bleiben ohne JavaScript nativ funktionsfähig (`method="post"`).

### Dialog

- **`initialFocus="action"` (Standard):** Fokus auf `[autofocus]`, sonst die erste Aktion. Aktionen deshalb in der Reihenfolge **„ungefährlich zuerst“** anordnen (z. B. „Abbrechen“ vor „Löschen“).
- **`initialFocus="title"`:** Fokus auf den Titel. Für umfangreiche Textdialoge, damit der Inhalt von Anfang an gelesen wird.
- **`dismissible={false}`** verhindert **nur** das Schliessen per Klick auf den Hintergrund. **Escape und die Schliessen-Schaltfläche bleiben bewusst aktiv** und werden nicht automatisch deaktiviert. Tastatur- und Screenreader-Nutzer dürfen nie in einem Dialog eingeschlossen werden.

## Verbindliche UI/UX-Entscheide (19.11.2026)

| Thema | Entscheid |
|---|---|
| Favicon | Erst mit dem finalen Logo, bis dahin ein leerer Platzhalter |
| Text-Links | Eigenständige Text-Link-Buttons mit 44 px Touch-Ziel, Links im Fliesstext kompakt (`Link variant="inline"`) |
| Dialog-Fokus | Erste ungefährliche Aktion. Bei umfangreichen Textdialogen konfigurierbar auf den Titel |
| Validierung | Nach Benutzerinteraktion bzw. Absenden, danach live |
| Hervorgehobene Karten | Mint-Akzent oben und dunkler Rahmen (`Card variant="featured"`) |
| FAQ | Akkordeon erst mit der B2B-Homepage, möglichst nativ mit `<details>`/`<summary>` |

## Zustände

| Zustand | Umsetzung |
|---|---|
| Hover | Farbwechsel über Aktions-Tokens, Pfeil-Icons rücken 2–3 px nach rechts, interaktive Karten heben sich um 2 px |
| Active | 1 px nach unten |
| Fokus | 2 px Ring in `--color-focus` (Forest 600 bzw. Mint 300 auf Dunkel), nur bei Tastaturbedienung |
| Deaktiviert | `--color-disabled-*`, `cursor: not-allowed` |
| Laden | Spinner über der unsichtbaren Beschriftung (stabile Breite), `aria-busy` |
| Fehler | Rahmen und Meldung in `--color-error` mit Icon, direkt unter dem Feld |

Bewegung: 80–220 ms. Bei `prefers-reduced-motion: reduce` ist sie abgeschaltet, der Spinner steht still.

## Vorbereitet für spätere PRs

| Baustein | Grundlage |
|---|---|
| Preiskarten | `Card variant="featured"`, `Badge`, `.price` (tabellarische Ziffern), `Button` |
| Abrechnungsperiode | `SegmentedControl` |
| FAQ | Natives `<details>`/`<summary>`, eigene Komponente zusammen mit der B2B-Homepage |
| Provisionsrechner | `Input`, `SegmentedControl`, `.numeric`, `lib/format.ts` |
| Lead-Formulare | `Form`, `Input`, `Select`, `lib/validation.ts`, Netlify Forms (ADR 0007). Die Feldnamen bleiben stabil für die CRM-Anbindung |
