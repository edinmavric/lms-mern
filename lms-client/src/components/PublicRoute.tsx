import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface PublicRouteProps {
  children: React.ReactNode;
  restricted?: boolean;
}

export function PublicRoute({
  children,
  restricted = false,
}: PublicRouteProps) {
  const { isAuthenticated } = useAuthStore();

  if (restricted && isAuthenticated) {
    return <Navigate to="/app" replace />;
  }

  return <>{children}</>;
}
