import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PublicLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={`/${user.roleName.toLowerCase()}`} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-white p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;

