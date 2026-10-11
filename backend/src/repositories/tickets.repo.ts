import { pool } from "../db";
import type {
  CreateTicketInput,
  Priority,
  Status,
} from "../validation/tickets.schemas";

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