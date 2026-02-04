import type { Context, Next } from "hono";
import type postgres from "postgres";
import { RateLimitError } from "@mindforge/shared-utils";
import { now, addTime } from "@mindforge/shared-utils";
import type { RateLimitRow } from "../db/database.js";

interface RateLimitOptions {
  windowMs: number; // Window in milliseconds
  maxRequests: number; // Max requests per window
  keyGenerator?: (c: Context) => string; // Function to generate rate limit key
}

export function createRateLimiter(sql: postgres.Sql, options: RateLimitOptions) {
  const { windowMs, maxRequests, keyGenerator } = options;
  const windowSeconds = Math.ceil(windowMs / 1000);

  return async (c: Context, next: Next) => {
    const key = keyGenerator ? keyGenerator(c) : getClientIp(c);
    const endpoint = c.req.path;
    const fullKey = `${endpoint}:${key}`;

    // Cleanup old entries occasionally (1% chance per request)
    if (Math.random() < 0.01) {
      await sql`DELETE FROM rate_limits WHERE expires_at < NOW()`;
    }

    // Get rate limit entry
    const entries = await sql<RateLimitRow[]>`SELECT * FROM rate_limits WHERE key = ${fullKey}`;
    const entry = entries.length > 0 ? entries[0] : null;

    const currentTime = now();
    const expiresAt = addTime(new Date(), windowSeconds, "seconds");

    if (!entry) {
      // Create new entry
      await sql`
        INSERT INTO rate_limits (key, count, window_start, expires_at) VALUES (${fullKey}, 1, ${currentTime}, ${expiresAt})
      `;
    } else {
      // Check if window expired
      const windowExpired = entry.expires_at < new Date();

      if (windowExpired) {
        // Reset window
        await sql`
          UPDATE rate_limits SET count = 1, window_start = ${currentTime}, expires_at = ${expiresAt} WHERE key = ${fullKey}
        `;
      } else if (entry.count >= maxRequests) {
        // Rate limit exceeded
        throw new RateLimitError("Zu viele Anfragen. Bitte später erneut versuchen.");
      } else {
        // Increment counter
        await sql`
          UPDATE rate_limits SET count = count + 1 WHERE key = ${fullKey}
        `;
      }
    }

    await next();
  };
}

function getClientIp(c: Context): string {
  // Check common proxy headers
  const forwarded = c.req.header("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = c.req.header("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to connection info (Bun-specific)
  return "unknown";
}
