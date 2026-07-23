import { useAuth } from '../context/AuthContext.jsx';
import StudentDashboard from '../dashboard/StudentDashboard.jsx';
import HRDashboard from '../dashboard/hr/HRDashboard.jsx';

export default function DashboardPage() {
  const { profile } = useAuth();

  if (profile?.role === 'student') {
    return <StudentDashboard />;
  }

  if (profile?.role === 'hr') {
    return <HRDashboard />;
  }

  // Fallback for unknown roles
  return (
    <main style={{ display: 'grid', minHeight: '100vh', placeItems: 'center', background: '#f7f4e9', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111111' }}>Welcome, {profile?.name}</h1>
        <p style={{ color: '#6f6f68', marginTop: 8 }}>Unknown role — please contact support.</p>
      </div>
    </main>
  );
}
