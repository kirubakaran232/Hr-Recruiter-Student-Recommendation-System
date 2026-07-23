import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <main style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', background: '#f7f4e9', color: '#242424' }}>
        <div style={{ borderRadius: '999px', background: '#fff', padding: '12px 20px', fontSize: '0.875rem', boxShadow: '0 10px 30px rgba(36,36,36,0.1)', fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif', fontWeight: 600 }}>
          Loading TalentOS AI…
        </div>
      </main>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
