# Authentication Architecture

## Overview

MindForge Auth ist ein **eigenständiger Service** (`auth.mindforge.de`), getrennt vom Core-Backend (`api.mindforge.de`).

**Warum getrennt?**
- Auth ist nach Beta weitgehend stabil
- Core entwickelt sich ständig weiter
- Klare Verantwortlichkeiten, weniger Komplexität
- Auth später durch Keycloak/Auth0 ersetzbar
- Passwort-Hashes isoliert in eigener DB

**Aktueller Stand (Beta):**
- Email/Passwort Authentifizierung
- Email-Verifizierung bei Registrierung
- Passwort-Reset via Email
- Token-Verifizierung beim App-Start

**Später nachrüsten:**
- OAuth Provider (Google, Apple, GitHub)
- Evtl. via Auth0/Keycloak

---

## Warum zentrale Login-Page?

| Aspekt | Dezentral (Login in jeder App) | Zentral (Hosted Login Page) |
|--------|-------------------------------|----------------------------|
| **Auth-Änderungen** | N Apps anpassen | 1x anpassen |
| **Neuer OAuth Provider** | N Apps anpassen | 1x anpassen |
| **Passwort-Reset** | In jeder App bauen | 1x bauen |
| **Konsistente UX** | Schwer | Automatisch |
| **Sicherheits-Updates** | N Deployments | 1 Deployment |

Bei 5+ Apps in Zukunft spart die zentrale Lösung erheblich Aufwand.

---

## System-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│ Apps (D&D, Future Apps)                                     │
│                                                             │
│  Login/Register → auth.mindforge.de                         │
│  API Calls      → api.mindforge.de (mit JWT)                │
└──────────────────────┬──────────────────┬───────────────────┘
                       │                  │
                       ↓                  ↓
