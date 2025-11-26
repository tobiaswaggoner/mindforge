# Cross-Project History

Diese Datei dokumentiert relevante Änderungen aus den Schwester-Projekten des MindForge-Ökosystems.

**Fokus für MindForge:**
- Assessment-Logik & Fragen-Formate (D&D)
- Tracking & Diagnostik-Konzepte (D&D)
- Konzeptuelle Entscheidungen (Wiki)
- API-Schnittstellen zwischen den Systemen

---

## Sync vom 2025-11-26 (Erster Sync - letzte 30 Tage)

### dungeons-and-diplomas

**Repository:** https://github.com/milchinien/dungeons-and-diplomas

**Aktive Branches:**
- `main` - Haupt-Entwicklungsbranch
- `feature/spike/mw-dungeon-and-diplomas-test` - Inventory & Loot System (aktiv)
- `feature/spike-dungeon-clawler-like` - Dungeon Crawler Spike
- `feature/add-database` - Database Integration
- `Timi-topdown-game` - Tim's Top-Down Roguelike
- `test/game-engine` - Asset-Packs Testing

#### Relevante Änderungen (Assessment/Tracking/Database)

| Commit | Beschreibung | Relevanz für MindForge |
|--------|--------------|------------------------|
| `c5a947d` | **feat: introduced tracking** | Tracking-System für Lernfortschritt |
| `9eab88c` | **feat: added database** | Supabase-Integration für Persistenz |
| `6f5a10f` | **feat: RB questions** | Fragen-Generierung und Format |
| `50fcaa8` | **feat: add basic combat scene with question flow** | Combat = Assessment Pattern |
| `45dc42a` | **feat: connect supabase** | Datenbank-Setup |
| `f16ec4a` | **refactor: Implement Combat Reducer Pattern** | Combat-Logik modularisiert |
| `fbdc98a` | **refactor: Extract CombatEngine for pure combat logic** | Entkoppelte Kampf-/Assessment-Logik |
| `d77d1de` | **refactor: Extract ELO aggregation from /api/stats** | ELO-basierte Schwierigkeitsanpassung |
| `c91d75f` | **refactor: Add Clock injection for testable time** | Zeitbasierte Mechaniken (Spaced Rep?) |

#### Architektur-Erkenntnisse
- **Combat = Assessment**: Fragen beantworten = Angriff im Kampf
- **ELO-System**: Schwierigkeitsgrad basiert auf ELO-Aggregation
- **Supabase**: PostgreSQL-Backend für User-Daten und Tracking
- **Modularisierung**: CombatEngine, VisibilityCalculator, ThemeLoader als separate Module

#### Sonstige Aktivität (47 Commits)
- Umfangreiches Refactoring (10+ Refactoring-Sprints abgeschlossen)
- Tileset-Editor und Dungeon-Generator implementiert
- Fog of War System
- Inventory & Loot System (feature/spike/mw-dungeon-and-diplomas-test)
- Tim's Top-Down Game Spike
- Asset-Packs und UI-Verbesserungen

---

### mindforge_work

**Website:** https://tobiaswaggoner.github.io/mindforge_work/

#### Relevante Änderungen (Konzepte/Architektur)

| Commit | Beschreibung | Relevanz für MindForge |
|--------|--------------|------------------------|
| `2cff21f` | **docs: mindforge content and assessment** | Direkte MindForge-Dokumentation |
| `ed7d26d` | **feat: Fallen und Dekoration nach Dungeon-Räumung** | Lernmotivation durch Gamification |
| `3f01282` | **doc: Integrated Dungeons & Diplomas into concept** | Ökosystem-Integration |
| `aca28fc` | **SPARK: Educational Dungeon Crawler** | Konzept-Validierung |
| `e9044c5` | **doc: new spark Adaptives Quiz** | Adaptive Assessment-Konzepte |
| `de13c2a` | **SPARK: Multi-Channel-AI-Tutor-with-Memory** | **Direkt relevant für MindForge Codex** |
| `5579bb4` | **feat: Planning-Prozess und Stock Item Template** | Workflow-Dokumentation |
| `b54999d` | **docs: KST** | Kompetenzstruktur-Dokumentation |
| `1aa9da2` | **docs: finanzierung** | Projekt-Finanzierung |
| `9d248b3` | **docs: deep Research doc** | Forschungsdokumentation |

#### Konzeptuelle Erkenntnisse
- **Multi-Channel-AI-Tutor-with-Memory**: Direkt anwendbar auf MindForge Codex
- **Adaptive Quiz**: Diagnostik-Ansatz für Wissensstand-Ermittlung
- **Dungeon-Metapher**: Räumliche Wissensverankerung (Method of Loci)
- **Fallen & Dekoration**: Gamification nach erfolgreicher Wissens-Capture

#### Sonstige Aktivität (14 Commits)
- MkDocs-Setup und Deployment
- Navigation-Fixes
- Workflow-Updates
- Forge Log Erweiterungen

---

### mindforge (dieses Repo)

#### Änderungen seit letztem Sync
| Commit | Beschreibung |
|--------|--------------|
| `6d9f1a4` | feat: Add patches for sibling repos cross-project sync |
| `5465f89` | feat: Add cross-project ecosystem context and sync workflow |

---

## Nächste Schritte für MindForge

### API-Kompatibilität prüfen
- [ ] Supabase-Schema von D&D analysieren für gemeinsame User-Daten
- [ ] ELO-Aggregation API verstehen für Schwierigkeitsanpassung

### Konzepte übernehmen
- [ ] Multi-Channel-AI-Tutor-with-Memory Konzept in MindForge integrieren
- [ ] Adaptive Quiz Logik als Basis für RAG-Retrieval nutzen

### Tracking-Integration
- [ ] Tracking-System von D&D als Referenz für MindForge-Events
- [ ] Event-Sourcing Pattern abstimmen

---

## Initialer Stand (2025-11-26)

### dungeons-and-diplomas

**Aktueller Stand:**
- Tech Stack: Next.js 15, Phaser 3, Supabase
- MVP in aktiver Entwicklung: Roguelike Combat mit Lernfragen
- Assessment-Mechanik: Multiple-Choice-Fragen im Kampf
- Umfangreiches Refactoring abgeschlossen (modulare Architektur)

**Relevante Konzepte:**
- Combat = Assessment (Fragen beantworten = Angriff)
- ELO-basierte Schwierigkeitsanpassung
- Prozedurale Dungeon-Generierung
- Supabase für Persistenz und User-Tracking

### mindforge_work

**Relevante Konzepte:**
- Dungeon-Metapher für räumliche Wissensverankerung (Method of Loci)
- Chaos-Mechanik: Spaced Repetition als spielerischer Verfall (1-2-4-8-16 Tage)
- Loss Aversion: Schlüssel drohen nach 14 Tagen Inaktivität zu brechen
- Diagnostik: Analyse der letzten Antworten mit zeitlicher Gewichtung
- Multi-Channel-AI-Tutor-with-Memory: Kernkonzept für MindForge

---

*Letzte Synchronisation: 2025-11-26T11:00:00Z*
*Nächster Sync: Führe `/sync-projects` aus*
