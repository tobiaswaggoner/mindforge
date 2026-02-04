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

  // Subjects
  await db`
    CREATE TABLE IF NOT EXISTS subjects (
      id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      key         TEXT UNIQUE NOT NULL,
      name        TEXT NOT NULL,
      description TEXT,
      created_at  TIMESTAMPTZ DEFAULT NOW(),
      updated_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Question Clusters
  await db`
    CREATE TABLE IF NOT EXISTS question_clusters (
      id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      subject_id          UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
      topic               TEXT NOT NULL,
      canonical_template  TEXT,
      difficulty_baseline INTEGER DEFAULT 5,
      created_at          TIMESTAMPTZ DEFAULT NOW(),
      updated_at          TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Question Variants
  await db`
    CREATE TABLE IF NOT EXISTS question_variants (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cluster_id    UUID NOT NULL REFERENCES question_clusters(id) ON DELETE CASCADE,
      question_text TEXT NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Answers
  await db`
    CREATE TABLE IF NOT EXISTS answers (
      id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      variant_id      UUID NOT NULL REFERENCES question_variants(id) ON DELETE CASCADE,
      answer_text     TEXT NOT NULL,
      is_correct      BOOLEAN NOT NULL DEFAULT FALSE,
      distractor_type TEXT,
      created_at      TIMESTAMPTZ DEFAULT NOW(),
      updated_at      TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Generation Tasks
  await db`
    CREATE TABLE IF NOT EXISTS generation_tasks (
      id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_type         TEXT NOT NULL,
      status            TEXT NOT NULL DEFAULT 'pending',
      payload           JSONB NOT NULL,
      user_context      JSONB,
      created_at        TIMESTAMPTZ DEFAULT NOW(),
      started_at        TIMESTAMPTZ,
      completed_at      TIMESTAMPTZ,
      delayed_until     TIMESTAMPTZ,
      progress_current  INTEGER DEFAULT 0,
      progress_total    INTEGER DEFAULT 0,
      progress_message  TEXT,
      error_message     TEXT,
      retry_count       INTEGER DEFAULT 0,
      max_retries       INTEGER DEFAULT 3,
      accepted_at       TIMESTAMPTZ,
      reverted_at       TIMESTAMPTZ
    )
  `;

  // Task Content Logs
  await db`
    CREATE TABLE IF NOT EXISTS task_content_logs (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id       UUID NOT NULL REFERENCES generation_tasks(id) ON DELETE CASCADE,
      entity_type   TEXT NOT NULL,
      entity_id     UUID NOT NULL,
      action        TEXT NOT NULL,
      previous_data JSONB,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Learner Events
  await db`
    CREATE TABLE IF NOT EXISTS learner_events (
      id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      user_id       UUID NOT NULL,
      event_type    TEXT NOT NULL,
      event_data    JSONB NOT NULL,
      game_id       TEXT,
      session_id    TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Learner Profiles
  await db`
    CREATE TABLE IF NOT EXISTS learner_profiles (
      user_id       UUID PRIMARY KEY,
      profile_data  JSONB NOT NULL,
      created_at    TIMESTAMPTZ DEFAULT NOW(),
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Indexes
  await db`CREATE INDEX IF NOT EXISTS idx_clusters_subject ON question_clusters(subject_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_variants_cluster ON question_variants(cluster_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_answers_variant ON answers(variant_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_tasks_status ON generation_tasks(status)`;
  await db`CREATE INDEX IF NOT EXISTS idx_task_logs_task ON task_content_logs(task_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_events_user ON learner_events(user_id)`;
  await db`CREATE INDEX IF NOT EXISTS idx_events_session ON learner_events(session_id)`;

  // Migrations tracking
  await db`
    CREATE TABLE IF NOT EXISTS _migrations (
      id          SERIAL PRIMARY KEY,
      name        TEXT UNIQUE NOT NULL,
      applied_at  TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  console.log("✅ Core database schema initialized");
}

// Type definitions for query results
export interface SubjectRow {
  id: string;
  key: string;
  name: string;
  description: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface QuestionClusterRow {
  id: string;
  subject_id: string;
  topic: string;
  canonical_template: string | null;
  difficulty_baseline: number;
  created_at: Date;
  updated_at: Date;
}

export interface QuestionVariantRow {
  id: string;
  cluster_id: string;
  question_text: string;
  created_at: Date;
  updated_at: Date;
}

export interface AnswerRow {
  id: string;
  variant_id: string;
  answer_text: string;
  is_correct: boolean;
  distractor_type: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface GenerationTaskRow {
  id: string;
  task_type: string;
  status: string;
  payload: unknown;
  user_context: unknown | null;
  created_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
  delayed_until: Date | null;
  progress_current: number;
  progress_total: number;
  progress_message: string | null;
  error_message: string | null;
  retry_count: number;
  max_retries: number;
  accepted_at: Date | null;
  reverted_at: Date | null;
}

export interface TaskContentLogRow {
  id: string;
  task_id: string;
  entity_type: string;
  entity_id: string;
  action: string;
  previous_data: unknown | null;
  created_at: Date;
}

export interface LearnerEventRow {
  id: string;
  user_id: string;
  event_type: string;
  event_data: unknown;
  game_id: string | null;
  session_id: string | null;
  created_at: Date;
}
