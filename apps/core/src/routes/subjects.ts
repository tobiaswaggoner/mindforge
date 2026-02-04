import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createSubjectSchema, updateSubjectSchema } from "@mindforge/shared-types";
import { NotFoundError, ConflictError } from "@mindforge/shared-utils";
import type { ContentRepository } from "../repositories/content.repository.js";

export function createSubjectRoutes(contentRepo: ContentRepository) {
  const app = new Hono();

  // GET /api/v1/subjects
  app.get("/", async (c) => {
    const subjects = await contentRepo.getAllSubjects();
    return c.json(subjects);
  });

  // GET /api/v1/subjects/:id
  app.get("/:id", async (c) => {
    const subject = await contentRepo.getSubjectById(c.req.param("id"));
    if (!subject) {
      throw new NotFoundError("Fach");
    }
    return c.json(subject);
  });

  // POST /api/v1/subjects
  app.post("/", zValidator("json", createSubjectSchema), async (c) => {
    const data = c.req.valid("json");

    // Check if key already exists
    const existing = await contentRepo.getSubjectByKey(data.key);
    if (existing) {
      throw new ConflictError(`Fach mit Key '${data.key}' existiert bereits`);
    }

    const subject = await contentRepo.createSubject(data);
    return c.json(subject, 201);
  });

  // PUT /api/v1/subjects/:id
  app.put("/:id", zValidator("json", updateSubjectSchema), async (c) => {
    const data = c.req.valid("json");
    const id = c.req.param("id");

    // Check for key conflict if changing key
    if (data.key) {
      const existing = await contentRepo.getSubjectByKey(data.key);
      if (existing && existing.id !== id) {
        throw new ConflictError(`Fach mit Key '${data.key}' existiert bereits`);
      }
    }

    const subject = await contentRepo.updateSubject(id, data);
    if (!subject) {
      throw new NotFoundError("Fach");
    }
    return c.json(subject);
  });

  // DELETE /api/v1/subjects/:id
  app.delete("/:id", async (c) => {
    const deleted = await contentRepo.deleteSubject(c.req.param("id"));
    if (!deleted) {
      throw new NotFoundError("Fach");
    }
    return c.body(null, 204);
  });

  return app;
}
