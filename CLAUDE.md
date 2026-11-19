# Arbeitsregeln für dieses Repository

Dieses Repository ist die **IzyOrder-Marketing-Website**. Es ist strikt von der IzyOrder-Bestellplattform getrennt.

Verbindlich vor jeder Änderung lesen und einhalten:

- `docs/richtlinien/isolationsregeln.md` – keine Verbindung zu produktiven Bestell-, Zahlungs- oder Kundendaten, keine Plattform-Secrets, keine Änderungen an anderen Repositories (insbesondere nicht an der Bestellplattform und nicht an `finanzplanerCH`).
- `docs/richtlinien/inhaltsregeln.md` – Markenschreibweise **IzyOrder**, keine fiktiven Restaurants als Partner, keine unbelegten Aussagen, Preise exkl. MWST.
- `docs/adr/` – getroffene Architekturentscheide.

Arbeitsweise:

- Kleine, thematisch getrennte Pull Requests gemäss `docs/entwicklungsplan.md`.
- Kein Merge und kein Produktionsdeployment ohne ausdrückliche Freigabe der Projektleitung.
- Vorschau- und Produktionsumgebungen bleiben `noindex`, bis die Indexierung ausdrücklich freigegeben ist.
- Sprache der Inhalte: Deutsch (de-CH), Schweizer Rechtschreibung (ss statt ß).
