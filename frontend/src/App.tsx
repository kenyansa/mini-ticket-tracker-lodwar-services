import { useAuth } from './auth/AuthContext';
import { LoginPage } from './components/LoginPage';
import { TicketsPage } from './pages/TicketsPage';

export default function App() {
  const { user, loading } = useAuth();
  if (loading) return <p className="p-6 text-center text-gray-500">Loading…</p>;
  return user ? <TicketsPage /> : <LoginPage />;
}
