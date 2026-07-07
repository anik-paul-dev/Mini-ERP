import React, { ReactNode } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  permission: string;
  children: ReactNode;
  fallbackMessage?: string;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  permission, 
  children,
  fallbackMessage = `You do not have the required permission (${permission}) to view this content.`
}) => {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center animate-in fade-in">
        <ShieldAlert size={48} className="text-amber-500 mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
        <p className="text-gray-500 max-w-md mx-auto">{fallbackMessage}</p>
      </div>
    );
  }

  return <>{children}</>;
};

export default PermissionGuard;
