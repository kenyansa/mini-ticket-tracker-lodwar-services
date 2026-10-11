import type { Status } from '../types/ticket';
import { STATUS_LABELS } from './Badge';

interface Props {
  value: Status | undefined;
  onChange: (status: Status | undefined) => void;
}

const OPTIONS: (Status | undefined)[] = [undefined, 'open', 'in_progress', 'closed'];

export function StatusFilter({ value, onChange }: Props) {
  return (
    <div className="status-filter" role="group" aria-label="Filter tickets by status">
      {OPTIONS.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt ?? 'all'}
            type="button"
            onClick={() => onChange(opt)}
            aria-pressed={active}
            className={`status-filter-button${active ? ' is-active' : ''}`}
          >
            {opt ? STATUS_LABELS[opt] : 'All'}
          </button>
        );
      })}
    </div>
  );
}
