export type Status = "open" | "in_progress" | "closed";
export type Priority = "low" | "medium" | "high";

export interface Ticket {
  id: number;
  title: string;
  description: string | null;
  status: Status;
  priority: Priority;
  createdAt: string; // ISO string, JSON has no Date type
  createdBy: number | null;
  assigneeId: number | null;
  assigneeName: string | null;
}

export interface PaginatedTickets {
  data: Ticket[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type TicketStats = Record<Status, number>;

export interface CreateTicketInput {
  title: string;
  description?: string;
  priority?: Priority;
}

export interface UpdateTicketInput {
  status?: Status;
  priority?: Priority;
  assigneeId?: number | null;
}