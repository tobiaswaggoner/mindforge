import { Hono } from "hono";
import { logger } from "hono/logger";
import { getDatabase } from "./db/database.js";
import { PostgresContentRepository } from "./repositories/postgres.content.repository.js";
import { PostgresTaskRepository } from "./repositories/postgres.task.repository.js";
import { createHealthRoutes } from "./routes/health.js";
import { createSubjectRoutes } from "./routes/subjects.js";
import { createClusterRoutes } from "./routes/clusters.js";
import { createVariantRoutes } from "./routes/variants.js";
import { createAnswerRoutes } from "./routes/answers.js";
import { createQuestionRoutes } from "./routes/questions.js";
import { createTaskRoutes } from "./routes/tasks.js";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/error-handler.js";
import { taskRegistry } from "./tasks/registry.js";
import { createStubHandlers } from "./tasks/handlers/stub-handler.js";

export function createApp() {
  const app = new Hono();

  // Initialize database connection
  const sql = getDatabase();

  // Initialize repositories
  const contentRepo = new PostgresContentRepository(sql);
  const taskRepo = new PostgresTaskRepository(sql);

  // Register task handlers
  const handlers = createStubHandlers(taskRepo);
  handlers.forEach((handler) => taskRegistry.register(handler));

  // Global middleware
  app.use("*", logger());
  app.use("*", corsMiddleware);

  // Error handler
  app.onError(errorHandler);

  // Routes
  app.route("/health", createHealthRoutes(sql));

  // Content API routes
  app.route("/api/v1/subjects", createSubjectRoutes(contentRepo));
  app.route("/api/v1/clusters", createClusterRoutes(contentRepo));
  app.route("/api/v1/variants", createVariantRoutes(contentRepo));
  app.route("/api/v1/answers", createAnswerRoutes(contentRepo));

  // Game API routes
  app.route("/api/v1/questions", createQuestionRoutes(contentRepo));

  // Task management routes
  app.route("/api/v1/tasks", createTaskRoutes(taskRepo));

  // Root endpoint
  app.get("/", (c) => {
    return c.json({
      name: "MindForge Core API",
      version: "0.1.0",
      endpoints: {
        health: "/health",
        subjects: "/api/v1/subjects",
        clusters: "/api/v1/clusters",
        variants: "/api/v1/variants",
        answers: "/api/v1/answers",
        questions: "/api/v1/questions",
        tasks: "/api/v1/tasks",
      },
    });
  });

  return app;
}
