import type { Priority, Status } from '../types/ticket';

const STATUS_STYLES: Record<Status, string> = {
  open: 'badge-open',
  in_progress: 'badge-in-progress',
  closed: 'badge-closed',
};

const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'badge-low',
  medium: 'badge-medium',
  high: 'badge-high',
};

export const STATUS_LABELS: Record<Status, string> = {
  open: 'Open',
  in_progress: 'In progress',
  closed: 'Closed',
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

type BadgeProps = { kind: 'status'; value: Status } | { kind: 'priority'; value: Priority };

export function Badge(props: BadgeProps) {
  const styles =
    props.kind === 'status' ? STATUS_STYLES[props.value] : PRIORITY_STYLES[props.value];
  const label = props.kind === 'status' ? STATUS_LABELS[props.value] : PRIORITY_LABELS[props.value];

  return (
    <span className={`ticket-badge ${styles}`}>{label}</span>
  );
}
