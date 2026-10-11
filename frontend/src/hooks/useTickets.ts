import { useCallback, useEffect, useState } from 'react';
import { getStats, listTickets } from '../api/tickets';
import type { PaginatedTickets, Status, TicketStats } from '../types/ticket';

const PAGE_SIZE = 10;

export function useTickets() {
  const [status, setStatusState] = useState<Status | undefined>(undefined);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PaginatedTickets | null>(null);
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    Promise.all([listTickets({ status, page, limit: PAGE_SIZE }), getStats()])
      .then(([list, counts]) => {
        if (cancelled) return;
        setResult(list);
        setStats(counts);
        setError(null);
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [status, page, reloadKey]);

  const setStatus = useCallback((next: Status | undefined) => {
    setStatusState(next);
    setPage(1);
  }, []);

  const refetch = useCallback(() => setReloadKey((k) => k + 1), []);

  return { status, setStatus, page, setPage, result, stats, loading, error, refetch };
}
