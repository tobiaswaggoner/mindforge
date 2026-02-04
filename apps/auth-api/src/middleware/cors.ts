import { cors } from "hono/cors";
import { config } from "../config.js";

const origins = config.CORS_ORIGINS.split(",").map((o) => o.trim());

export const corsMiddleware = cors({
  origin: origins,
  allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowHeaders: ["Content-Type", "Authorization"],
  exposeHeaders: ["Content-Length"],
  maxAge: 86400,
  credentials: true,
});
