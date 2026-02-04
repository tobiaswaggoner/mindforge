import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createQuestionClusterSchema, updateQuestionClusterSchema } from "@mindforge/shared-types";
import { NotFoundError } from "@mindforge/shared-utils";
import type { ContentRepository } from "../repositories/content.repository.js";

export function createClusterRoutes(contentRepo: ContentRepository) {
  const app = new Hono();

  // GET /api/v1/clusters?subjectId=...
  app.get("/", async (c) => {
    const subjectId = c.req.query("subjectId");
    if (!subjectId) {
      return c.json({ error: "subjectId query parameter required" }, 400);
    }

    // Verify subject exists
    const subject = await contentRepo.getSubjectById(subjectId);
    if (!subject) {
      throw new NotFoundError("Fach");
    }

    const clusters = await contentRepo.getClustersBySubject(subjectId);
    return c.json(clusters);
  });

  // GET /api/v1/clusters/:id
  app.get("/:id", async (c) => {
    const cluster = await contentRepo.getClusterById(c.req.param("id"));
    if (!cluster) {
      throw new NotFoundError("Cluster");
    }
    return c.json(cluster);
  });

  // POST /api/v1/clusters
  app.post("/", zValidator("json", createQuestionClusterSchema), async (c) => {
    const data = c.req.valid("json");

    // Verify subject exists
    const subject = await contentRepo.getSubjectById(data.subjectId);
    if (!subject) {
      throw new NotFoundError("Fach");
    }

    const cluster = await contentRepo.createCluster(data);
    return c.json(cluster, 201);
  });

  // PUT /api/v1/clusters/:id
  app.put("/:id", zValidator("json", updateQuestionClusterSchema), async (c) => {
    const data = c.req.valid("json");
    const cluster = await contentRepo.updateCluster(c.req.param("id"), data);
    if (!cluster) {
      throw new NotFoundError("Cluster");
    }
    return c.json(cluster);
  });

  // DELETE /api/v1/clusters/:id
  app.delete("/:id", async (c) => {
    const deleted = await contentRepo.deleteCluster(c.req.param("id"));
    if (!deleted) {
      throw new NotFoundError("Cluster");
    }
    return c.body(null, 204);
  });

  return app;
}
