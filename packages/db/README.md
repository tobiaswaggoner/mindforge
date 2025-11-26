# Database Package

Datenbank-Abstraktionsschicht für SQLite (lokal) und Supabase (prod).

## Struktur

```
db/
├── python/          # Python-Implementation (für Backend)
└── typescript/      # TypeScript-Implementation (für Frontend, falls nötig)
```

## Features

- Einheitliches Interface für beide Datenbank-Backends
- Automatische Erkennung des Environments
- Connection Pooling (Supabase)
- Migrations-Support
