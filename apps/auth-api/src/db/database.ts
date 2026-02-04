import postgres from "postgres";
import { config } from "../config.js";

let sql: postgres.Sql | null = null;

export function getDatabase(): postgres.Sql {
  if (sql) return sql;

  sql = postgres(config.DATABASE_URL, {
    max: 10, // Connection pool size
    idle_timeout: 20,
    connect_timeout: 10,
  });

  console.log(`✅ PostgreSQL connected`);

  return sql;
}

export async function closeDatabase(): Promise<void> {
  if (sql) {
    await sql.end();
    sql = null;
    console.log("Database connection closed");
  }
}

/**
 * Initialize database schema
 * Run this on app startup
 */
export async function initializeDatabase(): Promise<void> {
  const db = getDatabase();

  await db`
    CREATE TABLE IF NOT EXISTS users (
      id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      email                     TEXT UNIQUE NOT NULL,
      password_hash             TEXT NOT NULL,

      -- Email Verification
      email_verified            BOOLEAN DEFAULT FALSE,
      email_verification_token  TEXT,
      email_verification_sent_at TIMESTAMPTZ,

      -- Password Reset
      password_reset_token      TEXT,
      password_reset_expires    TIMESTAMPTZ,

      -- Account Status
      is_active                 BOOLEAN DEFAULT TRUE,

      -- Roles (JSON array)
      roles                     JSONB DEFAULT '["user"]'::jsonb,

      -- Timestamps
      created_at                TIMESTAMPTZ DEFAULT NOW(),
      updated_at                TIMESTAMPTZ DEFAULT NOW(),
      deleted_at                TIMESTAMPTZ,
      last_login_at             TIMESTAMPTZ
    )
  `;

  await db`
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
  `;

  await db`
    CREATE INDEX IF NOT EXISTS idx_users_email_verification_token
    ON users(email_verification_token)
    WHERE email_verification_token IS NOT NULL
  `;

  await db`
    CREATE INDEX IF NOT EXISTS idx_users_password_reset_token
    ON users(password_reset_token)
    WHERE password_reset_token IS NOT NULL
  `;

  await db`
    CREATE INDEX IF NOT EXISTS idx_users_is_active
    ON users(is_active)
    WHERE is_active = TRUE
  `;

  // Rate limiting table
  await db`
    CREATE TABLE IF NOT EXISTS rate_limits (
      key           TEXT PRIMARY KEY,
      count         INTEGER DEFAULT 1,
      window_start  TIMESTAMPTZ DEFAULT NOW(),
      expires_at    TIMESTAMPTZ NOT NULL
    )
  `;

  await db`
    CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits(expires_at)
  `;

  // Migrations tracking
  await db`
    CREATE TABLE IF NOT EXISTS _migrations (
      id          SERIAL PRIMARY KEY,
      name        TEXT UNIQUE NOT NULL,
      applied_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("✅ Auth database schema initialized");
}

// Type definitions for query results
export interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  email_verified: boolean;
  email_verification_token: string | null;
  email_verification_sent_at: Date | null;
  password_reset_token: string | null;
  password_reset_expires: Date | null;
  is_active: boolean;
  roles: string[];
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  last_login_at: Date | null;
}

export interface RateLimitRow {
  key: string;
  count: number;
  window_start: Date;
  expires_at: Date;
}
