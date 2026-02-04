import type { UserRole } from "@mindforge/shared-types";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  emailVerificationToken: string | null;
  emailVerificationSentAt: string | null;
  passwordResetToken: string | null;
  passwordResetExpires: string | null;
  isActive: boolean;
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  lastLoginAt: string | null;
}

export interface CreateUserData {
  id: string;
  email: string;
  passwordHash: string;
  emailVerificationToken: string;
}

export interface UserRepository {
  findById(id: string): Promise<UserRecord | null>;
  findByEmail(email: string): Promise<UserRecord | null>;
  findByEmailVerificationToken(token: string): Promise<UserRecord | null>;
  findByPasswordResetToken(token: string): Promise<UserRecord | null>;

  create(data: CreateUserData): Promise<UserRecord>;

  updateEmailVerified(id: string, verified: boolean): Promise<void>;
  updateEmailVerificationToken(id: string, token: string | null, sentAt: string | null): Promise<void>;
  updatePasswordHash(id: string, passwordHash: string): Promise<void>;
  updatePasswordResetToken(id: string, token: string | null, expires: string | null): Promise<void>;
  updateLastLogin(id: string): Promise<void>;
  updateIsActive(id: string, isActive: boolean): Promise<void>;
}
