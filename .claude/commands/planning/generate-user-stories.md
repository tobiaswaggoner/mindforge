# Generate User Stories

Generiere User Stories zu einem Epic basierend auf der neuen Projektstruktur.

## Epic aus dem die User Stories erzeugt werden sollen:

`$ARGUMENTS`

Wenn hier nichts angegeben wurde, breche die Bearbeitung ab und frage den Benutzer nach dem Epic, das er ausdefinieren will.

## Schritt 1: Epic-Analyse

- Lies alle bestehenden Epics in `docs/planning/epics/` um Abgrenzungen und Abhängigkeiten zu verstehen
- Identifiziere verwandte Epics und deren aktuellen Status
- Verstehe die strategische Positionierung innerhalb der Gesamtarchitektur

## Schritt 2: Bestehende Stories analysieren

- Lies alle User Stories im Verzeichnis `docs/planning/stories/**/*` um Überschneidungen zu vermeiden
- Prüfe auch bereits implementierte Stories in `docs/planning/archive/**/*`
- Stelle fest, was die aktuelle höchste Story-Nummer für das Epic ist
- **Naming Convention**: `E{xxx}-S{xxx}-{Description-With-Dashes}.md` (z.B. `E002-S006-Development-UI.md`)

## Schritt 3: Template und Struktur

- Nutze das Template: `docs/planning/StoryTemplate.md`
- Stories werden im entsprechenden Epic-Unterordner erstellt: `docs/planning/stories/E{xxx}-{Epic-Name}/`

## Schritt 4: Qualitätsprüfung

Stelle sicher, dass du alle relevanten Informationen hast:
- **Business Value**: Welchen konkreten Wert schafft die Story?
- **Technical Context**: Welche Systemkomponenten sind betroffen?
- **Dependencies**: Gibt es Abhängigkeiten zu anderen Stories?
- **Scope**: Ist der Umfang angemessen (nicht zu klein, nicht zu groß)?

Frage den User nach fehlenden oder unklaren Details. Wiederhole die Klärung, bis du die Intention vollständig verstanden hast.

## Schritt 5: Story-Erstellung

Erstelle neue User Stories mit folgenden Qualitätskriterien:
- **Echten Business Value**: Jede Story muss einen messbaren Nutzen schaffen
- **Angemessenen Scope**: Stories sollten in 1-3 Tagen implementierbar sein
- **Klare Akzeptanzkriterien**: Testbare und messbare Erfolgsmaßstäbe
- **Epic-Verlinkung**: Verweise auf das entsprechende Epic mit `[[E{xxx}-Epic-Name]]`

**Zielverzeichnis**: `docs/planning/epic/E{xxx}-{Epic-Name}/`