┌──────────────────────────────┐  ┌───────────────────────────┐
│ MindForge Auth               │  │ MindForge Core            │
│ auth.mindforge.de            │  │ api.mindforge.de          │
│                              │  │                           │
│ Pages:                       │  │ Endpoints:                │
│ ├─ /login                    │  │ ├─ /api/v1/learners/*     │
│ ├─ /register                 │  │ ├─ /api/v1/questions/*    │
│ ├─ /verify-email             │  │ ├─ /api/v1/events/*       │
│ ├─ /forgot-password          │  │ └─ /api/v1/stats/*        │
│ └─ /reset-password           │  │                           │
│                              │  │ Validiert JWT von Auth    │
│ API:                         │  │ Speichert nur user_id     │
│ ├─ POST /api/v1/auth/login   │  │                           │
│ ├─ POST /api/v1/auth/register│  └───────────┬───────────────┘
│ ├─ GET  /api/v1/auth/verify  │              │
│ └─ ...                       │              ↓
└──────────────┬───────────────┘  ┌───────────────────────────┐
               │                  │ Core DB                   │
               ↓                  │ learner_profiles,         │
┌──────────────────────────────┐  │ questions, events, ...    │
│ Auth DB                      │  │ (user_id als FK)          │
│ users (credentials only)     │  └───────────────────────────┘
└──────────────────────────────┘
               │
               ↓
┌──────────────────────────────┐
│ Email Service (Mailgun EU)   │
└──────────────────────────────┘
```

### Environments

| Environment | Auth | Core |
|-------------|------|------|
| **Production** | auth.mindforge.de | api.mindforge.de |
| **Staging** | auth-staging.mindforge.de | api-staging.mindforge.de |
| **Development** | auth-dev.mindforge.de (zentral) | localhost:8000 |

**Dev Auth Server:** Zentral bereitgestellt, da Auth nach Beta stabil ist. Entwickler müssen Auth nicht lokal starten.

---

## Client Flow (App-Start)

```
┌─────────────────────────────────────────────────────────────┐
│ App startet                                                 │
│                                                             │
│ Token im localStorage/Cookie?                               │
│     │                                                       │
│     ├─ NEIN ──────────────────────────────────────────────┐ │
│     │                                                     │ │
│     └─ JA                                                 │ │
│          │                                                │ │
│          ↓                                                │ │
│     GET /api/v1/auth/verify-token                         │ │
│     Authorization: Bearer <token>                         │ │
│          │                                                │ │
│          ├─ 200 OK ───→ User eingeloggt ✓                 │ │
│          │              (Token gültig, Account aktiv)     │ │
│          │                                                │ │
│          └─ 401 Unauthorized ─────────────────────────────┤ │
│                (Token ungültig, abgelaufen, oder          │ │
│                 Account gesperrt/deaktiviert)             │ │
│                                                           │ │
│                         ↓                                 │ │
│     ┌─────────────────────────────────────────────────────┘ │
│     │                                                       │
│     ↓                                                       │
│ Token löschen (falls vorhanden)                             │
│ Redirect zu: auth.mindforge.de/login?redirect_uri=<app_url> │
└─────────────────────────────────────────────────────────────┘
```

**Warum Token-Verifizierung beim Start?**
- Account kann gesperrt worden sein
- Token kann manuell revoked worden sein
- Berechtigungen können sich geändert haben
- Verhindert API-Fehler erst bei der ersten Aktion

---

## Registrierungs-Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User klickt "Registrieren" in App                        │
│    → Redirect zu auth.mindforge.de/register?redirect_uri=...│
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. MindForge zeigt Registrierungsformular                   │
│                                                             │
│    ┌─────────────────────────────────────┐                  │
│    │  Registrieren                       │                  │
│    │                                     │                  │
│    │  Email:    [___________________]    │                  │
│    │  Passwort: [___________________]    │                  │
│    │  Passwort                           │                  │
│    │  bestätigen: [_________________]    │                  │
│    │                                     │                  │
│    │  [      REGISTRIEREN      ]         │                  │
│    │                                     │                  │
│    │  Bereits registriert? Anmelden      │                  │
│    └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. MindForge Backend                                        │
│    - Validiert Email-Format                                 │
│    - Prüft: Email bereits registriert?                      │
│    - Hasht Passwort (bcrypt)                                │
│    - Erstellt User (email_verified = false)                 │
│    - Generiert email_verification_token                     │
│    - Sendet Verifizierungs-Email                            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Bestätigungsseite                                        │
│                                                             │
│    "Wir haben dir eine Email gesendet.                      │
│     Bitte klicke auf den Link um deine                      │
│     Email-Adresse zu bestätigen."                           │
│                                                             │
│    [Email erneut senden]                                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. User klickt Link in Email                                │
│    → auth.mindforge.de/verify-email?token=abc123            │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. MindForge Backend                                        │
│    - Validiert Token                                        │
│    - Setzt email_verified = true                            │
│    - Löscht email_verification_token                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. Erfolgsseite                                             │
│                                                             │
│    "Email bestätigt! Du kannst dich jetzt anmelden."        │
│                                                             │
│    [Zur Anmeldung]                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## Login-Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. App leitet zu Login                                      │
│    → auth.mindforge.de/login?redirect_uri=https://dnd.de/cb │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. MindForge zeigt Login-Formular                           │
│                                                             │
│    ┌─────────────────────────────────────┐                  │
│    │  Anmelden                           │                  │
│    │                                     │                  │
│    │  Email:    [___________________]    │                  │
│    │  Passwort: [___________________]    │                  │
│    │                                     │                  │
│    │  ☐ Angemeldet bleiben (30 Tage)    │                  │
│    │                                     │                  │
│    │  [       ANMELDEN       ]           │                  │
│    │                                     │                  │
│    │  Passwort vergessen?                │                  │
│    │  Noch kein Konto? Registrieren      │                  │
│    └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. MindForge Backend prüft                                  │
│    - Email existiert?                                       │
│    - Passwort korrekt? (bcrypt verify)                      │
│    - Email verifiziert?                                     │
│      └─ Nein → Fehler "Bitte bestätige deine Email"         │
│    - Account aktiv (nicht gesperrt)?                        │
│      └─ Nein → Fehler "Account gesperrt"                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. JWT Token generieren                                     │
│    - Lifetime: 24h (default) oder 30 Tage (keep logged in)  │
│    - Claims: user_id, email, roles, exp, iat                │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. Redirect zurück zur App                                  │
│    → https://dnd.de/cb?token=eyJhbGciOiJSUzI1NiIs...        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. App speichert Token                                      │
│    - localStorage (oder HttpOnly Cookie später)             │
│    - User ist eingeloggt                                    │
└─────────────────────────────────────────────────────────────┘
```

---

## Passwort-Reset-Flow

```
┌─────────────────────────────────────────────────────────────┐
│ 1. User klickt "Passwort vergessen?"                        │
│    → auth.mindforge.de/forgot-password                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. MindForge zeigt Formular                                 │
│                                                             │
│    ┌─────────────────────────────────────┐                  │
│    │  Passwort zurücksetzen              │                  │
│    │                                     │                  │
│    │  Email:    [___________________]    │                  │
│    │                                     │                  │
│    │  [    LINK SENDEN    ]              │                  │
│    └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. MindForge Backend                                        │
│    - Generiert password_reset_token (zufällig, 64 Zeichen)  │
│    - Setzt password_reset_expires (1 Stunde)                │
│    - Sendet Reset-Email                                     │
│    - WICHTIG: Gleiche Antwort ob Email existiert oder nicht │
│      (verhindert Email-Enumeration)                         │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. Bestätigungsseite (immer gleich)                         │
│                                                             │
│    "Falls ein Account mit dieser Email existiert,           │
│     haben wir dir einen Link zum Zurücksetzen gesendet."    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. User klickt Link in Email                                │
│    → auth.mindforge.de/reset-password?token=xyz789          │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. MindForge zeigt Formular                                 │
│                                                             │
│    ┌─────────────────────────────────────┐                  │
│    │  Neues Passwort setzen              │                  │
│    │                                     │                  │
│    │  Neues Passwort:     [__________]   │                  │
│    │  Passwort bestätigen: [__________]  │                  │
│    │                                     │                  │
│    │  [    PASSWORT ÄNDERN    ]          │                  │
│    └─────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. MindForge Backend                                        │
│    - Validiert Token (existiert, nicht abgelaufen)          │
│    - Hasht neues Passwort                                   │
│    - Aktualisiert password_hash                             │
│    - Löscht password_reset_token                            │
│    - Optional: Alle bestehenden Sessions invalidieren       │
└─────────────────────────────────────────────────────────────┘
                              │
                              ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. Erfolgsseite                                             │
│                                                             │
│    "Passwort erfolgreich geändert!"                         │
│                                                             │
│    [Zur Anmeldung]                                          │
└─────────────────────────────────────────────────────────────┘
```

---

## API Endpoints

### POST /api/v1/auth/register

Neuen Account erstellen (Email noch nicht verifiziert).

**Request:**
```json
{
  "email": "student@example.de",
  "password": "mindestens8zeichen"
}
```

**Response (201 Created):**
```json
{
  "message": "Verifizierungs-Email gesendet",
  "email": "student@example.de"
}
```

**Fehler:**
- `400` - Ungültiges Email-Format oder Passwort zu kurz
- `409` - Email bereits registriert

---

### POST /api/v1/auth/verify-email

Email-Adresse verifizieren.

**Request:**
```json
{
  "token": "abc123..."
}
```

**Response (200 OK):**
```json
{
  "message": "Email erfolgreich verifiziert"
}
```

**Fehler:**
- `400` - Token ungültig oder abgelaufen

---

### POST /api/v1/auth/login

Anmelden und JWT Token erhalten.

**Request:**
```json
{
  "email": "student@example.de",
  "password": "...",
  "remember_me": true
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 2592000,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.de"
  }
}
```

**Fehler:**
- `401` - Ungültige Credentials
- `403` - Email nicht verifiziert
- `403` - Account gesperrt

---

### GET /api/v1/auth/verify-token

Token beim App-Start verifizieren.

**Request:**
```
GET /api/v1/auth/verify-token
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "valid": true,
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.de",
    "roles": ["user"]
  }
}
```

**Fehler:**
- `401` - Token ungültig, abgelaufen, oder Account gesperrt/inaktiv

---

### GET /api/v1/auth/me

Aktuellen User abrufen (nach erfolgreicher Token-Verifizierung).

**Request:**
```
GET /api/v1/auth/me
Authorization: Bearer eyJhbGciOiJSUzI1NiIs...
```

**Response (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "student@example.de",
  "email_verified": true,
  "roles": ["user"],
  "created_at": "2026-02-04T10:00:00Z"
}
```

---

### POST /api/v1/auth/forgot-password

Passwort-Reset anfordern.

**Request:**
```json
{
  "email": "student@example.de"
}
```

**Response (200 OK - immer, auch wenn Email nicht existiert):**
```json
{
  "message": "Falls ein Account existiert, wurde eine Email gesendet"
}
```

---

### POST /api/v1/auth/reset-password

Neues Passwort setzen.

**Request:**
```json
{
  "token": "xyz789...",
  "password": "neuespasswort123"
}
```

**Response (200 OK):**
```json
{
  "message": "Passwort erfolgreich geändert"
}
```

**Fehler:**
- `400` - Token ungültig oder abgelaufen
- `400` - Passwort zu kurz

---

### POST /api/v1/auth/resend-verification

Verifizierungs-Email erneut senden.

**Request:**
```json
{
  "email": "student@example.de"
}
```

**Response (200 OK):**
```json
{
  "message": "Verifizierungs-Email gesendet"
}
```

---

## Datenbank-Schema

```sql
CREATE TABLE users (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email                     VARCHAR(255) UNIQUE NOT NULL,
  password_hash             VARCHAR(255) NOT NULL,

  -- Email Verifizierung
  email_verified            BOOLEAN DEFAULT FALSE,
  email_verification_token  VARCHAR(255),
  email_verification_sent_at TIMESTAMP,

  -- Passwort Reset
  password_reset_token      VARCHAR(255),
  password_reset_expires    TIMESTAMP,

  -- Account Status
  is_active                 BOOLEAN DEFAULT TRUE,  -- FALSE = Account gesperrt

  -- Rollen
  roles                     VARCHAR[] DEFAULT ARRAY['user'],

  -- Timestamps
  created_at                TIMESTAMP DEFAULT NOW(),
  updated_at                TIMESTAMP DEFAULT NOW(),
  deleted_at                TIMESTAMP,  -- Soft Delete
  last_login_at             TIMESTAMP
);

-- Indizes
CREATE UNIQUE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_email_verification_token ON users(email_verification_token)
  WHERE email_verification_token IS NOT NULL;
CREATE INDEX idx_users_password_reset_token ON users(password_reset_token)
  WHERE password_reset_token IS NOT NULL;
CREATE INDEX idx_users_is_active ON users(is_active) WHERE is_active = TRUE;
```

---

## JWT Token

### Struktur

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT"
  },
  "payload": {
    "sub": "550e8400-e29b-41d4-a716-446655440000",
    "email": "student@example.de",
    "roles": ["user"],
    "iat": 1707033600,
    "exp": 1709625600,
    "iss": "https://auth.mindforge.de"
  }
}
```

### Token Lifetime

| "Angemeldet bleiben" | Lifetime |
|---------------------|----------|
| Nicht angehakt | 24 Stunden |
| Angehakt | 30 Tage |

### Token Revocation

Tokens können nicht direkt revoked werden (stateless JWT). Stattdessen:

1. **Account sperren:** `is_active = false`
   - Token-Verifizierung beim App-Start schlägt fehl
   - User wird ausgeloggt

2. **Passwort-Reset:** Optional alle Tokens invalidieren
   - Speichere `password_changed_at` in DB
   - Prüfe bei Token-Verifizierung: Token älter als `password_changed_at`?

---

## Email-Service

### Anforderungen

- EU-Region (GDPR)
- Transaktionale Emails (kein Marketing)
- Zuverlässige Zustellung

### Empfohlene Anbieter

| Anbieter | EU-Region | Free Tier | Empfehlung |
|----------|-----------|-----------|------------|
| **Mailgun** | ✅ (EU) | 5k/Monat | ✅ Empfohlen |
| **Postmark** | ✅ (EU) | 100/Monat | Gut, aber wenig Free |
| **Sendinblue** | ✅ (EU) | 300/Tag | Alternative |
| Amazon SES | ⚠️ (US) | 62k/Monat | Cloud Act Problem |

### Email-Templates

**Verifizierungs-Email:**
```
Betreff: Bestätige deine Email-Adresse

Hallo,

bitte klicke auf den folgenden Link um deine Email-Adresse zu bestätigen:

https://auth.mindforge.de/verify-email?token=abc123

Der Link ist 24 Stunden gültig.

Falls du dich nicht bei MindForge registriert hast,
kannst du diese Email ignorieren.

Dein MindForge Team
```

**Passwort-Reset-Email:**
```
Betreff: Passwort zurücksetzen

Hallo,

du hast ein neues Passwort angefordert.
Klicke auf den folgenden Link:

https://auth.mindforge.de/reset-password?token=xyz789

Der Link ist 1 Stunde gültig.

Falls du kein neues Passwort angefordert hast,
kannst du diese Email ignorieren.

Dein MindForge Team
```

---

## Sicherheit

### Bedrohungen & Mitigationen

| Bedrohung | Mitigation |
|-----------|------------|
| Brute Force Login | Rate Limiting (5 Versuche/Min pro IP) |
| Email Enumeration | Gleiche Antwort bei forgot-password |
| Token Theft (XSS) | HttpOnly Cookies (später), kurze Lifetime |
| Account Takeover | Email-Verifizierung, Passwort-Reset per Email |
| SQL Injection | ORM (SQLAlchemy), parameterisierte Queries |
| Passwort Leak | bcrypt Hashing |

### Passwort-Anforderungen

- Mindestens 8 Zeichen
- Keine weiteren Einschränkungen (für Beta)
- Später: Passwort-Stärke-Indikator

### Rate Limiting

| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 5/Min pro IP |
| `/auth/register` | 3/Min pro IP |
| `/auth/forgot-password` | 3/Min pro IP |
| `/auth/resend-verification` | 2/Min pro Email |

---

## Theming (Später)

Login-Seite kann pro App customized werden:

```
https://auth.mindforge.de/login?client_id=dnd&redirect_uri=...
```

**Customizable:**
- Logo
- Farbschema
- Hintergrund
- Texte ("Willkommen bei D&D")

**Immer gleich:**
- Login-Logik
- Sicherheit
- Flows

---

## OAuth Integration (Später)

Wenn Google/Apple/GitHub hinzugefügt wird:

```
┌─────────────────────────────────────┐
│  Anmelden                           │
│                                     │
│  Email:    [___________________]    │
│  Passwort: [___________________]    │
│                                     │
│  [       ANMELDEN       ]           │
│                                     │
│  ─────────── oder ───────────       │
│                                     │
│  [🔵 Mit Google anmelden]           │
│  [🍎 Mit Apple anmelden]            │
│                                     │
└─────────────────────────────────────┘
```

Optionen:
1. Selbst implementieren (Google SDK, etc.)
2. Auth0/Clerk einbinden
3. Keycloak self-hosted

---

## Referenzen

- **ADR-001:** `adr-001-authentication.md`
- **ARCHITECTURE.md:** `../ARCHITECTURE.md`
- **BUSINESS_STRATEGY.md:** `../BUSINESS_STRATEGY.md`

---

*Letzte Aktualisierung: 4. Februar 2026*
