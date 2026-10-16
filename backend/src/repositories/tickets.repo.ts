import { pool } from '../db';
import type {
  CreateTicketInput,
  ListTicketsQuery,
  Priority,
  Status,
  UpdateTicketInput,
} from '../validation/tickets.schemas';

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  createdAt: Date;
  createdBy: number | null;
  assigneeId: number | null;
  assigneeName: string | null;
}

// Restricts which tickets a query may see
export interface TicketScope {
  createdBy?: number;
  assigneeId?: number;
}

const SELECT = `
  t.id::int AS id, t.title, t.description, t.status, t.priority,
  t.created_at AS "createdAt",
  t.created_by::int AS "createdBy",
  t.assignee_id::int AS "assigneeId",
  a.name AS "assigneeName"
`;
const JOIN = `LEFT JOIN users a ON a.id = t.assignee_id`;

export async function insert(input: CreateTicketInput, createdBy: number): Promise<Ticket> {
  const { rows } = await pool.query<Ticket>(
    `WITH t AS (
       INSERT INTO tickets (title, description, priority, created_by)
       VALUES ($1, $2, COALESCE($3::ticket_priority, 'medium'), $4)
       RETURNING *
     )
     SELECT ${SELECT} FROM t ${JOIN}`,
    [input.title, input.description ?? null, input.priority ?? null, createdBy]
  );
  return rows[0];
}

export async function findAll(
  query: ListTicketsQuery,
  scope: TicketScope = {}
): Promise<{ items: Ticket[]; total: number }> {
  const { status, page, limit } = query;
  const offset = (page - 1) * limit;

  const params: unknown[] = [];
  const conditions: string[] = [];
  const add = (sql: string, value: unknown) => {
    params.push(value);
    conditions.push(sql.replace('?', `$${params.length}`));
  };
  if (status) add('t.status = ?::ticket_status', status);
  if (scope.createdBy) add('t.created_by = ?', scope.createdBy);
  if (scope.assigneeId) add('t.assignee_id = ?', scope.assigneeId);
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const n = params.length;

  const countResult = await pool.query<{ total: number }>(
    `SELECT COUNT(*)::int AS total FROM tickets t ${where}`,
    params
  );

  const listResult = await pool.query<Ticket>(
    `SELECT ${SELECT}
     FROM tickets t ${JOIN}
     ${where}
     ORDER BY t.created_at DESC, t.id DESC
     LIMIT $${n + 1} OFFSET $${n + 2}`,
    [...params, limit, offset]
  );

  return { items: listResult.rows, total: countResult.rows[0].total };
}

export async function update(id: number, input: UpdateTicketInput): Promise<Ticket | null> {
  const { rows } = await pool.query<Ticket>(
    `WITH t AS (
       UPDATE tickets
       SET status      = COALESCE($2::ticket_status, status),
           priority    = COALESCE($3::ticket_priority, priority),
           assignee_id = CASE WHEN $4::boolean THEN $5::bigint ELSE assignee_id END
       WHERE id = $1
       RETURNING *
     )
     SELECT ${SELECT} FROM t ${JOIN}`,
    [
      id,
      input.status ?? null,
      input.priority ?? null,
      input.assigneeId !== undefined, // true when the client sent assigneeId, even if null
      input.assigneeId ?? null,
    ]
  );
  return rows[0] ?? null;
}

export async function countByStatus(
  createdBy?: number
): Promise<{ status: Status; count: number }[]> {
  const { rows } = await pool.query<{ status: Status; count: number }>(
    `SELECT status, COUNT(*)::int AS count
     FROM tickets
     ${createdBy ? 'WHERE created_by = $1' : ''}
     GROUP BY status`,
    createdBy ? [createdBy] : []
  );
  return rows;
}
