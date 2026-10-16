import * as bcrypt from 'bcryptjs';
import request from 'supertest';
import { app } from '../src/app';
import { pool } from '../src/db';

type Role = 'admin' | 'agent' | 'requester';

export async function createUser(role: Role, email = `${role}@test.com`) {
  const hash = await bcrypt.hash('password123', 4);
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO users (email, name, password_hash, role_id)
     VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = $4))
     RETURNING id::int AS id`,
    [email, role, hash, role]
  );
  return { id: rows[0].id, email };
}

// returns a supertest agent that keeps the session cookie between requests
export async function loginAs(role: Role, email?: string) {
  const user = await createUser(role, email);
  const agent = request.agent(app);
  await agent.post('/auth/login').send({ email: user.email, password: 'password123' }).expect(200);
  return { agent, user };
}
