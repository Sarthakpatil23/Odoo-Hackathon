import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute: redirects to /login if not authenticated.
 * Shows a loading screen while the auth state is being restored.
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border border-border border-t-foreground rounded-full animate-spin" />
          <p className="text-muted-foreground text-xs font-mono">loading session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

/**
 * RoleProtectedRoute: after auth check, also verifies the user's role.
 * If the role is not in allowedRoles, redirects to /dashboard.
 *
 * Usage: <RoleProtectedRoute allowedRoles={['Admin']} />
 */
export function RoleProtectedRoute({ allowedRoles }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="dark min-h-screen bg-background flex items-center justify-center font-sans">
        <div className="w-8 h-8 border border-border border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
