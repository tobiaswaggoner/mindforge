# Create Implementation Plan

Erstelle einen detaillierten, phasebasierten Implementierungsplan für eine User Story.

## User Story, die geplant werden soll:

$1

Wenn hier nichts angegeben wurde, breche die Bearbeitung ab und frage den Benutzer nach der Story, die er planen will.

## Schritt 1: Kontext-Analyse

- **Story & Epic**: Lies die User Story und das zugehörige Epic aus `docs/planning/epics/`
- **Akzeptanzkriterien**: Verstehe alle testbaren Erfolgskriterien
- **Business Value**: Identifiziere den konkreten Nutzen und die Zielgruppe
- **Dependencies**: Erkenne Abhängigkeiten zu anderen Stories oder Systemkomponenten

## Schritt 2: Technical Discovery

- **Codebase-Analyse**: Finde relevante Codestellen in der betroffenen Anwendung (AGE, API, Studio, App)
- **Pattern-Identification**: Identifiziere bestehende Patterns, die für Konsistenz befolgt werden sollten
- **Existing Solutions**: Suche nach ähnlichen bereits implementierten Features
- **Integration Points**: Erkenne notwendige Schnittstellen zwischen Komponenten

## Schritt 3: Implementation Strategy

Bestimme die technische Herangehensweise:
- **Komponenten**: Welche System-Teile müssen geändert werden?
- **Data Flow**: Wie fließen Daten durch das System?
- **Testing Strategy**: Wie wird die Implementierung validiert?
- **Risk Assessment**: Welche technischen Risiken gibt es?

## Schritt 4: Plan-Erstellung

Erstelle den `### Implementierungsplan` in der Story-Datei mit folgender Struktur:

```markdown
### Implementierungsplan

#### Phase 1: {Beschreibung der ersten logischen Phase}

- [ ] {Konkreter, testbarer Schritt}
- [ ] {Weiterer Schritt mit klarem Deliverable}
- [ ] {Integration/Testing für diese Phase}

#### Phase 2: {Beschreibung der zweiten Phase}

- [ ] {Aufbauend auf Phase 1}
- [ ] {Weitere Schritte}

#### Hinweise

**Code-Locations:**
- `pfad/zur/datei.ext` - Beschreibung was hier geändert wird
- `anderer/pfad/` - Welche neuen Files hier erstellt werden

**Bestehende Patterns:**
- Pattern X verwenden für Y (siehe `beispiel/datei.ext`)
- Konsistenz mit Z-Implementation beibehalten

**Integration Points:**
- API-Endpunkt: `GET/POST /api/...`
- Database: Neue Tabelle/Felder für ...
- Frontend: Neue Component/Page für ...

**Testing Notes:**
- Unit Tests für neue Service-Methoden
- Integration Tests für API-Endpunkte
- E2E Tests für User-Journey
```

## Qualitätskriterien für den Plan:

- **Atomic Steps**: Jeder Schritt ist in sich abgeschlossen testbar
- **Logical Order**: Phasen bauen aufeinander auf
- **Clear Deliverables**: Jeder Schritt hat ein konkretes Ergebnis
- **Specific Paths**: Konkrete Dateipfade und Code-Locations
- **Pattern Consistency**: Folgt bestehenden Code-Patterns
- **Risk Mitigation**: Kritische Schritte sind gut abgesichert