import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { createQuestionVariantSchema, updateQuestionVariantSchema } from "@mindforge/shared-types";
import { NotFoundError } from "@mindforge/shared-utils";
import type { ContentRepository } from "../repositories/content.repository.js";

export function createVariantRoutes(contentRepo: ContentRepository) {
  const app = new Hono();

  // GET /api/v1/variants?clusterId=...
  app.get("/", async (c) => {
    const clusterId = c.req.query("clusterId");
    if (!clusterId) {
      return c.json({ error: "clusterId query parameter required" }, 400);
    }

    // Verify cluster exists
    const cluster = await contentRepo.getClusterById(clusterId);
    if (!cluster) {
      throw new NotFoundError("Cluster");
    }

    const variants = await contentRepo.getVariantsByCluster(clusterId);
    return c.json(variants);
  });

  // GET /api/v1/variants/:id
  app.get("/:id", async (c) => {
    const variant = await contentRepo.getVariantById(c.req.param("id"));
    if (!variant) {
      throw new NotFoundError("Variante");
    }
    return c.json(variant);
  });

  // GET /api/v1/variants/:id/full - Get variant with cluster and answers
  app.get("/:id/full", async (c) => {
    const fullQuestion = await contentRepo.getFullQuestion(c.req.param("id"));
    if (!fullQuestion) {
      throw new NotFoundError("Variante");
    }
    return c.json(fullQuestion);
  });

  // POST /api/v1/variants
  app.post("/", zValidator("json", createQuestionVariantSchema), async (c) => {
    const data = c.req.valid("json");

    // Verify cluster exists
    const cluster = await contentRepo.getClusterById(data.clusterId);
    if (!cluster) {
      throw new NotFoundError("Cluster");
    }

    const variant = await contentRepo.createVariant(data);
    return c.json(variant, 201);
  });

  // PUT /api/v1/variants/:id
  app.put("/:id", zValidator("json", updateQuestionVariantSchema), async (c) => {
    const data = c.req.valid("json");
    const variant = await contentRepo.updateVariant(c.req.param("id"), data);
    if (!variant) {
      throw new NotFoundError("Variante");
    }
    return c.json(variant);
  });

  // DELETE /api/v1/variants/:id
  app.delete("/:id", async (c) => {
    const deleted = await contentRepo.deleteVariant(c.req.param("id"));
    if (!deleted) {
      throw new NotFoundError("Variante");
    }
    return c.body(null, 204);
  });

  return app;
}
