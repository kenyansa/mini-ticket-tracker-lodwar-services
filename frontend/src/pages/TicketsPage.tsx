import { useEffect, useState } from 'react';
import { listAssignableUsers } from '../api/users';
import { useAuth } from '../auth/AuthContext';
import { Pagination } from '../components/Pagination';
import { StatsBar } from '../components/StatsBar';
import { StatusFilter } from '../components/StatusFilter';
import { TicketForm } from '../components/TicketForm';
import { TicketList } from '../components/TicketList';
import { useTickets } from '../hooks/useTickets';
import type { UserSummary } from '../types/user';

export function TicketsPage() {
  const { user, signOut, can } = useAuth();
  const { status, setStatus, setPage, result, stats, loading, error, refetch } = useTickets();
  const [assignees, setAssignees] = useState<UserSummary[]>([]);

  useEffect(() => {
    if (!can('ticket:assign')) return;
    listAssignableUsers()
      .then(setAssignees)
      .catch(() => setAssignees([]));
  }, [can]);

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Mini Ticket Tracker</h1>
        <div className="flex items-center gap-3 text-sm text-gray-600">
          <span>
            {user?.name} <span className="text-gray-400">({user?.role})</span>
          </span>
          <button
            onClick={signOut}
            className="rounded border border-gray-300 bg-white px-3 py-1 hover:bg-gray-50"
          >
            Sign out
          </button>
        </div>
      </header>

      <StatsBar stats={stats} />

      {can('ticket:create') && <TicketForm onCreated={refetch} />}

      {error && (
        <p role="alert" className="rounded border border-red-200 bg-red-50 p-3 text-red-700">
          {error}
        </p>
      )}

      <StatusFilter value={status} onChange={setStatus} />

      <TicketList
        tickets={result?.data ?? []}
        assignees={assignees}
        loading={loading}
        onChanged={refetch}
      />

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
