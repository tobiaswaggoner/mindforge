import type { Context, Next } from "hono";
import { UnauthorizedError } from "@mindforge/shared-utils";
import type { JwtPayload } from "@mindforge/shared-types";
import { verifyToken } from "../services/token.service.js";
import type { UserRecord } from "../repositories/user.repository.js";
import type { UserRepository } from "../repositories/user.repository.js";

declare module "hono" {
  interface ContextVariableMap {
    jwtPayload: JwtPayload;
    user: UserRecord;
  }
}

/**
 * Authentication middleware - requires valid JWT
 */
export function authMiddleware(userRepository: UserRepository) {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Token fehlt");
    }

    const token = authHeader.slice(7);
    const payload = await verifyToken(token);

    if (!payload) {
      throw new UnauthorizedError("Token ungültig oder abgelaufen");
    }

    // Verify user exists and is active
    const user = await userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedError("Account nicht gefunden oder gesperrt");
    }

    // Store payload and user in context
    c.set("jwtPayload", payload);
    c.set("user", user);

    await next();
  };
}

/**
 * Optional auth middleware - sets user if valid token, but doesn't require it
 */
export function optionalAuthMiddleware(userRepository: UserRepository) {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const payload = await verifyToken(token);

      if (payload) {
        const user = await userRepository.findById(payload.sub);
        if (user && user.isActive) {
          c.set("jwtPayload", payload);
          c.set("user", user);
        }
      }
    }

    await next();
  };
}
