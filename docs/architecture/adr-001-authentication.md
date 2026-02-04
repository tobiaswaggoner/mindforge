# ADR-001: Eigenständiger Auth Service mit Hosted Login Page

**Datum:** 4. Februar 2026
**Status:** Akzeptiert
**Entscheider:** Tobias (Lead)
**Betroffene Komponenten:** MindForge Auth Service, MindForge Core Service, D&D Game, zukünftige Apps

---

## Problemstellung

MindForge braucht ein **zentrales Account-Management-System** für mehrere Apps (D&D jetzt, weitere später). Anforderungen:

- Benutzer sollen sich in Apps registrieren/anmelden können
- Zentrale Benutzerverwaltung (ein Account für alle Apps)
- Email-Verifizierung bei Registrierung
- Passwort-Reset via Email
- Möglichkeit, Accounts zu sperren (Token Revocation)
- Später: OAuth Provider (Google, Apple) nachrüstbar
- GDPR-konform (EU-Hosting, kein Cloud Act)

---

## Entscheidung

### Eigenständiger Auth Service

Auth wird als **separater Service** betrieben, getrennt vom Core-Backend:

- `auth.mindforge.de` → Auth Service (Login, Register, Tokens)
- `api.mindforge.de` → Core Service (Profiles, Questions, Events)

### Warum getrennte Services?

| Aspekt | Begründung |
|--------|------------|
| **Stabilität** | Auth ist nach Beta weitgehend stabil, Core entwickelt sich weiter |
| **Single Responsibility** | Klare Trennung = weniger Komplexität im Code |
| **Sicherheit** | Passwort-Hashes isoliert in eigener DB |
| **Austauschbarkeit** | Auth später durch Keycloak/Auth0 ersetzbar |
| **Ops** | Container-Deployment macht zwei Services trivial |

### Dev Environment

**Zentraler Dev Auth Server:** Da Auth stabil ist, wird ein zentraler Dev Auth Server betrieben (`auth-dev.mindforge.de`). Entwickler müssen Auth nicht lokal starten.

### Hosted Login Page

Alle Apps nutzen die **zentrale Login-Seite** unter `auth.mindforge.de`.

**Warum zentral statt dezentral?**

| Aspekt | Dezentral (Login in jeder App) | Zentral (Hosted Login Page) |
|--------|-------------------------------|----------------------------|
| Auth-Änderungen | N Apps anpassen | 1x anpassen |
| Neuer OAuth Provider | N Apps anpassen | 1x anpassen |
| Passwort-Reset | In jeder App bauen | 1x bauen |
| Email-Verifizierung | In jeder App bauen | 1x bauen |
| Konsistente UX | Schwer | Automatisch |
| Sicherheits-Updates | N Deployments | 1 Deployment |

Bei 5+ Apps in 1 Jahr spart die zentrale Lösung erheblich Aufwand.

### Email/Passwort (vorerst kein OAuth)

**Für Beta:** Nur Email/Passwort Authentifizierung.

**Warum kein Google OAuth jetzt?**
- Google OAuth für öffentliche Apps erfordert Verifizierung in Google Cloud Console
- Aufwändig und zeitintensiv
- Später nachrüstbar (evtl. via Auth0/Keycloak)

**Email/Passwort ist der primäre Weg weil:**
- Funktioniert für jeden (nicht nur Google-Nutzer)
- Keine externe Abhängigkeit
- Volle Kontrolle über den Flow
- Eltern/Schüler ohne Google Account können sich anmelden

### Token-Verifizierung beim App-Start

**Jede App prüft beim Start:**
1. Token vorhanden? → Wenn nein, Redirect zu Login
2. Token gültig? (API Call zu `/auth/verify-token`)
   - Ja → User eingeloggt
   - Nein → Token löschen, Redirect zu Login

**Warum?**
- Account kann gesperrt worden sein
- Token kann abgelaufen sein
- Verhindert API-Fehler erst bei der ersten Aktion

### Email-Verifizierung von Anfang an

**Registrierungs-Flow:**
1. User registriert sich (Email + Passwort)
2. Account wird erstellt (email_verified = false)
3. Verifizierungs-Email wird gesendet
4. User klickt Link → email_verified = true
5. Erst dann kann sich User einloggen

**Warum von Anfang an?**
- Verhindert Spam-Accounts
- Verhindert "Account-Besetzung" mit fremder Email
- Sauberer Start (keine Altlasten später)
- Email-Service wird sowieso für Passwort-Reset gebraucht

### Passwort-Reset via Email

**Flow:**
1. User klickt "Passwort vergessen"
2. User gibt Email ein
3. Reset-Link wird per Email gesendet (1h gültig)
4. User klickt Link, setzt neues Passwort

**Wichtig:** Gleiche Antwort ob Email existiert oder nicht (verhindert Email-Enumeration).

---

## Technische Umsetzung

### Architektur

```
Apps (D&D, zukünftige Apps)
         │
         ↓ Redirect
auth.mindforge.de (Hosted Login Page)
         │
         ├─ /login
         ├─ /register
         ├─ /verify-email
         ├─ /forgot-password
         └─ /reset-password
         │
         ↓ API Calls
MindForge Backend (/api/v1/auth/*)
         │
         ↓
PostgreSQL (users table)
         │
         ↓
Email Service (Mailgun EU)
```

