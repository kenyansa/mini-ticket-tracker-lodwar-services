import { useState } from 'react';
import { updateTicket } from '../api/tickets';
import { useAuth } from '../auth/AuthContext';
import type { Status, Ticket, UpdateTicketInput } from '../types/ticket';
import type { UserSummary } from '../types/user';
import { Badge, STATUS_LABELS } from './Badge';

interface Props {
  ticket: Ticket;
  assignees: UserSummary[];
  onChanged: () => void;
}

const STATUSES: Status[] = ['open', 'in_progress', 'closed'];
const selectClass = 'rounded border border-gray-300 bg-white px-2 py-1 text-xs disabled:opacity-50';

export function TicketRow({ ticket, assignees, onChanged }: Props) {
  const { can } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save(input: UpdateTicketInput) {
    setSaving(true);
    setError(null);
    try {
      await updateTicket(ticket.id, input);
      onChanged();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  }

  return (
    <li className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="min-w-0">
        <p className="font-medium text-gray-900">{ticket.title}</p>
        {ticket.description && <p className="mt-1 text-sm text-gray-600">{ticket.description}</p>}
        <p className="mt-1 text-xs text-gray-400">
          #{ticket.id} · {new Date(ticket.createdAt).toLocaleString()} · Assigned to{' '}
          {ticket.assigneeName ?? 'nobody'}
        </p>
        {error && (
          <p role="alert" className="mt-1 text-xs text-red-600">
            {error}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <Badge kind="priority" value={ticket.priority} />
        <Badge kind="status" value={ticket.status} />

        {can('ticket:update') && (
          <select
            aria-label={`Change status of ticket ${ticket.id}`}
            value={ticket.status}
            disabled={saving}
            onChange={(e) => save({ status: e.target.value as Status })}
            className={selectClass}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABELS[s]}
              </option>
            ))}
          </select>
        )}

        {can('ticket:assign') && (
          <select
            aria-label={`Assign ticket ${ticket.id}`}
            value={ticket.assigneeId ?? ''}
            disabled={saving}
            onChange={(e) => save({ assigneeId: e.target.value ? Number(e.target.value) : null })}
            className={selectClass}
          >
            <option value="">Unassigned</option>
            {assignees.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name}
              </option>
            ))}
          </select>
        )}
      </div>
    </li>
  );
}
