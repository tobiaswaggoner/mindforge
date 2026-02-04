import * as jose from "jose";
import type { JwtPayload, UserRole } from "@mindforge/shared-types";
import { config } from "../config.js";

const secretKey = new TextEncoder().encode(config.JWT_SECRET);

export interface TokenPayload {
  userId: string;
  email: string;
  roles: UserRole[];
}

export interface CreateTokenOptions {
  rememberMe?: boolean;
}

/**
 * Create a JWT access token
 */
export async function createAccessToken(
  payload: TokenPayload,
  options: CreateTokenOptions = {}
): Promise<{ token: string; expiresIn: number }> {
  const expiresIn = options.rememberMe
    ? config.JWT_REMEMBER_ME_EXPIRES_IN
    : config.JWT_ACCESS_TOKEN_EXPIRES_IN;

  const token = await new jose.SignJWT({
    sub: payload.userId,
    email: payload.email,
    roles: payload.roles,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(config.JWT_ISSUER)
    .setAudience(config.JWT_AUDIENCE)
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresIn)
    .sign(secretKey);

  return { token, expiresIn };
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
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
 * Decode a JWT without verification (for debugging)
 */
export function decodeToken(token: string): jose.JWTPayload | null {
  try {
    return jose.decodeJwt(token);
  } catch {
    return null;
  }
}
