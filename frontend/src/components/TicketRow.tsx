import { useState } from 'react';
import { updateTicket } from '../api/tickets';
import type { Status, Ticket } from '../types/ticket';
import { Badge, STATUS_LABELS } from './Badge';

interface Props {
  ticket: Ticket;
  onChanged: () => void;
}

const STATUSES: Status[] = ['open', 'in_progress', 'closed'];

export function TicketRow({ ticket, onChanged }: Props) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStatusChange(next: Status) {
    if (next === ticket.status) return;
    setSaving(true);
    setError(null);
    try {
      await updateTicket(ticket.id, { status: next });
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="ticket-row">
      <div className="ticket-content">
        <p className="ticket-title">{ticket.title}</p>
        {ticket.description && <p className="ticket-description">{ticket.description}</p>}
        <p className="ticket-meta">
          #{ticket.id} · {new Date(ticket.createdAt).toLocaleString()}
        </p>
        {error && (
          <p role="alert" className="error-message">
            {error}
          </p>
        )}
      </div>

      <div className="ticket-actions">
        <Badge kind="priority" value={ticket.priority} />
        <Badge kind="status" value={ticket.status} />
        <select
          aria-label={`Change status of ticket ${ticket.id}`}
          value={ticket.status}
          disabled={saving}
          onChange={(e) => handleStatusChange(e.target.value as Status)}
          className="ticket-status-select"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </div>
    </li>
  );
}
