# CLAUDE.md

Diese Datei gibt Claude Code (claude.ai/code) Orientierung bei der Arbeit mit dem Code in diesem Repository.

## Projekt-Ökosystem

Dieses Repository ist Teil eines **Drei-Repo-Ökosystems** für KI-gestütztes Lernen:

| Repository | Zweck | Link |
|------------|-------|------|
| **mindforge** (dieses Repo) | KI-Tutor für Wissens-Capture & RAG-Retrieval | - |
| **dungeons-and-diplomas** | Assessment Tool + Üben/Verfestigen (Gamified) | [GitHub](https://github.com/milchinien/dungeons-and-diplomas) |
| **mindforge_work** | Projekt-Wiki & Dokumentation | [Website](https://tobiaswaggoner.github.io/mindforge_work/) |

### Wie die Projekte zusammenhängen

```
┌─────────────────────────────────────────────────────────────────┐
│                    MindForge Ökosystem                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────┐     ┌─────────────────────────────────┐   │
│  │   MindForge     │     │    Dungeons & Diplomas          │   │
│  │   (The Codex)   │     │    (Assessment Tool)            │   │
│  ├─────────────────┤     ├─────────────────────────────────┤   │
│  │ • Wissen        │     │ • Wissensstand diagnostizieren  │   │
│  │   erfassen      │────▶│ • Üben & Verfestigen            │   │
│  │ • Strukturieren │     │ • Spaced Repetition             │   │
│  │ • RAG-Retrieval │◀────│ • Adaptive Lernpfade            │   │
│  └─────────────────┘     └─────────────────────────────────┘   │
│           │                           │                         │
│           └───────────┬───────────────┘                         │
│                       ▼                                         │
│            ┌─────────────────────┐                              │
│            │   mindforge_work    │                              │
│            │   (Wiki/Planung)    │                              │
│            └─────────────────────┘                              │
└─────────────────────────────────────────────────────────────────┘
```

### Relevanz für MindForge

Bei Änderungen in den Schwester-Repos ist für MindForge **primär relevant**:
- Assessment-Logik & Fragen-Formate (D&D)
- Tracking & Diagnostik-Konzepte (D&D)
- Konzeptuelle Entscheidungen (Wiki)
- API-Schnittstellen zwischen den Systemen

**Weniger relevant** (nur als Einzeiler notieren):
- Game-Assets, Sprites, Animationen (D&D)
- UI/UX-Mechaniken des Spiels (D&D)
- Phaser/Game-Engine-Details (D&D)

---

## Projektübersicht

**MindForge: The Codex** ist ein KI-gestützter Lern-Tracker, der Schülern hilft, Lerninhalte systematisch zu erfassen und zu archivieren. Das Projekt adressiert die Wissensfragmentierung im Schulalltag, indem es durch tägliche Interaktionen mit einem KI-Tutor eine umfassende, persönliche Wissensdatenbank aufbaut.

### Kernkonzept
- Schüler nutzen multimodale Eingaben (Text, Sprache, Fotos) für 5-10 Minuten tägliche Sessions
- KI-Tutor führt Schüler durch ihre Schulfächer
- Inhalte werden automatisch verarbeitet und für späteren Abruf archiviert
- Natürlichsprachliche Abfragen ermöglichen einfachen Zugriff auf vergangene Lerninhalte

## Architektur & Technologie-Stack

### Aktueller Stand
Dies ist ein Projekt in früher Phase mit minimaler Implementierung:
- Dokumentation existiert nur in `docs/brainstorming/` mit deutschen Spezifikationen

### Geplante Architektur (aus Spezifikationen)
- **Frontend**: React-basierte responsive Web-App (Mobile-First)
- **Backend**: Node.js mit Express-Framework
- **Datenbank**: MongoDB mit Event-Sourcing-Pattern (ohne dedizierte Event-Store-Bibliothek)
- **Authentifizierung**: OAuth (Google als initialer Provider)
- **KI-Integration**: Multimodales LLM (OpenAI Vision) für Content-Verarbeitung
- **Containerisierung**: Docker Compose Setup

## Hauptfeatures (MVP-Scope)

1. **KI-geführte tägliche Check-ins** - Dialogbasiertes Interface für Content-Erfassung
2. **Multimodale Eingabe** - Text, Sprachaufnahmen, Foto-Uploads mit OCR
3. **Intelligente Archivierung** - Auto-Kategorisierung nach Fach und Datum
4. **Semantische Suche** - Natürlichsprachliche Abfragen über erfasste Inhalte
5. **Content-Zusammenfassungen** - LLM-generierte tägliche Fach-Zusammenfassungen

## Entwicklungs-Befehle

Aktuell ist noch kein Build-System konfiguriert. Basierend auf dem geplanten Tech-Stack wird erwartet:
- `npm install` - Abhängigkeiten installieren
- `npm run dev` - Development-Server
- `npm run build` - Production-Build
- `docker-compose up` - Container-Deployment

## Entwicklungshinweise

### Datenverarbeitungs-Pipeline
- Rohe Eingaben (Text/Sprache/Bilder) → Multimodales LLM-Processing → Tägliche Fach-Zusammenfassungen → RAG-basierter Abruf
- Event-Sourcing-Ansatz speichert alle Interaktionen chronologisch
- Generierte Zusammenfassungen dienen als primäre Wissensbasis für Abfragen

### Happy Path (V1)
1. Google OAuth Authentifizierung
2. KI-Tutor fragt nach den heutigen Fächern
3. Schüler lädt Foto eines Hefteintrags hoch
4. LLM extrahiert und verarbeitet den Inhalt
5. Hintergrundprozess generiert tägliche Fach-Zusammenfassung
6. Spätere Abfragen rufen Informationen über RAG-System ab

### Außerhalb des Scopes (V1)
- Bearbeiten/Löschen-Funktionalität
- Gruppen-Kollaborationsfeatures
- Lehrer-Accounts
- Erweiterte semantische Suche
- Lernmodule (Quizzes, Karteikarten)

## Sprache & Lokalisierung
- Primärsprache: Deutsch
- Zielgruppe: Deutschsprachige Schüler
- Alle Code-Kommentare und Typen sind auf Englisch