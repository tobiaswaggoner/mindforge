import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { createAnswerSchema, updateAnswerSchema } from "@mindforge/shared-types";
import { NotFoundError } from "@mindforge/shared-utils";
import type { ContentRepository } from "../repositories/content.repository.js";

// Bulk create schema
const bulkCreateAnswersSchema = z.object({
  answers: z.array(createAnswerSchema),
});

export function createAnswerRoutes(contentRepo: ContentRepository) {
  const app = new Hono();

  // GET /api/v1/answers?variantId=...
  app.get("/", async (c) => {
    const variantId = c.req.query("variantId");
    if (!variantId) {
      return c.json({ error: "variantId query parameter required" }, 400);
    }

    // Verify variant exists
    const variant = await contentRepo.getVariantById(variantId);
    if (!variant) {
      throw new NotFoundError("Variante");
    }

    const answers = await contentRepo.getAnswersByVariant(variantId);
    return c.json(answers);
  });

  // GET /api/v1/answers/:id
  app.get("/:id", async (c) => {
    const answer = await contentRepo.getAnswerById(c.req.param("id"));
    if (!answer) {
      throw new NotFoundError("Antwort");
    }
    return c.json(answer);
  });

  // POST /api/v1/answers
  app.post("/", zValidator("json", createAnswerSchema), async (c) => {
    const data = c.req.valid("json");

    // Verify variant exists
    const variant = await contentRepo.getVariantById(data.variantId);
    if (!variant) {
      throw new NotFoundError("Variante");
    }

    const answer = await contentRepo.createAnswer(data);
    return c.json(answer, 201);
  });

  // POST /api/v1/answers/bulk
  app.post("/bulk", zValidator("json", bulkCreateAnswersSchema), async (c) => {
    const { answers: answersData } = c.req.valid("json");

    if (answersData.length === 0) {
      return c.json({ error: "At least one answer required" }, 400);
    }

    // Verify all variants exist
    const variantIds = [...new Set(answersData.map((a) => a.variantId))];
    for (const variantId of variantIds) {
      const variant = await contentRepo.getVariantById(variantId);
      if (!variant) {
        throw new NotFoundError(`Variante ${variantId}`);
      }
    }

    const answers = await contentRepo.createAnswersBulk(answersData);
    return c.json(answers, 201);
  });

  // PUT /api/v1/answers/:id
  app.put("/:id", zValidator("json", updateAnswerSchema), async (c) => {
    const data = c.req.valid("json");
    const answer = await contentRepo.updateAnswer(c.req.param("id"), data);
    if (!answer) {
      throw new NotFoundError("Antwort");
    }
    return c.json(answer);
  });

  // DELETE /api/v1/answers/:id
  app.delete("/:id", async (c) => {
    const deleted = await contentRepo.deleteAnswer(c.req.param("id"));
    if (!deleted) {
      throw new NotFoundError("Antwort");
    }
    return c.body(null, 204);
  });

  return app;
}
