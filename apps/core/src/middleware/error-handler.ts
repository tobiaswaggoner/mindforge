import type { Context } from "hono";
import { isAppError, InternalError } from "@mindforge/shared-utils";
import { ZodError } from "zod";

export async function errorHandler(err: Error, c: Context) {
  console.error("Error:", err);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return c.json(
      {
        error: "VALIDATION_ERROR",
        message: "Ungültige Eingabedaten",
        statusCode: 422,
        details: err.flatten(),
      },
      422
    );
  }

  // Handle AppError
  if (isAppError(err)) {
    return c.json(err.toJSON(), err.statusCode as 400);
  }

  // Handle unknown errors
  const internalError = new InternalError();
  return c.json(internalError.toJSON(), 500);
}
