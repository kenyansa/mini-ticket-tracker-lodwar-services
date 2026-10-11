import type { TicketStats } from '../types/ticket';
import { STATUS_LABELS } from './Badge';

export function StatsBar({ stats }: { stats: TicketStats | null }) {
  if (!stats) return null;
  return (
    <div className="grid grid-cols-3 gap-3">
      {(Object.keys(stats) as (keyof TicketStats)[]).map((key) => (
        <div key={key} className="rounded-lg border border-gray-200 bg-white p-3 text-center">
          <div className="text-2xl font-semibold">{stats[key]}</div>
          <div className="text-xs text-gray-500">{STATUS_LABELS[key]}</div>
        </div>
      ))}
    </div>
  );
}
