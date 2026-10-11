interface Props {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onChange }: Props) {
  if (total === 0) return null;
  const btn =
    'rounded border border-gray-300 bg-white px-3 py-1 text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50';

  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-gray-500">
        Page {page} of {Math.max(totalPages, 1)} · {total} ticket{total === 1 ? '' : 's'}
      </p>
      <div className="flex gap-2">
        <button className={btn} disabled={page <= 1} onClick={() => onChange(page - 1)}>
          Previous
        </button>
        <button className={btn} disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
          Next
        </button>
      </div>
    </div>
  );
}
