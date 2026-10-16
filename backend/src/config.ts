import "dotenv/config";

const isTest = process.env.NODE_ENV === "test";

const databaseUrl = isTest ? process.env.TEST_DATABASE_URL : process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(isTest ? "TEST_DATABASE_URL is not set" : "DATABASE_URL is not set");
}

const sessionSecret = process.env.SESSION_SECRET ?? (isTest ? "test-only-secret" : undefined);
if (!sessionSecret) throw new Error("SESSION_SECRET is not set");

export const config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl,
  isTest,
  sessionSecret,
  cookieSecure: process.env.COOKIE_SECURE === "true", // true when served over HTTPS
  bcryptRounds: isTest ? 4 : 12, // low cost in tests keeps them fast
};