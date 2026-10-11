interface Props {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, onChange }: Props) {
  if (total === 0) return null;

  return (
    <div className="pagination">
      <p className="pagination-summary">
        Page {page} of {Math.max(totalPages, 1)} · {total} ticket{total === 1 ? '' : 's'}
      </p>
      <div className="pagination-actions">
        <button
          className="secondary-button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </button>
        <button
          className="secondary-button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
