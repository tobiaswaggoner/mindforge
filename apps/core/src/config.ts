import { z } from "zod";

const envSchema = z.object({
  // Server
  PORT: z.coerce.number().default(4202),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database (PostgreSQL on minix-k3s K8s cluster)
  DATABASE_URL: z.string().url().default("postgres://hiddenstories_user:hiddenstories_pass@minix-k3s:30432/mindforge_core"),

  // Auth (for verifying JWTs from auth-api)
  JWT_SECRET: z.string().min(32),
  JWT_ISSUER: z.string().default("https://auth.mindforge-hub.de"),
  JWT_AUDIENCE: z.string().default("mindforge"),

  // CORS
  CORS_ORIGINS: z.string().default("http://localhost:3000,http://localhost:3001,http://localhost:4201"),
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
