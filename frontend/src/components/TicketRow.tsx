import type { Ticket } from '../types/ticket';
import { Badge } from './Badge';

export function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <li className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{ticket.title}</p>
        {ticket.description && <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>}
        <p className="mt-1 text-xs text-gray-400">
          #{ticket.id} · {new Date(ticket.createdAt).toLocaleString()}
        </p>
      </div>
      <div className="flex shrink-0 gap-2">
        <Badge kind="priority" value={ticket.priority} />
        <Badge kind="status" value={ticket.status} />
      </div>
    </li>
  );
}
