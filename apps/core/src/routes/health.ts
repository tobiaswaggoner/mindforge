import { Hono } from "hono";
import type postgres from "postgres";

export function createHealthRoutes(sql: postgres.Sql) {
  const app = new Hono();

  app.get("/", async (c) => {
    // Check database connectivity
    let dbStatus: "ok" | "unhealthy" = "unhealthy";
    try {
      await sql`SELECT 1`;
      dbStatus = "ok";
    } catch {
      // Database not available
    }

    const status = dbStatus === "ok" ? "ok" : "degraded";

    return c.json({
      status,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "0.1.0",
      services: {
        database: { status: dbStatus },
      },
    });
  });

  app.get("/ready", async (c) => {
    try {
      await sql`SELECT 1`;
      return c.json({ ready: true });
    } catch {
      return c.json({ ready: false }, 503);
    }
  });

  app.get("/live", (c) => {
    return c.json({ alive: true });
  });

  return app;
}
