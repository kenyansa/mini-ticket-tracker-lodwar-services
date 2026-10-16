import { pool } from '../db';
import type {
  CreateTicketInput,
  Priority,
  Status,
  ListTicketsQuery,
  UpdateTicketInput,
} from '../validation/tickets.schemas';

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  createdAt: Date;
}

// BIGSERIAL comes back from pg as a string, so cast to int in SQL.
const COLUMNS = `
  id::int AS id,
  title,
  description,
  status,
  priority,
  created_at AS "createdAt"
`;

export async function insert(input: CreateTicketInput): Promise<Ticket> {
  const { rows } = await pool.query<Ticket>(
    `INSERT INTO tickets (title, description, priority)
     VALUES ($1, $2, COALESCE($3::ticket_priority, 'medium'))
     RETURNING ${COLUMNS}`,
    [input.title, input.description ?? null, input.priority ?? null]
  );
  return rows[0];
}

export async function findAll(
  query: ListTicketsQuery
): Promise<{ items: Ticket[]; total: number }> {
  const { status, page, limit } = query;
  const offset = (page - 1) * limit;

  const filterParams: unknown[] = status ? [status] : [];
  const where = status ? 'WHERE status = $1::ticket_status' : '';
  const n = filterParams.length;

  const countResult = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM tickets ${where}`,
    filterParams
  );

  const listResult = await pool.query<Ticket>(
    `SELECT ${COLUMNS}
     FROM tickets
     ${where}
     ORDER BY created_at DESC, id DESC
     LIMIT $${n + 1} OFFSET $${n + 2}`,
    [...filterParams, limit, offset]
  );

  return { items: listResult.rows, total: countResult.rows[0].total };
}

export async function update(id: number, input: UpdateTicketInput): Promise<Ticket | null> {
  const { rows } = await pool.query<Ticket>(
    `UPDATE tickets
     SET status   = COALESCE($2::ticket_status, status),
         priority = COALESCE($3::ticket_priority, priority)
     WHERE id = $1
     RETURNING ${COLUMNS}`,
    [id, input.status ?? null, input.priority ?? null]
  );
  return rows[0] ?? null;
}

export async function countByStatus(): Promise<{ status: Status; count: number }[]> {
  const { rows } = await pool.query<{ status: Status; count: number }>(
    `SELECT status, COUNT(*)::int AS count FROM tickets GROUP BY status`
  );
  return rows;
}
