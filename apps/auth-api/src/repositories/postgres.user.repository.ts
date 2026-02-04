import type postgres from "postgres";
import type { UserRole } from "@mindforge/shared-types";
import type { UserRow } from "../db/database.js";
import type { CreateUserData, UserRecord, UserRepository } from "./user.repository.js";
import { now } from "@mindforge/shared-utils";

function rowToRecord(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    emailVerified: row.email_verified,
    emailVerificationToken: row.email_verification_token,
    emailVerificationSentAt: row.email_verification_sent_at?.toISOString() ?? null,
    passwordResetToken: row.password_reset_token,
    passwordResetExpires: row.password_reset_expires?.toISOString() ?? null,
    isActive: row.is_active,
    roles: row.roles as UserRole[],
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
    deletedAt: row.deleted_at?.toISOString() ?? null,
    lastLoginAt: row.last_login_at?.toISOString() ?? null,
  };
}

export class PostgresUserRepository implements UserRepository {
  constructor(private sql: postgres.Sql) {}

  async findById(id: string): Promise<UserRecord | null> {
    const rows = await this.sql<UserRow[]>`
      SELECT * FROM users WHERE id = ${id} AND deleted_at IS NULL
    `;
    const row = rows[0];
    return row ? rowToRecord(row) : null;
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const rows = await this.sql<UserRow[]>`
      SELECT * FROM users WHERE LOWER(email) = LOWER(${email}) AND deleted_at IS NULL
    `;
    const row = rows[0];
    return row ? rowToRecord(row) : null;
  }

  async findByEmailVerificationToken(token: string): Promise<UserRecord | null> {
    const rows = await this.sql<UserRow[]>`
      SELECT * FROM users WHERE email_verification_token = ${token} AND deleted_at IS NULL
    `;
    const row = rows[0];
    return row ? rowToRecord(row) : null;
  }

  async findByPasswordResetToken(token: string): Promise<UserRecord | null> {
    const rows = await this.sql<UserRow[]>`
      SELECT * FROM users WHERE password_reset_token = ${token} AND deleted_at IS NULL
    `;
    const row = rows[0];
    return row ? rowToRecord(row) : null;
  }

  async create(data: CreateUserData): Promise<UserRecord> {
    const timestamp = now();
    await this.sql`
      INSERT INTO users (id, email, password_hash, email_verification_token, email_verification_sent_at, created_at, updated_at)
      VALUES (${data.id}, ${data.email}, ${data.passwordHash}, ${data.emailVerificationToken}, ${timestamp}, ${timestamp}, ${timestamp})
    `;
    const user = await this.findById(data.id);
    if (!user) throw new Error("Failed to create user");
    return user;
  }

  async updateEmailVerified(id: string, verified: boolean): Promise<void> {
    await this.sql`
      UPDATE users SET email_verified = ${verified}, email_verification_token = NULL, updated_at = ${now()} WHERE id = ${id}
    `;
  }

  async updateEmailVerificationToken(id: string, token: string | null, sentAt: string | null): Promise<void> {
    await this.sql`
      UPDATE users SET email_verification_token = ${token}, email_verification_sent_at = ${sentAt}, updated_at = ${now()} WHERE id = ${id}
    `;
  }

  async updatePasswordHash(id: string, passwordHash: string): Promise<void> {
    await this.sql`
      UPDATE users SET password_hash = ${passwordHash}, password_reset_token = NULL, password_reset_expires = NULL, updated_at = ${now()} WHERE id = ${id}
    `;
  }

  async updatePasswordResetToken(id: string, token: string | null, expires: string | null): Promise<void> {
    await this.sql`
      UPDATE users SET password_reset_token = ${token}, password_reset_expires = ${expires}, updated_at = ${now()} WHERE id = ${id}
    `;
  }

  async updateLastLogin(id: string): Promise<void> {
    const timestamp = now();
    await this.sql`
      UPDATE users SET last_login_at = ${timestamp}, updated_at = ${timestamp} WHERE id = ${id}
    `;
  }

  async updateIsActive(id: string, isActive: boolean): Promise<void> {
    await this.sql`
      UPDATE users SET is_active = ${isActive}, updated_at = ${now()} WHERE id = ${id}
    `;
  }
}
