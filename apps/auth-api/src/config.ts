import { z } from "zod";

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(4000),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database (PostgreSQL on minix-k3s K8s cluster)
  DATABASE_URL: z.string().url().default("postgres://hiddenstories_user:hiddenstories_pass@minix-k3s:30432/mindforge_auth"),

  // JWT
  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default("https://auth.mindforge-hub.de"),
  JWT_AUDIENCE: z.string().default("mindforge"),
  JWT_ACCESS_TOKEN_EXPIRES_IN: z.coerce.number().default(86400), // 24 hours
  JWT_REMEMBER_ME_EXPIRES_IN: z.coerce.number().default(2592000), // 30 days

  // Email (Mailgun)
  MAILGUN_API_KEY: z.string().optional(),
  MAILGUN_DOMAIN: z.string().optional(),
  MAILGUN_FROM: z.string().default("MindForge <noreply@mindforge.de>"),

  // App URLs
  AUTH_UI_URL: z.string().default("http://localhost:3000"),
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001,http://localhost:4201"),

  // Rate Limiting
  RATE_LIMIT_LOGIN: z.coerce.number().default(5), // attempts per minute
  RATE_LIMIT_REGISTER: z.coerce.number().default(3),
  RATE_LIMIT_FORGOT_PASSWORD: z.coerce.number().default(3),
});

function loadConfig() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    console.error("❌ Invalid environment variables:");
    console.error(result.error.format());
    process.exit(1);
  }

  return result.data;
}

export const config = loadConfig();

export type Config = typeof config;
