# ADR 0004 – B2C unter `/bestellen`, Prototyp unter `/prototyp`

- **Status:** Angenommen
- **Datum:** 2026-11-19

## Kontext

Die Website ist primär ein B2B-Verkaufsauftritt. Der bestehende B2C-Prototyp (Restaurantsuche) enthält sinnvolle Funktionen und soll nicht verloren gehen.

## Entscheid

- Die Wurzel `/` wird zur B2B-Startseite. Bis diese steht, zeigt `/` eine neutrale Platzhalterseite.
- Der B2C-Restaurantfinder entsteht unter **`/bestellen`** auf demselben Host, damit die Domain-Autorität gebündelt wird. Er ist über die Hauptnavigation separat erreichbar.
- Der bestehende Prototyp wird **byte-identisch** unter **`/prototyp/`** gesichert (`public/prototyp/index.html`), bleibt `noindex` und wird nicht in die Navigation aufgenommen.
- Fiktive Restaurants werden **nie** als reale Partner dargestellt oder indexiert. Beispieldaten bleiben auf den Prototyp beschränkt oder sind klar gekennzeichnet.

## Konsequenzen

- Nach dem Merge zeigt die bisherige URL `/` nicht mehr den Prototyp, sondern die Platzhalter- bzw. später die B2B-Startseite. Der Prototyp ist unter `/prototyp/` weiterhin erreichbar.
- Die Suchlogik wird für `/bestellen` neu und getestet in TypeScript umgesetzt. Der Prototyp selbst wird nicht weiterentwickelt.
- Der Prototyp kann gelöscht werden, sobald `/bestellen` alle Funktionen abdeckt. Das braucht eine separate Freigabe.
