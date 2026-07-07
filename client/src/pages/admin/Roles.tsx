import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import { Role } from '../../types';
import { Shield, Plus, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Roles = () => {
  const { get, del } = useApi();
  const queryClient = useQueryClient();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => get<{data: Role[]}>('/roles').then(res => res?.data || []),
  });

  const handleDelete = async (publicId: string, roleName: string) => {
    if (window.confirm(`Are you sure you want to delete the role "${roleName}"?`)) {
      try {
        await del(`/roles/${publicId}`, { showSuccessToast: true, successMessage: 'Role deleted' });
        queryClient.invalidateQueries({ queryKey: ['roles'] });
      } catch (error) {
        // Error handled by useApi
      }
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">Manage system roles and their granted permissions.</p>
        </div>
        <Link to="/admin/roles/new" className="btn-primary">
          <Plus size={18} className="mr-2" />
          New Role
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading roles...</div>
        ) : roles?.map((role) => (
          <div key={role.publicId} className="group bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className={`p-4 border-b flex justify-between items-start ${
              role.name === 'Admin' ? 'bg-purple-50 border-purple-100' :
              role.name === 'Manager' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'
            }`}>
              <div>
                <div className="flex items-center gap-2">
                  <Shield className={
                    role.name === 'Admin' ? 'text-purple-600' :
                    role.name === 'Manager' ? 'text-blue-600' : 'text-gray-600'
                  } size={20} />
                  <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                  {role.isSystem && <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 bg-gray-200 px-2 py-0.5 rounded-full ml-2">System</span>}
                </div>
                <p className="text-sm text-gray-600 mt-1">{role.description}</p>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link to={`/admin/roles/${role.publicId}/edit`} className="p-1.5 text-brand-600 hover:bg-brand-50 rounded transition-colors">
                  <Edit size={16} />
                </Link>
                {!role.isSystem && (
                  <button onClick={() => handleDelete(role.publicId, role.name)} className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors">
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
            
            <div className="p-4 flex-1">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Permissions</h4>
              <div className="flex flex-wrap gap-2">
                {role.permissions.map((perm, idx) => {
                  const [resource, action] = perm.split(':');
                  return (
                    <span key={idx} className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-800">
                      <span className="capitalize">{resource}</span>
                      <span className="mx-1 text-gray-400">•</span>
                      <span className="text-brand-600 capitalize">{action}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Roles;
