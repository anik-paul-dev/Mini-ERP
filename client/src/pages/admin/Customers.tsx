import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Customer, PaginatedResponse } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Customers = () => {
  const { get, del } = useApi();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const fetchCustomers = () => {
    return get<PaginatedResponse<Customer>>(`/customers?page=${page}&limit=10${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['adminCustomers', page, searchTerm],
    queryFn: fetchCustomers,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => del(`/customers/${id}`, { showSuccessToast: true, successMessage: 'Customer deleted' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminCustomers'] });
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete customer');
    }
  });

  const handleDelete = () => {
    if (customerToDelete) {
      deleteMutation.mutate(customerToDelete.publicId);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    { header: 'Email', accessor: 'email', cell: (item: Customer) => item.email || '-' },
    { header: 'Phone', accessor: 'phone', cell: (item: Customer) => item.phone || '-' },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (item: Customer) => (
        <div className="flex space-x-3">
          <Link to={`/admin/customers/${item.publicId}/edit`} className="text-brand-600 hover:text-brand-900">
            <Edit2 size={18} />
          </Link>
          <button onClick={() => setCustomerToDelete(item)} className="text-red-600 hover:text-red-900">
            <Trash2 size={18} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
        <Link to="/admin/customers/new" className="btn-primary">
          <Plus size={18} className="mr-2" />
          Add Customer
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SearchBar onSearch={(val) => { setSearchTerm(val); setPage(1); }} placeholder="Search customers..." />
        </div>
        
        <DataTable
          columns={columns}
          data={data?.data || []}
          isLoading={isLoading}
          keyExtractor={(item) => item.publicId}
          emptyMessage="No customers found."
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
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Customer"
        message={`Are you sure you want to delete ${customerToDelete?.name}?`}
        confirmText="Delete"
      />
    </div>
  );
};

export default Customers;
