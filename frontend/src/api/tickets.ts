import type {
  CreateTicketInput,
  PaginatedTickets,
  Status,
  Ticket,
  TicketStats,
  UpdateTicketInput,
} from '../types/ticket';
import { request } from './http';

const BASE = '/api/tickets';

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