### API Endpoints

| Endpoint | Zweck |
|----------|-------|
| `POST /api/v1/auth/register` | Account erstellen |
| `POST /api/v1/auth/verify-email` | Email verifizieren |
| `POST /api/v1/auth/login` | Anmelden, JWT erhalten |
| `GET /api/v1/auth/verify-token` | Token beim App-Start prüfen |
| `GET /api/v1/auth/me` | Aktuellen User abrufen |
| `POST /api/v1/auth/forgot-password` | Reset-Email anfordern |
| `POST /api/v1/auth/reset-password` | Neues Passwort setzen |
| `POST /api/v1/auth/resend-verification` | Verifizierungs-Email erneut senden |

### Token Management

- **JWT Tokens** (RS256 signiert)
- **Lifetime:** 24h (default) oder 30 Tage ("Angemeldet bleiben")
- **Revocation:** Via `is_active = false` in DB + Token-Verifizierung beim App-Start

### Email Service

- **Empfehlung:** Mailgun (EU Region, 5k/Monat Free)
- **Alternativen:** Postmark, Sendinblue
- **Nicht:** Amazon SES (Cloud Act)

---

## Konsequenzen

### Positiv

✅ **Einmal bauen, überall nutzen:** Login-Logik nur 1x implementieren
✅ **Einfach erweiterbar:** OAuth später hinzufügen ohne App-Änderungen
✅ **Konsistente UX:** Alle Apps haben gleichen Login-Flow
✅ **Sicherheits-Updates zentral:** Ein Deployment für alle Apps
✅ **Email-Verifizierung:** Spam und Account-Besetzung verhindert
✅ **Token Revocation:** Accounts können sofort gesperrt werden

### Negativ

⚠️ **Redirect nötig:** User verlässt kurz die App für Login
⚠️ **Email-Service nötig:** Externe Abhängigkeit (Mailgun)
⚠️ **Komplexer als dezentral:** Mehr Infrastruktur

### Risiko-Mitigation

- **Redirect:** "Keep me logged in" reduziert Häufigkeit auf ~1x/Monat
- **Email-Service:** Mailgun ist zuverlässig, EU-Region verfügbar
- **Komplexität:** Lohnt sich bei 2+ Apps

---

## Alternativen (betrachtet)

### Alternative 1: Login in jeder App

- **Pro:** Kein Redirect, einfacher für einzelne App
- **Con:** Wartungsaufwand bei N Apps, inkonsistent
- **Abgelehnt:** Nicht skalierbar für 5+ Apps

### Alternative 2: Auth0 / Clerk

- **Pro:** Fertige Lösung, weniger Aufwand
- **Con:** US-Firma (Cloud Act), Vendor Lock-in, Kosten
- **Abgelehnt für jetzt:** Cloud Act Problem
- **Option für später:** Als OAuth-Proxy denkbar

### Alternative 3: Keycloak self-hosted

- **Pro:** Open Source, self-hosted, kein Cloud Act
- **Con:** Komplex, Java-basiert, Overhead
- **Zurückgestellt:** Evtl. später für OAuth

### Alternative 4: Direkt mit Google OAuth starten

- **Pro:** Kein Passwort-Management
- **Con:** Google Verifizierung nötig, nicht jeder hat Google
- **Zurückgestellt:** Später nachrüsten

---

## OAuth später nachrüsten

Wenn Google/Apple OAuth hinzugefügt wird:

1. **Option A:** Selbst implementieren
   - Google SDK in Login-Page einbinden
   - Token validieren, User mappen

2. **Option B:** Auth0/Clerk als OAuth-Proxy
   - Nur für OAuth, Email/PW bleibt selbst gebaut
   - Reduziert OAuth-Komplexität

3. **Option C:** Keycloak
   - Self-hosted auf Hetzner
   - Volle Kontrolle, aber mehr Aufwand

Die zentrale Login-Page macht alle Optionen möglich ohne App-Änderungen.

---

## Theming (Später)

Login-Seite kann pro App customized werden:

```
auth.mindforge.de/login?client_id=dnd&redirect_uri=...
```

- Logo, Farben, Texte pro App
- Login-Logik bleibt zentral

---

## Rollout Plan

### Phase 1: Beta (Feb 2026)

- ✅ Email/Passwort Authentifizierung
- ✅ Email-Verifizierung
- ✅ Passwort-Reset
- ✅ Token-Verifizierung beim App-Start
- ✅ Hosted Login Page
- ✅ "Angemeldet bleiben" (30 Tage)
- ❌ OAuth (zurückgestellt)
- ❌ Theming (zurückgestellt)

### Phase 2: Nach Beta

- [ ] OAuth Provider (Google, evtl. Apple)
- [ ] Theming pro App
- [ ] Account-Einstellungen (Passwort ändern, etc.)
- [ ] MFA (optional)

---

## Referenzen

- **Detaillierte Dokumentation:** `docs/architecture/authentication.md`
- **ARCHITECTURE.md:** Gesamtarchitektur
- **BUSINESS_STRATEGY.md:** Datenschutz-Anforderungen

---

*Akzeptiert: 4. Februar 2026*
