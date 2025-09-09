# Refine Epic

Verfeinere ein Epic basierend auf der aktuellen Projektstruktur und gewonnenen Erkenntnissen.

## Zu refinendes Epic

`$ARGUMENTS`

Wenn hier nichts angegeben wurde, breche die Bearbeitung ab und frage den Benutzer nach dem Epic, das er verfeinern möchte.

## Schritt 1: Epic-Kontext verstehen

- Lies alle bestehenden Epics in `docs/planning/epics/` um Abgrenzungen und Abhängigkeiten zu verstehen
- Identifiziere verwandte Epics und deren aktuellen Status
- Verstehe die strategische Positionierung innerhalb der Gesamtarchitektur

## Schritt 2: Aktuellen Epic-Status analysieren

- Lies das zu verfeinernde Epic gründlich durch
- Prüfe bereits implementierte User Stories in `docs/planning/archive/E{xxx}-{Epic-Name}/`
- Analysiere noch offene Stories in `docs/planning/stories/E{xxx}-{Epic-Name}/`
- Bewerte den Fortschritt gegen die ursprünglichen Akzeptanzkriterien

## Schritt 3: Template und Best Practices

- Stelle sicher, dass die Epic-Struktur den aktuellen Standards entspricht
- Prüfe ob Akzeptanzkriterien noch relevant und realistisch sind

## Schritt 4: Stakeholder-Alignment

Kläre folgende Aspekte mit dem User:
- **Scope-Änderungen**: Sind die ursprünglichen Ziele noch aktuell?
- **Prioritäten**: Haben sich die Geschäftsprioritäten verschoben?
- **Technical Learnings**: Welche technischen Erkenntnisse aus der Implementierung sollen einfließen?
- **Dependencies**: Sind neue Abhängigkeiten oder Blockers entstanden?

Wiederhole die Klärung, bis die Refinement-Ziele kristallklar sind.

## Schritt 5: Epic-Refinement durchführen

Überarbeite das Epic mit Fokus auf:
- **Aktualisierte Akzeptanzkriterien**: Basierend auf implementierten Stories und neuen Erkenntnissen
- **Verfeinerte User Journey**: Präzisere Beschreibung der End-to-End-Experience
- **Technical Refinements**: Integration von Architektur-Learnings und Pattern-Updates
- **Scope-Klarstellung**: Out-of-Scope deutlicher abgrenzen
- **Erfolgsmessung**: Messbare KPIs für Epic-Erfolg definieren

**Zieldatei**: `docs/planning/epics/E{xxx}-{Epic-Name}.md`