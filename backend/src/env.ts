import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(4000),
  WEB_ORIGIN: z.string().url(),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(16),
  COOKIE_NAME: z.string().min(1).default("ecom_access"),
  COOKIE_SECURE: z
    .string()
    .default("false")
    .transform((v) => v === "true"),
});

export const env = envSchema.parse(process.env);

