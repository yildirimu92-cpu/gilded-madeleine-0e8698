# Komponentenbibliothek

- **Status:** Version 1.0, zur Freigabe in PR #4
- **Vorschau:** `/styleguide/` (dauerhaft noindex, nicht verlinkt)
- **Entscheid:** [ADR 0011](../adr/0011-komponentenbibliothek.md)

Alle Komponenten liegen in `src/components/ui/` und verwenden ausschliesslich semantische Tokens aus `src/styles/tokens.css`.

## Übersicht

| Komponente | Wichtige Props | Barrierefreiheit |
|---|---|---|
| `Button` | `variant` primary/secondary/ghost/link · `size` sm/md/lg · `href` · `disabled` · `loading` · `iconStart`/`iconEnd` · `fullWidth` | `<button>` bzw. `<a>`. Beim Laden `aria-busy`, die Beschriftung bleibt Teil des Namens („Speichern Wird geladen …“). Deaktivierte Links erhalten `aria-disabled` und kein `href` |
| `Link` | `variant` inline/standalone/nav · `external` (automatisch erkannt) · `newTab` · `current` | Externe Links mit `rel="noopener noreferrer"`, Icon ↗ und Screenreader-Hinweis. `aria-current="page"` |
| `Container` | `size` prose/md/lg/xl · `as` | – |
| `Section` | `tone` default/subtle/accent/inverse · `spacing` md/sm/none · `labelledby`/`label` | `<section>` mit zugänglichem Namen |
| `Card` | `variant` neutral/interactive/featured · `title` · `href` · Slots `media`, `eyebrow`, `footer` | Interaktiv: ein Link im Titel, der die ganze Karte abdeckt (ein Tab-Stopp), Fokusring auf der Karte |
| `Badge` | `tone` neutral/accent/success/warning/error/inverse · `dot` | Nicht interaktiv. Bedeutung immer auch im Text |
| `Tag` | `href` (Link) · `pressed` (Umschalter) | `aria-pressed`, Touch-Ziel 44 px |
| `Form` | `demo` · alle `<form>`-Attribute | Statusregion (`role="status"`), Fokus auf das erste fehlerhafte Feld |
| `Input` | `type` text/email/tel · `label` · `hint` · `error` · `required` · `swissPhone` | Label, Hinweis und Fehler über `for` und `aria-describedby` verknüpft, `aria-invalid`. Passende `autocomplete`- und `inputmode`-Werte |
| `Select` | `options` · `placeholder` · `value` · `hint` · `error` | Natives `<select>` |
| `SegmentedControl` | `name` · `legend` · `options` · `value` · `fullWidth` | `<fieldset>`/`<legend>` mit Radio-Buttons, Pfeiltasten nativ |
| `Dialog` | `id` · `title` · `description` · `size` sm/md · `dismissible` · Slot `footer` | `<dialog>` modal, `aria-labelledby`/`aria-describedby`, Fokus auf die erste Aktion, Tab-Schleife, Escape, Fokus-Rückgabe |
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
| FAQ | Natives `<details>`, eigene Komponente in einem späteren PR |
| Provisionsrechner | `Input`, `SegmentedControl`, `.numeric`, `lib/format.ts` |
| Lead-Formulare | `Form`, `Input`, `Select`, `lib/validation.ts`, Netlify Forms (ADR 0007). Die Feldnamen bleiben stabil für die CRM-Anbindung |
