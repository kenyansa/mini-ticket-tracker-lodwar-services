import type { TicketStats } from '../types/ticket';
import { STATUS_LABELS } from './Badge';

export function StatsBar({ stats }: { stats: TicketStats | null }) {
  if (!stats) return null;
  return (
    <div className="stats-bar">
      {(Object.keys(stats) as (keyof TicketStats)[]).map((key) => (
        <div key={key} className="stat-card">
          <div className="stat-value">{stats[key]}</div>
          <div className="stat-label">{STATUS_LABELS[key]}</div>
        </div>
      ))}
    </div>
  );
}
