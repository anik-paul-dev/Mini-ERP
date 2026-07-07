import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

interface RoleGuardProps {
  allowedRoles: string[];
}

const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.roleName)) {
    // Redirect to their default dashboard
    return <Navigate to={`/${user.roleName.toLowerCase()}`} replace />;
  }

  return <Outlet />;
};

export default RoleGuard;
