import type { Ticket } from '../types/ticket';
import { TicketRow } from './TicketRow';

interface Props {
  tickets: Ticket[];
  loading: boolean;
  onChanged: () => void;
}

export function TicketList({ tickets, loading, onChanged }: Props) {
  if (loading && tickets.length === 0) {
    return <p className="empty-state">Loading tickets…</p>;
  }
  if (tickets.length === 0) {
    return <p className="empty-state">No tickets found.</p>;
  }
  return (
    <ul className={`ticket-list${loading ? ' is-loading' : ''}`}>
      {tickets.map((t) => (
        <TicketRow key={t.id} ticket={t} onChanged={onChanged} />
      ))}
    </ul>
  );
}
