import { useEffect, useState } from 'react';
import { Pagination } from './components/Pagination';
import { StatsBar } from './components/StatsBar';
import { StatusFilter } from './components/StatusFilter';
import { TicketForm } from './components/TicketForm';
import { TicketList } from './components/TicketList';
import { useTickets } from './hooks/useTickets';

export default function App() {
  const { status, setStatus, setPage, result, stats, loading, error, refetch } = useTickets();
  const [statusUpdateSuccess, setStatusUpdateSuccess] = useState(false);

  useEffect(() => {
    if (!statusUpdateSuccess) return;
    const timeoutId = window.setTimeout(() => setStatusUpdateSuccess(false), 4000);
    return () => window.clearTimeout(timeoutId);
  }, [statusUpdateSuccess]);

  function handleStatusUpdated() {
    setStatusUpdateSuccess(true);
    refetch();
  }

  return (
    <main className="app-shell">
      <header className="page-header">
        <p className="eyebrow">Workspace | Lodwar Services</p>
        <h1 className="page-title">Mini Ticket Tracker</h1>
        <p className="page-description">Keep work moving. Track every request in one place.</p>
      </header>

      <StatsBar stats={stats} />

      <TicketForm onCreated={refetch} />

      {error && (
        <p role="alert" className="error-message page-error">
          {error}
        </p>
      )}

      <section className="tickets-panel" aria-labelledby="tickets-heading">
        <div className="tickets-toolbar">
          <h2 id="tickets-heading" className="tickets-heading">
            Tickets
          </h2>
          <StatusFilter value={status} onChange={setStatus} />
        </div>

        {statusUpdateSuccess && (
          <p role="status" className="status-success">
            Ticket status updated successfully.
          </p>
        )}

        <TicketList
          tickets={result?.data ?? []}
          loading={loading}
          onChanged={handleStatusUpdated}
        />

        {result && (
          <Pagination
            page={result.page}
            totalPages={result.totalPages}
            total={result.total}
            onChange={setPage}
          />
        )}
      </section>
    </main>
  );
}
