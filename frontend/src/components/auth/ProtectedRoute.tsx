import { Navigate, useLocation } from 'react-router-dom';
import { useAuth, type UserRole } from '@/contexts/auth/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Tunggu sampai session restore selesai (mencegah flash redirect)
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

export const OwnerOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute children={children} allowedRoles={['owner']} />;
};

export const AdminOnlyRoute = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute children={children} allowedRoles={['owner', 'admin']} />;
};
