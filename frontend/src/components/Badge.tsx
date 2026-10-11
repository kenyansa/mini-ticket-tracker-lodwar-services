import type { Priority, Status } from '../types/ticket';

const STATUS_STYLES: Record<Status, string> = {
  open: 'bg-green-100 text-green-800',
  in_progress: 'bg-amber-100 text-amber-800',
  closed: 'bg-gray-200 text-gray-700',
};

const PRIORITY_STYLES: Record<Priority, string> = {
  low: 'bg-sky-100 text-sky-800',
  medium: 'bg-indigo-100 text-indigo-800',
  high: 'bg-red-100 text-red-800',
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
    <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}>
      {label}
    </span>
  );
}
