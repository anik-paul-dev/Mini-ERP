import React from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../hooks/useAuth';

const DashboardLayout = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  // Redirect to role-specific dashboard if at root /dashboard
  if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
    return <Navigate to={`/${user.roleName.toLowerCase()}`} replace />;
  }

  // Basic guard to prevent accessing other roles' paths
  const rolePath = user.roleName.toLowerCase();
  const currentRootPath = location.pathname.split('/')[1]; // e.g., 'admin' or 'manager'

  if (['admin', 'manager', 'employee'].includes(currentRootPath) && currentRootPath !== rolePath) {
    return <Navigate to={`/${rolePath}`} replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden relative">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
