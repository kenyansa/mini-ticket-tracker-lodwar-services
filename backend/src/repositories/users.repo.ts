import { pool } from '../db';
import type { UpdateUserInput } from '../validation/auth.schemas';

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthUser extends User {
  permissions: string[];
}

const COLUMNS = `
  u.id::int AS id, u.email, u.name, r.name AS role,
  u.is_active AS "isActive", u.created_at AS "createdAt"
`;
const FROM = `FROM users u JOIN roles r ON r.id = u.role_id`;

export async function findAuthUserById(id: number): Promise<AuthUser | null> {
  const { rows } = await pool.query<AuthUser>(
    `SELECT ${COLUMNS},
            ARRAY(
              SELECT p.name::text
              FROM role_permissions rp
              JOIN permissions p ON p.id = rp.permission_id
              WHERE rp.role_id = u.role_id
              ORDER BY p.name
            ) AS permissions
     ${FROM}
     WHERE u.id = $1`,
    [id]
  );
  return rows[0] ?? null;
}

export async function findCredentialsByEmail(email: string) {
  const { rows } = await pool.query<{ id: number; passwordHash: string; isActive: boolean }>(
    `SELECT id::int AS id, password_hash AS "passwordHash", is_active AS "isActive"
     FROM users WHERE email = $1`,
    [email]
  );
  return rows[0] ?? null;
}

export async function insert(input: {
  email: string;
  name: string;
  passwordHash: string;
  role: string;
}): Promise<number> {
  const { rows } = await pool.query<{ id: number }>(
    `INSERT INTO users (email, name, password_hash, role_id)
     VALUES ($1, $2, $3, (SELECT id FROM roles WHERE name = $4))
     RETURNING id::int AS id`,
    [input.email, input.name, input.passwordHash, input.role]
  );
  return rows[0].id;
}

export async function findAll(assignableOnly: boolean): Promise<User[]> {
  const where = assignableOnly
    ? `WHERE u.is_active AND EXISTS (
         SELECT 1 FROM role_permissions rp
         JOIN permissions p ON p.id = rp.permission_id
         WHERE rp.role_id = u.role_id AND p.name = 'ticket:update')`
    : '';
  const { rows } = await pool.query<User>(`SELECT ${COLUMNS} ${FROM} ${where} ORDER BY u.name`);
  return rows;
}

export async function update(id: number, input: UpdateUserInput): Promise<boolean> {
  const { rowCount } = await pool.query(
    `UPDATE users
     SET role_id   = COALESCE((SELECT id FROM roles WHERE name = $2), role_id),
         is_active = COALESCE($3::boolean, is_active)
     WHERE id = $1`,
    [id, input.role ?? null, input.isActive ?? null]
  );
  return (rowCount ?? 0) > 0;
}

// the main benefit of server-side sessions: kill a user's logins instantly
export async function deleteSessionsForUser(id: number): Promise<void> {
  await pool.query(`DELETE FROM "session" WHERE (sess->>'userId')::bigint = $1`, [id]);
}
