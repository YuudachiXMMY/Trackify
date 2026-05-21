import { useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router';
import { MobileShell } from '@/app/components/MobileShell';
import { AuthProvider, useAuth } from './AuthContext';

const PUBLIC_PATHS = ['/login', '/signup', '/onboarding'];

function AuthGuard() {
  const { isLoggedIn, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.some((p) => location.pathname.startsWith(p));
    if (!isLoggedIn && !isPublic) {
      navigate('/login', { replace: true });
    }
  }, [isLoggedIn, loading, location.pathname, navigate]);

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          minHeight: '200px',
        }}
      >
        <div
          style={{
            width: '36px',
            height: '36px',
            borderRadius: '50%',
            border: '3px solid #D8F3DC',
            borderTopColor: '#2D6A4F',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <Outlet />;
}

function RootInner() {
  const location = useLocation();
  const isOnboarding = location.pathname === '/onboarding';

  return (
    <MobileShell isOnboarding={isOnboarding}>
      <AuthGuard />
    </MobileShell>
  );
}

export function Root() {
  return (
    <AuthProvider>
      <RootInner />
    </AuthProvider>
  );
}
