import { z } from "zod";
import { timestampsSchema, uuidSchema } from "../common/index.js";

// User Roles
export const userRoleSchema = z.enum(["user", "admin", "moderator"]);
export type UserRole = z.infer<typeof userRoleSchema>;

// User Schema
export const userSchema = z.object({
  id: uuidSchema,
  email: z.string().email(),
  emailVerified: z.boolean(),
  isActive: z.boolean(),
  roles: z.array(userRoleSchema),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  lastLoginAt: z.string().datetime().nullable(),
});

export type User = z.infer<typeof userSchema>;

// Public user (safe to return to client)
export const publicUserSchema = userSchema.pick({
  id: true,
  email: true,
  emailVerified: true,
  roles: true,
  createdAt: true,
});

export type PublicUser = z.infer<typeof publicUserSchema>;

// Register Request
export const registerRequestSchema = z.object({
  email: z.string().email("Ungültige Email-Adresse"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
});

export type RegisterRequest = z.infer<typeof registerRequestSchema>;

// Register Response
export const registerResponseSchema = z.object({
  message: z.string(),
  email: z.string().email(),
});

export type RegisterResponse = z.infer<typeof registerResponseSchema>;

// Login Request
export const loginRequestSchema = z.object({
  email: z.string().email("Ungültige Email-Adresse"),
  password: z.string().min(1, "Passwort ist erforderlich"),
  rememberMe: z.boolean().optional(),
});

export type LoginRequest = z.infer<typeof loginRequestSchema>;

// Login Response
export const loginResponseSchema = z.object({
  accessToken: z.string(),
  tokenType: z.literal("Bearer"),
  expiresIn: z.number().int(),
  user: publicUserSchema,
});

export type LoginResponse = z.infer<typeof loginResponseSchema>;

// Verify Email Request
export const verifyEmailRequestSchema = z.object({
  token: z.string().min(1, "Token ist erforderlich"),
});

export type VerifyEmailRequest = z.infer<typeof verifyEmailRequestSchema>;

// Verify Token Response
export const verifyTokenResponseSchema = z.object({
  valid: z.boolean(),
  user: publicUserSchema.extend({
    roles: z.array(userRoleSchema),
  }),
});

export type VerifyTokenResponse = z.infer<typeof verifyTokenResponseSchema>;

// Me Response
export const meResponseSchema = publicUserSchema.extend({
  emailVerified: z.boolean(),
});

export type MeResponse = z.infer<typeof meResponseSchema>;

// Forgot Password Request
export const forgotPasswordRequestSchema = z.object({
  email: z.string().email("Ungültige Email-Adresse"),
});

export type ForgotPasswordRequest = z.infer<typeof forgotPasswordRequestSchema>;

// Reset Password Request
export const resetPasswordRequestSchema = z.object({
  token: z.string().min(1, "Token ist erforderlich"),
  password: z.string().min(8, "Passwort muss mindestens 8 Zeichen lang sein"),
});

export type ResetPasswordRequest = z.infer<typeof resetPasswordRequestSchema>;

// Resend Verification Request
export const resendVerificationRequestSchema = z.object({
  email: z.string().email("Ungültige Email-Adresse"),
});

export type ResendVerificationRequest = z.infer<typeof resendVerificationRequestSchema>;

// JWT Payload
export const jwtPayloadSchema = z.object({
  sub: uuidSchema, // user id
  email: z.string().email(),
  roles: z.array(userRoleSchema),
  iat: z.number().int(),
  exp: z.number().int(),
  iss: z.string(),
});

export type JwtPayload = z.infer<typeof jwtPayloadSchema>;
