import * as ticketsRepo from "../repositories/tickets.repo";
import type { CreateTicketInput } from "../validation/tickets.schemas";

export function createTicket(input: CreateTicketInput) {
  return ticketsRepo.insert(input);
}