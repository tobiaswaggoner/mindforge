import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import type postgres from "postgres";
import {
  registerRequestSchema,
  loginRequestSchema,
  verifyEmailRequestSchema,
  forgotPasswordRequestSchema,
  resetPasswordRequestSchema,
  resendVerificationRequestSchema,
} from "@mindforge/shared-types";
import { config } from "../config.js";
import { AuthService } from "../services/auth.service.js";
import type { EmailService } from "../services/email.service.js";
import type { UserRepository } from "../repositories/user.repository.js";
import { createRateLimiter } from "../middleware/rate-limit.js";
import { authMiddleware } from "../middleware/auth.js";

export function createAuthRoutes(
  sql: postgres.Sql,
  userRepository: UserRepository,
  emailService: EmailService
) {
  const app = new Hono();
  const authService = new AuthService(userRepository, emailService);

  // Rate limiters
  const loginLimiter = createRateLimiter(sql, {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: config.RATE_LIMIT_LOGIN,
  });

  const registerLimiter = createRateLimiter(sql, {
    windowMs: 60 * 1000,
    maxRequests: config.RATE_LIMIT_REGISTER,
  });

  const forgotPasswordLimiter = createRateLimiter(sql, {
    windowMs: 60 * 1000,
    maxRequests: config.RATE_LIMIT_FORGOT_PASSWORD,
  });

  // POST /api/v1/auth/register
  app.post(
    "/register",
    registerLimiter,
    zValidator("json", registerRequestSchema),
    async (c) => {
      const data = c.req.valid("json");
      const result = await authService.register(data);
      return c.json(result, 201);
    }
  );

  // POST /api/v1/auth/verify-email
  app.post(
    "/verify-email",
    zValidator("json", verifyEmailRequestSchema),
    async (c) => {
      const { token } = c.req.valid("json");
      const result = await authService.verifyEmail(token);
      return c.json(result);
    }
  );

  // POST /api/v1/auth/login
  app.post(
    "/login",
    loginLimiter,
    zValidator("json", loginRequestSchema),
    async (c) => {
      const data = c.req.valid("json");
      const result = await authService.login(data);
      return c.json(result);
    }
  );

  // GET /api/v1/auth/verify-token
  app.get("/verify-token", async (c) => {
    const authHeader = c.req.header("Authorization");
    const result = await authService.verifyTokenRequest(authHeader);
    return c.json(result);
  });

  // GET /api/v1/auth/me
  app.get("/me", authMiddleware(userRepository), async (c) => {
    const user = c.get("user");
    const result = await authService.me(user.id);
    return c.json(result);
  });

  // POST /api/v1/auth/forgot-password
  app.post(
    "/forgot-password",
    forgotPasswordLimiter,
    zValidator("json", forgotPasswordRequestSchema),
    async (c) => {
      const { email } = c.req.valid("json");
      const result = await authService.forgotPassword(email);
      return c.json(result);
    }
  );

  // POST /api/v1/auth/reset-password
  app.post(
    "/reset-password",
    zValidator("json", resetPasswordRequestSchema),
    async (c) => {
      const { token, password } = c.req.valid("json");
      const result = await authService.resetPassword(token, password);
      return c.json(result);
    }
  );

  // POST /api/v1/auth/resend-verification
  app.post(
    "/resend-verification",
    zValidator("json", resendVerificationRequestSchema),
    async (c) => {
      const { email } = c.req.valid("json");
      const result = await authService.resendVerification(email);
      return c.json(result);
    }
  );

  return app;
}
