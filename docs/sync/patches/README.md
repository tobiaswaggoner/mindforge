# Cross-Project Sync Patches

Diese Patches enthalten die `/sync-projects` Slash Commands für die Schwester-Repos.

## Anwendung

### dungeons-and-diplomas

```bash
cd /path/to/dungeons-and-diplomas
git checkout -b claude/cross-project-sync
git apply /path/to/dungeons-and-diplomas.patch
# oder:
git am /path/to/dungeons-and-diplomas.patch
git push -u origin claude/cross-project-sync
```

### mindforge_work

```bash
cd /path/to/mindforge_work
git checkout -b claude/cross-project-sync
git apply /path/to/mindforge_work.patch
# oder:
git am /path/to/mindforge_work.patch
git push -u origin claude/cross-project-sync
```

## Enthaltene Änderungen

Beide Patches fügen hinzu:
1. **CLAUDE.md** - Project Ecosystem Sektion mit Relevanz-Filtern
2. **sync-projects.md** - Slash Command für Cross-Project Sync
3. **Sync State Files** - Für Commit-Tracking
