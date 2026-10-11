import type { Ticket } from '../types/ticket';
import { TicketRow } from './TicketRow';

interface Props {
  tickets: Ticket[];
  loading: boolean;
}

export function TicketList({ tickets, loading }: Props) {
  if (loading && tickets.length === 0) {
    return <p className="p-6 text-center text-gray-500">Loading…</p>;
  }
  if (tickets.length === 0) {
    return <p className="p-6 text-center text-gray-500">No tickets found.</p>;
  }
  return (
    <ul
      className={`divide-y divide-gray-200 rounded-lg border border-gray-200 bg-white ${
        loading ? 'opacity-60' : ''
      }`}
    >
      {tickets.map((t) => (
        <TicketRow key={t.id} ticket={t} />
      ))}
    </ul>
  );
}
