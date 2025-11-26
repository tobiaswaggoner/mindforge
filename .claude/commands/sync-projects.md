# Cross-Project Sync für MindForge

Prüfe den Fortschritt in allen drei Projekten des MindForge-Ökosystems und aktualisiere das lokale History-Dokument.

## Kontext

Dieses Repo ist Teil eines Drei-Repo-Ökosystems:
- **mindforge** (dieses Repo): KI-Tutor für Wissens-Capture
- **dungeons-and-diplomas**: Assessment Tool (Gamified Learning)
- **mindforge_work**: Projekt-Wiki & Dokumentation

## Schritt 1: State-Datei prüfen

Prüfe, ob `/docs/sync/.last-sync.json` existiert. Falls ja, lies den letzten Sync-Timestamp.

Falls die Datei nicht existiert, erstelle sie mit dem aktuellen Timestamp und setze `first_run: true`.

Format der State-Datei:
```json
{
  "last_sync": "2025-01-15T10:30:00Z",
  "first_run": false,
  "repos": {
    "mindforge": { "last_commit": "abc123" },
    "dungeons-and-diplomas": {
      "remote": "https://github.com/milchinien/dungeons-and-diplomas.git",
      "last_commit": "def456"
    },
    "mindforge_work": {
      "remote": "https://github.com/tobiaswaggoner/mindforge_work.git",
      "last_commit": "ghi789"
    }
  }
}
```

**Wichtig:** Keine absoluten Pfade speichern! Pfade werden zur Laufzeit ermittelt (siehe Schritt 2).

## Schritt 2: Repos klonen/aktualisieren

### Base-Pfad ermitteln

Die drei Repos (`mindforge`, `dungeons-and-diplomas`, `mindforge_work`) sind normalerweise direkte Geschwister.

**Schritt 1:** Prüfe, ob du in einem Git-Worktree arbeitest:
```bash
git worktree list
# Beispiel-Output:
# C:/src/xrai/mindforge                                    f51d3ac [main]
# C:/Users/tobia/.claude-worktrees/mindforge/festive-pike  c546696 [festive-pike]
```

**Schritt 2:** Ermittle den Base-Pfad:
- Falls Worktree: Nimm den Pfad der ersten Zeile (main branch) und gehe ein Verzeichnis höher
- Falls kein Worktree: Nimm das Parent-Verzeichnis des aktuellen Repos

```bash
# Automatische Ermittlung des Base-Pfads:
MAIN_REPO=$(git worktree list | head -1 | awk '{print $1}')
BASE_PATH=$(dirname "$MAIN_REPO")
echo "Base-Pfad: $BASE_PATH"
# Erwartetes Ergebnis z.B.: C:/src/XRAI
```

Die Sibling-Repos sind dann:
- `$BASE_PATH/mindforge`
- `$BASE_PATH/dungeons-and-diplomas`
- `$BASE_PATH/mindforge_work`

Stelle sicher, dass alle drei Repos lokal verfügbar sind:

```bash
# Beispiel für NTLT-PC-09-2023:
# Base: C:/src/XRAI/
# - C:/src/XRAI/mindforge
# - C:/src/XRAI/dungeons-and-diplomas
# - C:/src/XRAI/mindforge_work

# dungeons-and-diplomas (falls nicht vorhanden)
if [ ! -d "$BASE_PATH/dungeons-and-diplomas" ]; then
  git clone https://github.com/milchinien/dungeons-and-diplomas.git $BASE_PATH/dungeons-and-diplomas
fi

# mindforge_work (falls nicht vorhanden)
if [ ! -d "$BASE_PATH/mindforge_work" ]; then
  git clone https://github.com/tobiaswaggoner/mindforge_work.git $BASE_PATH/mindforge_work
fi
```

Führe `git fetch --all` in allen drei Repos aus.

## Schritt 3: Neue Commits sammeln

Für jedes Repo, prüfe alle Branches auf neue Commits seit dem letzten Sync:

```bash
# Beispiel für ein Repo
git log --all --since="<last_sync_timestamp>" --oneline --decorate
```

## Schritt 4: Änderungen kategorisieren (MindForge-Fokus)

### Für dungeons-and-diplomas

**RELEVANT (ausführlich dokumentieren):**
- Änderungen an Assessment-Logik (`game/types/`, `lib/questions.ts`, etc.)
- Fragen-Formate und Generierung
- Tracking/Diagnostik-Code
- API-Endpunkte (`app/api/`)
- Datenbank-Schema (`supabase/`)

**WENIGER RELEVANT (nur Einzeiler):**
- Game-Assets, Sprites (`public/Assets/`)
- Phaser-Scenes (`game/scenes/` - außer Assessment-Logik)
- UI-Komponenten für Spielmechanik
- Animationen, Sounds

Kategorisiere Commits nach diesen Regeln:
```
[RELEVANT] fix: Update question generation algorithm
[EINZEILER] feat: Add new goblin sprite animation
```

### Für mindforge_work

**RELEVANT:**
- Konzeptuelle Entscheidungen in `/05_REFERENCE_LIBRARY/Concepts/`
- Architektur-Dokumente in `/01_BLUEPRINTS/`
- Forge-Items (aktive Arbeit) in `/03_THE_FORGE/`

**WENIGER RELEVANT:**
- Spark Chamber (Brainstorming) - nur bei relevanten Themen
- Forge Log (Weekly Updates) - nur Highlights

## Schritt 5: History-Dokument aktualisieren

Erstelle oder aktualisiere `/docs/sync/CROSS_PROJECT_HISTORY.md`:

```markdown
# Cross-Project History

Letzte Synchronisation: <timestamp>

## <Datum>

### dungeons-and-diplomas

#### Relevante Änderungen
- [commit-hash] Beschreibung der Assessment-relevanten Änderung
- [commit-hash] API-Änderung für Fragen-Endpoint

#### Sonstige Aktivität (Einzeiler)
- 3 Commits: Game-Assets und UI-Verbesserungen

### mindforge_work

#### Relevante Änderungen
- Neues Konzept: "Lernkonzept-Ausbau: Motivation und Wissensaufbau"

#### Sonstige Aktivität
- Weekly Update KW47

---

## <Älteres Datum>
...
```

## Schritt 6: State aktualisieren

Aktualisiere `/docs/sync/.last-sync.json` mit:
- Neuem Timestamp
- Aktuellen HEAD-Commits aller Repos

## Schritt 7: Zusammenfassung

Gib eine kurze Zusammenfassung aus:

```
=== MindForge Cross-Project Sync ===

Zeitraum: <last_sync> bis <now>

dungeons-and-diplomas:
  - X relevante Commits (Assessment/Tracking)
  - Y sonstige Commits (Game/UI)
  - Aktive Branches: feature/..., fix/...

mindforge_work:
  - X neue Konzept-Dokumente
  - Y Forge-Updates

Nächste Schritte für MindForge:
  - [Falls relevant] API-Kompatibilität prüfen für: ...
  - [Falls relevant] Konzept X berücksichtigen bei: ...
```

## Hinweise

- Bei erstem Run: Alle Commits der letzten 30 Tage scannen
- Commits von Bots/CI ignorieren
- Bei Merge-Commits: Nur den Merge selbst notieren, nicht die einzelnen Commits
- Branch-Namen mit `claude/` sind Agent-Branches und können übersprungen werden
