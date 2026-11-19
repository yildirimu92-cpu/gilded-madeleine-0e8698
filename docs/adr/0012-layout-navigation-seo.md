# ADR 0012 – Globales Layout, Navigation und SEO-Fundament

- **Status:** Zur Freigabe (PR #5)
- **Datum:** 2026-11-19
- **Baut auf:** ADR 0005 (Indexierung), ADR 0006 (Mehrsprachigkeit), ADR 0011 (Komponenten)

## Kontext

Die künftigen B2B-Seiten brauchen eine einheitliche Navigation, einen Footer und saubere SEO-Grundlagen. Dabei gilt:
- Keine Unterseite existiert bisher.
- Eine Live-Demo ist noch nicht freigegeben.
- Rechtliche Seiten folgen später.

Die Website darf keine Scheinziele, erfundenen Angaben oder unfertigen Assets zeigen.

## Entscheid

1. **Zentrales `PublicLayout`** (`src/layouts/PublicLayout.astro`) = `BaseLayout` + `SiteHeader` + `SiteFooter`. Öffentliche Seiten verwenden nur dieses Layout. Interne Seiten (`/styleguide/`, `/intern/…`) bleiben bei `BaseLayout` und unabhängig.
2. **Navigation als Daten** (`src/config/navigation.ts`):
   - Jeder Eintrag hat den Status `planned` oder `live`. Öffentlich gerendert werden nur `live`-Einträge.
   - Ein Unit-Test prüft, dass jedes `live`-Ziel eine Seite hat. E2E-Tests prüfen, dass jeder Link auf öffentlichen Seiten mit HTTP 200 antwortet und dass keine geplanten Ziele verlinkt sind.
3. **CTA «Live-Demo ansehen»:** Die Adresse `liveDemo.url` ist zentral konfigurierbar. **Ohne freigegebene Adresse wird kein CTA gerendert** (Entscheid der Projektleitung vom 19.11.2026). Externe Adressen öffnen in einem neuen Tab, mit Hinweis für Screenreader.
4. **Header:**
   - Sticky, 64 px (ab 1024 px 72 px), mit Trennlinie.
   - Desktop-Navigation ab 1024 px, darunter das Mobile-Menü.
   - Das **Mobile-Menü basiert auf nativem `<details>`/`<summary>`:** Es funktioniert ohne JavaScript und verursacht keinen Layout-Sprung.
   - Ein kleines Script (`mobile-nav.ts`, nur wenn ein Menü existiert) ergänzt Escape mit Fokus-Rückgabe, Klick ausserhalb, Schliessen nach Linkwahl, Schliessen beim Wechsel auf die Desktop-Breite und `aria-expanded`.
   - `scroll-padding-top` verhindert, dass Sprungziele unter dem Header liegen.
5. **Footer:**
   - Dunkle Markenfläche mit Wortmarke, Claim, aktiven Navigationsgruppen und © mit Jahreszahl des Builds.
   - **Keine** Kontakt-, Adress-, Firmen- oder Social-Media-Angaben.
   - Rechtliche Links erscheinen erst, wenn die Seiten existieren.
6. **SEO (`Seo.astro`, Logik in `src/lib/seo.ts`):**
   - Titel mit Marke (ohne Doppelung), Description, `robots`, Canonical.
   - hreflang für aktive Sprachen plus `x-default`.
   - Open Graph (`og:locale` de_CH) und Twitter/X (`summary`).
   - **Kein OG-Bild**, bis das finale Motiv freigegeben ist.
   - **JSON-LD:** `WebSite`, `Organization` und `WebPage`.
     - `Organization` enthält ausschliesslich Name, URL und den freigegebenen Claim.
     - Keine Rechtsform, Adresse, Kontaktdaten, Logo und Profile.
     - Die JSON-LD wird sicher serialisiert, `<` und `>` werden maskiert.
   - Seiten mit erzwungenem `noindex` (404, Styleguide, interne Vorschau) haben kein Canonical, keine Alternativen und kein JSON-LD.
   - Die Indexierung bleibt gemäss ADR 0005 deaktiviert.
7. **Sprachen:** `src/i18n/config.ts` führt FR, IT und EN mit Präfix (`/fr`, `/it`, `/en`), vorerst `enabled: false`. Mit `localizedPath()` und `alternateLinks()` lassen sich die Sprachen später ohne Umbau ergänzen.

## Konsequenzen

- Neue Seiten werden durch Umstellen des Status auf `live` in der Navigation sichtbar, sobald sie existieren.
- Mit einer freigegebenen Demo-Adresse erscheint der CTA automatisch in Header und Mobile-Menü.
- Die öffentliche Startseite lädt weiterhin kein JavaScript. Das einzige `<script>` ist das JSON-LD (Daten).
