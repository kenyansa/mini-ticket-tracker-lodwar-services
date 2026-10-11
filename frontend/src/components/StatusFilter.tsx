import type { Status } from '../types/ticket';
import { STATUS_LABELS } from './Badge';

interface Props {
  value: Status | undefined;
  onChange: (status: Status | undefined) => void;
}

const OPTIONS: (Status | undefined)[] = [undefined, 'open', 'in_progress', 'closed'];

export function StatusFilter({ value, onChange }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {OPTIONS.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt ?? 'all'}
            type="button"
            onClick={() => onChange(opt)}
            className={`rounded-full border px-3 py-1 text-sm ${
              active
                ? 'border-indigo-600 bg-indigo-600 text-white'
                : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {opt ? STATUS_LABELS[opt] : 'All'}
          </button>
        );
      })}
    </div>
  );
}
