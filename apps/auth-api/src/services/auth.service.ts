import type {
  LoginRequest,
  LoginResponse,
  MeResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyTokenResponse,
} from "@mindforge/shared-types";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
  generateSecureToken,
  generateUuid,
  isExpired,
  addTime,
  now,
} from "@mindforge/shared-utils";
import type { UserRepository, UserRecord } from "../repositories/user.repository.js";
import { hashPassword, verifyPassword } from "./password.service.js";
import { createAccessToken, verifyToken } from "./token.service.js";
import type { EmailService } from "./email.service.js";

export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private emailService: EmailService
  ) {}

  /**
   * Register a new user
   */
  async register(data: RegisterRequest): Promise<RegisterResponse> {
    // Check if email already exists
    const existing = await this.userRepository.findByEmail(data.email);
    if (existing) {
      throw new ConflictError("Diese Email-Adresse ist bereits registriert");
    }

    // Create user
    const passwordHash = await hashPassword(data.password);
    const emailVerificationToken = generateSecureToken(32);

    const user = await this.userRepository.create({
      id: generateUuid(),
      email: data.email,
      passwordHash,
      emailVerificationToken,
    });

    // Send verification email (async, don't wait)
    this.emailService
      .sendVerificationEmail(user.email, emailVerificationToken)
      .catch((err) => console.error("Failed to send verification email:", err));

    return {
      message: "Verifizierungs-Email gesendet",
      email: user.email,
    };
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmailVerificationToken(token);
    if (!user) {
      throw new BadRequestError("Ungültiger oder abgelaufener Verifizierungslink");
    }

    await this.userRepository.updateEmailVerified(user.id, true);

    return { message: "Email erfolgreich verifiziert" };
  }

  /**
   * Login user
   */
  async login(data: LoginRequest): Promise<LoginResponse> {
    const user = await this.userRepository.findByEmail(data.email);
    if (!user) {
      throw new UnauthorizedError("Ungültige Anmeldedaten");
    }

    // Check password
    const validPassword = await verifyPassword(data.password, user.passwordHash);
    if (!validPassword) {
      throw new UnauthorizedError("Ungültige Anmeldedaten");
    }

    // Check email verified
    if (!user.emailVerified) {
      throw new ForbiddenError("Bitte bestätige zuerst deine Email-Adresse");
    }

    // Check account active
    if (!user.isActive) {
      throw new ForbiddenError("Dein Account wurde gesperrt");
    }

    // Update last login
    await this.userRepository.updateLastLogin(user.id);

    // Generate token
    const { token, expiresIn } = await createAccessToken(
      {
        userId: user.id,
        email: user.email,
        roles: user.roles,
      },
      { rememberMe: data.rememberMe }
    );

    return {
      accessToken: token,
      tokenType: "Bearer",
      expiresIn,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        roles: user.roles,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Verify token (for app startup)
   */
  async verifyTokenRequest(authHeader: string | undefined): Promise<VerifyTokenResponse> {
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token fehlt");
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);

    if (!payload) {
      throw new UnauthorizedError("Token ungültig oder abgelaufen");
    }

    // Check user still exists and is active
    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Account nicht gefunden oder gesperrt");
    }

    return {
      valid: true,
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        roles: user.roles,
        createdAt: user.createdAt,
      },
    };
  }

  /**
   * Get current user
   */
  async me(userId: string): Promise<MeResponse> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User");
    }

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      roles: user.roles,
      createdAt: user.createdAt,
    };
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);

    // Always return success to prevent email enumeration
    const response = { message: "Falls ein Account existiert, wurde eine Email gesendet" };

    if (!user) {
      return response;
    }

    const token = generateSecureToken(32);
    const expires = addTime(new Date(), 1, "hours");

    await this.userRepository.updatePasswordResetToken(user.id, token, expires);

    // Send reset email (async)
    this.emailService
      .sendPasswordResetEmail(user.email, token)
      .catch((err) => console.error("Failed to send password reset email:", err));

    return response;
  }

  /**
   * Reset password with token
   */
  async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByPasswordResetToken(token);

    if (!user) {
      throw new BadRequestError("Ungültiger oder abgelaufener Reset-Link");
    }

    if (isExpired(user.passwordResetExpires)) {
      throw new BadRequestError("Der Reset-Link ist abgelaufen");
    }

    const passwordHash = await hashPassword(newPassword);
    await this.userRepository.updatePasswordHash(user.id, passwordHash);

    return { message: "Passwort erfolgreich geändert" };
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      // Don't reveal if email exists
      return { message: "Verifizierungs-Email gesendet" };
    }

    if (user.emailVerified) {
      return { message: "Email ist bereits verifiziert" };
    }

    const token = generateSecureToken(32);
    await this.userRepository.updateEmailVerificationToken(user.id, token, now());

    // Send verification email (async)
    this.emailService
      .sendVerificationEmail(user.email, token)
      .catch((err) => console.error("Failed to send verification email:", err));

    return { message: "Verifizierungs-Email gesendet" };
  }

  /**
   * Get user from token payload (for middleware)
   */
  async getUserFromToken(authHeader: string | undefined): Promise<UserRecord | null> {
    if (!authHeader?.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);

    if (!payload) {
      return null;
    }

    const user = await this.userRepository.findById(payload.sub);
    return user && user.isActive ? user : null;
  }
}
