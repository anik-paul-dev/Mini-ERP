import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useApi } from '../../../hooks/useApi';
import { Link } from 'react-router-dom';
import DataTable from '../../../components/ui/DataTable';
import SearchBar from '../../../components/ui/SearchBar';
import Pagination from '../../../components/ui/Pagination';
import { Sale, PaginatedResponse } from '../../../types';
import { formatCurrency, formatDate } from '../../../utils/helpers';
import { Plus } from 'lucide-react';

const Sales = () => {
  const { get } = useApi();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchSales = () => {
    return get<PaginatedResponse<Sale>>(`/sales?page=${page}&limit=10${searchTerm ? `&search=${searchTerm}` : ''}`);
  };

  const { data, isLoading } = useQuery({
    queryKey: ['adminSales', page, searchTerm],
    queryFn: fetchSales,
  });

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
    { header: 'Created By', accessor: 'createdByName' },
    { 
      header: 'Date', 
      accessor: 'createdAt',
      cell: (item: Sale) => formatDate(item.createdAt)
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Sales</h1>
        <Link to="/admin/sales/new" className="btn-primary">
          <Plus size={18} className="mr-2" />
          New Sale
        </Link>
      </div>

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
    </div>
  );
};

export default Sales;
