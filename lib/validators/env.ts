import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string(),
  SESSION_SECRET: z.string().min(16, "SESSION_SECRET phải có độ dài tối thiểu 16 ký tự").default("mock-session-secret-at-least-32-chars-long"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// For build-time compatibility or fallback if not run in Server Actions
const getEnv = () => {
  const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/giapha?schema=public";
  const secret = process.env.SESSION_SECRET || "mock-session-secret-at-least-32-chars-long";
  const nodeEnv = process.env.NODE_ENV || "development";

  return envSchema.parse({
    DATABASE_URL: dbUrl,
    SESSION_SECRET: secret,
    NODE_ENV: nodeEnv,
  });
};

export const env = getEnv();
