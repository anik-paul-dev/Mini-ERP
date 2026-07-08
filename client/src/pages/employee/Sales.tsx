import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../hooks/useApi';
import { useAuth } from '../../hooks/useAuth';
import { Link } from 'react-router-dom';
import DataTable from '../../components/ui/DataTable';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import { Sale, PaginatedResponse } from '../../types';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { Plus, ShieldAlert, Download, Eye } from 'lucide-react';
import axios from 'axios';

const Sales = () => {
  const { get } = useApi();
  const { hasPermission } = useAuth();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const canReadSales = hasPermission('sales:read');
  const canCreateSales = hasPermission('sales:create');
  const canExportSales = hasPermission('sales:export');

  const fetchSales = () => {
    return get<PaginatedResponse<Sale>>(`/sales?page=${page}&limit=10${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['employeeSales', page, searchTerm],
    queryFn: fetchSales,
    enabled: canReadSales,
  });

  const handleExport = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/sales/export${searchTerm ? `?search=${searchTerm}` : ''}`, {
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
      header: 'Grand Total', 
      accessor: 'grandTotal',
      cell: (item: Sale) => <span className="font-semibold text-brand-600">{formatCurrency(item.grandTotal)}</span>
    },
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
          <Link
            to={`/employee/sales/${item.publicId}`}
            className="p-1 text-gray-500 hover:text-brand-600 transition-colors"
            title="View Invoice"
          >
            <Eye size={18} />
          </Link>
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

      {!canReadSales ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center flex flex-col items-center">
          <ShieldAlert size={48} className="text-amber-500 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Access Restricted</h2>
          <p className="text-gray-500 max-w-md mx-auto">
            You do not have the required permission (sales:read) to view the sales history. 
            {canCreateSales && " You can still create new sales using the button above."}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <SearchBar onSearch={(val) => { setSearchTerm(val); setPage(1); }} placeholder="Search sales by customer..." />
          </div>
          
          <DataTable
            columns={columns}
            data={data?.data || []}
            isLoading={isLoading}
            keyExtractor={(item) => item.publicId}
            emptyMessage="No sales found."
          />
          
          {data?.meta && (
            <Pagination
              currentPage={data.meta.page}
              totalPages={data.meta.totalPages}
              onPageChange={setPage}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Sales;

