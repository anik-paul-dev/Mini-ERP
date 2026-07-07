import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { Role } from '../../types';
import { Shield } from 'lucide-react';

const Roles = () => {
  const { get } = useApi();

  const { data: roles, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => get<{data: Role[]}>('/roles').then(res => res?.data || []),
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Roles & Permissions</h1>
          <p className="text-sm text-gray-500 mt-1">View system roles and their granted permissions.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full py-12 text-center text-gray-500">Loading roles...</div>
        ) : roles?.map((role) => (
          <div key={role.publicId} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-md transition-shadow">
            <div className={`p-4 border-b ${
              role.name === 'Admin' ? 'bg-purple-50 border-purple-100' :
              role.name === 'Manager' ? 'bg-blue-50 border-blue-100' : 'bg-gray-50 border-gray-100'
            }`}>
              <div className="flex items-center gap-2">
                <Shield className={
                  role.name === 'Admin' ? 'text-purple-600' :
                  role.name === 'Manager' ? 'text-blue-600' : 'text-gray-600'
                } size={20} />
                <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
              </div>
              <p className="text-sm text-gray-600 mt-1">{role.description}</p>
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
