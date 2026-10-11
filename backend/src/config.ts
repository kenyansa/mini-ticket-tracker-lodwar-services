import "dotenv/config";

const isTest = process.env.NODE_ENV === "test";

const databaseUrl = isTest
  ? process.env.TEST_DATABASE_URL
  : process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    isTest
      ? "TEST_DATABASE_URL is not set"
      : "DATABASE_URL is not set"
  );
}

export const config = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl,
  isTest,
};