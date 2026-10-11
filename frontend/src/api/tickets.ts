import type {
  CreateTicketInput,
  PaginatedTickets,
  Status,
  Ticket,
  TicketStats,
  UpdateTicketInput,
} from '../types/ticket';

const BASE = '/api/tickets';

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    let details: unknown;
    try {
      const body = await res.json();
      message = body?.error?.message ?? message;
      details = body?.error?.details;
    } catch {
      // response had no JSON body, keep the default message
    }
    throw new ApiError(res.status, message, details);
  }

  return res.json() as Promise<T>;
}

export function listTickets(params: {
  status?: Status;
  page?: number;
  limit?: number;
}): Promise<PaginatedTickets> {
  const query = new URLSearchParams();
  if (params.status) query.set('status', params.status);
  if (params.page) query.set('page', String(params.page));
  if (params.limit) query.set('limit', String(params.limit));
  const qs = query.toString();
  return request<PaginatedTickets>(qs ? `${BASE}?${qs}` : BASE);
}

export function createTicket(input: CreateTicketInput): Promise<Ticket> {
  return request<Ticket>(BASE, { method: 'POST', body: JSON.stringify(input) });
}

export function updateTicket(id: number, input: UpdateTicketInput): Promise<Ticket> {
  return request<Ticket>(`${BASE}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export function getStats(): Promise<TicketStats> {
  return request<TicketStats>(`${BASE}/stats`);
}
