import * as ticketsRepo from "../repositories/tickets.repo";
import type { CreateTicketInput, ListTicketsQuery} from "../validation/tickets.schemas";

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