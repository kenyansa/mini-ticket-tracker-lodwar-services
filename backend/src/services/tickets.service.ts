import * as ticketsRepo from '../repositories/tickets.repo';
import { HttpError } from '../middleware/errorHandler';
import type {
  CreateTicketInput,
  ListTicketsQuery,
  Status,
  UpdateTicketInput,
} from '../validation/tickets.schemas';

export function createTicket(input: CreateTicketInput) {
  return ticketsRepo.insert(input);
}

export async function listTickets(query: ListTicketsQuery) {
  const { items, total } = await ticketsRepo.findAll(query);
  return {
    data: items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function updateTicket(id: number, input: UpdateTicketInput) {
  const ticket = await ticketsRepo.update(id, input);
  if (!ticket) {
    throw new HttpError(404, `Ticket ${id} not found`);
  }
  return ticket;
}

export async function getStats(): Promise<Record<Status, number>> {
  const counts: Record<Status, number> = { open: 0, in_progress: 0, closed: 0 };
  for (const row of await ticketsRepo.countByStatus()) {
    counts[row.status] = row.count;
  }
  return counts;
}
