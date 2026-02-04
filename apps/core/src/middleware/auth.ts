import type { Context, Next } from "hono";
import * as jose from "jose";
import { UnauthorizedError } from "@mindforge/shared-utils";
import type { JwtPayload, UserRole } from "@mindforge/shared-types";
import { config } from "../config.js";

const secretKey = new TextEncoder().encode(config.JWT_SECRET);

declare module "hono" {
  interface ContextVariableMap {
    jwtPayload: JwtPayload;
    userId: string;
    userRoles: UserRole[];
  }
}

/**
 * Verify JWT token
 */
async function verifyToken(token: string): Promise<JwtPayload | null> {
  try {
    const { payload } = await jose.jwtVerify(token, secretKey, {
      issuer: config.JWT_ISSUER,
      audience: config.JWT_AUDIENCE,
    });

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      roles: payload.roles as UserRole[],
      iat: payload.iat!,
      exp: payload.exp!,
      iss: payload.iss!,
    };
  } catch {
    return null;
  }
}

/**
 * Authentication middleware - requires valid JWT
 */
export function authMiddleware() {
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

    // Store payload in context
    c.set("jwtPayload", payload);
    c.set("userId", payload.sub);
    c.set("userRoles", payload.roles);

    await next();
  };
}

/**
 * Optional auth middleware - sets user if valid token, but doesn't require it
 */
export function optionalAuthMiddleware() {
  return async (c: Context, next: Next) => {
    const authHeader = c.req.header("Authorization");

    if (authHeader?.startsWith("Bearer ")) {
      const token = authHeader.slice(7);
      const payload = await verifyToken(token);

      if (payload) {
        c.set("jwtPayload", payload);
        c.set("userId", payload.sub);
        c.set("userRoles", payload.roles);
      }
    }

    await next();
  };
}

/**
 * Role check middleware - requires specific roles
 */
export function requireRoles(...roles: UserRole[]) {
  return async (c: Context, next: Next) => {
    const userRoles = c.get("userRoles");

    if (!userRoles) {
      throw new UnauthorizedError("Token fehlt");
    }

    const hasRole = roles.some((role) => userRoles.includes(role));
    if (!hasRole) {
      throw new UnauthorizedError("Zugriff verweigert");
    }

    await next();
  };
}
