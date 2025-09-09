### Code-Struktur

Die Struktur unseres Monorepos ist wie folgt aufgeteilt, um eine klare Trennung der Verantwortlichkeiten zu gewährleisten (eventuell sind noch nicht alle Folder erstellt)

* **`.github/`** - CI/CD-Workflows (GitHub Actions)
* **`.vscode/`** - Geteilte Editor-Einstellungen (VS Code, Cursor, Windsruf)
* **`ai/`** - Globale, projektweite Anweisungen & Prompts für die KI
* **`apps/`** - Quellcode der einzelnen, lauffähigen Anwendungen
  * **`api/`** - NodeJs Backend
  * **`app/`** - React Frontend
* **`docs/`** - Zentrale Projektdokumentation. Basiert auf Markdown / Obsidian
* **`packages/`** - Wiederverwendbarer, geteilter Code (Bibliotheken, Typisierungen)
* **`tools/`** - Interne Tools, die nur indirekt mit der Anwendung zu tun haben (z.B. Helper Generatoren, Dev Analytics, Admin Tools (Zeiterfassung...))

**Hinweise:** 

- **`apps/`** enthält lauffähige Anwendungen. Das sind die Endprodukte, die am Ende deployed werden.
- * **`packages/`** enthält wiederverwendbare, geteilte Bibliotheken (vor allem geteilt zwischen website und studio). Das ist Code, der für sich allein nicht lauffähig ist, daher liegt er auf Root Ebene.