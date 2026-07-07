import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../../hooks/useApi';
import { Link } from 'react-router-dom';
import DataTable from '../../../components/ui/DataTable';
import SearchBar from '../../../components/ui/SearchBar';
import Pagination from '../../../components/ui/Pagination';
import ConfirmDialog from '../../../components/ui/ConfirmDialog';
import { User, PaginatedResponse } from '../../../types';
import { Plus, Edit2, Trash2, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const Users = () => {
  const { get, del } = useApi();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const fetchUsers = () => {
    return get<PaginatedResponse<User>>(`/users?page=${page}&limit=10${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['adminUsers', page, searchTerm],
    queryFn: fetchUsers,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => del(`/users/${id}`, { showSuccessToast: true, successMessage: 'User deleted' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminUsers'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    }
  });

  const handleDelete = () => {
    if (userToDelete) {
      deleteMutation.mutate(userToDelete.publicId);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email' },
    { 
      header: 'Role', 
      accessor: 'roleName',
      cell: (item: User) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          item.roleName === 'Admin' ? 'bg-purple-100 text-purple-800' :
          item.roleName === 'Manager' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
        }`}>
          {item.roleName}
        </span>
      )
    },
    { 
      header: 'Status', 
      accessor: 'isActive',
      cell: (item: any) => item.isActive ? 
        <span className="flex items-center text-green-600 text-sm"><CheckCircle size={16} className="mr-1" /> Active</span> : 
        <span className="flex items-center text-red-600 text-sm"><XCircle size={16} className="mr-1" /> Inactive</span>
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (item: User) => (
        <div className="flex space-x-3">
          <Link to={`/admin/users/${item.publicId}/edit`} className="text-brand-600 hover:text-brand-900">
            <Edit2 size={18} />
          </Link>
          <button 
            onClick={() => setUserToDelete(item)} 
            className="text-red-600 hover:text-red-900 disabled:opacity-30 disabled:cursor-not-allowed"
            disabled={item.roleName === 'Admin'} // Protect Admin deletion
          >
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">System Users</h1>
        <Link to="/admin/users/new" className="btn-primary">
          <Plus size={18} className="mr-2" />
          Add User
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SearchBar onSearch={(val) => { setSearchTerm(val); setPage(1); }} placeholder="Search users by name or email..." />
        </div>
        
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          keyExtractor={(item) => item.publicId}
          emptyMessage="No users found."
        />
        
        {data?.meta && (
          <Pagination
            currentPage={data.meta.page}
            totalPages={data.meta.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>

      <ConfirmDialog
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${userToDelete?.name}? They will lose access immediately.`}
        confirmText="Delete User"
      />
    </div>
  );
};

export default Users;
