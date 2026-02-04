import { z } from "zod";
import { uuidSchema } from "../common/index.js";
import { contentTypeSchema } from "../content/index.js";

// Task Status
export const taskStatusSchema = z.enum([
  "pending",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
]);

export type TaskStatus = z.infer<typeof taskStatusSchema>;

// Task Type
export const taskTypeSchema = z.enum([
  "generate_clusters",
  "generate_variants",
  "regenerate_answers",
]);

export type TaskType = z.infer<typeof taskTypeSchema>;

// Task Payload
export const taskPayloadSchema = z.object({
  subjectId: uuidSchema.optional(),
  clusterId: uuidSchema.optional(),
  variantId: uuidSchema.optional(),
  count: z.number().int().min(1).optional(),
  variantsPerCluster: z.number().int().min(1).optional(),
  answersPerVariant: z.number().int().min(2).max(6).optional(),
});

export type TaskPayload = z.infer<typeof taskPayloadSchema>;

// Generation Task
export const generationTaskSchema = z.object({
  id: uuidSchema,
  taskType: taskTypeSchema,
  status: taskStatusSchema,
  payload: taskPayloadSchema,
  userContext: z.string().nullable(),
  createdAt: z.string().datetime(),
  startedAt: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  delayedUntil: z.string().datetime().nullable(),
  progressCurrent: z.number().int().min(0),
  progressTotal: z.number().int().min(0),
  progressMessage: z.string().nullable(),
  errorMessage: z.string().nullable(),
  retryCount: z.number().int().min(0),
  maxRetries: z.number().int().min(0),
  acceptedAt: z.string().datetime().nullable(),
  revertedAt: z.string().datetime().nullable(),
});

export type GenerationTask = z.infer<typeof generationTaskSchema>;

// Create Task Request
export const createTaskRequestSchema = z.object({
  taskType: taskTypeSchema,
  payload: taskPayloadSchema,
  userContext: z.string().nullable().optional(),
});

export type CreateTaskRequest = z.infer<typeof createTaskRequestSchema>;

// Task Content Log Action
export const taskContentLogActionSchema = z.enum(["created", "updated", "deleted"]);
export type TaskContentLogAction = z.infer<typeof taskContentLogActionSchema>;

// Task Content Log Entity Type
export const taskContentLogEntityTypeSchema = z.enum(["cluster", "variant", "answer"]);
export type TaskContentLogEntityType = z.infer<typeof taskContentLogEntityTypeSchema>;

// Task Content Log
export const taskContentLogSchema = z.object({
  id: uuidSchema,
  taskId: uuidSchema,
  entityType: taskContentLogEntityTypeSchema,
  entityId: uuidSchema,
  action: taskContentLogActionSchema,
  previousData: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type TaskContentLog = z.infer<typeof taskContentLogSchema>;

// Task Type Labels (German)
export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  generate_clusters: "Fragen generieren",
  generate_variants: "Varianten erstellen",
  regenerate_answers: "Antworten neu generieren",
};

// Task Status Labels (German)
export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Wartend",
  in_progress: "In Bearbeitung",
  completed: "Abgeschlossen",
  failed: "Fehlgeschlagen",
  cancelled: "Abgebrochen",
};
