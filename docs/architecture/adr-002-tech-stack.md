# ADR-002: Full Stack TypeScript

**Datum:** 4. Februar 2026
**Status:** Akzeptiert
**Entscheider:** Tobias (Lead)
**Betroffene Komponenten:** Alle Services und UIs

---

## Problemstellung

Welcher Tech Stack für MindForge?

Ursprüngliche Annahme: Python für Backends wegen AI/ML.
Realität: Wir nutzen LLM APIs, kein lokales ML.

---

## Entscheidung

**Full Stack TypeScript** für alle Komponenten.

| Komponente | Technologie |
|------------|-------------|
| Auth API | Node.js + TypeScript |
| Core API | Node.js + TypeScript |
| Auth UI | Next.js + TypeScript |
| Admin UI | Next.js + TypeScript |
| D&D Game | Next.js + TypeScript |

---

## Begründung

### Warum nicht Python?

- AI/ML war der Grund → trifft nicht zu (nur LLM API Calls)
- LLM SDKs existieren für Node.js (OpenAI, Anthropic)
- Type Mismatch zwischen Python Backend und TS Frontend

### Warum nicht .NET?

- Lead hat .NET Expertise, aber:
- Impedanz zwischen C# und TypeScript Frontends
- AI-gestützte Entwicklung macht lokale Expertise weniger kritisch
- Starker AI Review Loop (AI Reviews, Pen Tests) kompensiert

### Warum TypeScript?

| Vorteil | Beschreibung |
|---------|--------------|
| **Homogenität** | Ein Stack, kein Context Switching |
| **Shared Types** | Types zwischen Frontend und Backend teilbar |
| **Type Safety E2E** | Fehler zur Compile-Zeit statt Runtime |
| **Team** | Frontends sind bereits TypeScript |
| **Tooling** | Ein Ecosystem (npm, ESLint, etc.) |

---

## Strong Typing & Linting

### Runtime Validation

**Zod** für Schema-Definition und Runtime-Validierung:
- Definiert Schema einmal
- Generiert TypeScript Types automatisch
- Validiert zur Runtime (API Inputs)
- Ähnlich wie Pydantic in Python

### TypeScript Config

Strikte Einstellungen:
```json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "exactOptionalPropertyTypes": true
  }
}
```

### ESLint

Strikte Rules:
- `@typescript-eslint/strict-type-checked`
- `@typescript-eslint/stylistic-type-checked`
- No `any` allowed
- Explicit return types

---

## Backend Framework

**Optionen:**
- Express (etabliert, aber älter)
- Fastify (performant, schema-first)
- Hono (modern, edge-ready)
- NestJS (Angular-style, mehr Struktur)

**Empfehlung:** Fastify oder Hono
- Beide haben gute TypeScript-Unterstützung
- Schema-basierte Validierung (passt zu Zod)
- Performant

---

## Projektstruktur

```
mindforge/
├── apps/
│   ├── auth-api/      # Auth Backend (Node.js/TS)
│   ├── auth-ui/       # Auth Frontend (Next.js)
│   ├── core/          # Core Backend (Node.js/TS)
│   └── admin/         # Admin UI (Next.js)
├── packages/
│   ├── shared-types/  # Shared Zod Schemas & Types
│   └── shared-utils/  # Shared Utilities
└── docs/
```

**Shared Types Beispiel:**
```typescript
// packages/shared-types/src/user.ts
import { z } from 'zod';

export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  roles: z.array(z.enum(['user', 'editor', 'admin'])),
});

export type User = z.infer<typeof UserSchema>;
```

Dieses Schema wird von Auth API, Core API und Frontends genutzt.

---

## Konsequenzen

### Positiv

- ✅ Type Safety von DB bis UI
- ✅ Ein Tech Stack für alle
- ✅ Shared Types reduzieren Fehler
- ✅ Einfacheres Onboarding (ein Stack lernen)
- ✅ Konsistentes Tooling

### Negativ

- ⚠️ Node.js weniger performant als .NET (für unsere Scale irrelevant)
- ⚠️ Lead hat mehr .NET Erfahrung (kompensiert durch AI-Loop)

---

## Alternativen (betrachtet)

### Python (FastAPI)
- Pro: AI/ML Libraries
- Contra: Kein ML nötig, Type Mismatch mit Frontends
- **Abgelehnt**

### .NET (C#)
- Pro: Lead Expertise, Performance
- Contra: Impedanz zu TS Frontends, AI macht Expertise weniger kritisch
- **Abgelehnt**

### Mixed (Node + Python)
- Pro: "Best of both"
- Contra: Zwei Stacks, mehr Komplexität
- **Abgelehnt**

---

## Referenzen

- Zod: https://zod.dev/
- Fastify: https://www.fastify.io/
- TypeScript Strict Mode: https://www.typescriptlang.org/tsconfig#strict

---

*Akzeptiert: 4. Februar 2026*
