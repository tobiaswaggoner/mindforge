import { z } from "zod";
import { timestampsSchema, uuidSchema } from "../common/index.js";

// Subject Schema
export const subjectSchema = z.object({
  id: uuidSchema,
  key: z.string().min(1).max(50),
  name: z.string().min(1).max(100),
  description: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Subject = z.infer<typeof subjectSchema>;

export const createSubjectSchema = subjectSchema.pick({
  key: true,
  name: true,
  description: true,
});

export type CreateSubject = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = createSubjectSchema.partial();

export type UpdateSubject = z.infer<typeof updateSubjectSchema>;

// Question Cluster Schema
export const questionClusterSchema = z.object({
  id: uuidSchema,
  subjectId: uuidSchema,
  topic: z.string().min(1).max(200),
  canonicalTemplate: z.string().nullable(),
  difficultyBaseline: z.number().int().min(1).max(10).default(5),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type QuestionCluster = z.infer<typeof questionClusterSchema>;

export const createQuestionClusterSchema = questionClusterSchema.pick({
  subjectId: true,
  topic: true,
  canonicalTemplate: true,
  difficultyBaseline: true,
});

export type CreateQuestionCluster = z.infer<typeof createQuestionClusterSchema>;

export const updateQuestionClusterSchema = createQuestionClusterSchema.omit({ subjectId: true }).partial();

export type UpdateQuestionCluster = z.infer<typeof updateQuestionClusterSchema>;

// Question Variant Schema
export const questionVariantSchema = z.object({
  id: uuidSchema,
  clusterId: uuidSchema,
  questionText: z.string().min(1),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type QuestionVariant = z.infer<typeof questionVariantSchema>;

export const createQuestionVariantSchema = questionVariantSchema.pick({
  clusterId: true,
  questionText: true,
});

export type CreateQuestionVariant = z.infer<typeof createQuestionVariantSchema>;

export const updateQuestionVariantSchema = createQuestionVariantSchema.omit({ clusterId: true }).partial();

export type UpdateQuestionVariant = z.infer<typeof updateQuestionVariantSchema>;

// Answer Schema
export const answerSchema = z.object({
  id: uuidSchema,
  variantId: uuidSchema,
  answerText: z.string().min(1),
  isCorrect: z.boolean(),
  distractorType: z.string().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Answer = z.infer<typeof answerSchema>;

export const createAnswerSchema = answerSchema.pick({
  variantId: true,
  answerText: true,
  isCorrect: true,
  distractorType: true,
});

export type CreateAnswer = z.infer<typeof createAnswerSchema>;

export const updateAnswerSchema = createAnswerSchema.omit({ variantId: true }).partial();

export type UpdateAnswer = z.infer<typeof updateAnswerSchema>;

// Content Type enum
export const contentTypeSchema = z.enum(["subject", "cluster", "variant", "answer"]);
export type ContentType = z.infer<typeof contentTypeSchema>;

// Content Selection
export const contentSelectionSchema = z.object({
  type: contentTypeSchema,
  subjectId: uuidSchema.optional(),
  clusterId: uuidSchema.optional(),
  variantId: uuidSchema.optional(),
});

export type ContentSelection = z.infer<typeof contentSelectionSchema>;

// Full Question (with all related data)
export const fullQuestionSchema = questionVariantSchema.extend({
  cluster: questionClusterSchema,
  answers: z.array(answerSchema),
});

export type FullQuestion = z.infer<typeof fullQuestionSchema>;

// Game Question (simplified for games)
export const gameQuestionSchema = z.object({
  id: uuidSchema,
  questionText: z.string(),
  difficulty: z.number().int().min(1).max(10),
  subject: z.string(),
  topic: z.string(),
  answers: z.array(
    z.object({
      id: uuidSchema,
      text: z.string(),
    })
  ),
});

export type GameQuestion = z.infer<typeof gameQuestionSchema>;

// Game Answer Request
export const gameAnswerRequestSchema = z.object({
  questionId: uuidSchema,
  answerId: uuidSchema,
  responseTimeMs: z.number().int().min(0).optional(),
});

export type GameAnswerRequest = z.infer<typeof gameAnswerRequestSchema>;

// Game Answer Response
export const gameAnswerResponseSchema = z.object({
  correct: z.boolean(),
  correctAnswerId: uuidSchema,
  explanation: z.string().nullable().optional(),
});

export type GameAnswerResponse = z.infer<typeof gameAnswerResponseSchema>;
