import { afterAll, beforeEach } from "vitest";
import { pool } from "../src/db";

beforeEach(async () => {
  await pool.query('TRUNCATE tickets, users, "session" RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await pool.end();
});