import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { Sale, PaginatedResponse } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Plus, Download, Eye, Edit, Trash2, XCircle } from 'lucide-react';
import axios from 'axios';

const Sales = () => {
  const { get, patch, del } = useApi();
  const { hasPermission } = useAuth();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const canReadSales = hasPermission('sales:read');
  const canCreateSales = hasPermission('sales:create');
  const canExportSales = hasPermission('sales:export');
  const canUpdateSales = hasPermission('sales:update');
  const canCancelSales = hasPermission('sales:cancel');
  const canDeleteSales = hasPermission('sales:delete');

  const statusQuery = statusFilter ? `&status=${statusFilter}` : '';

  const fetchSales = () => {
    return get<PaginatedResponse<Sale>>(`/sales?page=${page}&limit=10${searchTerm ? `&search=${searchTerm}` : ''}${statusQuery}`);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['employeeSales', page, searchTerm, statusFilter],
    queryFn: fetchSales,
    enabled: canReadSales,
  });

  const refreshSales = () => {
    queryClient.invalidateQueries({ queryKey: ['employeeSales'] });
    queryClient.invalidateQueries({ queryKey: ['employeeDashboardStats'] });
  };

  const handleCancelSale = async (sale: Sale) => {
    if (window.confirm(`Cancel sale ${sale.publicId.substring(0, 8)}? This will deduct it from dashboard totals.`)) {
      await patch(`/sales/${sale.publicId}/cancel`, {}, { showSuccessToast: true, successMessage: 'Sale canceled' });
      refreshSales();
    }
  };

  const handleDeleteSale = async (sale: Sale) => {
    if (window.confirm(`Delete sale ${sale.publicId.substring(0, 8)} permanently? This removes it from the database.`)) {
      await del(`/sales/${sale.publicId}`, { showSuccessToast: true, successMessage: 'Sale deleted' });
      refreshSales();
    }
  };

  const handleExport = async () => {
    try {
      const query = `${searchTerm ? `?search=${searchTerm}` : '?'}${statusFilter ? `${searchTerm ? '&' : ''}status=${statusFilter}` : ''}`;
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/sales/export${searchTerm || statusFilter ? query : ''}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        withCredentials: true,
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'sales_export.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Export failed', error);
    }
  };

  const columns = [
    {
      header: 'Sale ID',
      accessor: 'publicId',
      cell: (item: Sale) => <span className="font-mono text-gray-600">{item.publicId.substring(0, 8)}</span>
    },
    { header: 'Customer', accessor: 'customerName' },
    {
      header: 'Items',
      accessor: 'items',
      cell: (item: Sale) => `${item.items.length} item(s)`
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (item: Sale) => (
        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${item.status === 'canceled' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {item.status === 'canceled' ? 'Canceled' : 'Active'}
        </span>
      )
    },
    {
      header: 'Grand Total',
      accessor: 'grandTotal',
      cell: (item: Sale) => <span className={`font-semibold ${item.status === 'canceled' ? 'text-red-600 line-through' : 'text-brand-600'}`}>{formatCurrency(item.grandTotal)}</span>
    },
    { header: 'Created By', accessor: 'createdByName' },
    {
      header: 'Date',
      accessor: 'createdAt',
      cell: (item: Sale) => formatDate(item.createdAt)
    },
    {
      header: 'Actions',
      accessor: 'actions',
      cell: (item: Sale) => (
        <div className="flex space-x-2">
          <Link to={`/employee/sales/${item.publicId}`} className="p-1 text-gray-500 hover:text-brand-600 transition-colors" title="View Invoice">
            <Eye size={18} />
          </Link>
          {canUpdateSales && item.status !== 'canceled' && (
            <Link to={`/employee/sales/${item.publicId}/edit`} className="p-1 text-gray-500 hover:text-blue-600 transition-colors" title="Edit Sale">
              <Edit size={18} />
            </Link>
          )}
          {canCancelSales && item.status !== 'canceled' && (
            <button onClick={() => handleCancelSale(item)} className="p-1 text-gray-500 hover:text-amber-600 transition-colors" title="Cancel Sale">
              <XCircle size={18} />
            </button>
          )}
          {canDeleteSales && (
            <button onClick={() => handleDeleteSale(item)} className="p-1 text-gray-500 hover:text-red-600 transition-colors" title="Delete Sale">
              <Trash2 size={18} />
            </button>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">My Sales</h1>
        <div className="flex space-x-3">
          {canExportSales && (
            <button onClick={handleExport} className="btn-secondary flex items-center">
            <Download size={18} className="mr-2" />
            Export CSV
            </button>
          )}
          {canCreateSales && (
            <Link to="/employee/sales/new" className="btn-primary">
            <Plus size={18} className="mr-2" />
            New Sale
            </Link>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 space-y-3">
          <SearchBar onSearch={(val) => { setSearchTerm(val); setPage(1); }} placeholder="Search sales by customer..." />
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All', value: '' },
              { label: 'Active', value: 'active' },
              { label: 'Canceled', value: 'canceled' },
            ].map((filter) => (
              <button
                key={filter.label}
                onClick={() => { setStatusFilter(filter.value); setPage(1); }}
                className={`px-3 py-1.5 rounded-md text-sm font-medium border ${statusFilter === filter.value ? 'bg-brand-600 text-white border-brand-600' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <DataTable columns={columns} data={data?.data || []} isLoading={isLoading} keyExtractor={(item) => item.publicId} emptyMessage="No sales found." />

        {data?.meta && (
          <Pagination currentPage={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
};

export default Sales;

