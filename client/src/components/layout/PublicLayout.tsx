import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const PublicLayout = () => {
  const { isAuthenticated, user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-main">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    const rolePath = user.roleName === 'Admin' ? 'admin' : user.roleName === 'Employee' ? 'employee' : 'manager';
    return <Navigate to={`/${rolePath}`} replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-main p-4">
      <div className="w-full max-w-md">
        <Outlet />
      </div>
    </div>
  );
};

export default PublicLayout;
