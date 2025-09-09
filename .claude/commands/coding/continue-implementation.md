# Continue Implementation

Setze die Implementierung einer User Story phasenweise fort basierend auf dem bestehenden Implementierungsplan.

## User Story, die weiter implementiert werden soll:

$1

Wenn hier nichts angegeben wurde, breche die Bearbeitung ab und frage den Benutzer nach der Story, die er implementieren will.

## Schritt 1: Plan-Analyse

- **Implementation Plan**: Analysiere den bestehenden Implementierungsplan in der Story
- **Current Phase**: Identifiziere die aktuelle Phase (erste Phase mit noch nicht erledigten Steps)
- **Phase Scope**: Verstehe den Umfang und die Deliverables der aktuellen Phase
- **Dependencies**: Prüfe, ob alle Abhängigkeiten aus vorherigen Phasen erfüllt sind

## Schritt 2: Status-Check & Safety

- **Branch Safety**: Stelle sicher, dass wir NICHT auf dem `main` Branch sind. Brich ab, wenn doch.
- **Git Status**: Prüfe mit `git diff main` was bereits implementiert wurde
- **Plan Synchronization**: Gleiche Git-Changes mit dem Implementation Plan ab
- **Documentation Update**: Ist der Plan noch aktuell oder müssen bereits erledigte Steps markiert werden?
- **Blocker Check**: Gibt es technische Blocker oder offene Fragen vor der Implementierung?

## Schritt 3: Phase-Implementation

**Fokus**: Implementiere NUR die Steps der aktuellen Phase.

- **Schritt-für-Schritt**: Arbeite jeden unerledigten Step der aktuellen Phase systematisch ab
- **Code Quality**: Halte dich an bestehende Patterns und Code-Standards
- **Testing**: Teste jeden Step einzeln, bevor du zum nächsten übergehst
- **Intermediate Commits**: Committe nach jedem sinnvollen Teilschritt
- **Error Handling**: Implementiere robuste Fehlerbehandlung

**Wichtig**: Implementiere KEINE Steps aus späteren Phasen, auch wenn sie einfach erscheinen.

## Schritt 4: Documentation Update

### Plan-Aktualisierung:
- Hake alle erfolgreich implementierten Steps als `[x]` ab
- Füge bei Bedarf zusätzliche Sub-Steps hinzu, die bei der Implementierung entstanden sind
- Aktualisiere Phase-Beschreibungen wenn nötig

### History-Protokoll:
Erweitere oder erstelle die `### History` Sektion am Ende der Story:

```markdown
### History

#### Phase X - {Datum} ({Completed|In Progress})

**Implementierte Changes:**
1. **{Component/Feature}** (`pfad/zur/datei.ext`):
   - {Konkrete Änderung 1}
   - {Konkrete Änderung 2}

2. **{Weitere Component}** (`anderer/pfad/`):
   - {Was wurde erstellt/geändert}

**Getestete Szenarien:**
- ✅ {Test-Szenario 1}: {Ergebnis}
- ✅ {Test-Szenario 2}: {Ergebnis}

**Validierung:**
- {Was wurde validiert und wie}
- {Offene Punkte für nächste Phase}
```

## Schritt 5: Phasen-Abschluss

- **Phase Status**: Markiere die Phase als abgeschlossen wenn alle Steps erledigt sind
- **Integration Test**: Führe einen integrierten Test der gesamten Phase durch
- **Next Phase Prep**: Bereite die nächste Phase vor (Dependencies, Open Questions)
- **Commit & Push**: Stelle sicher, dass alle Changes committed und gepusht sind

## Quality Gates:

- ✅ Alle Steps der aktuellen Phase vollständig implementiert
- ✅ Code folgt bestehenden Patterns und Standards
- ✅ Implementierung ist getestet und funktionsfähig
- ✅ Documentation ist aktuell und vollständig
- ✅ Git-Historie ist sauber und nachvollziehbar