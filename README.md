# IzyOrder – Marketing-Website

Offizielle Website von **IzyOrder**, der Schweizer SaaS-Plattform für Online-Bestellungen in Restaurants, Takeaways und Gastronomiebetrieben.

Dieses Repository enthält ausschliesslich die **Marketing-Website** (B2B-Verkaufsauftritt) und den **B2C-Restaurantfinder unter `/bestellen`**. Es ist vollständig unabhängig von der IzyOrder-Bestellplattform.

> **Verbindlich:** Vor jeder Änderung die [Isolationsregeln](docs/richtlinien/isolationsregeln.md) und die [Inhaltsregeln](docs/richtlinien/inhaltsregeln.md) lesen.

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [docs/README.md](docs/README.md) | Übersicht aller Dokumente |
| [Audit des Prototyps](docs/audit/2026-11-prototyp-audit.md) | Bestandsaufnahme der ursprünglichen Website |
| [Zielarchitektur](docs/architektur/zielarchitektur.md) | Systemgrenzen, Routing, Datenflüsse |
| [Architekturentscheide (ADR)](docs/adr/) | Verbindliche Entscheidungen mit Begründung |
| [Entwicklungsplan](docs/entwicklungsplan.md) | Geplante Pull Requests und Freigabeschritte |

## Status

Der ursprüngliche Prototyp (`index.html`) bleibt erhalten und wird mit dem Grundgerüst unter `/prototyp` gesichert. Die Website ist bis zur ausdrücklichen Freigabe **nicht indexierbar** (`noindex`).
