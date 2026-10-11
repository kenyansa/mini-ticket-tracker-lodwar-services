import { Pagination } from './components/Pagination';
import { StatsBar } from './components/StatsBar';
import { StatusFilter } from './components/StatusFilter';
import { TicketList } from './components/TicketList';
import { useTickets } from './hooks/useTickets';

export default function App() {
  const { status, setStatus, page, setPage, result, stats, loading, error } = useTickets();

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <h1 className="text-2xl font-bold text-gray-900">Mini Ticket Tracker</h1>

      <StatsBar stats={stats} />

      {error && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      <StatusFilter value={status} onChange={setStatus} />

      <TicketList tickets={result?.data ?? []} loading={loading} />

      {result && (
        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          total={result.total}
          onChange={setPage}
        />
      )}
    </main>
  );
}
