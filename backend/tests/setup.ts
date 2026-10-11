import { afterAll, beforeEach } from 'vitest';
import { pool } from '../src/db';

beforeEach(async () => {
  await pool.query('TRUNCATE tickets RESTART IDENTITY');
});

afterAll(async () => {
  await pool.end();
});
