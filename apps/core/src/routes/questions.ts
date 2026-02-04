import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { gameAnswerRequestSchema } from "@mindforge/shared-types";
import { NotFoundError } from "@mindforge/shared-utils";
import type { ContentRepository } from "../repositories/content.repository.js";
import type { Answer } from "@mindforge/shared-types";

/**
 * Game API routes for questions
 *
 * These endpoints are used by games (like Dungeons & Diplomas) to get questions
 * and submit answers.
 */
export function createQuestionRoutes(contentRepo: ContentRepository) {
  const app = new Hono();

  // GET /api/v1/questions/random?subject=...
  // Get a random question for a subject (for gameplay)
  app.get("/random", async (c) => {
    const subjectKey = c.req.query("subject");
    if (!subjectKey) {
      return c.json({ error: "subject query parameter required" }, 400);
    }

    const fullQuestion = await contentRepo.getRandomQuestionForSubject(subjectKey);
    if (!fullQuestion) {
      throw new NotFoundError("Keine Fragen für dieses Fach gefunden");
    }

    // Transform to game-friendly format (don't reveal correct answer)
    const gameQuestion = {
      id: fullQuestion.id,
      questionText: fullQuestion.questionText,
      difficulty: fullQuestion.cluster.difficultyBaseline,
      subject: subjectKey,
      topic: fullQuestion.cluster.topic,
      answers: fullQuestion.answers.map((a: Answer) => ({
        id: a.id,
        text: a.answerText,
      })),
    };

    return c.json(gameQuestion);
  });

  // POST /api/v1/questions/answer
  // Submit an answer to a question
  app.post("/answer", zValidator("json", gameAnswerRequestSchema), async (c) => {
    const { questionId, answerId } = c.req.valid("json");

    // Get the variant (question)
    const fullQuestion = await contentRepo.getFullQuestion(questionId);
    if (!fullQuestion) {
      throw new NotFoundError("Frage");
    }

    // Find the submitted answer
    const submittedAnswer = fullQuestion.answers.find((a: Answer) => a.id === answerId);
    if (!submittedAnswer) {
      throw new NotFoundError("Antwort");
    }

    // Find the correct answer
    const correctAnswer = fullQuestion.answers.find((a: Answer) => a.isCorrect);

    // TODO: Log this answer event for learning analytics
    // This would be done via an event service

    return c.json({
      correct: submittedAnswer.isCorrect,
      correctAnswerId: correctAnswer?.id || null,
      explanation: null, // Could add explanation field later
    });
  });

  // GET /api/v1/questions/:id
  // Get a specific question by variant ID
  app.get("/:id", async (c) => {
    const fullQuestion = await contentRepo.getFullQuestion(c.req.param("id"));
    if (!fullQuestion) {
      throw new NotFoundError("Frage");
    }
    return c.json(fullQuestion);
  });

  return app;
}
