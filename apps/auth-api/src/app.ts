import { Hono } from "hono";
import { logger } from "hono/logger";
import { getDatabase } from "./db/database.js";
import { PostgresUserRepository } from "./repositories/postgres.user.repository.js";
import { createEmailService } from "./services/email.service.js";
import { createHealthRoutes } from "./routes/health.js";
import { createAuthRoutes } from "./routes/auth.js";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";

export function createApp() {
  const app = new Hono();

  // Initialize database connection
  const sql = getDatabase();

  // Initialize repositories
  const userRepository = new PostgresUserRepository(sql);

  // Initialize services
  const emailService = createEmailService();

  // Global middleware
  app.use("*", logger());
  app.use("*", corsMiddleware);

  // Error handler
  app.onError(errorHandler);

  // Routes
  app.route("/health", createHealthRoutes(sql));
  app.route("/api/v1/auth", createAuthRoutes(sql, userRepository, emailService));

  // Root endpoint
  app.get("/", (c) => {
    return c.json({
      name: "MindForge Auth API",
      version: "0.1.0",
      docs: "/api/v1/docs",
    });
  });

  return app;
}
