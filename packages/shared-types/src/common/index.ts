import { z } from "zod";

// UUID Schema
export const uuidSchema = z.string().uuid();

// Pagination
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;

export const paginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) =>
  z.object({
    items: z.array(itemSchema),
    total: z.number().int().min(0),
    page: z.number().int().min(1),
    limit: z.number().int().min(1),
    totalPages: z.number().int().min(0),
  });

export type PaginatedResponse<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

// Timestamps
export const timestampsSchema = z.object({
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Timestamps = z.infer<typeof timestampsSchema>;

// API Error Response
export const apiErrorSchema = z.object({
  error: z.string(),
  message: z.string(),
  statusCode: z.number().int(),
  details: z.record(z.string(), z.unknown()).optional(),
});

export type ApiError = z.infer<typeof apiErrorSchema>;

// Success Response
export const successResponseSchema = z.object({
  message: z.string(),
});

export type SuccessResponse = z.infer<typeof successResponseSchema>;

// Health Check
export const healthCheckSchema = z.object({
  status: z.enum(["ok", "degraded", "unhealthy"]),
  timestamp: z.string().datetime(),
  version: z.string().optional(),
  services: z
    .record(
      z.string(),
      z.object({
        status: z.enum(["ok", "degraded", "unhealthy"]),
        latency: z.number().optional(),
      })
    )
    .optional(),
});

export type HealthCheck = z.infer<typeof healthCheckSchema>;
