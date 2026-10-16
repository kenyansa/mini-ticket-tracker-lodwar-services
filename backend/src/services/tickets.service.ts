import { can } from "../auth/permissions";
import { HttpError } from "../middleware/errorHandler";
import * as ticketsRepo from "../repositories/tickets.repo";
import type { TicketScope } from "../repositories/tickets.repo";
import * as usersRepo from "../repositories/users.repo";
import type { AuthUser } from "../repositories/users.repo";
import type {
  CreateTicketInput,
  ListTicketsQuery,
  Status,
  UpdateTicketInput,
} from "../validation/tickets.schemas";

export function createTicket(input: CreateTicketInput, actor: AuthUser) {
  return ticketsRepo.insert(input, actor.id);
}

export async function listTickets(query: ListTicketsQuery, actor: AuthUser) {
  const scope: TicketScope = {};
  if (!can(actor, "ticket:read_all")) scope.createdBy = actor.id; // requesters see their own
  if (query.assignee === "me") scope.assigneeId = actor.id;

  const { items, total } = await ticketsRepo.findAll(query, scope);
  return {
    data: items,
    page: query.page,
    limit: query.limit,
    total,
    totalPages: Math.ceil(total / query.limit),
  };
}

export async function updateTicket(id: number, input: UpdateTicketInput, actor: AuthUser) {
  const { status, priority, assigneeId } = input;

  if ((status !== undefined || priority !== undefined) && !can(actor, "ticket:update")) {
    throw new HttpError(403, "You do not have permission to change status or priority");
  }
  if (assigneeId !== undefined && !can(actor, "ticket:assign")) {
    throw new HttpError(403, "You do not have permission to assign tickets");
  }
  if (assigneeId) {
    const assignee = await usersRepo.findAuthUserById(assigneeId);
    if (!assignee || !assignee.isActive || !can(assignee, "ticket:update")) {
      throw new HttpError(400, "Assignee must be an active agent or admin");
    }
  }

  const ticket = await ticketsRepo.update(id, input);
  if (!ticket) throw new HttpError(404, `Ticket ${id} not found`);
  return ticket;
}

export async function getStats(actor: AuthUser): Promise<Record<Status, number>> {
  const createdBy = can(actor, "ticket:read_all") ? undefined : actor.id;
  const counts: Record<Status, number> = { open: 0, in_progress: 0, closed: 0 };
  for (const row of await ticketsRepo.countByStatus(createdBy)) {
    counts[row.status] = row.count;
  }
  return counts;
}