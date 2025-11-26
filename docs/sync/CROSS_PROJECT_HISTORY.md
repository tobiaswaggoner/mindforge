# Cross-Project History

Diese Datei dokumentiert relevante Änderungen aus den Schwester-Projekten des MindForge-Ökosystems.

**Fokus für MindForge:**
- Assessment-Logik & Fragen-Formate (D&D)
- Tracking & Diagnostik-Konzepte (D&D)
- Konzeptuelle Entscheidungen (Wiki)
- API-Schnittstellen zwischen den Systemen

---

## Initialer Stand (2025-11-26)

### dungeons-and-diplomas

**Repository:** https://github.com/milchinien/dungeons-and-diplomas

**Aktueller Stand:**
- Tech Stack: Next.js 15, Phaser 3, Supabase
- MVP in Entwicklung: Roguelike Combat mit Lernfragen
- Assessment-Mechanik: Multiple-Choice-Fragen im Kampf

**Aktive Branches:**
- `main` - Haupt-Entwicklungsbranch
- `Timi-topdown-game` - Tim's Top-Down Roguelike Spike
- `feature/spike/mw-dungeon-and-diplomas-test` - Inventory & Loot System
- `test/game-engine` - Asset-Packs

**Relevante Konzepte:**
- Combat = Assessment (Fragen beantworten = Angriff)
- Gegner-Lösungszeit als adaptiver Schwierigkeitsgrad
- Prozedurale Fragen-Generierung aus Pool

### mindforge_work

**Website:** https://tobiaswaggoner.github.io/mindforge_work/

**Relevante Konzepte:**
- Dungeon-Metapher für räumliche Wissensverankerung (Method of Loci)
- Chaos-Mechanik: Spaced Repetition als spielerischer Verfall (1-2-4-8-16 Tage)
- Loss Aversion: Schlüssel drohen nach 14 Tagen Inaktivität zu brechen
- Diagnostik: Analyse der letzten Antworten mit zeitlicher Gewichtung

---

*Nächster Sync: Führe `/sync-projects` aus*
