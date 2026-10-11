import { useEffect, useState } from 'react';
import { getStats } from './api/tickets';
import type { TicketStats } from './types/ticket';

export default function App() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch((e: Error) => setError(e.message));
  }, []);

  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold text-indigo-600">Mini Ticket Tracker</h1>
      {error && <p className="mt-4 text-red-600">{error}</p>}
      {stats && (
        <pre className="mt-4 rounded bg-gray-100 p-4">{JSON.stringify(stats, null, 2)}</pre>
      )}
    </main>
  );
}
