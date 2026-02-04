import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createTaskRequestSchema } from "@mindforge/shared-types";
import { NotFoundError, BadRequestError } from "@mindforge/shared-utils";
import type { TaskRepository } from "../repositories/task.repository.js";
import { taskRegistry } from "../tasks/registry.js";
import { getTaskRunner } from "../tasks/runner.js";

export function createTaskRoutes(taskRepo: TaskRepository) {
  const app = new Hono();

  // GET /api/v1/tasks
  app.get("/", async (c) => {
    const status = c.req.query("status");
    if (status) {
      const tasks = await taskRepo.getTasksByStatus(status as any);
      return c.json(tasks);
    }
    const tasks = await taskRepo.getAllTasks();
    return c.json(tasks);
  });

  // GET /api/v1/tasks/:id
  app.get("/:id", async (c) => {
    const task = await taskRepo.getTaskById(c.req.param("id"));
    if (!task) {
      throw new NotFoundError("Task");
    }
    return c.json(task);
  });

  // POST /api/v1/tasks
  app.post("/", zValidator("json", createTaskRequestSchema), async (c) => {
    const data = c.req.valid("json");

    // Verify handler exists for task type
    if (!taskRegistry.hasHandler(data.taskType)) {
      throw new BadRequestError(`Kein Handler für Task-Typ: ${data.taskType}`);
    }

    const task = await taskRepo.createTask(data);
    return c.json(task, 201);
  });

  // POST /api/v1/tasks/:id/cancel
  app.post("/:id/cancel", async (c) => {
    const task = await taskRepo.getTaskById(c.req.param("id"));
    if (!task) {
      throw new NotFoundError("Task");
    }

    if (task.status !== "pending" && task.status !== "in_progress") {
      throw new BadRequestError("Task kann nicht abgebrochen werden");
    }

    const updated = await taskRepo.updateTaskStatus(task.id, "cancelled");
    return c.json(updated);
  });

  // POST /api/v1/tasks/:id/accept
  app.post("/:id/accept", async (c) => {
    const task = await taskRepo.getTaskById(c.req.param("id"));
    if (!task) {
      throw new NotFoundError("Task");
    }

    if (task.status !== "completed") {
      throw new BadRequestError("Nur abgeschlossene Tasks können akzeptiert werden");
    }

    const updated = await taskRepo.acceptTask(task.id);
    return c.json(updated);
  });

  // POST /api/v1/tasks/:id/revert
  app.post("/:id/revert", async (c) => {
    const task = await taskRepo.getTaskById(c.req.param("id"));
    if (!task) {
      throw new NotFoundError("Task");
    }

    if (task.status !== "completed") {
      throw new BadRequestError("Nur abgeschlossene Tasks können zurückgesetzt werden");
    }

    const updated = await taskRepo.revertTask(task.id);
    return c.json(updated);
  });

  // DELETE /api/v1/tasks/:id
  app.delete("/:id", async (c) => {
    const deleted = await taskRepo.deleteTask(c.req.param("id"));
    if (!deleted) {
      throw new NotFoundError("Task");
    }
    return c.body(null, 204);
  });

  // GET /api/v1/tasks/:id/logs
  app.get("/:id/logs", async (c) => {
    const task = await taskRepo.getTaskById(c.req.param("id"));
    if (!task) {
      throw new NotFoundError("Task");
    }

    const logs = await taskRepo.getLogsForTask(task.id);
    return c.json(logs);
  });

  // GET /api/v1/tasks/runner/status
  app.get("/runner/status", (c) => {
    const runner = getTaskRunner(taskRepo);
    return c.json(runner.getStatus());
  });

  // POST /api/v1/tasks/runner/start
  app.post("/runner/start", (c) => {
    const runner = getTaskRunner(taskRepo);
    runner.start();
    return c.json({ message: "Task runner started", status: runner.getStatus() });
  });

  // POST /api/v1/tasks/runner/stop
  app.post("/runner/stop", (c) => {
    const runner = getTaskRunner(taskRepo);
    runner.stop();
    return c.json({ message: "Task runner stopped", status: runner.getStatus() });
  });

  return app;
}
